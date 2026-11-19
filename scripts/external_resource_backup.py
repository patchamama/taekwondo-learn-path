#!/usr/bin/env python3
"""Fixed-grant, offline external resource backup. Never create a mount or base."""
import sys
sys.dont_write_bytecode = True
import argparse
import hashlib
import json
import os
import shutil
import stat
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTERNAL_VOLUME = Path('/Volumes/sdd_1TB')
EXTERNAL_BASE = EXTERNAL_VOLUME / 'taekwondo-resources'
EXTERNAL_ARCHIVE = EXTERNAL_BASE / 'video/epub-backup'
EXTERNAL_OUTPUT = EXTERNAL_BASE / 'resources/epub'
EXTERNAL_BOOKS = EXTERNAL_BASE / 'books/epub'


def guard_external(path, *, kind):
    roots = {'base': EXTERNAL_BASE, 'archive': EXTERNAL_ARCHIVE,
             'catalogue': EXTERNAL_OUTPUT, 'books': EXTERNAL_BOOKS}
    raw = os.fspath(path)
    path = Path(raw)
    if kind not in roots or path != roots[kind] or raw != str(path):
        raise ValueError('Not an exact authorized external root')
    if any(p.is_symlink() for p in (path, *path.parents)) or path.resolve() != path:
        raise ValueError('External aliases/symlinks forbidden')
    if not os.path.ismount(EXTERNAL_VOLUME) or not EXTERNAL_BASE.is_dir():
        raise OSError('External volume/base missing; no internal fallback')
    if EXTERNAL_VOLUME.stat().st_dev == ROOT.stat().st_dev:
        raise OSError('External volume must be on a different device')
    for parent in (path, *path.parents):
        if parent == EXTERNAL_VOLUME.parent: break
        if parent.exists():
            if not parent.is_dir() or not os.access(parent, os.W_OK | os.X_OK):
                raise OSError('External destination is not a writable directory')
            if parent.stat().st_dev != EXTERNAL_VOLUME.stat().st_dev:
                raise OSError('External destination crosses devices')
    return path


RESERVE = 2 * 1024**3
AUTHORS = ('Adam Gold', 'Ted Hillson', 'Scott McMillan', 'Sung Woo',
           'Clint Sharp', 'Bill Pottle', 'Bryan McWhorter')


def checked(path):
    path = Path(path)
    if '..' in path.parts or any(p.is_symlink() for p in (path, *path.parents)):
        raise ValueError('Traversal/symlink forbidden: '+str(path))
    return path


def digest(path):
    checked(path)
    if not path.is_file(): raise ValueError('Not a regular source/file: '+str(path))
    h = hashlib.sha256()
    with path.open('rb') as stream:
        if not stat.S_ISREG(os.fstat(stream.fileno()).st_mode):
            raise ValueError('Not a regular file: '+str(path))
        for chunk in iter(lambda: stream.read(1024**2), b''): h.update(chunk)
    return h.hexdigest()


def external_check(path, kind):
    root = guard_external({'books': EXTERNAL_BOOKS, 'catalogue': EXTERNAL_OUTPUT,
                           'base': EXTERNAL_BASE}[kind], kind=kind)
    checked(path)
    if path != root and root not in path.parents:
        raise ValueError('Destination escapes fixed grant')
    for parent in (path, *path.parents):
        if parent == root.parent: break
        if parent.exists() and not parent.is_dir() and parent != path:
            raise ValueError('Destination parent is not a directory')
    return root


def source_entries():
    entries = []
    source = checked(ROOT/'docs/clint-sharp')
    for author in AUTHORS:
        matches = list(source.glob('*'+author+'*.epub'))
        if len(matches) != 1: raise ValueError('Expected one original EPUB: '+author)
        entries.append((matches[0], EXTERNAL_BOOKS/matches[0].name, 'books'))
    tree = checked(ROOT/'resources/epub')
    if not tree.is_dir(): raise ValueError('Private resource tree missing')
    for path in sorted(tree.rglob('*')):
        checked(path)
        if path.is_dir(): continue
        if not path.is_file(): raise ValueError('Nonregular source')
        entries.append((path, EXTERNAL_OUTPUT/path.relative_to(tree), 'catalogue'))
    return entries


def preflight(entries):
    """Complete conflict scan before creating even a destination directory."""
    records, needed, seen = [], 0, set()
    for source, target, kind in entries:
        external_check(target, kind)
        if target in seen: raise ValueError('Duplicate copy target')
        seen.add(target)
        sha, size = digest(source), source.stat().st_size
        exists = target.exists()
        if exists:
            external_check(target, kind)
            if not target.is_file() or target.stat().st_size != size or digest(target) != sha:
                raise ValueError('Existing destination conflicts: '+str(target))
        else: needed += size
        records.append({'source':str(source), 'path':str(target.relative_to(EXTERNAL_BASE)),
                        'bytes':size, 'sha256':sha, 'kind':kind, 'identical':exists})
    guard_external(EXTERNAL_BASE, kind='base')
    # Evidence JSON and filesystem metadata also need headroom.
    manifest_bytes = len(json.dumps(records, indent=2).encode())
    if shutil.disk_usage(EXTERNAL_BASE).free < needed + manifest_bytes + RESERVE + 1024**2:
        raise OSError('Need 2 GiB external reserve plus evidence headroom')
    return records


def make_parents(target, kind):
    external_check(target, kind)
    missing = []
    parent = target.parent
    while not parent.exists():
        missing.append(parent)
        parent = parent.parent
    for parent in reversed(missing):
        external_check(target, kind)
        parent.mkdir()  # Never includes the already-existing authorized base.


def exclusive_copy(source, target, kind, sha, size):
    external_check(target, kind)
    if digest(source) != sha or source.stat().st_size != size:
        raise ValueError('Source changed since preflight')
    make_parents(target, kind)
    external_check(target, kind)
    if shutil.disk_usage(EXTERNAL_BASE).free < size + RESERVE + 1024**2:
        raise OSError('External reserve reached')
    checked(source)
    with source.open('rb') as src:
        external_check(target, kind)
        with target.open('xb') as dst:  # No overwrite, including racing arrivals.
            shutil.copyfileobj(src, dst, 1024**2)
    external_check(target, kind)
    if target.stat().st_size != size or digest(target) != sha:
        raise OSError('Copied file verification failed; partial file retained')


def evidence(records, label):
    guard_external(EXTERNAL_BASE, kind='base')
    target = EXTERNAL_BASE/'evidence'/(label+'-'+uuid.uuid4().hex)/'manifest.json'
    make_parents(target, 'base')
    external_check(target, 'base')
    raw = json.dumps({'schema_version':1, 'operation':label, 'files':records}, indent=2).encode()
    if shutil.disk_usage(EXTERNAL_BASE).free - len(raw) < RESERVE:
        raise OSError('External reserve reached before evidence')
    external_check(target, 'base')
    with target.open('xb') as stream: stream.write(raw)
    return str(target)


def copy_resources(*, dry_run=False):
    guard_external(EXTERNAL_BASE, kind='base')
    records = preflight(source_entries())
    result = {'dryRun':dry_run, 'files':len(records),
              'bytes':sum(r['bytes'] for r in records),
              'identical':sum(r['identical'] for r in records)}
    if dry_run: return result
    for row in records:
        target = EXTERNAL_BASE/row['path']
        external_check(target, row['kind'])
        if row['identical']:
            if target.stat().st_size != row['bytes'] or digest(target) != row['sha256']:
                raise ValueError('Identical destination changed')
            continue
        exclusive_copy(Path(row['source']), target, row['kind'], row['sha256'], row['bytes'])
    result['manifest'] = evidence(records, 'copy-resources')
    return result


def snapshot_catalogue(*, dry_run=False):
    guard_external(EXTERNAL_OUTPUT, kind='catalogue')
    prefix = EXTERNAL_BASE/'evidence'/('catalogue-before-'+uuid.uuid4().hex)
    entries = []
    for path in sorted(EXTERNAL_OUTPUT.rglob('*')):
        external_check(path, 'catalogue')
        rel = path.relative_to(EXTERNAL_OUTPUT)
        mutable = rel.as_posix() in ('index.html', 'catalogue.json', 'catalogue-audit.json', 'resources.md')
        mutable |= len(rel.parts) == 3 and rel.parts[0] == 'books' and rel.name == 'index.html'
        if path.is_file() and mutable: entries.append((path, prefix/rel, 'base'))
    records = preflight(entries)
    if dry_run: return {'dryRun':True, 'files':len(records)}
    for row in records:
        external_check(Path(row['source']), 'catalogue')
        exclusive_copy(Path(row['source']), EXTERNAL_BASE/row['path'], 'base', row['sha256'], row['bytes'])
    # Same unique evidence directory, never an existing user manifest.
    target = prefix/'manifest.json'
    make_parents(target, 'base')
    external_check(target, 'base')
    raw = json.dumps({'files':records}, indent=2).encode()
    if shutil.disk_usage(EXTERNAL_BASE).free - len(raw) < RESERVE:
        raise OSError('External reserve reached before snapshot manifest')
    external_check(target, 'base')
    with target.open('xb') as stream: stream.write(raw)
    return {'files':len(records), 'manifest':str(target)}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', choices=('copy-resources', 'snapshot-catalogue'))
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args(argv)
    action = copy_resources if args.operation == 'copy-resources' else snapshot_catalogue
    print(json.dumps(action(dry_run=args.dry_run), indent=2))


if __name__ == '__main__':
    main()
