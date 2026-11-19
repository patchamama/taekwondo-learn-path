"""External grant tests: no access to the actual SSD."""
import sys
sys.dont_write_bytecode = True
import unittest
import io
import hashlib
from contextlib import ExitStack
from pathlib import Path
from unittest.mock import patch, Mock
from scripts import external_resource_backup as b


class GuardTests(unittest.TestCase):
    def test_exact_kind_and_root(self):
        for path, kind in ((b.EXTERNAL_OUTPUT/'child', 'catalogue'),
                           (b.EXTERNAL_BASE, 'unknown'),
                           (str(b.EXTERNAL_BASE)+'/../taekwondo-resources', 'base'),
                           (b.EXTERNAL_OUTPUT, 'books')):
            with self.subTest(path=path, kind=kind), self.assertRaises(ValueError):
                b.guard_external(path, kind=kind)

    def test_mount_device_and_permissions(self):
        with patch.object(Path, 'is_symlink', return_value=False), \
             patch.object(Path, 'resolve', autospec=True, side_effect=lambda p: p), \
             patch.object(Path, 'is_dir', return_value=True), \
             patch.object(Path, 'exists', return_value=True), \
             patch.object(Path, 'stat', side_effect=lambda **kw: Mock(st_dev=2)), \
             patch.object(b.os.path, 'ismount', return_value=False):
            with self.assertRaises(OSError): b.guard_external(b.EXTERNAL_BASE, kind='base')


    def test_device_writable_and_symlink_rules(self):
        for mounted, same_device, writable, symlink, error in (
                (True, False, True, False, None), (True, True, True, False, OSError),
                (True, False, False, False, OSError), (True, False, True, True, ValueError)):
            with self.subTest(same_device=same_device, writable=writable, symlink=symlink), ExitStack() as stack:
                stack.enter_context(patch.object(Path, 'is_symlink', return_value=symlink))
                stack.enter_context(patch.object(Path, 'resolve', autospec=True, side_effect=lambda p: p))
                stack.enter_context(patch.object(Path, 'is_dir', return_value=True))
                stack.enter_context(patch.object(Path, 'exists', return_value=True))
                stack.enter_context(patch.object(Path, 'stat', autospec=True,
                    side_effect=lambda p, **kw: Mock(st_dev=1 if p == b.ROOT and not same_device else 2)))
                stack.enter_context(patch.object(b.os.path, 'ismount', return_value=mounted))
                stack.enter_context(patch.object(b.os, 'access', return_value=writable))
                if error:
                    with self.assertRaises(error): b.guard_external(b.EXTERNAL_BASE, kind='base')
                else: self.assertEqual(b.guard_external(b.EXTERNAL_BASE, kind='base'), b.EXTERNAL_BASE)


class CopyTests(unittest.TestCase):
    def test_dry_run_no_writes_or_processes(self):
        with patch.object(b, 'guard_external'), patch.object(b, 'source_entries', return_value=[]), \
             patch.object(b, 'preflight', return_value=[]), patch.object(Path, 'open') as opened, \
             patch.object(Path, 'mkdir') as mkdir, patch.object(b, 'evidence') as evidence:
            self.assertTrue(b.copy_resources(dry_run=True)['dryRun'])
            opened.assert_not_called(); mkdir.assert_not_called(); evidence.assert_not_called()

    def test_conflict_rejected_before_any_write(self):
        with patch.object(b, 'guard_external'), patch.object(b, 'external_check'), \
             patch.object(b, 'source_entries', return_value=[(Path('/source'), b.EXTERNAL_BOOKS/'a.epub', 'books')]), \
             patch.object(b, 'digest', side_effect=['a', 'b']), \
             patch.object(Path, 'stat', return_value=Mock(st_size=3)), \
             patch.object(Path, 'exists', return_value=True), patch.object(Path, 'is_file', return_value=True), \
             patch.object(Path, 'mkdir') as mkdir, patch.object(Path, 'open') as opened:
            with self.assertRaises(ValueError): b.copy_resources()
            mkdir.assert_not_called(); opened.assert_not_called()

    def test_identical_skip_preserves_source_and_destination(self):
        row = {'source':'/source', 'path':'books/epub/a.epub', 'kind':'books',
               'bytes':3, 'sha256':'a', 'identical':True}
        with patch.object(b, 'guard_external'), patch.object(b, 'external_check'), \
             patch.object(b, 'source_entries', return_value=[]), patch.object(b, 'preflight', return_value=[row]), \
             patch.object(b, 'digest', return_value='a'), patch.object(Path, 'stat', return_value=Mock(st_size=3)), \
             patch.object(b, 'exclusive_copy') as copy, patch.object(b.os, 'utime') as utime, \
             patch.object(b, 'evidence', return_value='manifest'):
            self.assertEqual(b.copy_resources()['identical'], 1)
            copy.assert_not_called(); utime.assert_not_called()

    def test_external_capacity_and_mount_loss_before_write(self):
        with patch.object(b, 'guard_external'), patch.object(b.shutil, 'disk_usage', return_value=Mock(free=0)) as usage:
            with self.assertRaises(OSError): b.preflight([])
            usage.assert_called_once_with(b.EXTERNAL_BASE)
        with patch.object(b, 'external_check', side_effect=OSError('lost mount')), patch.object(Path, 'open') as opened:
            with self.assertRaises(OSError): b.exclusive_copy(Path('/s'), b.EXTERNAL_BOOKS/'a', 'books', 'a', 1)
            opened.assert_not_called()

    def test_source_and_destination_symlinks_rejected(self):
        with patch.object(Path, 'is_symlink', return_value=True):
            with self.assertRaises(ValueError): b.checked(Path('/source'))
        with patch.object(b, 'guard_external'), patch.object(Path, 'is_symlink', return_value=True):
            with self.assertRaises(ValueError): b.external_check(b.EXTERNAL_BOOKS/'a', 'books')

    def test_exclusive_verified_copy_and_no_metadata_mutation(self):
        raw = b'original CSS/fonts and all resources'
        sha = hashlib.sha256(raw).hexdigest()
        class Sink(io.BytesIO):
            def close(self): pass
        sink = Sink()
        with patch.object(b, 'external_check'), patch.object(b, 'checked'), patch.object(b, 'make_parents'), \
             patch.object(b, 'digest', return_value=sha), patch.object(Path, 'stat', return_value=Mock(st_size=len(raw))), \
             patch.object(b.shutil, 'disk_usage', return_value=Mock(free=b.RESERVE+10**7)), \
             patch.object(Path, 'open', side_effect=[io.BytesIO(raw), sink]) as opened, patch.object(b.os, 'utime') as utime:
            b.exclusive_copy(Path('/source'), b.EXTERNAL_BOOKS/'a', 'books', sha, len(raw))
            self.assertEqual(sink.getvalue(), raw)
            self.assertEqual(opened.call_args_list[1].args, ('xb',))
            utime.assert_not_called()


    def test_snapshot_only_mutable_files_and_dry_run(self):
        paths = [b.EXTERNAL_OUTPUT/p for p in ('index.html', 'catalogue.json',
                 'books/gold/index.html', 'books/gold/assets/a.css', 'media/images/a.png')]
        with patch.object(b, 'guard_external'), patch.object(b, 'external_check'), \
             patch.object(Path, 'rglob', return_value=paths), patch.object(Path, 'is_file', return_value=True), \
             patch.object(b, 'preflight', return_value=[]) as plan, patch.object(Path, 'open') as opened:
            b.snapshot_catalogue(dry_run=True)
            self.assertEqual([entry[0] for entry in plan.call_args.args[0]], sorted(paths[:3]))
            opened.assert_not_called()

    def test_cli_dry_run_dispatch(self):
        with patch.object(b, 'copy_resources', create=True, return_value={'dryRun': True}) as copy:
            b.main(['copy-resources', '--dry-run'])
            copy.assert_called_once_with(dry_run=True)


if __name__ == '__main__':
    unittest.main()
