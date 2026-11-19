"""Synthetic, offline EPUB reader contracts; no copyrighted fixtures."""
import io
import sys
sys.dont_write_bytecode = True
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

import epub_html_reader as r


def epub(extra=None, chapter=None):
    entries = {
        'META-INF/container.xml': b'<container><rootfiles><rootfile full-path="O/book.opf"/></rootfiles></container>',
        'O/book.opf': b'<package><manifest><item id="b" href="b.xhtml" media-type="application/xhtml+xml"/><item id="a" href="a.xhtml" media-type="application/xhtml+xml"/><item id="c" href="c.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="a"/><itemref idref="b"/></spine></package>',
        'O/a.xhtml': (chapter or '<html><body><h1 id="kick">Kick &amp; turn</h1><p>Complete text <em>emphasis</em></p><a href="b.xhtml#kick">Next</a><a href="#kick">Here</a><img src="images/original.png" alt="Movement"/><table><tr><td>Step</td></tr></table></body></html>').encode(),
        'O/b.xhtml': b'<html><body><h2 id="kick">Second</h2><a href="a.xhtml#kick">Back</a></body></html>',
        'O/c.xhtml': b'<html><body><h3>Remaining</h3></body></html>',
        'O/images/original.png': b'\x89PNG\r\n\x1a\nORIGINAL UNMODIFIED BYTES',
    }
    entries.update(extra or {})
    data = io.BytesIO()
    with zipfile.ZipFile(data, 'w') as z:
        for name, value in entries.items():
            z.writestr(name, value)
    return data.getvalue()


class ReaderTests(unittest.TestCase):
    def plan(self, data, ids=('book',)):
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / 'source.epub'
            source.write_bytes(data)
            with patch.object(Path, 'write_bytes', side_effect=AssertionError('planner wrote destination')):
                return r.plan_readers([(key, source) for key in ids])

    def test_complete_reader_manifest_spine_links_and_original_bytes(self):
        manifest, files = self.plan(epub())
        book = manifest['book']
        self.assertEqual(book['url'], 'books/book/index.html')
        self.assertEqual(list(book['members']), ['O/a.xhtml', 'O/b.xhtml', 'O/c.xhtml'])
        self.assertEqual([m['number'] for m in book['members'].values()], [1, 2, 3])
        html = files[book['url']].decode()
        for text in ('Complete text', '<em>emphasis</em>', '<table>', 'Remaining', 'Movement', 'Kick &amp; turn'):
            self.assertIn(text, html)
        self.assertNotIn('<details', html)
        a, b = (book['members'][name] for name in ('O/a.xhtml', 'O/b.xhtml'))
        self.assertNotEqual(a['anchors']['kick'], b['anchors']['kick'])
        for member in book['members'].values():
            for url in [member['url'], *member['anchors'].values(), *(h['url'] for h in member['headings'])]:
                self.assertIn('id="' + url.split('#')[1] + '"', html)
        self.assertIn('href="#' + b['anchors']['kick'].split('#')[1] + '"', html)
        self.assertEqual(a['headings'][0]['text'], 'Kick & turn')
        image = book['images']['O/images/original.png']
        self.assertEqual(image, 'books/book/O/images/original.png')
        self.assertEqual(files[image], b'\x89PNG\r\n\x1a\nORIGINAL UNMODIFIED BYTES')
        self.assertIn('src="O/images/original.png"', html)
        self.assertTrue(all(p.startswith('books/book/') for p in files))

    def test_hostile_markup_urls_and_active_assets_are_inert(self):
        chapter = '''<html><head><style>@import 'https://evil';</style><script>BAD_SCRIPT</script></head><body onload="evil()"><h1 id="x">Safe</h1><p style="background:url(https://evil)" onclick="evil()">Keep text</p><img src="https://evil/track" alt="Remote alternative"/><img src="bad.svg" alt="Diagram"/><svg onload="evil()"><script>BAD_SVG</script></svg><object data="evil.html">Object fallback</object><iframe src="https://evil">Frame</iframe><a href="javascript:evil()">Bad</a><a href="data:text/html,evil">Data</a><a href="//evil">Protocol</a><a href="https://example.org/watch?q=1&amp;x=2">Video reference</a><a href="missing.xhtml#madeup">Missing</a><a href="#missing">Absent anchor</a><figure><figcaption>Caption</figcaption></figure></body></html>'''
        _, files = self.plan(epub({'O/bad.svg': b'<svg/>'}, chapter))
        html = files['books/book/index.html'].decode()
        for forbidden in ('BAD_SCRIPT', 'BAD_SVG', '<script', '<style', 'onload=', 'onclick=', 'style=', '<svg', '<object', '<iframe', 'src="https:', 'javascript:', 'data:text', 'href="//', 'href="missing', '#missing"'):
            self.assertNotIn(forbidden, html)
        for expected in ('Keep text', 'Remote alternative', 'Diagram', 'unsupported', 'Object fallback', 'Video reference', 'Missing', 'Absent anchor', '<figcaption>Caption', 'target="_blank"', 'rel="noopener noreferrer"'):
            self.assertIn(expected, html)
        self.assertNotIn('books/book/O/bad.svg', files)

    def test_reject_unsafe_zip_names_before_reading(self):
        names = ('../evil', '/absolute', 'C:/drive', 'O\\evil', 'O/%2e%2e/evil', 'O/%252e%252e/evil', 'O//evil', 'O/./evil', 'O/A.xhtml')
        for name in names:
            with self.subTest(name=name), patch.object(zipfile.ZipFile, 'read', side_effect=AssertionError('read before validation')):
                with self.assertRaises(ValueError):
                    self.plan(epub({name: b'bad'}))

    def test_reject_duplicate_symlink_encryption_and_budgets_before_read(self):
        for kind in ('duplicate', 'symlink', 'budget', 'document', 'count', 'ratio', 'encrypted'):
            data = io.BytesIO(epub())
            with zipfile.ZipFile(data, 'a') as z:
                if kind == 'duplicate':
                    import warnings
                    with warnings.catch_warnings():
                        warnings.simplefilter('ignore')
                        z.writestr('O/a.xhtml', b'duplicate')
                elif kind == 'symlink':
                    info = zipfile.ZipInfo('link')
                    info.external_attr = (0o120777 << 16)
                    z.writestr(info, b'target')
            patches = {'budget': ('MAX_TOTAL', 1), 'document': ('MAX_DOCUMENT', 1), 'count': ('MAX_MEMBERS', 1), 'ratio': ('MAX_RATIO', 0)}
            with self.subTest(kind=kind):
                from contextlib import ExitStack
                with ExitStack() as stack:
                    if kind in patches:
                        key, value = patches[kind]
                        stack.enter_context(patch.object(r, key, value))
                    if kind == 'encrypted':
                        original = zipfile.ZipFile.infolist
                        def encrypted(z):
                            infos = original(z)
                            infos[0].flag_bits |= 1
                            return infos
                        stack.enter_context(patch.object(zipfile.ZipFile, 'infolist', encrypted))
                    stack.enter_context(patch.object(zipfile.ZipFile, 'read', side_effect=AssertionError('read before validation')))
                    with self.assertRaises(ValueError):
                        self.plan(data.getvalue())

    def test_relative_encoded_links_and_duplicate_ids(self):
        chapter = '<html><body><h1 id="a b">First</h1><p id="a b">Second</p><a href="./a.xhtml#a%20b">Encoded</a><a href="../O/b.xhtml#kick">Sibling</a><a href="%252e%252e/evil">Bad</a><img src="../O/images/original.png" alt="Original"/></body></html>'
        manifest, files = self.plan(epub(chapter=chapter))
        html = files['books/book/index.html'].decode()
        import re
        ids = re.findall(r' id="([^"]+)"', html)
        self.assertEqual(len(ids), len(set(ids)))
        self.assertIn('href="#' + manifest['book']['members']['O/a.xhtml']['anchors']['a b'].split('#')[1] + '"', html)
        self.assertNotIn('%252e', html)
        self.assertIn('src="O/images/original.png"', html)

    def test_encoded_xml_and_disguised_raster_are_not_active(self):
        declaration = '<!DOCTYPE container [<!ENTITY x "O/book.opf">]><container><rootfiles><rootfile full-path="&x;"/></rootfiles></container>'
        with self.assertRaises(ValueError):
            self.plan(epub({'META-INF/container.xml': declaration.encode('utf-16')}))
        manifest, files = self.plan(epub({'O/images/fake.png': b'<html><script>evil()</script></html>'}))
        self.assertNotIn('O/images/fake.png', manifest['book']['images'])
        self.assertNotIn('books/book/O/images/fake.png', files)

    def test_unsupported_asset_and_image_fragment_targets_exist(self):
        chapter = '<html><body><object id="asset">Fallback</object><img id="photo" src="images/original.png"/><img id="missing" src="missing.png"/><a href="#asset">Asset</a><a href="#missing">Missing</a></body></html>'
        manifest, files = self.plan(epub(chapter=chapter))
        html = files['books/book/index.html'].decode()
        for url in manifest['book']['members']['O/a.xhtml']['anchors'].values():
            self.assertIn('id="' + url.split('#')[1] + '"', html)

    def test_reject_entity_xml_and_invalid_book_ids(self):
        for name in ('../book', 'a/b', 'Book space', '', 'a%2f', 'CON'):
            with self.subTest(name=name), self.assertRaises(ValueError):
                self.plan(epub(), (name,))
        for ids in (('same', 'same'), ('book', 'BOOK')):
            with self.assertRaises(ValueError): self.plan(epub(), ids)
        for member in ('META-INF/container.xml', 'O/book.opf', 'O/a.xhtml'):
            with self.subTest(member=member), self.assertRaises(ValueError):
                self.plan(epub({member: b'<!DOCTYPE x [<!ENTITY x "expanded">]><html>&x;</html>'}))


if __name__ == '__main__':
    unittest.main()
