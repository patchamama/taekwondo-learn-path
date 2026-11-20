#!/usr/bin/env python3
"""Local-only public video archive. Standard library; every media action is explicit."""
import argparse
from collections import Counter
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import html
from html.parser import HTMLParser
import json
import math
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys
import time
from urllib.parse import parse_qs, urlparse
import zipfile

sys.dont_write_bytecode = True
from external_resource_backup import EXTERNAL_BASE, EXTERNAL_VOLUME, EXTERNAL_ARCHIVE, guard_external

REPO = Path(__file__).resolve().parent.parent
DEFAULT_ROOT = REPO / 'video/epub-backup'
LEGACY_ROOT = REPO / '.atl/epub-resources/archive'
GIB = 1024 ** 3
RESERVE = 2 * GIB
ID = re.compile(r'^[A-Za-z0-9_-]{11}$')
URL = re.compile(r'https?://(?:www\.)?(?:youtu\.be/|youtube(?:-nocookie)?\.com/)[^\s<>"\']+')
# No fallback above 720p; include audio only from the same source.
FORMAT = 'bv[height<=720]+ba/b[height<=720]'
YT = '/opt/homebrew/bin/yt-dlp'
MAX_SOURCES = 1000


def now():
    return datetime.now(timezone.utc).isoformat()


def numeric(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def offset_seconds(value):
    if value.isdigit():
        return int(value)
    if re.fullmatch(r'(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?', value) and value:
        parts = re.fullmatch(r'(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?', value).groups()
        return sum(int(p or 0) * m for p, m in zip(parts, (3600, 60, 1)))
    raise ValueError('Invalid source offset: ' + value)


def youtube_ref(url):
    parsed = urlparse(html.unescape(url).rstrip('.,;)'))
    host = (parsed.hostname or '').lower()
    query = parse_qs(parsed.query)
    if host in ('youtu.be', 'www.youtu.be'):
        video_id = parsed.path.strip('/')
    elif host in ('youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'm.youtube.com'):
        parts = parsed.path.strip('/').split('/')
        video_id = query.get('v', [''])[0] if parsed.path == '/watch' else (parts[1] if len(parts) == 2 and parts[0] in ('embed', 'shorts', 'live') else '')
    else:
        return None
    if not ID.fullmatch(video_id):
        return None
    fragment = parse_qs(parsed.fragment)
    offset = query.get('t', query.get('start', fragment.get('t', ['0'])))[0]
    return video_id, offset_seconds(offset)


class Links(HTMLParser):
    def __init__(self, book, member):
        super().__init__(convert_charrefs=True)
        self.book, self.member = book, member
        self.anchor = None
        self.refs = []

    def record(self, url, origin):
        ref = youtube_ref(url)
        if ref:
            video_id, offset = ref
            item = {'id': video_id, 'kind': 'epub', 'book': self.book, 'member': self.member,
                    'anchor': self.anchor, 'offset': offset, 'url': html.unescape(url), 'origin': origin}
            # The same href commonly appears as visible text; preserve distinct origins.
            if item not in self.refs:
                self.refs.append(item)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.anchor = attrs.get('id', attrs.get('name', self.anchor))
        if 'href' in attrs:
            self.record(attrs['href'], 'href')

    def handle_data(self, data):
        for match in URL.finditer(data):
            self.record(match.group(), 'text')


def epub_refs(path, book):
    refs = []
    with zipfile.ZipFile(path) as archive:
        total = 0
        for info in archive.infolist():
            if not info.filename.lower().endswith(('.xhtml', '.html', '.htm', '.xml')):
                continue
            total += info.file_size
            if info.file_size > 32 * 1024 ** 2 or total > 512 * 1024 ** 2:
                raise ValueError('EPUB XML exceeds bounded inspection size')
            parser = Links(book, info.filename)
            parser.feed(archive.read(info).decode('utf-8-sig', errors='replace'))
            refs.extend(parser.refs)
    return refs


def associate(sources, video_id, association):
    if not ID.fullmatch(video_id):
        raise ValueError('Invalid YouTube ID')
    source = sources.setdefault(video_id, {'id': video_id, 'url': 'https://www.youtube.com/watch?v=' + video_id, 'associations': []})
    if association not in source['associations']:
        source['associations'].append(association)
    if len(sources) > MAX_SOURCES:
        raise ValueError('Inventory exceeds explicit bounded source count')


def inventory():
    data = REPO / 'src/data'
    constants = (data / 'clips.ts').read_text()
    dubs_match = re.search(r'COURSE_VIDEOS\s*=\s*\{([^}]+)\}', constants)
    self_match = re.search(r"SELF_DEFENSE_VIDEO\s*=\s*'([^']+)'", constants)
    if not dubs_match or not self_match:
        raise ValueError('Cannot derive course video constants')
    dubs = re.findall(r"(\w+):\s*'([^']+)'", dubs_match[1])
    if not dubs:
        raise ValueError('No course dubs found')
    sources = {}
    rows = json.loads((data / 'clips.json').read_text())
    for path in sorted((data / 'curriculum').glob('kup*.json')):
        rows.extend(json.loads(path.read_text()).get('clips', []))
    for row in rows:
        validate_range(row['start'], row['end'])
        for language, video_id in dubs:
            associate(sources, video_id, dict(row, kind='app', source='course', language=language))
    for row in json.loads((data / 'clips-selfdefense.json').read_text()):
        if row['cardId'].startswith('sd-'):
            validate_range(row['start'], row['end'])
            associate(sources, self_match[1], dict(row, kind='app', source='selfdefense'))
    for row in json.loads((data / 'clips-external.json').read_text()):
        validate_range(row['start'], row['end'])
        associate(sources, row['videoId'], dict(row, kind='app', source='external'))
    books = sorted((REPO / 'docs/clint-sharp').glob('*.epub'))
    if len(books) != 7:
        raise ValueError('Expected all seven EPUBs; refusing incomplete inventory')
    for book in books:
        for ref in epub_refs(book, str(book.relative_to(REPO))):
            video_id = ref.pop('id')
            associate(sources, video_id, ref)
    if 'qNpQpJLHyUg' in sources:
        sources['qNpQpJLHyUg'].update(requiresExplicitRetry=True, prior_failure={
            'action': 'review-sample-download', 'exit_code': 1, 'reason': 'Read timeout after 10 seconds',
            'audit': '.atl/epub-video-review/qNpQpJLHyUg/download.stderr.log',
            'reported_by': 'parent; not read by archive worker'})
        resolve_review_retry(sources['qNpQpJLHyUg'])
    return {'schema_version': 1, 'created_at': now(), 'epub_count': len(books),
            'sources': [sources[k] for k in sorted(sources)]}


def retry_attempt():
    path = REPO / '.atl/epub-video-review/qNpQpJLHyUg/retry-authorized/attempt.json'
    if any(p.is_symlink() for p in (path, *path.parents)) or not path.is_file() or path.stat().st_size > 65536:
        return {}
    try:
        return json.loads(path.read_text())
    except (ValueError, OSError):
        return {}


def resolve_review_retry(source):
    """Resolve only the historical review failure, never a subsequent backup failure."""
    if (source.get('id') != 'qNpQpJLHyUg' or source.get('retry_resolution')
            or source.get('prior_failure', {}).get('action') != 'review-sample-download'
            or source.get('backup', {}).get('status') not in (None, 'not-started')):
        return
    attempt = retry_attempt()
    if not (attempt.get('videoId') == source['id'] and attempt.get('authorization') == 'S8: retoma lo de taegeuk 5'
            and attempt.get('downloadExit') == 0 and attempt.get('status') == 'ready'
            and attempt.get('priorFailurePreserved') is True):
        return
    source['requiresExplicitRetry'] = False
    source['retry_resolution'] = {'authorization_ref':'S8/L25',
        'attempt':'.atl/epub-video-review/qNpQpJLHyUg/retry-authorized/attempt.json',
        'status':'review-sample-ready-not-full-backup', 'resolved_at':now()}


def validate_root(root):
    # Exact external grant; internal/legacy descendant policy is unchanged.
    raw = os.fspath(root)
    original = Path(root)
    root = original.absolute()
    if '..' in root.parts:
        raise ValueError('Output root traversal is not allowed')
    if root == EXTERNAL_ARCHIVE:
        if not original.is_absolute() or raw != str(root):
            raise ValueError('External archive requires its exact absolute path')
        return guard_external(root, kind='archive')
    if not any(root.is_relative_to(allowed.absolute()) for allowed in (DEFAULT_ROOT, LEGACY_ROOT)):
        raise ValueError('Output root must be inside an authorized archive root')
    # Reject any existing symlink component, including parents of the authorized root.
    for component in [root, *root.parents]:
        if component.is_symlink():
            raise ValueError('Symlink output component: ' + str(component))
    return root


def safe_path(root, relative):
    root = validate_root(root)
    relative = Path(relative)
    if relative.is_absolute() or '..' in relative.parts:
        raise ValueError('Output path escapes root')
    target = root / relative
    if not target.resolve().is_relative_to(root.absolute()):
        raise ValueError('Output symlink escapes root')
    for component in [target, *target.parents]:
        if component == root.parent:
            break
        if component.is_symlink():
            raise ValueError('Output symlinks are not allowed')
    return target


def recheck_path(path):
    """Revalidate external file paths at the I/O boundary, never authorize roots."""
    path = Path(path)
    if path.is_relative_to(EXTERNAL_ARCHIVE):
        return safe_path(EXTERNAL_ARCHIVE, path.relative_to(EXTERNAL_ARCHIVE))
    return path


def destination_label(root):
    return str(root.relative_to(REPO)) if root.is_relative_to(REPO) else str(root)


class MetadataCapacityError(ValueError):
    pass


def metadata_space(required):
    if not capacity(required, free_bytes(EXTERNAL_ARCHIVE))['allowed']:
        raise MetadataCapacityError('External metadata capacity denied: reserve/headroom required; no further writes')


def metadata_json(value):
    # Check before encoding, bound memory, then reserve exact UTF-8 bytes.
    metadata_space(0)
    chunks, size = [], 1
    encoder = json.JSONEncoder(indent=2, ensure_ascii=False, allow_nan=False)
    for chunk in encoder.iterencode(value):
        chunk = chunk.encode('utf-8')
        size += len(chunk)
        if size > 12 * 1024**2:
            raise ValueError('External metadata exceeds bounded JSON size')
        chunks.append(chunk)
    content = b''.join(chunks) + b'\n'
    metadata_space(len(content))
    return content


def write_metadata(path, content, reserved=0):
    # Recheck before directory creation and exclusive creation/write boundaries.
    metadata_space(len(content) + reserved)
    recheck_path(path).parent.mkdir(parents=True, exist_ok=True)
    metadata_space(len(content) + reserved)
    with recheck_path(path).open('xb') as stream:
        metadata_space(len(content) + reserved)
        stream.write(content)


def save_json(path, value):
    # Snapshots/audits are append-only. Never overwrite an earlier failure record.
    if Path(path).is_relative_to(EXTERNAL_ARCHIVE):
        recheck_path(path)
        write_metadata(path, metadata_json(value))
        return
    recheck_path(path).parent.mkdir(parents=True, exist_ok=True)
    with recheck_path(path).open('x', encoding='utf-8') as stream:
        json.dump(value, stream, indent=2, ensure_ascii=False, allow_nan=False)
        stream.write('\n')


def snapshot(root, manifest):
    name = 'manifests/' + str(time.time_ns()) + '.json'
    save_json(safe_path(root, name), manifest)
    return name


def load_manifest(root):
    folder = safe_path(root, 'manifests')
    files = sorted(folder.glob('*.json')) if folder.exists() else []
    if not files:
        raise ValueError('No manifest: run plan first')
    result = json.loads(safe_path(root, str(files[-1].relative_to(root))).read_text())
    if result.get('schema_version') != 1 or len(result.get('sources', [])) > MAX_SOURCES:
        raise ValueError('Unsupported or oversized manifest')
    seen = set()
    for source in result['sources']:
        if not ID.fullmatch(source['id']) or source['id'] in seen:
            raise ValueError('Invalid or duplicate manifest source ID')
        seen.add(source['id'])
    return result


def run_process(command, timeout, root=None):
    started = time.monotonic()
    process = None
    if root is not None:
        validate_root(root)  # Before dispatch, including ffprobe.
    options = {}
    if root == EXTERNAL_ARCHIVE:
        # Keep library/tool temporary files on the selected device too.
        options = {'cwd': str(root), 'env': dict(os.environ, TMPDIR=str(root), TMP=str(root), TEMP=str(root))}
    try:
        if root is not None:
            validate_root(root)
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True, **options)
        timed_out, capacity_stopped = False, False
        while True:
            remaining = timeout - (time.monotonic() - started)
            try:
                capacity_stopped = root is not None and free_bytes(root) < RESERVE + 256 * 1024 ** 2
            except (ValueError, OSError):
                # Mount loss is fatal; stop the running process, never fall back.
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                process.communicate()
                raise
            if remaining <= 0 or capacity_stopped:
                timed_out = remaining <= 0
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                stdout, stderr = process.communicate()
                break
            try:
                stdout, stderr = process.communicate(timeout=min(remaining, 0.25))
                break
            except subprocess.TimeoutExpired:
                continue
        return {'command': command, 'stdout': stdout.decode('utf-8', errors='replace'),
                'stderr': stderr.decode('utf-8', errors='replace'), 'exit_code': process.returncode,
                'timed_out': timed_out, 'capacity_stopped': capacity_stopped,
                'elapsed_seconds': time.monotonic() - started}
    except OSError as exc:
        if root is not None:
            validate_root(root)
        return {'command': command, 'stdout': '', 'stderr': str(exc), 'exit_code': None,
                'timed_out': False, 'elapsed_seconds': time.monotonic() - started}


def validate_range(start, end, duration=None):
    if not numeric(start) or not numeric(end) or start < 0 or end <= start:
        raise ValueError('Invalid nonnegative clip range')
    if duration is not None and (not numeric(duration) or duration <= 0 or end > duration):
        raise ValueError('Clip range exceeds source duration')


def estimate(meta):
    duration = meta.get('duration')
    if not numeric(duration) or duration <= 0:
        raise ValueError('Missing finite positive duration')
    formats = meta.get('requested_formats') or meta.get('requested_downloads') or [meta]
    selected, total, uncertain = [], 0, False
    for fmt in formats:
        height = fmt.get('height')
        video = fmt.get('vcodec') not in (None, 'none') or height is not None
        if (height is not None and (not numeric(height) or height > 720)) or (video and height is None):
            raise ValueError('Selected video quality is unknown or above 720p')
        size = fmt.get('filesize') or fmt.get('file_size')
        method = 'filesize'
        if not numeric(size) or size <= 0:
            size = fmt.get('filesize_approx') or fmt.get('file_size_approx')
            method = 'filesize_approx'
            uncertain = True
        if not numeric(size) or size <= 0:
            bitrate = fmt.get('tbr')
            size = bitrate * 1000 / 8 * duration if numeric(bitrate) and bitrate > 0 else None
            method = 'tbr*duration' if size else 'unknown'
            uncertain = True
        selected.append({'format_id': fmt.get('format_id'), 'height': height,
                         'bytes': math.ceil(size) if size else None, 'method': method})
        if size is None:
            total = None
        elif total is not None:
            total += math.ceil(size)
    return {'bytes': total, 'duration': duration, 'uncertain': uncertain, 'selected_formats': selected}


def yt_base():
    return [YT, '--ignore-config', '--no-cache-dir', '--no-playlist', '--retries', '0',
            '--fragment-retries', '0', '--extractor-retries', '0', '--file-access-retries', '0',
            '--socket-timeout', '15', '-f', FORMAT]


def plan_source(root, source, timeout):
    result = run_process(yt_base() + ['--skip-download', '--dump-single-json', 'https://www.youtube.com/watch?v=' + source['id']], timeout, root=root)
    audit = 'audit/' + source['id'] + '-plan-' + str(time.time_ns()) + '.json'
    save_json(safe_path(root, audit), result)
    source['metadata_audit'] = audit
    source['planned_at'] = now()
    if result['exit_code'] != 0 or result['timed_out']:
        source.update(availability='unavailable', reason='Metadata command failed or timed out; see audit')
        return
    try:
        meta = json.loads(result['stdout'])
        if meta.get('id') != source['id'] or meta.get('is_live') or meta.get('live_status') in ('is_live', 'is_upcoming'):
            raise ValueError('Wrong ID or live/upcoming source')
        estimates = estimate(meta)
        source.update(availability='accessible', title=meta.get('title'), duration=estimates['duration'], estimate=estimates)
        source['clips'] = clip_specs(source)
    except (ValueError, TypeError, KeyError) as exc:
        source.update(availability='unavailable', reason=str(exc))


def clip_specs(source):
    duration = source['duration']
    specs = []
    seen = set()
    for association in source['associations']:
        if association['kind'] == 'app':
            start, end = association['start'], association['end']
            validate_range(start, end, duration)
            key = (start, end)
            spec = {'start': start, 'end': end, 'label': 'curated-app-range', 'cardIds': [association['cardId']]}
            if key in seen:
                old = next(c for c in specs if (c['start'], c['end']) == key)
                if association['cardId'] not in old['cardIds']:
                    old['cardIds'].append(association['cardId'])
                continue
            seen.add(key)
            specs.append(spec)
    offsets = sorted({a['offset'] for a in source['associations'] if a['kind'] == 'epub'})
    # A preview at each distinct EPUB offset preserves source context, not teaching approval.
    if not specs and not offsets:
        offsets = [0]
    for start in offsets:
        end = min(duration, start + 30)
        validate_range(start, end, duration)
        if any(c['start'] <= start < c['end'] for c in specs):
            continue
        specs.append({'start': start, 'end': end, 'label': 'review-preview-not-technically-reviewed', 'cardIds': []})
    for index, spec in enumerate(specs):
        spec['key'] = str(index).zfill(4)
    return specs


def reconcile_inventory(manifest, current):
    """Offline current ranges + retained metadata; never mutate the saved input.

    Identity is source ID plus start/end/label, not the positional export key.
    Retired specs remain evidence, not active export obligations. File/hash checks
    still happen in required_bytes/export_clip before any record is reused.
    """
    result = deepcopy(manifest)
    sources = {source['id']: source for source in result['sources']}
    pending = []
    associations = [{'id':source['id'], 'associations':source['associations']} for source in current['sources']]
    identity = lambda spec: (spec['start'], spec['end'], spec['label'])
    for item in associations:
        source = sources.get(item['id'])
        if source is None:
            source = {'id':item['id'], 'url':'https://www.youtube.com/watch?v='+item['id'],
                      'availability':'not-planned', 'reason':'Current inventory source has no retained metadata'}
            result['sources'].append(source)
            sources[item['id']] = source
        source['associations'] = deepcopy(item['associations'])
        if (not numeric(source.get('duration')) or source['duration'] <= 0
                or not numeric(source.get('estimate', {}).get('bytes')) or source['estimate']['bytes'] <= 0):
            pending.append(source['id'])
            continue
        old = {identity(spec): spec for spec in source.get('clips', [])}
        specs = clip_specs(source)
        active = {identity(spec) for spec in specs}
        retired = source.setdefault('retired_clips', [])
        for key, spec in old.items():
            if key not in active and spec not in retired:
                retired.append(spec)
        for spec in specs:
            # Also permit restoration of an identical retired range, never a
            # nearby preview or a stale ordinal key. Keep failed records too.
            prior = old.get(identity(spec))
            if prior is None:
                prior = next((r for r in reversed(retired) if identity(r) == identity(spec)), {})
            if 'export' in prior:
                spec['export'] = deepcopy(prior['export'])
        source['clips'] = specs
    result['reconciliation'] = {
        'at':now(), 'basis':'offline current authorized app/EPUB inventory; retained metadata only',
        'inventory_sha256':hashlib.sha256(json.dumps(associations, sort_keys=True, separators=(',', ':')).encode()).hexdigest(),
        'current_source_count':len(associations), 'metadata_pending_ids':pending,
        'active_clip_count':sum(len(s.get('clips', [])) for s in result['sources']),
        'retired_files':'retained without deletion; only current matching specs are active'}
    return result


def capacity(required, free):
    allowed = numeric(required) and required >= 0 and free >= math.ceil(required) + RESERVE + 256 * 1024 ** 2
    return {'allowed': allowed, 'required_bytes': required, 'free_bytes': free, 'reserve_bytes': RESERVE,
            'reason': 'sufficient' if allowed else ('unknown estimate' if required is None else 'insufficient free space')}


def free_bytes(root):
    path = validate_root(root)
    while not path.exists():
        path = path.parent
    validate_root(root)
    return shutil.disk_usage(path).free


def hash_file(path):
    digest, size = hashlib.sha256(), 0
    with recheck_path(path).open('rb') as stream:
        while True:
            recheck_path(path)
            block = stream.read(1024 * 1024)
            if not block:
                break
            digest.update(block)
            size += len(block)
    return digest.hexdigest(), size


def verified(root, entry):
    if not entry or not entry.get('path') or not entry.get('sha256'):
        return False
    path = safe_path(root, entry['path'])
    return path.is_file() and hash_file(path) == (entry['sha256'], entry.get('bytes'))


def clip_budget(source, spec):
    # Reencode at a hard max 8 Mbps video + 192 kbps audio, including mux overhead.
    return math.ceil((spec['end'] - spec['start']) * 8192000 / 8 * 1.15)


def whole_source(spec, duration):
    return spec['start'] == 0 and spec['end'] == duration and duration <= 30


def required_bytes(manifest, root, action='all'):
    if manifest.get('reconciliation', {}).get('metadata_pending_ids'):
        return None
    total = 0
    for source in manifest['sources']:
        if source.get('availability') != 'accessible':
            continue
        amount = source.get('estimate', {}).get('bytes')
        if amount is None:
            return None
        backed_up = verified(root, source.get('backup'))
        if action != 'clips' and not backed_up:
            # Streams, merge/remux, retained fragments and uncertainty: 5x selected size.
            total += math.ceil(amount * 5)
        if action != 'backup':
            for spec in source.get('clips', []):
                if not whole_source(spec, source['duration']) and not verified(root, spec.get('export')):
                    total += 2 * clip_budget(source, spec)
    return total


def probe(root, relative, timeout):
    result = run_process(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,height', '-of', 'json', str(safe_path(root, relative))], timeout, root=root)
    save_json(safe_path(root, 'audit/probe-' + str(time.time_ns()) + '.json'), result)
    if result['exit_code'] != 0 or result['timed_out']:
        raise ValueError('ffprobe failed')
    meta = json.loads(result['stdout'])
    duration = float(meta['format']['duration'])
    video = [s for s in meta.get('streams', []) if s.get('codec_type') == 'video']
    if not video or any(not numeric(s.get('height')) or s['height'] > 720 for s in video):
        raise ValueError('No verified video stream at or below 720p')
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError('Invalid probed duration')
    return duration


def record_file(root, relative, duration):
    digest, size = hash_file(safe_path(root, relative))
    return {'status': 'complete', 'path': relative, 'sha256': digest, 'bytes': size,
            'duration': duration, 'verified_at': now()}


def backup_source(root, source, timeout):
    if source.get('requiresExplicitRetry'):
        source['backup'] = {'status': 'blocked-explicit-retry-required', 'reason': 'Prior download failed; no automatic retry authorized'}
        return False
    if verified(root, source.get('backup')):
        return True
    relative = 'originals/' + source['id'] + '.mkv'
    target = safe_path(root, relative)
    if target.exists():
        source['backup'] = {'status': 'blocked', 'reason': 'Unverified original exists; retained, never overwritten'}
        return False
    recheck_path(target).parent.mkdir(parents=True, exist_ok=True)
    # yt-dlp also creates format/fragment/partial names beyond the final template.
    # Refuse pre-existing symlinks/directories for this source's entire namespace.
    for existing in target.parent.glob(source['id'] + '*'):
        recheck_path(existing)
        if existing.is_symlink() or existing.is_dir():
            raise ValueError('Unsafe download intermediate: ' + str(existing))
    result = run_process(yt_base() + ['--continue', '--no-overwrites', '--concurrent-fragments', '1',
                                     '--merge-output-format', 'mkv', '--remux-video', 'mkv', '--keep-video', '--keep-fragments',
                                     '--paths', 'temp:' + str(safe_path(root, 'originals')),
                                     '--max-filesize', str(source['estimate']['bytes'] * 2),
                                     '-o', str(safe_path(root, 'originals/' + source['id'] + '.%(ext)s')),
                                     'https://www.youtube.com/watch?v=' + source['id']], timeout, root=root)
    audit = 'audit/' + source['id'] + '-backup-' + str(time.time_ns()) + '.json'
    save_json(safe_path(root, audit), result)
    source['backup'] = {'status': 'incomplete', 'audit': audit, 'reason': 'Process failed or output not verified; partials retained'}
    if result['exit_code'] != 0 or result['timed_out'] or not target.is_file():
        return False
    try:
        duration = probe(root, relative, min(timeout, 60))
        if abs(duration - source['duration']) > 2:
            raise ValueError('Original duration differs from planned metadata by >2 seconds')
        source['backup'] = dict(record_file(root, relative, duration), audit=audit)
        return True
    except (ValueError, KeyError, TypeError) as exc:
        source['backup']['reason'] = str(exc)
        return False


def retry_backup_source(root, source, timeout, before_dispatch):
    """One explicitly selected retry; never reuse or overwrite an old namespace."""
    token = source['id'] + '-' + str(time.time_ns())
    directory = 'originals/retry-' + token
    relative = directory + '/' + source['id'] + '.mkv'
    if not capacity(64 * 1024, free_bytes(root))['allowed']:
        raise MetadataCapacityError('Retry attempt metadata/temp capacity denied')
    attempt = {'attempt_id':token, 'requested_at':now(), 'status':'prepared',
               'previous_backup':deepcopy(source['backup']),
               'previous_retry_guard':source.get('requiresExplicitRetry'), 'path':relative}
    source.setdefault('full_backup_retries', []).append(attempt)
    # Immutable checkpoint records selection and prior state BEFORE any process.
    before_dispatch()
    folder = safe_path(root, directory)
    recheck_path(folder).mkdir(parents=True, exist_ok=False)  # Collision is fatal; no fallback.
    recheck_path(safe_path(root, directory + '/temp')).mkdir(exist_ok=False)
    target = safe_path(root, relative)
    result = run_process(yt_base() + ['--no-continue', '--no-overwrites', '--concurrent-fragments', '1',
                        '--merge-output-format', 'mkv', '--remux-video', 'mkv', '--keep-video', '--keep-fragments',
                        '--paths', 'temp:' + str(safe_path(root, directory + '/temp')),
                        '--max-filesize', str(source['estimate']['bytes'] * 2),
                        '-o', str(safe_path(root, directory + '/' + source['id'] + '.%(ext)s')),
                        'https://www.youtube.com/watch?v=' + source['id']], timeout, root=root)
    audit = 'audit/' + token + '-explicit-backup.json'
    save_json(safe_path(root, audit), result)
    attempt.update(status='incomplete', audit=audit)
    source['backup'] = {'status':'incomplete', 'path':relative, 'audit':audit,
                        'reason':'Explicit attempt failed or not verified; all old/new partials retained'}
    if result['exit_code'] != 0 or result['timed_out'] or not recheck_path(target).is_file():
        return False
    try:
        duration = probe(root, relative, min(timeout, 60))
        if abs(duration - source['duration']) > 2:
            raise ValueError('Original duration differs from planned metadata by >2 seconds')
        record = record_file(root, relative, duration)
        if record['bytes'] <= 0:
            raise ValueError('Empty verified retry original')
        source['backup'] = dict(record, audit=audit)
        source['requiresExplicitRetry'] = False
        source['full_backup_retry_resolution'] = {'attempt_id':token, 'status':'verified-explicit-full-backup',
                                                   'resolved_at':now()}
        attempt['status'] = 'complete'
        return True
    except (ValueError, KeyError, TypeError) as exc:
        source['backup']['reason'] = str(exc)
        return False


def export_clip(root, source, spec, timeout):
    if verified(root, spec.get('export')):
        return True
    original = source.get('backup')
    if not verified(root, original):
        spec['export'] = {'status': 'missing-original', 'reason': 'Requires hash-verified source'}
        return False
    if 0 < spec['end'] - original['duration'] < 1 and spec['start'] < original['duration']:
        # Ranges come from rounded metadata durations; trim a sub-second overshoot, reject anything larger.
        spec['end'] = original['duration']
    validate_range(spec['start'], spec['end'], original['duration'])
    if whole_source(spec, original['duration']):
        spec['export'] = dict(original, reused_original=True)
        return True
    # Unique attempt file keeps every failed output without overwrite or deletion.
    relative = 'clips/' + source['id'] + '-' + spec['key'] + '-' + str(time.time_ns()) + '.mp4'
    target = safe_path(root, relative)
    recheck_path(target).parent.mkdir(parents=True, exist_ok=True)
    command = ['ffmpeg', '-nostdin', '-v', 'error', '-n', '-i', str(safe_path(root, original['path'])),
               '-ss', str(spec['start']), '-t', str(spec['end'] - spec['start']),
               '-map', '0:v:0', '-map', '0:a:0?', '-c:v', 'libx264', '-preset', 'veryfast',
               '-crf', '23', '-maxrate', '8M', '-bufsize', '16M', '-threads', '2',
               '-c:a', 'aac', '-b:a', '192k', '-fs', str(clip_budget(source, spec)), str(target)]
    result = run_process(command, timeout, root=root)
    audit = 'audit/' + source['id'] + '-clip-' + str(time.time_ns()) + '.json'
    save_json(safe_path(root, audit), result)
    spec['export'] = {'status': 'incomplete', 'path': relative, 'audit': audit, 'reason': 'Process/output verification incomplete'}
    if result['exit_code'] != 0 or result['timed_out']:
        return False
    try:
        duration = probe(root, relative, min(timeout, 60))
        if abs(duration - (spec['end'] - spec['start'])) > 0.25:
            raise ValueError('Export duration outside 250 ms tolerance')
        spec['export'] = dict(record_file(root, relative, duration), audit=audit, bounds='decoded reencode; frame/audio rounding <=250ms')
        return True
    except (ValueError, KeyError, TypeError) as exc:
        spec['export']['reason'] = str(exc)
        return False


def status_report(root):
    manifest = load_manifest(root)
    return {'sources': len(manifest['sources']),
            'availability': dict(Counter(s.get('availability', 'not-planned') for s in manifest['sources'])),
            'backup': dict(Counter(s.get('backup', {}).get('status', 'not-started') for s in manifest['sources'])),
            'clips': dict(Counter(c.get('export', {}).get('status', 'not-started') for s in manifest['sources'] for c in s.get('clips', [])))}


def migrate_metadata(root):
    """Copy only immutable JSON history; preflight all conflicts before writing."""
    root = validate_root(root)
    if root not in (DEFAULT_ROOT, EXTERNAL_ARCHIVE):
        raise ValueError('Metadata migration requires an exact paired destination')
    origin = DEFAULT_ROOT if root == EXTERNAL_ARCHIVE else LEGACY_ROOT
    external = root == EXTERNAL_ARCHIVE
    if external:
        metadata_space(0)
    manifest = deepcopy(load_manifest(origin))  # Missing history is not an empty migration.
    copies = []
    total = 0
    for folder in ('audit', 'manifests'):
        source_dir = safe_path(origin, folder)
        for source in sorted(source_dir.glob('*.json')):
            if external:
                metadata_space(0)
            source = safe_path(origin, str(source.relative_to(origin)))
            if not source.is_file() or source.stat().st_size > 12 * 1024**2:
                raise ValueError('Unsafe metadata file')
            target = safe_path(root, str(source.relative_to(origin)))
            total += source.stat().st_size
            if external and (total > 256 * 1024**2 or len(copies) >= 4096):
                raise ValueError('External metadata history exceeds bounded migration size')
            content = source.read_bytes()
            if target.exists() and (not target.is_file() or target.read_bytes() != content):
                raise ValueError('Metadata destination conflict: ' + str(target))
            copies.append((source, target, content))
    if external:
        # Serialize the state that would be latest AFTER copying, including a
        # resumed partial migration whose destination only has older history.
        incoming = [target.name for _, target, _ in copies if target.parent == root/'manifests']
        existing = [path.name for path in safe_path(root, 'manifests').glob('*.json')]
        if existing and max(existing) > max(incoming, default=''):
            manifest = deepcopy(load_manifest(root))
        manifest['migration'] = {'from':destination_label(origin), 'to':destination_label(root),
                                'copied_metadata_files':len(copies), 'at':now(),
                                'mode':'byte-for-byte metadata only; original history preserved'}
        for source in manifest['sources']:
            resolve_review_retry(source)
        update_capacity(root, manifest)
        checkpoint = metadata_json(manifest)
        pending = [(source, target, content) for source, target, content in copies if not recheck_path(target).exists()]
        remaining = len(checkpoint) + sum(len(content) for _, _, content in pending)
        metadata_space(remaining)  # Full history + exact new checkpoint, not media budget.
        for source, target, content in pending:
            write_metadata(target, content, remaining - len(content))
            if recheck_path(target).read_bytes() != content:
                raise ValueError('Metadata copy verification failed: ' + str(target))
            remaining -= len(content)
        write_metadata(safe_path(root, 'manifests/' + str(time.time_ns()) + '.json'), checkpoint)
        return manifest
    for source, target, content in copies:
        if not recheck_path(target).exists():
            recheck_path(target).parent.mkdir(parents=True, exist_ok=True)
            with recheck_path(target).open('xb') as stream:
                stream.write(content)
        if recheck_path(target).read_bytes() != content:
            raise ValueError('Metadata copy verification failed: ' + str(target))
    manifest = load_manifest(root)
    manifest['migration'] = {'from':destination_label(origin), 'to':destination_label(root),
                             'copied_metadata_files':len(copies), 'at':now(), 'mode':'byte-for-byte metadata only; original history preserved'}
    return manifest


def update_capacity(root, manifest):
    requirement = required_bytes(manifest, root)
    manifest['capacity'] = capacity(requirement, free_bytes(root))
    manifest['capacity_checked_at'] = now()
    manifest['capacity_basis'] = 'offline current filesystem; whole-job estimate from retained metadata'
    manifest['destination'] = destination_label(root)
    manifest['policy'] = {'max_height': 720, 'format_selector': FORMAT, 'reserve_bytes': RESERVE,
                          'original_budget': '5x selected estimate (streams + merge + retained fragments + uncertainty)',
                          'clip_budget': '2x bounded reencode estimate; failures retained',
                          'missing_estimate': 'blocks all media actions'}


def unattempted_selection(manifest):
    selected, skipped = [], []
    for source in manifest['sources']:
        reason = None
        if 'backup' in source:
            reason = 'existing-backup-record'
        elif source.get('requiresExplicitRetry', False) is not False:
            reason = 'explicit-or-unknown-retry-state'
        else:
            markers = {key for key in source if 'attempt' in key.lower() or key in
                       ('prior_failure', 'retry_resolution', 'backup_history', 'prior_backup')}
            # S8's resolved review sample explicitly was NOT a full backup attempt.
            failure, resolution = source.get('prior_failure'), source.get('retry_resolution')
            if (source['id'] == 'qNpQpJLHyUg' and isinstance(failure, dict) and isinstance(resolution, dict)
                    and failure.get('action') == 'review-sample-download'
                    and resolution.get('authorization_ref') == 'S8/L25'
                    and resolution.get('status') == 'review-sample-ready-not-full-backup'):
                markers -= {'prior_failure', 'retry_resolution'}
            if markers:
                reason = 'prior-or-unknown-attempt-evidence'
            elif source.get('availability') != 'accessible':
                reason = 'metadata-not-accessible'
        if reason:
            skipped.append({'id':source['id'], 'reason':reason})
        else:
            selected.append(source['id'])
    return {'selected_ids':selected, 'skipped':skipped, 'attempted_ids':[],
            'basis':'first full-backup attempts only; existing records and retry evidence retained'}


def explicit_retry_selection(manifest, ids):
    if len(ids) != len(set(ids)) or any(not re.fullmatch(r'[A-Za-z0-9_-]{11}', ident) for ident in ids):
        raise ValueError('Retry selection requires unique valid source IDs')
    sources = {source['id']:source for source in manifest['sources']}
    for ident in ids:
        source = sources.get(ident, {})
        backup = source.get('backup')
        if not isinstance(backup, dict) or backup.get('status') != 'incomplete':
            raise ValueError('Retry source must have an existing incomplete backup: ' + ident)
        if (source.get('availability') != 'accessible' or not numeric(source.get('duration'))
                or source['duration'] <= 0 or not numeric(source.get('estimate', {}).get('bytes'))
                or source['estimate']['bytes'] <= 0
                or not isinstance(source.get('full_backup_retries', []), list)):
            raise ValueError('Retry source metadata is not usable: ' + ident)
    return {'selected_ids':list(ids), 'skipped':[{'id':s['id'], 'reason':'not-explicitly-selected'}
            for s in manifest['sources'] if s['id'] not in ids], 'attempted_ids':[],
            'requested_at':now(), 'authorization':'explicit --retry-source arguments',
            'prior_states':{ident:deepcopy(sources[ident]) for ident in ids},
            'basis':'one fresh attempt per selected incomplete source; failures stop; old namespaces retained'}


def recovery_checkpoint(manifest, evidence, key='unattempted_recovery'):
    outstanding = [source['id'] for source in manifest['sources']
                   if not isinstance(source.get('backup'), dict) or source['backup'].get('status') != 'complete']
    evidence.update(outstanding_ids=outstanding, status='partial' if outstanding else 'complete')
    manifest[key] = evidence


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['inventory', 'plan', 'backup', 'clips', 'status', 'migrate-metadata', 'refresh-offline'],
                        help='refresh-offline reconciles current ranges and appends capacity without network/media')
    parser.add_argument('--root', default=DEFAULT_ROOT)
    parser.add_argument('--dry-run', action='store_true', help='Process-free, read-only: plan prints inventory; backup/clips compute current ranges/capacity without snapshots')
    parser.add_argument('--timeout', type=int, default=120, help='Per-process seconds (1..1800)')
    parser.add_argument('--job-seconds', type=int, default=14400, help='Total job budget (1..86400)')
    parser.add_argument('--unattempted-only', action='store_true',
                        help='backup only: first attempts with no backup record or unresolved/unknown prior attempt; never retry failures')
    parser.add_argument('--retry-source', action='append', metavar='ID',
                        help='backup only: explicit one-attempt retry of each selected incomplete ID in a fresh namespace; repeat for IDs; stops on first failure; incompatible with --unattempted-only')
    args = parser.parse_args(argv)
    if args.retry_source and (args.action != 'backup' or args.unattempted_only):
        parser.error('--retry-source requires backup and cannot be combined with --unattempted-only')
    if args.unattempted_only and args.action != 'backup':
        parser.error('--unattempted-only requires backup')
    try:
        root = validate_root(args.root)
        if not 1 <= args.timeout <= 1800 or not 1 <= args.job_seconds <= 86400:
            raise ValueError('Invalid bounded process/job timeout')
        if args.action == 'status':
            print(json.dumps(status_report(root), indent=2))
            return 0
        if args.action in ('inventory', 'plan'):
            manifest = inventory()
            if args.action == 'inventory' or args.dry_run:
                print(json.dumps(manifest, indent=2))
                return 0
        elif args.action == 'migrate-metadata':
            if args.dry_run:
                raise ValueError('Use refresh-offline --dry-run for a read-only check; migration writes metadata')
            manifest = migrate_metadata(root)
        else:
            retained = load_manifest(root)
            manifest = reconcile_inventory(retained, inventory())
        if args.action in ('plan', 'migrate-metadata'):
            for source in manifest['sources']:
                resolve_review_retry(source)
        deadline = time.monotonic() + args.job_seconds
        failures = False
        if args.action == 'plan':
            # Replanning preserves earlier complete backup/export records only if hashes match.
            try:
                previous = {s['id']: s for s in load_manifest(root)['sources']}
            except ValueError:
                previous = {}
            for index, source in enumerate(manifest['sources']):
                if time.monotonic() >= deadline or not capacity(32 * 1024 ** 2, free_bytes(root))['allowed']:
                    source.update(availability='not-planned', reason='Job deadline or reserve reached')
                    failures = True
                    continue
                print(f"plan {index + 1}/{len(manifest['sources'])} {source['id']}", file=sys.stderr, flush=True)
                plan_source(root, source, min(args.timeout, max(1, int(deadline - time.monotonic()))))
                prior = previous.get(source['id'], {})
                if prior.get('requiresExplicitRetry'):
                    resolve_review_retry(prior)
                    source['requiresExplicitRetry'] = prior['requiresExplicitRetry']
                    source['prior_failure'] = prior.get('prior_failure', prior.get('backup'))
                if prior.get('retry_resolution'):
                    source['retry_resolution'] = prior['retry_resolution']
                if verified(root, prior.get('backup')):
                    source['backup'] = prior['backup']
                old_clips = {(c['start'], c['end']): c for c in prior.get('clips', [])}
                for spec in source.get('clips', []):
                    old = old_clips.get((spec['start'], spec['end']), {})
                    if verified(root, old.get('export')):
                        spec['export'] = old['export']
                snapshot(root, manifest)
        external_migration = args.action == 'migrate-metadata' and root == EXTERNAL_ARCHIVE
        evidence = (explicit_retry_selection(retained, args.retry_source) if args.retry_source
                    else unattempted_selection(manifest) if args.unattempted_only else None)
        recovery_key = 'explicit_retry_recovery' if args.retry_source else 'unattempted_recovery'
        def checkpoint():
            if evidence is not None:
                recovery_checkpoint(manifest, evidence, recovery_key)
            snapshot(root, manifest)
        if not external_migration:
            if evidence is None:
                update_capacity(root, manifest)
            else:
                # Unknown records stay intact; conservatively budget them as absent.
                budget = deepcopy(manifest)
                for source in budget['sources']:
                    if 'backup' in source and not isinstance(source['backup'], dict):
                        del source['backup']
                update_capacity(root, budget)
                for key in ('capacity', 'capacity_checked_at', 'capacity_basis', 'destination', 'policy'):
                    manifest[key] = budget[key]
                # Budget current ranges, but never rewrite even derived fields of
                # skipped sources in the recovery snapshots.
                prior = {source['id']:source for source in retained['sources']}
                skipped = {item['id'] for item in evidence['skipped']}
                manifest['sources'] = [deepcopy(prior[source['id']])
                    if (args.retry_source or source['id'] in skipped) and source['id'] in prior else source
                    for source in manifest['sources']]
                recovery_checkpoint(manifest, evidence, recovery_key)
                if not args.dry_run and (not args.retry_source or manifest['capacity']['allowed']):
                    checkpoint()
        if args.retry_source and not manifest['capacity']['allowed']:
            print(json.dumps({'capacity':manifest['capacity'], recovery_key:evidence}, indent=2))
            return 3
        if args.action in ('backup', 'clips') and not args.dry_run and manifest['capacity']['allowed']:
            for index, source in enumerate(manifest['sources']):
                if evidence is not None and source['id'] not in evidence['selected_ids']:
                    continue
                if source.get('availability') != 'accessible':
                    continue
                print(f"{args.action} {index + 1}/{len(manifest['sources'])} {source['id']}", file=sys.stderr, flush=True)
                specs = [None] if args.action == 'backup' else source.get('clips', [])
                for spec in specs:
                    remaining = deadline - time.monotonic()
                    amount = source['estimate']['bytes'] * 5 if spec is None else 2 * clip_budget(source, spec)
                    if remaining < 1 or not capacity(amount, free_bytes(root))['allowed']:
                        manifest['stopped'] = 'Deadline or per-operation capacity block; no new process'
                        checkpoint()
                        print(json.dumps(manifest['capacity'], indent=2))
                        return 3
                    timeout = min(args.timeout, max(1, int(remaining)))
                    if evidence is not None:
                        evidence['attempted_ids'].append(source['id'])
                    if args.retry_source:
                        ok = retry_backup_source(root, source, timeout, checkpoint)
                    else:
                        ok = backup_source(root, source, timeout) if spec is None else export_clip(root, source, spec, timeout)
                    checkpoint()
                    if not ok:
                        if spec is None:
                            source['requiresExplicitRetry'] = True
                            checkpoint()
                        failures = True
                        # No automatic retry. Stop this invocation; retain all evidence.
                        print('Operation failed; audit/partials preserved. No retry.', file=sys.stderr)
                        if evidence is not None:
                            print(json.dumps({recovery_key:evidence}, indent=2))
                        return 4
        if not args.dry_run and not external_migration:
            checkpoint()
        print(json.dumps({'capacity': manifest['capacity'], 'sources': len(manifest['sources']),
                          'planned_clips':sum(len(s.get('clips', [])) for s in manifest['sources']),
                          'reconciliation':manifest.get('reconciliation'),
                          'status': 'dry-run' if args.dry_run else args.action,
                          **({recovery_key:evidence} if evidence is not None else {})}, indent=2))
        if not manifest['capacity']['allowed']:
            return 3
        if (evidence is not None and not args.dry_run and evidence['outstanding_ids']):
            return 4
        if failures or any(s.get('availability') in ('unavailable', 'not-planned') for s in manifest['sources']):
            return 4
        return 0
    except MetadataCapacityError as exc:
        print('Archive error: ' + str(exc), file=sys.stderr)
        return 3
    except (ValueError, OSError, KeyError, TypeError, zipfile.BadZipFile) as exc:
        print('Archive error: ' + str(exc), file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
