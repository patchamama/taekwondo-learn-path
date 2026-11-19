"""Offline contract tests; all EPUB fixtures stay in memory."""
import sys
sys.dont_write_bytecode = True
import importlib.util
import io
import hashlib
import json
import struct
import subprocess
import shutil
import re
import unittest
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location('catalogue', Path(__file__).with_name('build-epub-resource-catalogue.py'))
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)


def fixture():
    data = io.BytesIO()
    with zipfile.ZipFile(data, 'w') as z:
        z.writestr('META-INF/container.xml', '<container><rootfiles><rootfile full-path="book.opf"/></rootfiles></container>')
        z.writestr('book.opf', '<package><metadata><title>Fixture &amp; book</title></metadata><manifest><item id="b" href="b.xhtml"/><item id="a" href="a.xhtml"/><item id="toc" href="toc.ncx"/></manifest><spine><itemref idref="a"/><itemref idref="b"/></spine></package>')
        z.writestr('toc.ncx', '<ncx><navMap><navPoint><navLabel><text>Kicks</text></navLabel><content src="a.xhtml"/></navPoint></navMap></ncx>')
        z.writestr('a.xhtml', '<html><body><h1>Kicks</h1><h2>Front kick</h2><p>Named movement.</p><p><img src="images/a.png"/></p><a href="https://www.youtube.com/watch?v=aKA3TgYmShY&amp;t=9s">Front Kick</a></body></html>')
        z.writestr('b.xhtml', '<html><body><img src="images/b.png"/></body></html>')
        z.writestr('images/a.png', b'\x89PNG\r\n\x1a\n'+b'\x00\x00\x00\rIHDR'+struct.pack('>II', 640, 480)+b'0'*20)
    data.seek(0)
    return data


def apple_double_fixture():
    """Synthetic xattr value, never copied from the SSD/user metadata."""
    raw = bytearray(4096)
    struct.pack_into('>II16sH', raw, 0, 0x51607, 0x20000, b'Mac OS X        ', 2)
    struct.pack_into('>6I', raw, 26, 9, 50, 3760, 2, 3810, 286)
    struct.pack_into('>8I2H', raw, 84, 0x41545452, 0, 3810, 152, 11, 0, 0, 0, 0, 1)
    name = b'com.apple.provenance\0'
    struct.pack_into('>IIHB', raw, 120, 152, 11, 0, len(name))
    raw[131:131+len(name)] = name
    raw[152:163] = b'synthetic!!'
    header = struct.pack('>4I', 256, 256, 0, 30)
    raw[3810:3826] = raw[4066:4082] = header
    struct.pack_into('>IHHHHH', raw, 4082, 0, 0, 0, 28, 30, 0xffff)
    return bytes(raw)


class AppleDoubleAccountingTests(unittest.TestCase):
    def environment(self, metadata=None, *, output=None, companion=True, free=None):
        from contextlib import ExitStack
        from unittest.mock import patch, Mock
        output = c.EXTERNAL_OUTPUT if output is None else output
        state = {output/'._index.html':apple_double_fixture() if metadata is None else metadata}
        if companion: state[output/'index.html'] = b'hello'
        stack = ExitStack()
        self.addCleanup(stack.close)
        stack.enter_context(patch.object(c, 'guard_external', side_effect=lambda p, **kw: Path(p)))
        stack.enter_context(patch.object(Path, 'is_symlink', return_value=False))
        stack.enter_context(patch.object(Path, 'exists', lambda p: p in state or p not in (output/'index.html',)))
        stack.enter_context(patch.object(Path, 'is_file', lambda p: p in state))
        stack.enter_context(patch.object(Path, 'is_dir', lambda p: p not in state and p != output/'index.html'))
        stack.enter_context(patch.object(Path, 'stat', lambda p: Mock(st_size=len(state[p]), st_mtime_ns=123)))
        stack.enter_context(patch.object(Path, 'rglob', return_value=list(state)))
        stack.enter_context(patch.object(Path, 'read_bytes', lambda p: state[p]))
        stack.enter_context(patch.object(Path, 'open', lambda p, *a, **kw: io.BytesIO(state[p])))
        write = stack.enter_context(patch.object(Path, 'write_bytes'))
        mkdir = stack.enter_context(patch.object(Path, 'mkdir'))
        stack.enter_context(patch.object(c, 'MAX_BYTES', 5))
        capacity = stack.enter_context(patch.object(c.shutil, 'disk_usage', return_value=Mock(free=c.RESERVE+100000 if free is None else free)))
        return output, state, write, mkdir, capacity

    def test_public_write_plan_valid_metadata_outside_content_cap(self):
        output, state, write, mkdir, capacity = self.environment()
        before = dict(state)
        estimate = c.write_plan(output, {'index.html':b'hello'})
        self.assertEqual(estimate['totalBytes'], 5)
        self.assertEqual(estimate['metadataBytes'], 4096)
        self.assertEqual(estimate['physicalBytes'], 4101)
        self.assertEqual(estimate['retainedPhysicalBytes'], 4096)
        self.assertEqual(estimate['writeBytes'], 0)
        self.assertEqual(state, before)
        write.assert_not_called(); mkdir.assert_not_called()
        capacity.assert_called_with(c.EXTERNAL_BASE)

    def test_malformed_unknown_and_missing_companion_count_as_content(self):
        good = apple_double_fixture()
        corruptions = []
        for offset, replacement in ((0,b'FAKE'), (4,b'\0\1\0\0'), (38,struct.pack('>I',9)),
                (42,struct.pack('>I',51)), (84,b'NOPE'), (128,b'\xff'),
                (131,b'unknown'), (3810,b'FAKE'), (4094,b'\0\0')):
            raw = bytearray(good); raw[offset:offset+len(replacement)] = replacement
            corruptions.append(bytes(raw))
        for raw, companion in [(r, True) for r in corruptions]+[(good[:100],True),(b'user-owned note',True),(good,False)]:
            with self.subTest(length=len(raw), companion=companion):
                output, state, write, mkdir, _ = self.environment(raw, companion=companion)
                before = dict(state)
                with self.assertRaisesRegex(OSError, '280 MiB'): c.write_plan(output, {'index.html':b'hello'})
                self.assertEqual(state, before)
                write.assert_not_called(); mkdir.assert_not_called()

    def test_content_cap_physical_reserve_and_mount_loss_remain_fatal(self):
        from unittest.mock import patch
        output, state, write, mkdir, _ = self.environment(free=c.RESERVE-1)
        before = dict(state)
        with self.assertRaisesRegex(OSError, 'reserve'): c.write_plan(output, {'index.html':b'hello'})
        with self.assertRaisesRegex(OSError, '280 MiB'): c.write_plan(output, {'index.html':b'longer'})
        with patch.object(c, 'guard_external', side_effect=OSError('mount lost')):
            with self.assertRaisesRegex(OSError, 'mount lost'): c.write_plan(output, {'index.html':b'hello'})
        self.assertEqual(state, before)
        write.assert_not_called(); mkdir.assert_not_called()

    def test_directory_companion_supported_without_rewriting_it(self):
        from unittest.mock import patch
        output, state, write, mkdir, _ = self.environment(companion=False)
        with patch.object(Path, 'is_dir', lambda p: p not in state):
            estimate = c.write_plan(output, {})
        self.assertEqual(estimate['metadataBytes'], 4096)
        self.assertEqual(estimate['totalBytes'], 0)
        write.assert_not_called(); mkdir.assert_not_called()

    def test_metadata_headroom_and_read_failure_prevent_writes(self):
        from unittest.mock import patch
        output, state, write, mkdir, _ = self.environment(free=c.RESERVE+6)
        before = dict(state)
        with self.assertRaisesRegex(OSError, 'reserve'):
            c.write_plan(output, {'index.html':b'world'})
        with patch.object(Path, 'open', side_effect=OSError('mount lost during read')):
            with self.assertRaisesRegex(OSError, 'mount lost during read'):
                c.write_plan(output, {'index.html':b'hello'})
        self.assertEqual(state, before)
        write.assert_not_called(); mkdir.assert_not_called()

    def test_write_boundary_rechecks_external_metadata_headroom(self):
        from contextlib import redirect_stdout, redirect_stderr
        from unittest.mock import Mock
        output, state, write, mkdir, capacity = self.environment()
        before = dict(state)
        capacity.side_effect = [Mock(free=c.RESERVE+100000),
                                Mock(free=c.RESERVE+5+8192-1)]
        stdout, stderr = io.StringIO(), io.StringIO()
        with redirect_stdout(stdout), redirect_stderr(stderr):
            with self.assertRaisesRegex(OSError, '^Disk reserve reached$'):
                c.write_plan(output, {'index.html':b'world'})
        self.assertEqual((stdout.getvalue(), stderr.getvalue()), ('', ''))
        self.assertEqual(state, before)
        self.assertEqual(capacity.call_count, 2)
        write.assert_not_called(); mkdir.assert_not_called()

    def test_internal_and_legacy_sidecars_still_charge_content(self):
        for output in (c.ROOT/'resources/epub', c.LEGACY_OUT):
            with self.subTest(output=output):
                out, state, write, mkdir, _ = self.environment(output=output)
                with self.assertRaisesRegex(OSError, '280 MiB'): c.write_plan(out, {'index.html':b'hello'})
                write.assert_not_called(); mkdir.assert_not_called()


class ExternalCliSpellingTests(unittest.TestCase):
    def invoke(self, raw, *, rejected=False):
        from contextlib import ExitStack
        from unittest.mock import patch, Mock
        import external_resource_backup as helper
        stdout, stderr = io.StringIO(), io.StringIO()
        files = {}
        with ExitStack() as stack:
            stack.enter_context(patch.object(c, 'OUT', c.ROOT/'resources/epub'))
            stack.enter_context(patch.object(sys, 'argv', ['catalogue', '--output', raw]))
            stack.enter_context(patch.object(sys, 'stdout', stdout))
            stack.enter_context(patch.object(sys, 'stderr', stderr))
            stack.enter_context(patch.object(helper.os.path, 'ismount', return_value=True))
            stack.enter_context(patch.object(helper.os, 'access', return_value=True))
            stack.enter_context(patch.object(Path, 'resolve', lambda p: p))
            stack.enter_context(patch.object(Path, 'is_symlink', return_value=False))
            stack.enter_context(patch.object(Path, 'exists', return_value=True))
            stack.enter_context(patch.object(Path, 'is_dir', return_value=True))
            stack.enter_context(patch.object(Path, 'stat', lambda p, **kw: Mock(st_dev=1 if p == helper.ROOT else 2)))
            io_calls = [stack.enter_context(patch.object(Path, name))
                        for name in ('open', 'read_bytes', 'read_text', 'write_bytes', 'mkdir', 'glob', 'rglob')]
            capacity = stack.enter_context(patch.object(c.shutil, 'disk_usage'))
            plan = stack.enter_context(patch.object(c, 'build_catalogue', return_value=({'audit':{}}, files)))
            write = stack.enter_context(patch.object(c, 'write_plan', return_value={}))
            for name in ('render_html', 'render_markdown'):
                stack.enter_context(patch.object(c, name, return_value='rendered'))
            if rejected:
                with self.assertRaises(SystemExit) as exit:
                    c.main(['--output', raw])
                self.assertEqual(exit.exception.code, 2)
                self.assertEqual(stdout.getvalue(), '')
                self.assertEqual(stderr.getvalue(), 'usage: catalogue [-h] [--output OUTPUT]\n'
                                 'catalogue: error: Not an exact authorized external root\n')
                plan.assert_not_called(); write.assert_not_called(); capacity.assert_not_called()
                for call in io_calls: call.assert_not_called()
                self.assertEqual(files, {})
                self.assertEqual(c.OUT, c.ROOT/'resources/epub')
            else:
                c.main(['--output', raw])
                plan.assert_called_once_with()
                self.assertEqual(write.call_args.args[0], Path(raw))
                self.assertEqual(stderr.getvalue(), '')
                self.assertIn('Generated '+str(Path(raw))+'/index.html', stdout.getvalue())

    def test_external_raw_aliases_rejected_before_io(self):
        exact = str(c.EXTERNAL_OUTPUT)
        for raw in (exact+'/', exact.replace('/resources/', '/resources//'),
                    exact.replace('/resources/', '/resources/./')):
            with self.subTest(raw=raw): self.invoke(raw, rejected=True)

    def test_exact_external_and_internal_legacy_cli_preserved(self):
        for raw in (str(c.EXTERNAL_OUTPUT), str(c.ROOT/'resources/epub'), str(c.LEGACY_OUT)):
            with self.subTest(raw=raw): self.invoke(raw)


class ExternalCatalogueTests(unittest.TestCase):
    def test_exact_external_pair_and_capacity(self):
        from unittest.mock import patch, Mock
        from scripts import external_resource_backup as b
        with patch.object(c, 'guard_external', create=True, side_effect=lambda p, **kw: p), \
             patch.object(Path, 'is_symlink', return_value=False), \
             patch.object(Path, 'exists', return_value=False), \
             patch.object(c.shutil, 'disk_usage', return_value=Mock(free=c.RESERVE+8192+1024)) as usage:
            self.assertEqual(c.validate_output(b.EXTERNAL_OUTPUT), b.EXTERNAL_OUTPUT)
            self.assertEqual(c.archive_pair(b.EXTERNAL_OUTPUT), (b.EXTERNAL_ARCHIVE, c.BROWSER_PREFIX))
            c.validate_plan(b.EXTERNAL_OUTPUT, {'index.html':b'ok'})
            usage.assert_called_with(b.EXTERNAL_BASE)

    def test_external_no_internal_metadata_fallback_or_unknown_output(self):
        from unittest.mock import patch
        from scripts import external_resource_backup as b
        with patch.object(c, 'guard_external', side_effect=lambda p, **kw: p), \
             patch.object(Path, 'is_symlink', return_value=False), \
             patch.object(Path, 'glob', return_value=[]) as glob:
            sources, notes = c.validated_archive(b.EXTERNAL_OUTPUT)
            self.assertEqual(sources, {})
            glob.assert_called_once_with('*.json')
            with self.assertRaises(ValueError): c.archive_pair(b.EXTERNAL_OUTPUT/'other')
            self.assertEqual(c.archive_pair(c.LEGACY_OUT), (c.LEGACY_OUT/'archive', 'archive/'))

    def test_external_mount_error_fatal_before_archive_read(self):
        from unittest.mock import patch
        from scripts import external_resource_backup as b
        with patch.object(c, 'guard_external', create=True, side_effect=OSError('mount lost')), \
             patch.object(Path, 'glob') as glob:
            with self.assertRaises(OSError): c.validated_archive(b.EXTERNAL_OUTPUT)
            glob.assert_not_called()


class CatalogueTests(unittest.TestCase):
    def test_visible_output_allowlist(self):
        self.assertEqual(c.OUT, c.ROOT/'resources/epub')
        for root in (c.OUT, c.ROOT/'.atl/epub-resources'):
            self.assertEqual(c.validate_output(root), root)
        for root in (c.ROOT/'resources/other', c.OUT/'nested', c.OUT/'../other'):
            with self.assertRaises(ValueError): c.validate_output(root)
        from unittest.mock import patch
        with patch.object(Path, 'is_symlink', return_value=True):
            with self.assertRaises(ValueError): c.validate_output(c.OUT)

    def test_record_and_trusted_browser_prefix_are_distinct(self):
        record = {'status':'complete','path':'clips/a.mp4','sha256':'a'*64,'bytes':12,'duration':3,'verified_at':'now'}
        self.assertTrue(c.archive_record_eligible(record))
        self.assertTrue(c.valid_local_video_path('../../video/epub-backup/clips/a.mp4'))
        for name in ('../../video/epub-backup/clips/a.mp4','../clips/a.mp4','clips/../../a.mp4','clips/%2e%2e/a.mp4'):
            self.assertFalse(c.archive_record_eligible({**record,'path':name}))
        for name in ('../../video/other/a.mp4','../../video/epub-backup/../a.mp4','../../../video/epub-backup/a.mp4'):
            self.assertFalse(c.valid_local_video_path(name))
        gate = re.search(r'function validLocalVideoPath\(value\).*?\nfunction showVideo', c.HTML_TEMPLATE, re.S).group(0).rsplit('\nfunction showVideo', 1)[0]
        script = gate + '''
const assert=require('node:assert/strict');
for(const value of ['../../video/epub-backup/clips/a.mp4','archive/clips/a.mp4'])assert.equal(validLocalVideoPath(value),true);
for(const value of ['../../video/other/a.mp4','../../video/epub-backup/../a.mp4','../../../video/epub-backup/a.mp4','../../video/epub-backup/%2e/a.mp4','../../video/epub-backup//tmp/a.mp4'])assert.equal(validLocalVideoPath(value),false);
'''
        result = subprocess.run(['node','-e',script],text=True,capture_output=True,timeout=10)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_new_archive_adapter_hash_symlink_and_clip_offsets(self):
        from unittest.mock import patch, Mock
        raw = b'verified local video'
        record = {'status':'complete','path':'clips/a.mp4','sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'duration':30,'verified_at':'now'}
        data = {'schema_version':1,'sources':[{'id':'gzae5gZEgcU','availability':'accessible','clips':[{'start':159,'end':189,'export':record}]}]}
        manifest = c.ARCHIVE/'manifests/1.json'
        for symlink, content, expected in ((False, raw, 1), (False, b'changed', 0), (True, raw, 0)):
            with self.subTest(symlink=symlink,content=content), patch.object(Path,'glob',return_value=[manifest]), patch.object(Path,'is_symlink',return_value=symlink), patch.object(Path,'is_file',return_value=True), patch.object(Path,'stat',return_value=Mock(st_size=len(raw))), patch.object(Path,'read_text',return_value=json.dumps(data)), patch.object(Path,'open',return_value=io.BytesIO(content)):
                sources, notes = c.validated_archive(c.ROOT/'resources/epub')
                media = sources.get('gzae5gZEgcU',{}).get('media',[])
                self.assertEqual(len(media), expected)
                if media:
                    self.assertEqual(media[0]['path'],'../../video/epub-backup/clips/a.mp4')
                    selected = c.local_media_for({'videoId':'gzae5gZEgcU','start':160,'end':170},sources)
                    self.assertEqual((selected['playStart'],selected['playEnd']),(1,11))
                    self.assertIsNone(c.local_media_for({'videoId':'gzae5gZEgcU','start':158},sources))

    def test_member_guards(self):
        self.assertEqual(c.safe_member('OEBPS/ch.xhtml', '../images/x.png'), 'images/x.png')
        for value in ('../../etc/passwd', '/etc/passwd', 'https://bad/a', '..%2f..%2fsecret', 'x\\bad'):
            with self.subTest(value=value), self.assertRaises(ValueError):
                c.safe_member('chapter.xhtml', value)

    def test_spine_toc_and_image_chapter_association(self):
        book = c.read_book(fixture())
        self.assertEqual([d['member'] for d in book['documents']], ['a.xhtml', 'b.xhtml'])
        self.assertEqual(book['toc'][0]['title'], 'Kicks')
        self.assertEqual(book['documents'][0]['images'][0]['heading'], 'Front kick')
        self.assertEqual(book['documents'][1]['chapter'], 'Kicks')
        self.assertEqual(book['documents'][0]['images'][0]['member'], 'images/a.png')
        self.assertEqual(book['documents'][0]['videos'][0]['start'], 9)

    def test_image_policy(self):
        self.assertEqual(c.image_dimensions(b'bad'), None)
        self.assertEqual(c.image_reason('cover.jpg', (800, 900), True), 'decorative-name')
        self.assertEqual(c.image_reason('x.jpg', (2000, 9), True), 'tiny-or-strip')
        self.assertEqual(c.image_reason('x.jpg', (500, 400), False), 'outside-relevant-section')
        self.assertIsNone(c.image_reason('technical.jpg', (500, 400), True))
        self.assertEqual(c.image_reason('x.jpg', None, True), 'unsupported-or-corrupt-header')

    def test_individual_video_and_offsets(self):
        self.assertIsNone(c.youtube('https://youtube.com/playlist?list=PL123'))
        self.assertIsNone(c.youtube('https://evil.example/watch?v=aKA3TgYmShY'))
        self.assertEqual(c.youtube('https://youtu.be/NSSVH1TUElk?t=9s')['start'], 9)
        self.assertEqual(c.youtube('https://www.youtube.com/watch?v=gzae5gZEgcU&t=159s')['start'], 159)

    def test_missing_video_uncertainty_and_hash(self):
        self.assertEqual(c.row_state({'videos': []}), 'Sin vídeo vinculado')
        self.assertIn('desconocida', c.row_state({'videos': [{'availability': 'unknown'}]}))
        self.assertEqual(c.stable_id('a','b'), c.stable_id('a','b'))
        self.assertNotEqual(c.stable_id('a','b'), c.stable_id('b','a'))
        self.assertIsNone(c.canonical('Reverse side kick (Bandae Yop Chagi)', 'ITF / Chang-Hon'))
        self.assertEqual(c.canonical('Front Kick', 'Kukkiwon / WT'), 'ap-chagi')

    def test_inline_html_escaping_and_gallery_contract(self):
        data={'books': [], 'rows': [], 'images': [], 'audit': {'note': '</script><img onerror=bad>'}}
        page=c.render_html(data)
        self.assertNotIn('</script><img onerror=bad>', page)
        self.assertIn('\\u003c/script', page)
        self.assertNotIn('fetch(', page)
        for token in ('showModal', 'ArrowLeft', 'ArrowRight', 'Escape', 'youtube-nocookie.com/embed/', 'returnFocus', 'Sin resultados', 'Restablecer', 'hasImage', 'hasVideo'):
            self.assertIn(token, page)
        payload=page.split('<script id="catalogue-data" type="application/json">')[1].split('</script>')[0]
        self.assertEqual(json.loads(payload), data)

    def test_source_confirmed_form_ids_and_sample_not_backup(self):
        self.assertEqual(c.FORM_IDS['gzae5gZEgcU'], 'taeguk-6')
        self.assertIn('ap-chagi', c.load_app_labels())
        self.assertIn('taeguk-6', c.load_app_labels())
        self.assertIn('ap-chagi', c.load_app_info())
        self.assertIn('es', c.load_app_info()['ap-chagi'])
        self.assertEqual(c.sample_state({'status':'ready'}), 'Muestra de revisión preparada; vídeo de baja resolución sin audio, no respaldo completo')
        self.assertIn('falló', c.sample_state({'status':'download-failed-or-no-media'}))

    def test_archive_complete_gate_and_clip_timeline(self):
        record = {'status':'complete', 'path':'clips/a.mp4', 'sha256':'a'*64, 'bytes':123, 'duration':30, 'verified_at':'2026-01-01'}
        self.assertTrue(c.archive_record_eligible(record))
        self.assertFalse(c.archive_record_eligible({**record, 'path':'/clips/a.mp4'}))
        self.assertFalse(c.archive_record_eligible({**record, 'path':'https://bad/a.mp4'}))
        for status in ('incomplete','blocked','accessible','metadata-ready','blocked-explicit-retry-required'):
            self.assertFalse(c.archive_record_eligible({**record,'status':status}))
        sources={'gzae5gZEgcU':{'media':[{'path':'archive/clips/a.mp4','kind':'clip','sourceStart':159,'sourceEnd':189,'duration':30}]}}
        media=c.local_media_for({'videoId':'gzae5gZEgcU','start':159}, sources)
        self.assertEqual(media['playStart'], 0)
        self.assertEqual(media['kind'], 'clip')
        self.assertIsNone(c.local_media_for({'videoId':'gzae5gZEgcU','start':9}, sources))

    def test_real_client_filter_predicate_offline(self):
        if not shutil.which('node'):
            self.skipTest('Node unavailable for the real inline JS filter predicate')
        predicate = re.search(r'function rowMatches\(r,f\).*?\nfunction render', c.HTML_TEMPLATE, re.S).group(0).rsplit('\nfunction render',1)[0]
        script = r'''const assert=require('node:assert/strict');
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const books=new Map([['fixture',{author:'Writer'}]]),bookTitle=()=> 'Book';
const r={name:'Side kick',chapter:'Chapter 4',summaryEs:'Equilibrio',members:['OEBPS/kick.xhtml'],bookId:'fixture',style:'ITF',videos:[],imageIds:[],appNames:{es:'Patada lateral'}};
const f=extra=>({q:'',book:'',style:'',video:'',image:'',...extra});
'''+predicate+r'''
assert.equal(rowMatches(r,f({q:'writer'})),true);
assert.equal(rowMatches(r,f({q:'oebps/kick'})),true);
assert.equal(rowMatches(r,f({q:norm('Équilibrío')})),true);
assert.equal(rowMatches(r,f({q:'no match'})),false);
assert.equal(rowMatches(r,f({book:'other'})),false);
assert.equal(rowMatches(r,f({style:'WT'})),false);
assert.equal(rowMatches(r,f({video:'yes'})),false);
assert.equal(rowMatches(r,f({video:'no'})),true);
assert.equal(rowMatches(r,f({image:'yes'})),false);
assert.equal(rowMatches({...r,imageIds:['a']},f({image:'yes'})),true);
assert.equal(rowMatches({...r,videos:[{}]},f({video:'yes'})),true);
'''
        result = subprocess.run(['node','-e',script], text=True, capture_output=True, timeout=10)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_generated_catalogue_links_hashes_and_coverage(self):
        output = c.OUT/'catalogue.json'
        if not output.exists():
            self.skipTest('Run the offline generator for real-book structural checks')
        data = json.loads(output.read_text())
        self.assertEqual(len(data['books']), 7)
        self.assertEqual(len(data['audit']['sourceVideoIds']), 57)
        self.assertEqual(len({i['id'] for i in data['images']}), len(data['images']))
        self.assertGreater(data['audit']['sourceRowCount'], 100)
        by_id={i['id']:i for i in data['images']}
        for image in data['images']:
            self.assertTrue(image['path'].startswith('media/images/'))
            self.assertNotIn('..', Path(image['path']).parts)
            self.assertEqual(hashlib.sha256((c.OUT/image['path']).read_bytes()).hexdigest(), image['sha256'])
            self.assertEqual(image['captionConfidence'], 'unverified-structural-reference')
        for book in data['books']:
            image=next(i for i in data['images'] if i['bookId']==book['id'])
            with zipfile.ZipFile(c.ROOT/'docs/clint-sharp'/book['filename']) as archive:
                self.assertEqual(archive.read(image['member']), (c.OUT/image['path']).read_bytes())
        for row in data['rows']:
            self.assertTrue(set(row['imageIds']) <= by_id.keys())
            for video in row['videos']:
                self.assertEqual(c.youtube(video['url'])['videoId'], video['videoId'])
        source_videos=[v for r in data['rows'] if r['bookId']!='current' for v in r['videos']]
        self.assertIn(159,[v['start'] for v in source_videos if v['videoId']=='gzae5gZEgcU'])
        self.assertIn(9,[v['start'] for v in source_videos if v['videoId']=='NSSVH1TUElk'])
        reviewed = c.documented_sample_reviews(c.review_samples())
        for row in data['rows']:
            for video in row['videos']:
                if video.get('visualReview') == 'sampled-by-T1':
                    self.assertIn(video['videoId'], reviewed)
                    self.assertEqual(video['appSupplement'], reviewed[video['videoId']])
        self.assertEqual({v['videoId'] for r in data['rows'] for v in r['videos'] if v.get('visualReview') == 'sampled-by-T1'}, set(reviewed))
        page=(c.OUT/'index.html').read_text()
        for path in ('resources.md','catalogue.json','catalogue-audit.json'):
            self.assertTrue((c.OUT/path).is_file())
            self.assertIn('href="'+path+'"', page)
        self.assertLess(sum(p.stat().st_size for p in (c.OUT/'media/images').rglob('*') if p.is_file()), c.MAX_BYTES)

    def test_browser_dialog_tab_containment(self):
        """Isolated catalogue-only file:// regression; no server or remote media."""
        module = c.ROOT/'.atl/browser-verification/node_modules/playwright-core/index.mjs'
        chrome = Path('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        self.assertTrue(module.is_file(), 'Parent-provided isolated Playwright is required')
        self.assertTrue(chrome.is_file(), 'Installed sandboxed Chrome is required')
        script = 'import { chromium } from '+json.dumps(module.as_uri())+';\n'
        import tempfile
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        isolated = Path(temporary.name).resolve()
        data, planned = c.build_catalogue()
        # Real planner bytes in an isolated fixture, never resources/epub.
        for name, raw in planned.items():
            if name.startswith('books/'):
                target=isolated/name; target.parent.mkdir(parents=True,exist_ok=True); target.write_bytes(raw)
        (isolated/'index.html').write_text(c.render_html(data),encoding='utf-8')
        script += 'const url='+json.dumps((isolated/'index.html').as_uri())+';\n'
        script += 'const executablePath='+json.dumps(str(chrome))+';\n'
        script += r'''
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath,chromiumSandbox:true,headless:true,timeout:10000,args:['--disable-background-networking','--no-first-run']});
try {
 const context=await browser.newContext({offline:true,acceptDownloads:false});
 await context.route(/^https?:\/\//,route=>route.abort());
 const page=await context.newPage();page.setDefaultTimeout(2500);
 await page.goto(url,{waitUntil:'load',timeout:10000});
 const results=[];
 const active=()=>page.evaluate(()=>({tag:document.activeElement.tagName,id:document.activeElement.id,inside:document.getElementById('modal').contains(document.activeElement)}));
 const edges=()=>page.evaluate(()=>{
  const modal=document.getElementById('modal');
  const list=[...modal.querySelectorAll('button,a[href],input,select,textarea,iframe,video[controls],[tabindex]')].filter(el=>el.tabIndex>=0&&!el.matches(':disabled')&&!el.closest('[hidden],[inert]')&&el.getClientRects().length&&getComputedStyle(el).visibility==='visible');
  list.forEach((el,i)=>el.dataset.tabTest=String(i));
  return list.length;
 });
 async function checkEdges(label){
  const count=await edges();assert.ok(count>0,label+' controls');
  await page.locator('[data-tab-test="'+(count-1)+'"]').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.tabTest),'0',label+' Tab must wrap last→first; active='+JSON.stringify(await active()));
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.tabTest),String(count-1),label+' Shift+Tab must wrap first→last');
  for(let i=0;i<count+2;i++){
   await page.keyboard.press('Tab');assert.equal((await active()).inside,true,label+' forward containment');
   await page.keyboard.press('Shift+Tab');assert.equal((await active()).inside,true,label+' reverse containment');
  }
  results.push(label+': Tab/Shift+Tab wrap and containment passed ('+count+' controls)');
 }
 assert.equal(await page.locator('[data-row]').count(),1008,'all source/course rows in initial DOM');
 assert.equal(await page.locator('[data-image-card]').count(),1732,'all selected image records in initial DOM');
 assert.equal(await page.locator('[data-video-card]').count(),100,'one card per union ID');
 assert.equal(await page.locator('details,[data-more]').count(),0,'no collapsed or batched content');
 await page.locator('#totals [data-view="videos"][data-scope="epub"]').click();
 assert.equal(await page.locator('[data-video-card]:visible').count(),57,'EPUB scope');
 await page.locator('#video-scopes [data-scope="course"]').click();
 assert.equal(await page.locator('[data-video-card]:visible').count(),56,'course scope');
 await page.locator('#video-scopes [data-scope="union"]').click();
 assert.equal(await page.locator('[data-video-card]:visible').count(),100,'union scope');
 assert.equal(await page.locator('#view-catalogue').isVisible(),false,'exclusive video view');
 assert.equal(await page.locator('#view-images').isVisible(),false,'exclusive video view');
 await page.locator('#totals [data-view="images"]').click();
 assert.equal(await page.locator('[data-image-card]:visible').count(),1732,'summary opens all images');
 assert.equal(await page.locator('iframe').count(),0,'no remote player before opt-in');
 const image=page.locator('[data-image]').first();
 await image.click();await checkEdges('image');
 const before=await page.locator('#position').textContent();await page.keyboard.press('ArrowRight');
 assert.notEqual(await page.locator('#position').textContent(),before,'image ArrowRight');
 await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#position').textContent(),before,'image ArrowLeft');
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-image')),true,'image return focus');
 assert.equal(await page.evaluate(()=>document.body.style.overflow),'','image scroll restoration');
 await page.locator('#totals [data-view="videos"][data-scope="epub"]').click();
 const video=page.locator('#view-videos [data-video]').first();await video.click();await checkEdges('video before load');
 await page.getByRole('button',{name:'Cargar vídeo remoto',exact:true}).focus();
 await page.evaluate(()=>{
  const viewer=document.getElementById('viewer');
  const frame=document.createElement('iframe');frame.id='local-test-frame';frame.srcdoc='<button>Offline iframe control</button>';frame.title='Offline dynamic test';
  [...viewer.querySelectorAll('button')].find(el=>el.textContent==='Cargar vídeo remoto').replaceWith(frame);
  const extra=document.createElement('button');extra.id='dynamic-control';extra.textContent='Dynamic control';viewer.append(extra);
  const hidden=document.createElement('button');hidden.hidden=true;hidden.textContent='Hidden';viewer.append(hidden);
  const disabled=document.createElement('button');disabled.disabled=true;disabled.textContent='Disabled';viewer.append(disabled);
  const invisible=document.createElement('button');invisible.style.visibility='hidden';invisible.textContent='Invisible';viewer.append(invisible);
 });
 assert.equal((await active()).inside,true,'replacement of focused load button retains focus');
 assert.equal(await edges(),4,'only visible enabled controls, including dynamic iframe');
 await checkEdges('video dynamic iframe/control');
 // Cross-frame Tab events do not bubble: exercise entry/exit through real srcdoc.
 await page.locator('#local-test-frame').focus();
 for(let i=0;i<5;i++){await page.keyboard.press('Tab');assert.equal((await active()).inside,true,'dynamic iframe Tab containment');}
 for(let i=0;i<5;i++){await page.keyboard.press('Shift+Tab');assert.equal((await active()).inside,true,'dynamic iframe Shift+Tab containment');}
 await page.evaluate(()=>document.querySelectorAll('#modal button:not(#close),#modal a,#modal iframe').forEach(el=>el.hidden=true));
 await checkEdges('video single visible control');
 await page.evaluate(()=>document.getElementById('close').hidden=true);
 await page.keyboard.press('Tab');assert.equal((await active()).id,'modal','zero controls Tab focuses dialog');
 await page.keyboard.press('Shift+Tab');assert.equal((await active()).id,'modal','zero controls Shift+Tab focuses dialog');
 results.push('zero controls: Tab/Shift+Tab remain on dialog');
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-video')),true,'video return focus');
 assert.equal(await page.evaluate(()=>document.body.style.overflow),'','video scroll restoration');
 await page.locator('#totals [data-view="catalogue"]').click();
 const decision=page.locator('[data-decision]').first();await decision.selectOption('keep');
 await page.locator('#q').fill('no-such-catalogue-result');
 assert.equal(await page.locator('#empty').isVisible(),true,'empty state');
 await page.locator('#reset').click();assert.equal(await decision.inputValue(),'keep','decision survives filtering');
 await page.evaluate(()=>{const original=URL.createObjectURL;URL.createObjectURL=blob=>{window.exported=blob.text();return original(blob)};HTMLAnchorElement.prototype.click=function(){}});
 await page.locator('#export').click();
 assert.equal(await page.evaluate(async()=>JSON.parse(await window.exported).decisions[0].decision),'keep','safe JSON decision export');
 assert.equal(await page.locator('iframe[src^="https:"]').count(),0,'remote playback remains opt-in');
 await page.evaluate(()=>{document.getElementById('q').focus()});await page.keyboard.press('Tab');
 assert.equal((await active()).id,'book','closed modal does not capture Tab');
 results.push('image arrows/Escape and video Escape/return focus/scroll restore; closed-modal Tab passed');
 console.log(JSON.stringify(results));
} finally {await browser.close();}
'''
        result = subprocess.run(['node','--input-type=module','-'],input=script,text=True,capture_output=True,timeout=25)
        self.assertEqual(result.returncode,0,result.stdout+result.stderr)
        print(result.stdout.strip())

    def test_archive_paths_and_hash(self):
        for path in ('../a.mp4','archive/../x.mp4','https://bad/a.mp4','/tmp/a.mp4','archive/a.txt'):
            self.assertFalse(c.valid_local_video_path(path))
        self.assertTrue(c.valid_local_video_path('archive/videos/a.mp4'))


def media_fixture():
    video = {'videoId':'aKA3TgYmShY', 'start':9, 'url':'https://www.youtube.com/watch?v=aKA3TgYmShY&t=9s', 'backup':'pending'}
    row = {'id':'r', 'bookId':'gold', 'name':'Kick </script><img onerror=bad>', 'category':'Patadas', 'chapter':'Kicks', 'members':['a.xhtml'], 'style':'ITF', 'summaryEs':'Demostración sin verificar', 'notes':'Precaución', 'videos':[video], 'imageIds':['i'], 'appNames':{'es':'<bad>&'}, 'appInfo':{'es':'Descripción'}, 'mappingConfidence':'pending'}
    image = {'id':'i','bookId':'gold','category':'Patadas','path':'media/images/a.png','member':'images/a.png','title':'Kick','references':[{'document':'a.xhtml','chapter':'Kicks','heading':'Kick'}], 'sha256':'a'*64,'bytes':42,'width':640,'height':480,'captionEs':'Sin verificar'}
    manifest = {'gold':{'url':'books/gold/index.html', 'members':{'a.xhtml':{'number':7,'url':'books/gold/index.html#m7','anchors':{'kick':'books/gold/index.html#m7-kick'},'headings':[{'text':'Kicks','url':'books/gold/index.html#m7-heading'}]}}, 'images':{'images/a.png':'books/gold/assets/a.png'}}}
    return {'books':[{'id':'gold','shortTitle':'Book','author':'Author','style':'ITF','noteEs':'Note','copyright':'Private','toc':[]}], 'rows':[row,{**row,'id':'r2','videos':[{**video,'start':159}]},{**row,'id':'c','bookId':'current','members':['synthetic'],'videos':[{**video,'videoId':'NSSVH1TUElk'}]}], 'images':[image], 'readers':manifest, 'audit':{'sourceRowCount':2,'sourceVideoIds':['aKA3TgYmShY'],'currentCourseVideoIds':['NSSVH1TUElk'],'books':[],'archiveNotes':[]}}


class CompleteMediaTests(unittest.TestCase):
    def test_static_complete_exclusive_views_and_contexts(self):
        data = media_fixture()
        data['rows'] += [{**data['rows'][0], 'id':f'extra{n}'} for n in range(65)]
        data['images'] += [{**data['images'][0], 'id':f'image{n}'} for n in range(65)]
        page = c.render_html(data)
        from html.parser import HTMLParser
        class Inventory(HTMLParser):
            def __init__(self): super().__init__(); self.attrs=[]
            def handle_starttag(self, tag, attrs): self.attrs.append((tag,dict(attrs)))
        inventory=Inventory(); inventory.feed(page)
        self.assertEqual(sum('data-row' in a for _,a in inventory.attrs),len(data['rows']))
        self.assertEqual(sum('data-image-card' in a for _,a in inventory.attrs),len(data['images']))
        self.assertEqual(sum('data-video-card' in a for _,a in inventory.attrs),2)
        self.assertNotIn('<div id="coverage" class="coverage"></div>',page)
        self.assertNotIn('<div id="limits"></div>',page)
        for token in ('id="view-catalogue"','id="view-videos"','id="view-images"','data-scope="epub"','data-scope="course"','data-scope="union"','159s','9s'):
            self.assertIn(token,page)
        for token in ('visibleLimits','data-more','slice(0,','<details','Mostrar más'):
            self.assertNotIn(token,page)

    def test_reader_reference_numbers_and_original_assets(self):
        data=media_fixture(); page=c.render_html(data)
        self.assertIn('href="books/gold/index.html" target="_blank" rel="noopener noreferrer"',page)
        self.assertRegex(page,r'href="books/gold/index.html#m7"[^>]*>7</a>')
        self.assertIn('href="books/gold/index.html#m7-heading"',page)
        self.assertIn('src="books/gold/assets/a.png"',page)
        self.assertIn('href="books/gold/assets/a.png"',page)
        self.assertNotIn('books/current',page)
        data['rows'][0]['videos'][0]['sourceAnchor']='kick'
        self.assertIn('books/gold/index.html#m7-kick',c.render_references(data,data['rows'][0]))
        data['rows'][0]['chapter']='Unknown chapter'
        data['rows'][0]['videos']=[]
        self.assertIn('href="books/gold/index.html#m7"',c.render_references(data,data['rows'][0]))

    def test_highlighted_json_escapes_tokens_and_static_text(self):
        page=c.render_html(media_fixture())
        self.assertIn('json-key',page)
        self.assertIn('json-string',page)
        self.assertIn('&lt;bad&gt;&amp;',page)
        self.assertNotIn('</script><img onerror=bad>',page)
        self.assertNotIn('<bad>',page)
        data=media_fixture(); data['audit']['sourceRowCount']='</script><img onerror=bad>'
        self.assertFalse('</script><img onerror=bad>' in c.render_html(data),'summary values must also be escaped')
        marked=c.highlight_json({'x':'</script><img onerror=bad>','count':3,'ok':True,'none':None})
        for token in ('json-number','json-literal','&lt;/script&gt;'):
            self.assertIn(token,marked)

    def test_output_plan_preflight_budget_hash_and_preservation(self):
        import tempfile
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as directory:
            out=Path(directory).resolve(); asset=out/'media/images/a.png'; asset.parent.mkdir(parents=True); asset.write_bytes(b'raw')
            stamp=asset.stat().st_mtime_ns
            files={'media/images/a.png':b'raw','books/gold/index.html':b'book','index.html':b'page'}
            with patch.object(c,'validate_output',side_effect=lambda p:Path(p)):
                estimate=c.validate_plan(out,files,free=c.RESERVE+8)
                self.assertEqual(estimate,{'totalBytes':11,'writeBytes':8})
                c.write_plan(out,files)
                self.assertEqual(asset.stat().st_mtime_ns,stamp)
                self.assertEqual(asset.read_bytes(),b'raw')
                for name in ('books/../escape','books/gold/../../escape','books/gold/%2e%2e/x','/books/x','books//x','books/gold/x?bad','other/x','books\\x','books/evil/part.html'):
                    with self.subTest(name=name),self.assertRaises(ValueError):
                        c.validate_plan(out,{**files,name:b'bad'})
                self.assertEqual(c.validate_plan(out,{'books/gold/index.html':b'changed'})['writeBytes'],7)
                for name in ('media/images/a.png',):
                    with self.subTest(name=name),self.assertRaises(ValueError): c.validate_plan(out,{name:b'changed'})
                with self.assertRaises(OSError): c.validate_plan(out,{**files,'index.html':b'12345678'},free=c.RESERVE+7)
                with patch.object(c,'MAX_BYTES',10),self.assertRaises(OSError): c.validate_plan(out,files)
                with self.assertRaises(ValueError): c.validate_plan(out,{'books/gold/a':b'file','books/gold/a/b.png':b'child'})
                with self.assertRaises(ValueError): c.validate_plan(out,{'media/images/a.png/child':b'child'})
                link=out/'books/gold/link'; link.symlink_to(asset)
                with self.assertRaises(ValueError): c.validate_plan(out,{'books/gold/link/a.png':b'bad'})

    def test_real_plan_completeness_without_destination_writes(self):
        before={p:(p.stat().st_size,p.stat().st_mtime_ns) for p in (c.OUT/'media/images').rglob('*') if p.is_file()}
        data, files=c.build_catalogue()
        self.assertEqual(data['audit']['sourceRowCount'],840)
        self.assertEqual(len(data['rows']),1008)
        self.assertEqual(len(data['images']),1732)
        self.assertEqual((len(data['audit']['sourceVideoIds']),len(data['audit']['currentCourseVideoIds'])),(57,56))
        self.assertEqual(len(set(data['audit']['sourceVideoIds'])|set(data['audit']['currentCourseVideoIds'])),100)
        self.assertEqual(sum(len(book['members']) for book in data['readers'].values()),570)
        self.assertEqual(len([name for name in files if name.startswith('books/')]),3527)
        self.assertEqual(sum(len(raw) for name,raw in files.items() if name.startswith('books/') and not name.endswith('/index.html')),140100814)
        page=c.render_html(data)
        for name, content in {'index.html':page,'resources.md':c.render_markdown(data),'catalogue.json':json.dumps(data,ensure_ascii=False,indent=2)+'\n','catalogue-audit.json':json.dumps(data['audit'],ensure_ascii=False,indent=2)+'\n'}.items(): files[name]=content.encode('utf-8')
        estimate=c.validate_plan(c.OUT,files)
        self.assertLessEqual(estimate['totalBytes'],c.MAX_BYTES)
        self.assertEqual(estimate['writeBytes'],0,'guard-only correction must preserve accepted generated output byte-for-byte')
        for name,raw in files.items():
            self.assertEqual(hashlib.sha256(raw).digest(),hashlib.sha256((c.OUT/name).read_bytes()).digest(),name)
        print(f'Accepted-output equivalence: {len(files)} planned files byte-identical; no destination regeneration needed')
        self.assertEqual(before,{p:(p.stat().st_size,p.stat().st_mtime_ns) for p in before})
        white=next(im for im in data['images'] if im['bookId']=='mcmillan' and im['member']=='OEBPS/image_rsrcEP8.jpg')
        self.assertEqual(white['sha256'],'63116ce3db98b1147d71d606f09ec606fcfa893ea4c183401446a8d2bc076c12')
        self.assertEqual(files[white['originalPath']],(c.OUT/white['path']).read_bytes())
        self.assertEqual(len(files[white['originalPath']]),9481)
        self.assertEqual(len({v['videoId'] for r in data['rows'] for v in r['videos'] if v.get('visualReview')=='sampled-by-T1'}),13)
        print('Pure real plan: '+json.dumps({'sourceRows':840,'imageRecords':1732,'existingImageFiles':len(before),'videoScopes':[57,56,100],'readerMembers':570,'readerFiles':3527,**estimate}))

    def test_reader_planner_contract_adapter(self):
        from unittest.mock import Mock
        data=media_fixture(); sources=[('gold',Path('fixture.epub'))]
        planner=Mock(return_value=(data['readers'],{'books/gold/index.html':b'book','books/gold/assets/a.png':b'raw'}))
        files=c.attach_readers(data,sources,planner)
        planner.assert_called_once_with(sources)
        self.assertEqual(files['books/gold/index.html'],b'book')
        self.assertEqual(data['images'][0]['originalPath'],'books/gold/assets/a.png')
        with self.assertRaises(ValueError): c.attach_readers(data,sources,lambda _: ({}, {'media/images/bad.png':b'bad'}))


class PublicInputBoundaryTests(unittest.TestCase):
    def test_public_generator_rejects_hostile_archives_before_unsafe_reads(self):
        """Call main(), not the pure planner; no legacy unbounded reads or writes."""
        import tempfile
        import warnings
        from contextlib import ExitStack
        from unittest.mock import patch
        from scripts import epub_html_reader as reader
        entries = {
            'META-INF/container.xml':b'<container><rootfiles><rootfile full-path="book.opf"/></rootfiles></container>',
            'book.opf':b'<package><manifest><item id="a" href="a.xhtml"/><item id="toc" href="toc.ncx"/></manifest><spine><itemref idref="a"/></spine></package>',
            'toc.ncx':b'<ncx><navMap/></ncx>',
            'a.xhtml':b'<html><body><h1>Safe</h1></body></html>',
        }
        cases = [(kind,None,None) for kind in ('unsafe','duplicate','symlink','encrypted','count','total','ratio','member','container-size','opf-size','ncx-size','chapter-size')]
        cases += [(kind,member,encoding) for kind in ('declaration','doctype','entity') for member in entries for encoding in ('utf-8','utf-16-le','utf-16-be','utf-32-le','utf-32-be')]
        cases += [('malformed','toc.ncx',None)]
        for kind, member, encoding in cases:
            with self.subTest(kind=kind,member=member,encoding=encoding), tempfile.TemporaryDirectory() as directory:
                root=Path(directory).resolve(); sources=root/'docs/clint-sharp'; sources.mkdir(parents=True)
                source=sources/'Adam Gold.epub'; output=root/'resources/epub'; (output/'media/images').mkdir(parents=True)
                (output/'catalogue.json').write_bytes(b'{"sourceRowCount":840,"imageCount":1732}')
                (output/'media/images/preserved.png').write_bytes(b'UNCHANGED ORIGINAL')
                values=dict(entries)
                declarations={'declaration':'<!DOCTYPE HOSTILE_XML [<!ENTITY x "expanded">]><HOSTILE_XML>&x;</HOSTILE_XML>', 'doctype':'<!DOCTYPE HOSTILE_XML><HOSTILE_XML/>', 'entity':'<!ENTITY x "expanded"><HOSTILE_XML/>'}
                if kind in declarations: values[member]=declarations[kind].encode(encoding)
                if kind=='malformed': values[member]=b'<ncx><broken></ncx>'
                if kind=='unsafe': values['../escape']=b'bad'
                with warnings.catch_warnings(), zipfile.ZipFile(source,'w',compression=zipfile.ZIP_DEFLATED) as archive:
                    warnings.simplefilter('ignore')
                    for name,raw in values.items(): archive.writestr(name,raw)
                    if kind=='duplicate': archive.writestr('a.xhtml',b'duplicate')
                    if kind=='symlink':
                        info=zipfile.ZipInfo('link'); info.external_attr=0o120777<<16; archive.writestr(info,b'target')
                stored={p:(p.read_bytes(),p.stat().st_mtime_ns) for p in (source,output/'catalogue.json',output/'media/images/preserved.png')}
                events=[]; original_infos=zipfile.ZipFile.infolist; original_open=zipfile.ZipFile.open
                original_read=zipfile.ZipExtFile.read; original_parse=c.ET.fromstring
                def infos(archive):
                    events.append(('directory',None)); result=original_infos(archive)
                    if kind=='encrypted': result[0].flag_bits |= 1
                    sizes={'member':('a.xhtml',reader.MAX_MEMBER+1),'container-size':('META-INF/container.xml',reader.MAX_DOCUMENT+1),'opf-size':('book.opf',reader.MAX_DOCUMENT+1),'ncx-size':('toc.ncx',reader.MAX_DOCUMENT+1),'chapter-size':('a.xhtml',reader.MAX_DOCUMENT+1)}
                    if kind in sizes:
                        target,size=sizes[kind]; next(i for i in result if i.filename==target).file_size=size
                    return result
                def opened(archive,name,*args,**kwargs):
                    events.append(('open',name.filename if isinstance(name,zipfile.ZipInfo) else name))
                    self.assertTrue(any(e[0]=='directory' for e in events),'directory must be checked before decompression')
                    return original_open(archive,name,*args,**kwargs)
                def bounded(stream,size=-1):
                    self.assertGreaterEqual(size,0,'public generator attempted unbounded decompression')
                    self.assertLessEqual(size,reader.MAX_MEMBER+1)
                    events.append(('bounded',size)); return original_read(stream,size)
                def parsed(raw,*args,**kwargs):
                    self.assertNotIn(b'HOSTILE_XML',raw.replace(b'\x00',b''),'declaration reached XML parser')
                    events.append(('parse',None)); return original_parse(raw,*args,**kwargs)
                with ExitStack() as stack:
                    for name,value in (('ROOT',root),('OUT',output),('LEGACY_OUT',root/'.atl/epub-resources'),('BOOKS',{'gold':c.BOOKS['gold']})):
                        stack.enter_context(patch.object(c,name,value))
                    stack.enter_context(patch.object(sys,'argv',['catalogue']))
                    for name,value in (('load_app_labels',{}),('load_app_info',{}),('validated_archive',({},[])),('review_samples',{}),('documented_sample_reviews',{})):
                        stack.enter_context(patch.object(c,name,return_value=value))
                    for target,name,replacement in ((zipfile.ZipFile,'infolist',infos),(zipfile.ZipFile,'open',opened),(zipfile.ZipExtFile,'read',bounded),(c.ET,'fromstring',parsed)):
                        stack.enter_context(patch.object(target,name,replacement))
                    unbounded=stack.enter_context(patch.object(zipfile.ZipFile,'read',side_effect=AssertionError('legacy ZipFile.read before safe boundary')))
                    writes=[stack.enter_context(patch.object(Path,name,side_effect=AssertionError('rejected input wrote output'))) for name in ('write_bytes','write_text','mkdir')]
                    for case,key,value in (('count','MAX_MEMBERS',1),('total','MAX_TOTAL',1),('ratio','MAX_RATIO',0)):
                        if kind==case: stack.enter_context(patch.object(reader,key,value))
                    with self.assertRaises(ValueError): c.main()
                    self.assertEqual(unbounded.call_count,0)
                    for write in writes: write.assert_not_called()
                if kind not in ('declaration','doctype','entity','malformed'):
                    self.assertFalse(any(event in ('open','parse') for event,_ in events),'unsafe directory must reject before any member decompression/parser')
                else:
                    self.assertTrue(any(event=='bounded' for event,_ in events),'XML declaration check must follow a bounded read')
                self.assertEqual(stored,{p:(p.read_bytes(),p.stat().st_mtime_ns) for p in stored})
        print(f'Public main() guard matrix: {len(cases)} hostile cases; bounded-first/XML-before-parser/no-writes/source+stored counters preserved')


if __name__ == '__main__':
    unittest.main()
