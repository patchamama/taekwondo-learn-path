"""Offline behavioral tests; no network, media, or temporary files."""
import copy
from contextlib import contextmanager, ExitStack
import importlib.util
import io
import json
from pathlib import Path
import unittest
from unittest.mock import Mock, patch
import zipfile
import sys
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))

SPEC = importlib.util.spec_from_file_location('archive', Path(__file__).with_name('archive-epub-videos.py'))
archive = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(archive)


class ArchiveTests(unittest.TestCase):
    def test_external_cli_exact_root_and_readonly_commands(self):
        external = Path('/Volumes/sdd_1TB/taekwondo-resources/video/epub-backup')
        stale, current = self.stale_and_current()
        for action in ('status', 'refresh-offline', 'backup', 'clips', 'plan'):
            with self.subTest(action=action), patch.object(archive, 'guard_external', return_value=external, create=True) as guard, patch.object(archive, 'load_manifest', return_value=stale), patch.object(archive, 'inventory', return_value=current), patch.object(archive.shutil, 'disk_usage', return_value=Mock(free=627*archive.GIB)) as usage, patch.object(Path, 'exists', return_value=True), patch.object(archive, 'snapshot') as save, patch.object(archive, 'run_process') as run, patch.object(archive.sys, 'stdout', io.StringIO()):
                self.assertEqual(archive.main([action, '--root', str(external), '--dry-run']), 0)
                guard.assert_called_with(external, kind='archive')
                if action in ('backup', 'clips', 'refresh-offline'):
                    self.assertEqual(usage.call_args.args[0], external)
                save.assert_not_called()
                run.assert_not_called()
        for root in (external/'child', external.parent/'sibling', Path('/Volumes/other/archive'), external/'..'/'epub-backup', str(external)+'/', str(external).replace('/video/', '//video/')):
            with self.subTest(root=root), patch.object(archive, 'guard_external', return_value=external, create=True), patch.object(archive, 'inventory') as read, patch.object(archive.sys, 'stderr', io.StringIO()):
                self.assertEqual(archive.main(['plan', '--dry-run', '--root', str(root)]), 2)
                read.assert_not_called()

    def test_external_mount_loss_prevents_cli_io_and_dispatch(self):
        external = Path('/Volumes/sdd_1TB/taekwondo-resources/video/epub-backup')
        for action in ('status', 'refresh-offline', 'backup', 'clips', 'migrate-metadata'):
            with self.subTest(action=action), patch.object(archive, 'guard_external', side_effect=ValueError('offline'), create=True), patch.object(archive, 'load_manifest') as read, patch.object(archive, 'snapshot') as save, patch.object(archive.subprocess, 'Popen') as run, patch.object(archive.sys, 'stderr', io.StringIO()):
                self.assertEqual(archive.main([action, '--root', str(external)]), 2)
                read.assert_not_called()
                save.assert_not_called()
                run.assert_not_called()
        with patch.object(archive, 'guard_external', side_effect=ValueError('offline'), create=True), patch.object(archive.subprocess, 'Popen') as run:
            with self.assertRaises(ValueError): archive.run_process(['ffprobe'], 1, root=external)
            run.assert_not_called()

    def test_external_migration_uses_only_paired_internal_history(self):
        external = Path('/Volumes/sdd_1TB/taekwondo-resources/video/epub-backup')
        old = archive.DEFAULT_ROOT/'manifests/history.json'
        new = external/'manifests/history.json'
        stale, _ = self.stale_and_current()
        stale['sources'][0].update(requiresExplicitRetry=True, backup={'status':'incomplete'}, prior_failure={'action':'backup'})
        before = copy.deepcopy(stale)
        with patch.object(archive, 'guard_external', return_value=external, create=True), patch.object(Path, 'glob', side_effect=[[], [old], [new]]), patch.object(Path, 'is_file', return_value=True), patch.object(Path, 'stat', return_value=Mock(st_size=3)), patch.object(Path, 'read_bytes', return_value=b'old'), patch.object(Path, 'exists', return_value=True), patch.object(Path, 'open') as opened, patch.object(archive, 'load_manifest', return_value=stale), patch.object(archive, 'free_bytes', return_value=627*archive.GIB), patch.object(archive, 'write_metadata') as write:
            result = archive.migrate_metadata(external)
            opened.assert_not_called()
            self.assertEqual(write.call_count, 1, 'only a new checkpoint; identical history is untouched')
            self.assertEqual(result['migration']['from'], 'video/epub-backup')
            self.assertEqual(result['migration']['to'], str(external))
            self.assertEqual(result['sources'], before['sources'])
        with patch.object(archive, 'guard_external', return_value=external, create=True), patch.object(Path, 'glob', side_effect=[[], [old]]), patch.object(Path, 'is_file', return_value=True), patch.object(Path, 'stat', return_value=Mock(st_size=3)), patch.object(Path, 'read_bytes', side_effect=[b'old', b'conflict']), patch.object(Path, 'exists', return_value=True), patch.object(Path, 'open') as opened, patch.object(archive, 'free_bytes', return_value=627*archive.GIB), patch.object(archive, 'load_manifest', return_value=stale):
            with self.assertRaises(ValueError): archive.migrate_metadata(external)
            opened.assert_not_called()

    def test_external_mount_loss_rechecked_before_read_capacity_and_write(self):
        external = archive.EXTERNAL_ARCHIVE
        stale, current = self.stale_and_current()
        with patch.object(archive, 'guard_external', side_effect=[external, ValueError('lost')]), patch.object(Path, 'exists') as exists, patch.object(archive.sys, 'stderr', io.StringIO()):
            self.assertEqual(archive.main(['status', '--root', str(external)]), 2)
            exists.assert_not_called()
        with patch.object(archive, 'guard_external', side_effect=[external, ValueError('lost')]), patch.object(archive, 'load_manifest', return_value=stale), patch.object(archive, 'inventory', return_value=current), patch.object(archive, 'required_bytes', return_value=0), patch.object(archive.shutil, 'disk_usage') as usage, patch.object(archive.sys, 'stderr', io.StringIO()):
            self.assertEqual(archive.main(['refresh-offline', '--dry-run', '--root', str(external)]), 2)
            usage.assert_not_called()
        with patch.object(archive, 'guard_external', side_effect=ValueError('lost')), patch.object(Path, 'mkdir') as mkdir, patch.object(Path, 'open') as opened:
            with self.assertRaises(ValueError): archive.save_json(external/'manifests/new.json', {})
            mkdir.assert_not_called()
            opened.assert_not_called()

    def test_external_loss_during_process_kills_group_without_fallback(self):
        process = Mock(pid=123, returncode=-9)
        process.communicate.return_value = (b'', b'')
        with patch.object(archive, 'guard_external', return_value=archive.EXTERNAL_ARCHIVE), patch.object(archive.subprocess, 'Popen', return_value=process) as popen, patch.object(archive, 'free_bytes', side_effect=ValueError('lost')), patch.object(archive.os, 'killpg') as kill:
            with self.assertRaises(ValueError): archive.run_process(['ffmpeg'], 10, root=archive.EXTERNAL_ARCHIVE)
            kill.assert_called_once()
            self.assertEqual(popen.call_args.kwargs['cwd'], str(archive.EXTERNAL_ARCHIVE))
            for key in ('TMPDIR', 'TMP', 'TEMP'):
                self.assertEqual(popen.call_args.kwargs['env'][key], str(archive.EXTERNAL_ARCHIVE))

    def test_external_backup_cli_outputs_and_partials_remain_external(self):
        external = archive.EXTERNAL_ARCHIVE
        stale, current = self.stale_and_current()
        failure = {'exit_code':1, 'timed_out':False, 'stderr':'failure'}
        with patch.object(archive, 'guard_external', return_value=external), patch.object(archive, 'load_manifest', return_value=stale), patch.object(archive, 'inventory', return_value=current), patch.object(archive, 'free_bytes', return_value=627*archive.GIB), patch.object(Path, 'exists', return_value=False), patch.object(Path, 'mkdir'), patch.object(Path, 'glob', return_value=[]), patch.object(archive, 'run_process', return_value=failure) as run, patch.object(archive, 'save_json'), patch.object(archive.sys, 'stdout', io.StringIO()), patch.object(archive.sys, 'stderr', io.StringIO()):
            self.assertEqual(archive.main(['backup', '--root', str(external)]), 4)
            command = run.call_args.args[0]
            self.assertEqual(command[command.index('-o')+1], str(external/'originals/qNpQpJLHyUg.%(ext)s'))
            self.assertEqual(command[command.index('--paths')+1], 'temp:'+str(external/'originals'))
            self.assertEqual(run.call_args.kwargs['root'], external)
            self.assertEqual(command[command.index('--retries')+1], '0')
            self.assertNotIn('backup', stale['sources'][0])

    def test_external_refresh_cli_appends_without_resolving_retries(self):
        external = archive.EXTERNAL_ARCHIVE
        stale, current = self.stale_and_current()
        stale.update(capacity={'free_bytes':7430000000})
        stale['sources'][0].update(requiresExplicitRetry=True, backup={'status':'incomplete'}, prior_failure={'action':'backup'})
        original = copy.deepcopy(stale)
        for action in ('refresh-offline',):
            with self.subTest(action=action), patch.object(archive, 'guard_external', return_value=external), patch.object(archive, 'load_manifest', return_value=stale), patch.object(archive, 'inventory', return_value=current), patch.object(archive, 'free_bytes', return_value=627*archive.GIB), patch.object(archive, 'snapshot') as save, patch.object(archive, 'run_process') as run, patch.object(archive.sys, 'stdout', io.StringIO()):
                self.assertEqual(archive.main([action, '--root', str(external)]), 0)
                updated = save.call_args.args[1]
                self.assertEqual(updated['capacity']['free_bytes'], 627*archive.GIB)
                self.assertEqual(updated['destination'], str(external))
                self.assertTrue(updated['sources'][0]['requiresExplicitRetry'])
                self.assertEqual(updated['sources'][0]['backup'], {'status':'incomplete'})
                run.assert_not_called()
        self.assertEqual(stale, original)

    def test_external_clips_cli_keeps_input_output_and_probe_external(self):
        external = archive.EXTERNAL_ARCHIVE
        stale, current = self.stale_and_current()
        stale['sources'][0]['backup'] = {'path':'originals/source.mkv', 'duration':502, 'status':'complete'}
        with patch.object(archive, 'guard_external', return_value=external), patch.object(archive, 'load_manifest', return_value=stale), patch.object(archive, 'inventory', return_value=current), patch.object(archive, 'free_bytes', return_value=627*archive.GIB), patch.object(archive, 'verified', side_effect=lambda root, entry: bool(entry)), patch.object(Path, 'mkdir'), patch.object(archive, 'run_process', return_value={'exit_code':1, 'timed_out':False}) as run, patch.object(archive, 'save_json'), patch.object(archive.sys, 'stdout', io.StringIO()), patch.object(archive.sys, 'stderr', io.StringIO()):
            self.assertEqual(archive.main(['clips', '--root', str(external)]), 4)
            command = run.call_args.args[0]
            self.assertEqual(command[command.index('-i')+1], str(external/'originals/source.mkv'))
            self.assertTrue(Path(command[-1]).is_relative_to(external/'clips'))
            self.assertEqual(run.call_args.kwargs['root'], external)
        with patch.object(archive, 'guard_external', return_value=external), patch.object(archive, 'run_process', return_value={'exit_code':1, 'timed_out':False}) as run, patch.object(archive, 'save_json'):
            with self.assertRaises(ValueError): archive.probe(external, 'originals/source.mkv', 10)
            self.assertEqual(run.call_args.kwargs['root'], external)

    def test_external_missing_migration_source_fails_before_writes(self):
        with patch.object(archive, 'free_bytes', return_value=627*archive.GIB), patch.object(archive, 'guard_external', return_value=archive.EXTERNAL_ARCHIVE), patch.object(archive, 'load_manifest', side_effect=ValueError('No manifest')), patch.object(Path, 'mkdir') as mkdir, patch.object(Path, 'open') as opened, patch.object(archive.sys, 'stderr', io.StringIO()):
            self.assertEqual(archive.main(['migrate-metadata', '--root', str(archive.EXTERNAL_ARCHIVE)]), 2)
            mkdir.assert_not_called()
            opened.assert_not_called()

    def test_external_public_cli_with_real_shared_guard_mocked_mount(self):
        import external_resource_backup as helper
        for mounted, same_device, symlink, writable in ((True, False, False, True), (False, False, False, True), (True, True, False, True), (True, False, True, True), (True, False, False, False)):
            expected = 0 if mounted and not same_device and not symlink and writable else 2
            def device(path, *args, **kwargs):
                return Mock(st_dev=1 if path == helper.ROOT or same_device else 2)
            with self.subTest(mounted=mounted, same_device=same_device, symlink=symlink, writable=writable), patch.object(helper.os.path, 'ismount', return_value=mounted), patch.object(helper.os, 'access', return_value=writable), patch.object(Path, 'is_symlink', return_value=symlink), patch.object(Path, 'resolve', lambda path: path), patch.object(Path, 'stat', device), patch.object(Path, 'is_dir', return_value=True), patch.object(Path, 'exists', return_value=True), patch.object(archive, 'inventory', return_value={'sources':[]}) as read, patch.object(archive, 'save_json') as save, patch.object(archive.subprocess, 'Popen') as process, patch.object(archive.sys, 'stdout', io.StringIO()), patch.object(archive.sys, 'stderr', io.StringIO()):
                self.assertEqual(archive.main(['plan', '--dry-run', '--root', str(archive.EXTERNAL_ARCHIVE)]), expected)
                if expected == 2: read.assert_not_called()
                save.assert_not_called()
                process.assert_not_called()

    def test_metadata_reserve_public_cli_rejects_before_any_write(self):
        external = archive.EXTERNAL_ARCHIVE
        stale, current = self.stale_and_current()
        before = copy.deepcopy(stale)
        old = archive.DEFAULT_ROOT/'manifests/100.json'
        for action in ('migrate-metadata', 'refresh-offline'):
            output, error = io.StringIO(), io.StringIO()
            with self.subTest(action=action), patch.object(archive, 'guard_external', return_value=external), patch.object(archive, 'load_manifest', side_effect=lambda root: copy.deepcopy(stale)), patch.object(archive, 'inventory', return_value=current), patch.object(archive, 'free_bytes', return_value=archive.RESERVE) as free, patch.object(Path, 'glob', side_effect=lambda path: [old] if path == '*.json' else []), patch.object(Path, 'is_file', return_value=True), patch.object(Path, 'stat', return_value=Mock(st_size=3)), patch.object(Path, 'read_bytes', return_value=b'old'), patch.object(Path, 'exists', return_value=False), patch.object(Path, 'mkdir') as mkdir, patch.object(Path, 'open') as opened, patch.object(archive.sys, 'stdout', output), patch.object(archive.sys, 'stderr', error):
                self.assertEqual(archive.main([action, '--root', str(external)]), 3)
                mkdir.assert_not_called()
                opened.assert_not_called()
                self.assertIn('metadata', error.getvalue().lower())
                self.assertEqual(output.getvalue(), '')
                self.assertTrue(all(call.args[0] == external for call in free.call_args_list))
        self.assertEqual(stale, before)

    def test_metadata_reserve_save_boundary_rejects_before_encoding_or_mkdir(self):
        external = archive.EXTERNAL_ARCHIVE
        with patch.object(archive, 'guard_external', return_value=external), patch.object(archive, 'free_bytes', return_value=archive.RESERVE), patch.object(archive.json, 'dump') as encode, patch.object(archive.json.JSONEncoder, 'iterencode') as chunks, patch.object(Path, 'mkdir') as mkdir, patch.object(Path, 'open') as opened:
            with self.assertRaisesRegex(ValueError, '[Mm]etadata'):
                archive.save_json(external/'audit/denied.json', {'sources':[]})
            encode.assert_not_called()
            chunks.assert_not_called()
            mkdir.assert_not_called()
            opened.assert_not_called()

    @contextmanager
    def metadata_filesystem(self, free):
        """In-memory filesystem: real public CLI, no real temp or SSD writes."""
        stale, current = self.stale_and_current()
        stale['sources'][0].update(requiresExplicitRetry=True, backup={'status':'incomplete'}, prior_failure={'action':'backup'})
        original = json.dumps(stale).encode()
        files = {archive.DEFAULT_ROOT/'manifests/100.json': original,
                 archive.DEFAULT_ROOT/'audit/attempt.json': b'{"failure":"timeout"}'}
        dirs, events = set(), []
        @contextmanager
        def opened(path, mode, **kwargs):
            self.assertEqual(mode, 'xb')
            if path in files: raise FileExistsError(str(path))
            events.append(('open', path))
            files[path] = b''
            writer = Mock()
            def write(content):
                events.append(('write', path))
                files[path] += content
            writer.write.side_effect = write
            yield writer
        def mkdir(path, **kwargs):
            events.append(('mkdir', path))
            dirs.add(path)
        def available(root):
            self.assertEqual(root, archive.EXTERNAL_ARCHIVE)
            events.append(('capacity', root))
            return free(files, events) if callable(free) else free
        with ExitStack() as stack:
            for item in (
                patch.object(archive, 'guard_external', return_value=archive.EXTERNAL_ARCHIVE),
                patch.object(archive, 'inventory', return_value=current),
                patch.object(archive, 'free_bytes', side_effect=available),
                patch.object(Path, 'glob', lambda path, pattern: sorted(p for p in files if p.parent == path and p.suffix == '.json')),
                patch.object(Path, 'exists', lambda path: path in files or path in dirs or any(path in p.parents for p in files)),
                patch.object(Path, 'is_file', lambda path: path in files),
                patch.object(Path, 'stat', lambda path, **kwargs: Mock(st_size=len(files.get(path, b'')))),
                patch.object(Path, 'read_bytes', lambda path: files[path]),
                patch.object(Path, 'read_text', lambda path: files[path].decode()),
                patch.object(Path, 'mkdir', mkdir), patch.object(Path, 'open', opened),
                patch.object(archive.sys, 'stdout', io.StringIO()), patch.object(archive.sys, 'stderr', io.StringIO())):
                stack.enter_context(item)
            yield files, dirs, events

    def test_metadata_reserve_exact_history_and_checkpoint_budget(self):
        # Enough for metadata, deliberately far below the whole-media budget.
        margin = archive.RESERVE + 256*1024**2
        with self.metadata_filesystem(margin + 100000) as (files, dirs, events):
            source = {p: data for p, data in files.items()}
            code = archive.main(['migrate-metadata', '--root', str(archive.EXTERNAL_ARCHIVE)])
            self.assertEqual(code, 3, 'media remains capacity-blocked, metadata can fit')
            for path, data in source.items():
                self.assertEqual(files[path], data)
                self.assertEqual(files[archive.EXTERNAL_ARCHIVE/path.relative_to(archive.DEFAULT_ROOT)], data)
            checkpoints = [p for p in files if p.parent == archive.EXTERNAL_ARCHIVE/'manifests' and p.name != '100.json']
            self.assertEqual(len(checkpoints), 1)
            latest = json.loads(files[checkpoints[0]])
            self.assertTrue(latest['sources'][0]['requiresExplicitRetry'])
            self.assertEqual(latest['sources'][0]['prior_failure'], {'action':'backup'})
            self.assertEqual(latest['sources'][0]['backup'], {'status':'incomplete'})
            needed = sum(len(data) for p, data in files.items() if p.is_relative_to(archive.EXTERNAL_ARCHIVE))
            for index, (event, path) in enumerate(events):
                if event in ('mkdir', 'open', 'write'):
                    self.assertTrue(path.is_relative_to(archive.EXTERNAL_ARCHIVE))
                    self.assertEqual(events[index-1][0], 'capacity')
        # One byte below that exact new-history/checkpoint requirement: no mutation.
        with self.metadata_filesystem(margin + needed - 1) as (files, dirs, events), patch.object(archive, 'now', return_value=latest['capacity_checked_at']):
            before = dict(files)
            self.assertEqual(archive.main(['migrate-metadata', '--root', str(archive.EXTERNAL_ARCHIVE)]), 3)
            self.assertEqual(files, before)
            self.assertEqual(dirs, set())
            self.assertFalse(any(event != 'capacity' for event, _ in events))

    def test_metadata_reserve_mid_migration_loss_retains_verified_copy(self):
        margin = archive.RESERVE + 256*1024**2
        def free(files, events):
            copied = any(p.is_relative_to(archive.EXTERNAL_ARCHIVE) and data for p, data in files.items())
            return margin - 1 if copied else margin + 100000
        with self.metadata_filesystem(free) as (files, dirs, events):
            before = dict(files)
            self.assertEqual(archive.main(['migrate-metadata', '--root', str(archive.EXTERNAL_ARCHIVE)]), 3)
            external = {p:data for p, data in files.items() if p.is_relative_to(archive.EXTERNAL_ARCHIVE)}
            self.assertEqual(external, {archive.EXTERNAL_ARCHIVE/'audit/attempt.json': before[archive.DEFAULT_ROOT/'audit/attempt.json']})
            self.assertEqual({p:files[p] for p in before}, before)
            self.assertEqual(sum(event == 'open' for event, _ in events), 1)
            self.assertEqual(events[-1][0], 'capacity')
            self.assertIn('External metadata capacity denied', archive.sys.stderr.getvalue())
            self.assertEqual(archive.sys.stdout.getvalue(), '')

    def test_metadata_reserve_resumed_migration_checkpoints_projected_latest_state(self):
        for name, retry in (('050.json', True), ('999.json', False)):
            with self.subTest(destination=name), self.metadata_filesystem(100*archive.GIB) as (files, dirs, events):
                older = json.loads(files[archive.DEFAULT_ROOT/'manifests/100.json'])
                older['sources'][0]['requiresExplicitRetry'] = False
                path = archive.EXTERNAL_ARCHIVE/'manifests'/name
                history = json.dumps(older).encode()
                files[path] = history
                self.assertEqual(archive.main(['migrate-metadata', '--root', str(archive.EXTERNAL_ARCHIVE)]), 0)
                latest = next(p for p in files if p.parent == archive.EXTERNAL_ARCHIVE/'manifests' and p.name not in (name, '100.json'))
                self.assertEqual(json.loads(files[latest])['sources'][0]['requiresExplicitRetry'], retry)
                self.assertEqual(files[path], history)

    def test_metadata_reserve_does_not_change_internal_json_writes(self):
        with patch.object(archive, 'free_bytes') as free, patch.object(Path, 'mkdir'), patch.object(Path, 'open') as opened:
            archive.save_json(archive.DEFAULT_ROOT/'audit/internal.json', {'historical':True})
            free.assert_not_called()
            self.assertEqual(opened.call_args.args[0], 'x')
            self.assertEqual(opened.call_args.kwargs['encoding'], 'utf-8')

    def test_authorized_roots_only(self):
        self.assertEqual(archive.DEFAULT_ROOT, archive.REPO/'video/epub-backup')
        for root in (archive.REPO/'video/epub-backup', archive.REPO/'.atl/epub-resources/archive'):
            self.assertEqual(archive.validate_root(root/'nested'), root/'nested')
        for root in (archive.REPO/'video/other', archive.REPO/'resources/epub', archive.REPO/'video/epub-backup/../escape'):
            with self.assertRaises(ValueError): archive.validate_root(root)
        with patch.object(Path, 'is_symlink', return_value=True):
            with self.assertRaises(ValueError): archive.validate_root(archive.DEFAULT_ROOT)

    def test_scoped_retry_resolution_preserves_history(self):
        attempt = {'videoId':'qNpQpJLHyUg', 'authorization':'S8: retoma lo de taegeuk 5', 'downloadExit':0, 'status':'ready', 'priorFailurePreserved':True}
        source = {'id':'qNpQpJLHyUg','requiresExplicitRetry':True,'prior_failure':{'action':'review-sample-download'}}
        with patch.object(archive, 'retry_attempt', return_value=attempt):
            archive.resolve_review_retry(source)
            self.assertFalse(source['requiresExplicitRetry'])
            self.assertEqual(source['retry_resolution']['authorization_ref'], 'S8/L25')
            self.assertEqual(source['prior_failure']['action'], 'review-sample-download')
            source['requiresExplicitRetry'] = True
            archive.resolve_review_retry(source)
            self.assertTrue(source['requiresExplicitRetry'], 'must not clear a later failure')
            other = {'id':'abcdefghijk','requiresExplicitRetry':True,'prior_failure':{'action':'review-sample-download'}}
            archive.resolve_review_retry(other)
            self.assertTrue(other['requiresExplicitRetry'])

    def test_metadata_migration_matches_bytes_and_never_overwrites(self):
        old = archive.LEGACY_ROOT/'audit/history.json'
        new = archive.DEFAULT_ROOT/'audit/history.json'
        with patch.object(Path, 'glob', side_effect=[[old], []]), patch.object(Path, 'is_file', return_value=True), patch.object(Path, 'stat', return_value=Mock(st_size=3)), patch.object(Path, 'read_bytes', return_value=b'old'), patch.object(Path, 'exists', return_value=True), patch.object(Path, 'open') as opened, patch.object(archive, 'load_manifest', return_value={'sources':[]}):
            result = archive.migrate_metadata(archive.DEFAULT_ROOT)
            self.assertEqual(result['migration']['copied_metadata_files'], 1)
            opened.assert_not_called()
        with patch.object(Path, 'glob', side_effect=[[old], []]), patch.object(Path, 'is_file', return_value=True), patch.object(Path, 'stat', return_value=Mock(st_size=3)), patch.object(Path, 'read_bytes', side_effect=[b'old', b'new']), patch.object(Path, 'exists', return_value=True), patch.object(Path, 'open') as opened, patch.object(archive, 'load_manifest', return_value={'sources':[]}):
            with self.assertRaises(ValueError): archive.migrate_metadata(archive.DEFAULT_ROOT)
            opened.assert_not_called()

    def stale_and_current(self):
        stale = {'schema_version':1,'sources':[{'id':'qNpQpJLHyUg','availability':'accessible','duration':502,
            'estimate':{'bytes':1000},'metadata_audit':'audit/retained.json','associations':[],
            'clips':[{'start':0,'end':30,'label':'review-preview-not-technically-reviewed','key':'0000','cardIds':[]}]}]}
        current = {'sources':[{'id':'qNpQpJLHyUg','associations':[{'kind':'app','cardId':'taeguk-5','start':184,'end':226}]}]}
        return stale, current

    def test_backup_and_clips_reconcile_before_budget_and_execution(self):
        for action in ('backup','clips'):
            stale, current = self.stale_and_current()
            original = copy.deepcopy(stale)
            planned = []
            def budget(manifest, root):
                planned.extend(manifest['sources'][0]['clips'])
                return 1000
            with self.subTest(action=action), patch.object(archive,'load_manifest',return_value=stale), patch.object(archive,'inventory',return_value=current), patch.object(archive,'required_bytes',side_effect=budget), patch.object(archive,'free_bytes',return_value=100*archive.GIB), patch.object(archive,'snapshot'), patch.object(archive,'backup_source',return_value=True) as backup, patch.object(archive,'export_clip',return_value=True) as export, patch.object(archive,'run_process') as run:
                self.assertEqual(archive.main([action]),0)
                self.assertEqual([(s['start'],s['end']) for s in planned],[(184,226)])
                if action == 'clips': self.assertEqual(export.call_args.args[2]['start'],184)
                else: self.assertEqual(backup.call_args.args[1]['clips'][0]['end'],226)
                run.assert_not_called()
            self.assertEqual(stale, original)

    def test_dry_run_current_budget_is_process_and_write_free(self):
        for action in ('backup','clips'):
            stale, current = self.stale_and_current()
            original = copy.deepcopy(stale)
            output = io.StringIO()
            with self.subTest(action=action), patch.object(archive,'load_manifest',return_value=stale), patch.object(archive,'inventory',return_value=current), patch.object(archive,'free_bytes',return_value=archive.GIB), patch.object(archive,'snapshot') as save, patch.object(archive,'run_process') as run, patch.object(archive,'resolve_review_retry') as retry, patch.object(archive.sys,'stdout',output):
                self.assertEqual(archive.main([action,'--dry-run']),3)
                save.assert_not_called()
                run.assert_not_called()
                retry.assert_not_called()
            expected = 5000 + 2*archive.clip_budget({}, {'start':184,'end':226})
            self.assertEqual(json.loads(output.getvalue())['capacity']['required_bytes'],expected)
            self.assertEqual(stale,original)

    def test_reconciliation_preserves_records_and_retires_obsolete_exports(self):
        stale, current = self.stale_and_current()
        source = stale['sources'][0]
        record = {'status':'complete','path':'clips/old.mp4','sha256':'a'*64,'bytes':10}
        source['clips'][0]['export'] = record
        matching = {'start':184,'end':226,'label':'curated-app-range','key':'0001','cardIds':['taeguk-5'],'export':{**record,'path':'clips/accepted.mp4'}}
        source['clips'].append(matching)
        source.update(backup={**record,'path':'originals/source.mkv'},requiresExplicitRetry=True,
                      prior_failure={'action':'backup'},retry_resolution={'authorization_ref':'S8/L25'})
        original = copy.deepcopy(stale)
        reconciled = archive.reconcile_inventory(stale,current)
        updated = reconciled['sources'][0]
        for key in ('backup','metadata_audit','estimate','requiresExplicitRetry','prior_failure','retry_resolution'):
            self.assertEqual(updated[key],source[key])
        self.assertEqual(updated['clips'][0]['export'],matching['export'])
        self.assertEqual(updated['retired_clips'][0]['export'],record)
        self.assertEqual(stale,original)
        with patch.object(archive,'verified',return_value=True):
            self.assertEqual(archive.required_bytes(reconciled,archive.DEFAULT_ROOT),0)

    def test_new_source_without_metadata_blocks_offline_plan(self):
        stale, current = self.stale_and_current()
        current['sources'].append({'id':'abcdefghijk','associations':[{'kind':'app','cardId':'new','start':0,'end':5}]})
        reconciled = archive.reconcile_inventory(stale,current)
        source = next(s for s in reconciled['sources'] if s['id']=='abcdefghijk')
        self.assertNotEqual(source.get('availability'),'accessible')
        self.assertIsNone(archive.required_bytes(reconciled,archive.DEFAULT_ROOT))

    def test_explicit_refresh_appends_only_new_offline_snapshot(self):
        stale, current = self.stale_and_current()
        original = copy.deepcopy(stale)
        with patch.object(archive,'load_manifest',return_value=stale), patch.object(archive,'inventory',return_value=current), patch.object(archive,'free_bytes',return_value=archive.GIB), patch.object(archive,'snapshot') as save, patch.object(archive,'run_process') as run:
            self.assertEqual(archive.main(['refresh-offline']),3)
        save.assert_called_once()
        run.assert_not_called()
        self.assertIn('capacity_checked_at',save.call_args.args[1])
        self.assertIn('reconciliation',save.call_args.args[1])
        self.assertEqual(stale,original)

    def test_real_offline_reconciliation_includes_accepted_taegeuk5(self):
        saved = archive.load_manifest(archive.DEFAULT_ROOT)
        before = copy.deepcopy(saved)
        with patch.object(archive,'run_process') as run, patch.object(archive,'snapshot') as write:
            updated = archive.reconcile_inventory(saved,archive.inventory())
        source = next(s for s in updated['sources'] if s['id']=='qNpQpJLHyUg')
        self.assertIn((184,226,'curated-app-range'),[(s['start'],s['end'],s['label']) for s in source['clips']])
        self.assertEqual(saved,before)
        run.assert_not_called()
        write.assert_not_called()

    def test_ids_offsets_and_playlist_rejection(self):
        self.assertEqual(archive.youtube_ref('https://youtu.be/gzae5gZEgcU?t=159'), ('gzae5gZEgcU', 159))
        self.assertEqual(archive.youtube_ref('https://www.youtube.com/watch?v=abcdefghijk&start=9'), ('abcdefghijk', 9))
        self.assertEqual(archive.youtube_ref('https://youtu.be/abcdefghijk?t=2m3s'), ('abcdefghijk', 123))
        self.assertIsNone(archive.youtube_ref('https://youtube.com/playlist?list=PL5CF4C717FADAC486'))
        self.assertIsNone(archive.youtube_ref('https://evil.example/watch?v=abcdefghijk'))

    def test_epub_zip_anchor_text_and_offset(self):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, 'w') as z:
            z.writestr('OEBPS/ch.xhtml', '<html><body><a id="form6" href="https://youtu.be/gzae5gZEgcU?t=159">Taegeuk 6</a><p>https://youtu.be/abcdefghijk?t=9</p></body></html>')
        stream.seek(0)
        refs = archive.epub_refs(stream, 'book.epub')
        self.assertEqual(len(refs), 2)
        self.assertEqual(refs[0]['anchor'], 'form6')
        self.assertEqual(refs[0]['member'], 'OEBPS/ch.xhtml')
        self.assertEqual([r['offset'] for r in refs], [159, 9])

    def test_dedup_keeps_associations(self):
        sources = {}
        archive.associate(sources, 'abcdefghijk', {'kind': 'app', 'cardId': 'a', 'start': 1, 'end': 4})
        archive.associate(sources, 'abcdefghijk', {'kind': 'epub', 'offset': 9})
        archive.associate(sources, 'abcdefghijk', {'kind': 'epub', 'offset': 9})
        self.assertEqual(len(sources), 1)
        self.assertEqual(len(sources['abcdefghijk']['associations']), 2)

    def test_ranges_reject_invalid(self):
        for start, end in [(-1, 2), (1, 1), (0, 11), (float('nan'), 3), (True, 4)]:
            with self.subTest(start=start, end=end), self.assertRaises(ValueError):
                archive.validate_range(start, end, 10)
        archive.validate_range(0, 10, 10)

    def test_paths_reject_escape_and_symlink(self):
        root = archive.DEFAULT_ROOT
        with self.assertRaises(ValueError):
            archive.safe_path(root, '../outside')
        with self.assertRaises(ValueError):
            archive.validate_root(Path('/tmp/archive'))
        with self.assertRaises(ValueError):
            archive.validate_root(root / '..' / 'outside')
        with patch.object(Path, 'resolve', return_value=Path('/outside')):
            with self.assertRaises(ValueError):
                archive.safe_path(root, 'originals')

    def test_capacity_reserve_and_unknown(self):
        self.assertFalse(archive.capacity(3 * archive.GIB, 5 * archive.GIB)['allowed'])
        self.assertFalse(archive.capacity(None, 100 * archive.GIB)['allowed'])
        self.assertTrue(archive.capacity(archive.GIB, 5 * archive.GIB)['allowed'])
        self.assertGreaterEqual(archive.capacity(0, 1)['reserve_bytes'], 2 * archive.GIB)

    def test_selected_formats_estimation(self):
        meta = {'duration': 10, 'requested_formats': [{'format_id': 'v', 'height': 720, 'filesize': 1000}, {'format_id': 'a', 'tbr': 8}]}
        estimate = archive.estimate(meta)
        self.assertEqual(estimate['bytes'], 11000)
        self.assertTrue(estimate['uncertain'])
        with self.assertRaises(ValueError):
            archive.estimate({'duration': 10, 'height': 1080, 'filesize': 100})
        self.assertIsNone(archive.estimate({'duration': 10})['bytes'])

    def test_preview_offset_and_curated_bounds(self):
        source = {'associations': [{'kind': 'epub', 'offset': 159}], 'duration': 415}
        self.assertEqual(archive.clip_specs(source)[0]['start'], 159)
        self.assertEqual(archive.clip_specs(source)[0]['label'], 'review-preview-not-technically-reviewed')
        source['associations'].append({'kind': 'app', 'cardId': 'form', 'start': 160, 'end': 175})
        self.assertEqual(archive.clip_specs(source)[0]['label'], 'curated-app-range')
        source['associations'][1]['end'] = 500
        with self.assertRaises(ValueError):
            archive.clip_specs(source)

    def test_process_timeout_keeps_full_output(self):
        import subprocess
        process = Mock(pid=123, returncode=-9)
        process.communicate.side_effect = [subprocess.TimeoutExpired(['x'], 1), (b'full metadata', b'failure')]
        with patch.object(archive.subprocess, 'Popen', return_value=process), patch.object(archive.os, 'killpg') as kill, patch.object(archive.time, 'monotonic', side_effect=[0, 0, 2, 2]):
            result = archive.run_process(['x'], 1)
        self.assertEqual(result['stdout'], 'full metadata')
        self.assertEqual(result['stderr'], 'failure')
        self.assertTrue(result['timed_out'])
        self.assertEqual(result['exit_code'], -9)
        kill.assert_called_once()

    def test_metadata_failure_preserves_audit(self):
        source = {'id': 'abcdefghijk', 'associations': []}
        failure = {'stdout': 'partial-json', 'stderr': 'unavailable', 'exit_code': 1, 'timed_out': False}
        with patch.object(archive, 'run_process', return_value=failure), patch.object(archive, 'save_json') as save:
            archive.plan_source(archive.DEFAULT_ROOT, source, 10)
        self.assertEqual(source['availability'], 'unavailable')
        self.assertEqual(save.call_args.args[1], failure)

    def test_dry_run_never_starts_process(self):
        with patch.object(archive, 'inventory', return_value={'sources': []}), patch.object(archive, 'run_process') as run, patch.object(archive, 'save_json'):
            self.assertEqual(archive.main(['plan', '--dry-run']), 0)
        run.assert_not_called()

    def test_real_inventory_current_data(self):
        inv = archive.inventory()
        app = {s['id'] for s in inv['sources'] if any(a['kind'] == 'app' for a in s['associations'])}
        epub = {s['id'] for s in inv['sources'] if any(a['kind'] == 'epub' for a in s['associations'])}
        self.assertGreaterEqual(len(app), 43)
        self.assertEqual(len(epub), 57)
        self.assertEqual(inv['epub_count'], 7)
        self.assertEqual(len(inv['sources']), 100)
        taegeuk6 = next(s for s in inv['sources'] if s['id'] == 'gzae5gZEgcU')
        self.assertIn(159, [a['offset'] for a in taegeuk6['associations'] if a['kind'] == 'epub'])
        refs = [a for s in inv['sources'] for a in s['associations'] if a['kind'] == 'epub']
        self.assertTrue(any(a['offset'] == 159 for a in refs))
        self.assertTrue(any(a['offset'] == 9 for a in refs))

    def test_verified_existing_requires_hash(self):
        entry = {'path': 'originals/abcdefghijk.mkv', 'sha256': 'abc', 'bytes': 10}
        with patch.object(Path, 'is_file', return_value=True), patch.object(archive, 'hash_file', return_value=('abc', 10)):
            self.assertTrue(archive.verified(archive.DEFAULT_ROOT, entry))
        with patch.object(Path, 'is_file', return_value=True), patch.object(archive, 'hash_file', return_value=('changed', 10)):
            self.assertFalse(archive.verified(archive.DEFAULT_ROOT, entry))

    def test_prior_failure_requires_explicit_retry(self):
        source = {'id': 'qNpQpJLHyUg', 'requiresExplicitRetry': True}
        with patch.object(archive, 'run_process') as run:
            self.assertFalse(archive.backup_source(archive.DEFAULT_ROOT, source, 10))
        run.assert_not_called()
        self.assertEqual(source['backup']['status'], 'blocked-explicit-retry-required')

    def test_disk_monitor_stops_process(self):
        process = Mock(pid=123, returncode=-9)
        process.communicate.return_value = (b'partial', b'')
        with patch.object(archive.subprocess, 'Popen', return_value=process), patch.object(archive.os, 'killpg') as kill, patch.object(archive, 'free_bytes', return_value=2 * archive.GIB):
            result = archive.run_process(['x'], 1, root=archive.DEFAULT_ROOT)
        self.assertTrue(result['capacity_stopped'])
        kill.assert_called_once()

    def test_failed_backup_preserves_audit_and_incomplete_state(self):
        source = {'id': 'abcdefghijk', 'estimate': {'bytes': 1000}}
        failure = {'stdout': 'full-output', 'stderr': 'read timed out', 'exit_code': 1, 'timed_out': False}
        with patch.object(Path, 'exists', return_value=False), patch.object(Path, 'mkdir'), patch.object(Path, 'glob', return_value=[]), patch.object(archive, 'run_process', return_value=failure), patch.object(archive, 'save_json') as save:
            self.assertFalse(archive.backup_source(archive.DEFAULT_ROOT, source, 10))
        self.assertEqual(source['backup']['status'], 'incomplete')
        self.assertEqual(save.call_args.args[1], failure)
        self.assertIn('audit/', source['backup']['audit'])

    def test_existing_unverified_original_never_overwritten(self):
        source = {'id': 'abcdefghijk'}
        with patch.object(Path, 'exists', return_value=True), patch.object(archive, 'run_process') as run:
            self.assertFalse(archive.backup_source(archive.DEFAULT_ROOT, source, 10))
        run.assert_not_called()
        self.assertEqual(source['backup']['status'], 'blocked')

    def test_manifest_status_missing_is_explicit(self):
        with patch.object(archive, 'load_manifest', return_value={'sources': [{'availability': 'unavailable'}, {'availability': 'accessible', 'backup': {'status': 'complete'}}] } ):
            status = archive.status_report(archive.DEFAULT_ROOT)
        self.assertEqual(status['availability'], {'unavailable': 1, 'accessible': 1})
        self.assertEqual(status['backup'], {'not-started': 1, 'complete': 1})


class UnattemptedTests(unittest.TestCase):
    def fixture(self):
        sources = []
        for index in range(100):
            source = {'id':f'{index:011d}', 'availability':'accessible', 'duration':10,
                      'estimate':{'bytes':1000}, 'associations':[{'kind':'app', 'cardId':'c', 'start':0, 'end':1}]}
            if index < 14:
                source['backup'] = {'status':'complete', 'path':f'originals/{index}.mkv', 'sha256':'a', 'bytes':1}
            elif index == 14:
                source.update(id='8wX0JzYe8n0', backup={'status':'incomplete', 'audit':'audit/403.json'}, requiresExplicitRetry=True)
            sources.append(source)
        return {'schema_version':1, 'sources':sources}

    def invoke(self, manifest, argv, fail=False):
        original = copy.deepcopy(manifest)
        saved, calls = [], []
        output, error = io.StringIO(), io.StringIO()
        def backup(root, source, timeout):
            calls.append(source['id'])
            source['backup'] = {'status':'incomplete' if fail else 'complete', 'audit':'audit/new.json'}
            return not fail
        current = {'sources':[{'id':s['id'], 'associations':s['associations']} for s in manifest['sources']]}
        with patch.object(archive, 'load_manifest', return_value=manifest), patch.object(archive, 'inventory', return_value=current), patch.object(archive, 'free_bytes', return_value=100*archive.GIB), patch.object(archive, 'verified', side_effect=lambda root, entry: bool(entry) and entry.get('status') == 'complete'), patch.object(archive, 'snapshot', side_effect=lambda root, state: saved.append(copy.deepcopy(state))), patch.object(archive, 'backup_source', side_effect=backup), patch.object(archive, 'run_process') as process, patch.object(Path, 'mkdir') as mkdir, patch.object(Path, 'open') as opened, patch.object(archive.sys, 'stdout', output), patch.object(archive.sys, 'stderr', error):
            code = archive.main(argv)
            process.assert_not_called()
            mkdir.assert_not_called()
            opened.assert_not_called()
        self.assertEqual(manifest, original, 'saved input and old failure/mtime/counters must not change')
        return code, output.getvalue(), error.getvalue(), saved, calls

    def test_unattempted_dry_run_exact_85_and_prior_records_preserved(self):
        manifest = self.fixture()
        code, output, error, saved, calls = self.invoke(manifest, ['backup', '--unattempted-only', '--dry-run'])
        self.assertEqual(code, 0)
        recovery = json.loads(output)['unattempted_recovery']
        self.assertEqual(recovery['selected_ids'], [s['id'] for s in manifest['sources'][15:]])
        self.assertEqual([s['id'] for s in recovery['skipped']], [s['id'] for s in manifest['sources'][:15]])
        self.assertEqual(recovery['status'], 'partial')
        self.assertEqual(error, '')
        self.assertEqual((saved, calls), ([], []))

    def test_unattempted_excludes_empty_unknown_records_and_attempt_markers(self):
        manifest = self.fixture()
        extras = [dict(backup={}), dict(backup=None), dict(backup={'status':'unknown'}),
                  dict(requiresExplicitRetry=True), dict(requiresExplicitRetry=None),
                  dict(prior_failure={'action':'backup'}), dict(prior_attempts=[])]
        for source, extra in zip(manifest['sources'][15:], extras): source.update(extra)
        code, output, error, saved, calls = self.invoke(manifest, ['backup', '--unattempted-only', '--dry-run'])
        self.assertEqual(code, 0)
        recovery = json.loads(output)['unattempted_recovery']
        self.assertEqual(len(recovery['selected_ids']), 78)
        self.assertTrue(all(item['reason'] for item in recovery['skipped']))
        self.assertEqual((saved, calls, error), ([], [], ''))

    def test_unattempted_flag_rejected_on_siblings_before_io(self):
        for action in ('inventory', 'plan', 'clips', 'status', 'refresh-offline', 'migrate-metadata'):
            with self.subTest(action=action), patch.object(archive, 'validate_root') as root, patch.object(archive, 'load_manifest') as read, patch.object(archive, 'snapshot') as write, patch.object(archive.sys, 'stdout', io.StringIO()) as output, patch.object(archive.sys, 'stderr', io.StringIO()) as error:
                with self.assertRaises(SystemExit) as caught:
                    archive.main([action, '--unattempted-only'])
                self.assertEqual(caught.exception.code, 2)
                self.assertIn('--unattempted-only requires backup', error.getvalue())
                self.assertEqual(output.getvalue(), '')
                root.assert_not_called(); read.assert_not_called(); write.assert_not_called()

    def test_unattempted_first_new_failure_stops_and_appends_honest_evidence(self):
        manifest = self.fixture()
        code, output, error, saved, calls = self.invoke(manifest, ['backup', '--unattempted-only'], fail=True)
        self.assertEqual(code, 4)
        self.assertEqual(calls, [manifest['sources'][15]['id']])
        self.assertIn('Operation failed; audit/partials preserved. No retry.', error)
        evidence = saved[-1]['unattempted_recovery']
        self.assertEqual(evidence['selected_ids'], [s['id'] for s in manifest['sources'][15:]])
        self.assertEqual(evidence['attempted_ids'], calls)
        self.assertEqual(evidence['status'], 'partial')
        self.assertIn('8wX0JzYe8n0', evidence['outstanding_ids'])
        self.assertEqual(saved[-1]['sources'][14], manifest['sources'][14])
        self.assertTrue(saved[-1]['sources'][15]['requiresExplicitRetry'])
        self.assertEqual(json.loads(output)['unattempted_recovery'], evidence)

    def test_unattempted_known_resolved_review_is_not_full_backup_attempt(self):
        manifest = self.fixture()
        manifest['sources'][15].update(id='qNpQpJLHyUg', requiresExplicitRetry=False,
            prior_failure={'action':'review-sample-download'},
            retry_resolution={'authorization_ref':'S8/L25', 'status':'review-sample-ready-not-full-backup'})
        code, output, error, saved, calls = self.invoke(manifest, ['backup', '--unattempted-only', '--dry-run'])
        self.assertEqual(code, 0)
        self.assertIn('qNpQpJLHyUg', json.loads(output)['unattempted_recovery']['selected_ids'])
        self.assertEqual((saved, calls, error), ([], [], ''))


    def test_unattempted_success_still_partial_when_prior_failure_outstanding(self):
        manifest = self.fixture()
        code, output, error, saved, calls = self.invoke(manifest, ['backup', '--unattempted-only'])
        self.assertEqual(code, 4)
        self.assertEqual(len(calls), 85)
        evidence = json.loads(output)['unattempted_recovery']
        self.assertEqual(evidence['outstanding_ids'], ['8wX0JzYe8n0'])
        self.assertEqual(evidence['status'], 'partial')
        self.assertEqual(saved[-1]['sources'][14], manifest['sources'][14])
        self.assertEqual(evidence, saved[-1]['unattempted_recovery'])


class ExplicitRetryTests(unittest.TestCase):
    ids = ['8wX0JzYe8n0', 'xsiqce4w3v0']

    def fixture(self):
        result = UnattemptedTests.fixture(self)
        for index, source in enumerate(result['sources']):
            source.update(id=f'{index:011d}', requiresExplicitRetry=False,
                          backup={'status':'complete', 'path':f'originals/{index}.mkv', 'bytes':1, 'sha256':'old'},
                          clips=[{'key':'saved', 'start':0, 'end':1, 'label':'saved', 'export':{'status':'complete'}}])
        for source, ident in zip(result['sources'][-2:], self.ids):
            source.update(id=ident, requiresExplicitRetry=True,
                          backup={'status':'incomplete', 'audit':f'audit/{ident}-prior.json'})
        return result

    def invoke(self, extra=(), *, outcome='success', free=None, manifest=None, collision=False, offline=False):
        import hashlib
        root = archive.EXTERNAL_ARCHIVE if offline else archive.DEFAULT_ROOT
        manifest = self.fixture() if manifest is None else manifest
        before = copy.deepcopy(manifest)
        old = {root/'originals'/f'{ident}.mkv':b'' for ident in self.ids}
        old.update({root/'originals'/f'{ident}.part':b'old partial' for ident in self.ids})
        files = dict(old); directories = {root, root/'originals'}; calls, saved = [], []
        if collision: directories.add(root/'originals'/('retry-'+self.ids[0]+'-42'))
        def mkdir(path, parents=False, exist_ok=False):
            if path in directories and not exist_ok: raise FileExistsError('Retry namespace exists')
            directories.add(path)
        def run(command, timeout, **kwargs):
            calls.append(command)
            template = command[command.index('-o')+1]
            path = Path(template.replace('%(ext)s', 'mkv'))
            files[path] = b'' if outcome == 'empty' else b'new verified original'
            return {'exit_code':1 if outcome == 'http403' else 0, 'timed_out':False,
                    'stdout':'', 'stderr':'HTTP 403' if outcome == 'http403' else ''}
        current = {'sources':[{'id':s['id'], 'associations':s['associations']} for s in manifest['sources']]}
        stdout, stderr = io.StringIO(), io.StringIO()
        argv = ['backup', '--root', str(root)]
        for ident in self.ids: argv += ['--retry-source', ident]
        argv += list(extra)
        with ExitStack() as stack:
            stack.enter_context(patch.object(archive, 'guard_external', side_effect=ValueError('offline') if offline else lambda p, **kw:p))
            read = stack.enter_context(patch.object(archive, 'load_manifest', return_value=manifest))
            stack.enter_context(patch.object(archive, 'inventory', return_value=current))
            stack.enter_context(patch.object(archive, 'free_bytes', return_value=100*archive.GIB if free is None else free))
            stack.enter_context(patch.object(archive, 'verified', side_effect=lambda r,e: bool(e) and e.get('status') == 'complete'))
            stack.enter_context(patch.object(archive, 'snapshot', side_effect=lambda r,m:saved.append(copy.deepcopy(m))))
            stack.enter_context(patch.object(archive, 'save_json'))
            stack.enter_context(patch.object(archive, 'run_process', side_effect=run))
            stack.enter_context(patch.object(archive, 'probe', return_value=13 if outcome == 'duration' else 10))
            stack.enter_context(patch.object(archive.time, 'time_ns', return_value=42))
            stack.enter_context(patch.object(Path, 'is_symlink', return_value=False))
            stack.enter_context(patch.object(Path, 'exists', lambda p:p in files or p in directories))
            stack.enter_context(patch.object(Path, 'is_file', lambda p:p in files))
            stack.enter_context(patch.object(Path, 'mkdir', mkdir))
            stack.enter_context(patch.object(Path, 'open', lambda p,*a,**k:io.BytesIO(files[p])))
            stack.enter_context(patch.object(archive.sys, 'stdout', stdout))
            stack.enter_context(patch.object(archive.sys, 'stderr', stderr))
            try: code = archive.main(argv)
            except SystemExit as exc: code = exc.code
        self.assertEqual(manifest, before)
        for path, raw in old.items(): self.assertEqual(files[path], raw)
        return code, stdout.getvalue(), stderr.getvalue(), saved, calls, files, len(directories), read.call_count

    def test_exact_two_source_dry_run_is_readonly(self):
        code, out, err, saved, calls, files, dirs, _ = self.invoke(['--dry-run'])
        self.assertEqual((code, err, saved, calls, dirs), (0, '', [], [], 2))
        evidence = json.loads(out)['explicit_retry_recovery']
        self.assertEqual(evidence['selected_ids'], self.ids)
        self.assertEqual(len(evidence['skipped']), 98)
        self.assertEqual(evidence['attempted_ids'], [])
        self.assertEqual(evidence['outstanding_ids'], self.ids)

    def test_invalid_selection_and_incompatible_flags_reject_before_dispatch(self):
        cases = []
        for record in ({'status':'complete'}, {}, None, {'status':'blocked'}):
            fixture = self.fixture(); fixture['sources'][-2]['backup'] = record; cases.append(fixture)
        fixture = self.fixture(); fixture['sources'][-2]['id'] = 'MISSING0000'; cases.append(fixture)
        fixture = self.fixture(); fixture['sources'][-2]['duration'] = float('inf'); cases.append(fixture)
        for fixture in cases:
            with self.subTest(record=fixture['sources'][-2]):
                code, out, err, saved, calls, _, dirs, _ = self.invoke(manifest=fixture)
                self.assertEqual((code, out, saved, calls, dirs), (2, '', [], [], 2))
                self.assertTrue(err.startswith('Archive error: Retry '))
        for extra in (['--retry-source',self.ids[0]], ['--unattempted-only'], ['--dry-run','--unattempted-only']):
            code, out, err, saved, calls, _, dirs, _ = self.invoke(extra)
            self.assertEqual((code, out, saved, calls, dirs), (2, '', [], [], 2))
            self.assertTrue(err)
        for action in ('inventory','plan','clips','status','refresh-offline','migrate-metadata'):
            with patch.object(archive, 'validate_root') as root, patch.object(archive.sys, 'stdout', io.StringIO()) as out, patch.object(archive.sys, 'stderr', io.StringIO()) as err:
                with self.assertRaises(SystemExit) as caught: archive.main([action,'--retry-source',self.ids[0]])
                self.assertEqual(caught.exception.code, 2)
                self.assertEqual(out.getvalue(), '')
                self.assertTrue(err.getvalue().endswith('--retry-source requires backup and cannot be combined with --unattempted-only\n'))
                root.assert_not_called()

    def test_success_uses_fresh_namespace_preserves_98_sources_and_all_clips(self):
        import hashlib
        code, out, err, saved, calls, files, _, _ = self.invoke()
        self.assertEqual((code, err, len(calls)), (0, 'backup 99/100 8wX0JzYe8n0\nbackup 100/100 xsiqce4w3v0\n', 2))
        original = self.fixture(); final = saved[-1]
        self.assertEqual(final['sources'][:-2], original['sources'][:-2])
        for source, prior, command in zip(final['sources'][-2:], original['sources'][-2:], calls):
            self.assertEqual(source['clips'], prior['clips'])
            self.assertEqual(source['full_backup_retries'][-1]['previous_backup'], prior['backup'])
            self.assertTrue(source['full_backup_retries'][-1]['previous_retry_guard'])
            self.assertFalse(source['requiresExplicitRetry'])
            self.assertEqual(source['backup']['sha256'], hashlib.sha256(b'new verified original').hexdigest())
            self.assertIn('/retry-'+source['id']+'-', source['backup']['path'])
            self.assertIn('--no-continue', command); self.assertIn('--no-overwrites', command)
            self.assertNotIn('--continue', command)
            self.assertEqual(command[command.index('--retries')+1], '0')
            self.assertIn('/retry-'+source['id']+'-', command[command.index('--paths')+1])
        self.assertEqual(json.loads(out)['explicit_retry_recovery']['status'], 'complete')
        self.assertTrue(any(s['sources'][-2]['backup'] == original['sources'][-2]['backup'] and s['sources'][-2].get('full_backup_retries') for s in saved))

    def test_failure_empty_and_duration_mismatch_preserve_evidence_and_stop(self):
        for outcome in ('http403','empty','duration'):
            with self.subTest(outcome=outcome):
                code, out, err, saved, calls, _, _, _ = self.invoke(outcome=outcome)
                self.assertEqual((code, len(calls)), (4, 1))
                self.assertIn('Operation failed; audit/partials preserved. No retry.', err)
                source = saved[-1]['sources'][-2]
                self.assertTrue(source['requiresExplicitRetry'])
                self.assertEqual(source['backup']['status'], 'incomplete')
                self.assertEqual(source['full_backup_retries'][-1]['previous_backup'], self.fixture()['sources'][-2]['backup'])
                self.assertEqual(saved[-1]['sources'][-1], self.fixture()['sources'][-1])
                self.assertEqual(json.loads(out)['explicit_retry_recovery']['attempted_ids'], [self.ids[0]])

    def test_capacity_mount_and_namespace_collision_never_dispatch(self):
        for kwargs, expected in (({'free':0},3), ({'offline':True},2), ({'collision':True},2)):
            with self.subTest(kwargs=kwargs):
                code, out, err, saved, calls, _, _, _ = self.invoke(**kwargs)
                self.assertEqual((code, calls), (expected, []))
                if 'collision' not in kwargs: self.assertEqual(saved, [])


if __name__ == '__main__':
    unittest.main()
