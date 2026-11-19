"""Pure, offline EPUB-to-static-reader planning. No destination filesystem writes."""
import html
from contextlib import contextmanager
from html.parser import HTMLParser
import posixpath
import re
import stat
from urllib.parse import quote, unquote, urlsplit
import xml.etree.ElementTree as ET
import zipfile

MAX_TOTAL = 280 * 1024 * 1024
MAX_MEMBER = 64 * 1024 * 1024
MAX_DOCUMENT = 8 * 1024 * 1024
MAX_MEMBERS = 20000
MAX_RATIO = 1000
RASTER = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'}
DOCS = {'.xhtml', '.html', '.htm'}
SAFE = set('p div span section article header footer main aside blockquote pre code em strong b i u s sub sup small br hr h1 h2 h3 h4 h5 h6 ul ol li dl dt dd table caption thead tbody tfoot tr th td figure figcaption a img abbr cite q time'.split())
VOID = {'br', 'hr', 'img', 'meta', 'link', 'input', 'source', 'embed', 'area', 'base', 'wbr'}
DROP = {'script', 'style', 'head', 'template', 'noscript'}
ACTIVE = {'svg', 'math', 'object', 'embed', 'iframe', 'video', 'audio', 'canvas', 'form', 'input', 'button'}


def _name(value):
    """Canonical ZIP names only; reject aliases before any member is opened."""
    if (not value or '\\' in value or re.search(r'[\x00-\x20\x7f:#?]', value)
            or unquote(value) != value or value.startswith('/')
            or any(p in {'', '.', '..'} for p in value.split('/'))):
        raise ValueError('Unsafe EPUB member name: ' + repr(value))
    return value


def _reference(base, value):
    """Resolve EPUB-relative paths without allowing escape or encoded aliases."""
    if not value or re.search(r'[\x00-\x20\x7f\\]', value):
        raise ValueError('Unsafe EPUB reference')
    parts = urlsplit(value)
    if parts.scheme or parts.netloc or parts.query or parts.path.startswith('/'):
        raise ValueError('Nonlocal EPUB reference')
    path = unquote(parts.path, errors='strict')
    if unquote(path) != path or '\\' in path or ':' in path:
        raise ValueError('Encoded EPUB traversal')
    resolved = posixpath.normpath(posixpath.join(posixpath.dirname(base), path)) if path else base
    _name(resolved)
    return resolved, unquote(parts.fragment)


def _xml(data):
    # ElementTree never retrieves external entities; disallow declarations too.
    if re.search(br'<!\s*(?:DOCTYPE|ENTITY)', data.replace(b'\x00', b''), re.I):
        raise ValueError('DTD/entities are not supported')
    try:
        return ET.fromstring(data)
    except ET.ParseError as exc:
        raise ValueError('Invalid EPUB package XML') from exc


def _elements(root, name):
    return (e for e in root.iter() if e.tag.rsplit('}', 1)[-1] == name)


class _Tree(HTMLParser):
    """Small inert HTML tree; never emits source markup or evaluates anything."""
    def __init__(self, data):
        super().__init__(convert_charrefs=True)
        self.root = ['root', {}, []]
        self.stack = [self.root]
        text = data.decode('utf-8-sig')
        if re.search(r'<!\s*ENTITY', text, re.I) or re.search(r'<!DOCTYPE[^>]*\[', text, re.I):
            raise ValueError('HTML entities are not supported')
        self.feed(text)
        self.close()

    def handle_starttag(self, tag, attrs):
        node = [tag.lower(), dict(attrs), []]
        self.stack[-1][2].append(node)
        if tag not in VOID:
            if len(self.stack) > 256:
                raise ValueError('EPUB HTML nesting too deep')
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1][2].append(data)


def _text(node):
    if isinstance(node, str):
        return node
    if node[0] in DROP:
        return ''
    return ''.join(_text(c) for c in node[2])


def _index(tree, number, url):
    anchors, headings, assigned = {}, [], {}
    prefix = 'm' + str(number)

    def walk(node):
        if isinstance(node, str) or node[0] in DROP or node[0] in {'svg', 'math'}:
            return
        tag, attrs, children = node
        original = attrs.get('id') or (attrs.get('name') if tag == 'a' else None)
        heading = tag in {'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}
        if original or heading:
            ident = prefix + '-a' + str(len(assigned) + 1)
            assigned[id(node)] = ident
            if original:
                anchors.setdefault(original, url + '#' + ident)
            if heading:
                headings.append({'text': ' '.join(_text(node).split()), 'url': url + '#' + ident})
        for child in children:
            walk(child)
    walk(tree)
    return {'number': number, 'url': url + '#' + prefix, 'anchors': anchors, 'headings': headings}, assigned


def _render(tree, member, members, images, assigned):
    def link(value):
        if re.search(r'[\x00-\x20\x7f\\]', value):
            return None
        try:
            parts = urlsplit(value)
            if parts.scheme.lower() in {'http', 'https'} and parts.hostname:
                return value, True
            target, fragment = _reference(member, value)
            if target in members:
                info = members[target]
                url = info['anchors'].get(fragment) if fragment else info['url']
                return ('#' + url.split('#', 1)[1], False) if url else None
            if target in images and not fragment:
                return quote(target, safe='/'), False
        except (ValueError, UnicodeError):
            pass
        return None

    def render(node):
        if isinstance(node, str):
            return html.escape(node)
        tag, attrs, children = node
        if tag in DROP:
            return ''
        if tag in {'svg', 'math'}:
            return '<span>[unsupported active illustration]</span>'
        content = ''.join(render(child) for child in children)
        marker = ' id="' + assigned[id(node)] + '"' if id(node) in assigned else ''
        if tag in ACTIVE:
            return '<span' + marker + '>[unsupported active asset]</span>' + content
        if tag not in SAFE:
            # Preserve IDs on structural wrappers without retaining unknown tags.
            ident = assigned.get(id(node))
            return ('<div id="' + ident + '">' + content + '</div>') if ident else content
        out = {}
        if id(node) in assigned:
            out['id'] = assigned[id(node)]
        if attrs.get('title'):
            out['title'] = attrs['title']
        if tag in {'td', 'th'}:
            for key in ('colspan', 'rowspan'):
                if re.fullmatch(r'[1-9][0-9]{0,2}', attrs.get(key) or ''):
                    out[key] = attrs[key]
        if tag == 'a':
            target = link(attrs.get('href') or '')
            if target:
                out['href'] = target[0]
                if target[1]:
                    out.update(target='_blank', rel='noopener noreferrer')
        if tag == 'img':
            alt = attrs.get('alt') or ''
            try:
                target, fragment = _reference(member, attrs.get('src') or '')
            except (ValueError, UnicodeError):
                target, fragment = None, None
            if target not in images or fragment:
                return '<span' + marker + '>[unsupported image: ' + html.escape(alt) + ']</span>'
            out.update(src=quote(target, safe='/'), alt=alt, loading='lazy')
        attributes = ''.join(' ' + k + '="' + html.escape(v, quote=True) + '"' for k, v in out.items())
        return '<' + tag + attributes + '>' + ('' if tag in VOID else content + '</' + tag + '>')
    return render(tree)


class _SafeArchive:
    """One central-directory gate and bounded reader shared by both consumers."""
    def __init__(self, archive):
        self._archive = archive
        self._infos = archive.infolist()
        if len(self._infos) > MAX_MEMBERS:
            raise ValueError('EPUB member-count budget exceeded')
        names, total = set(), 0
        for info in self._infos:
            name = _name(info.filename.rstrip('/') if info.is_dir() else info.filename)
            key = name.casefold()
            if key in names or stat.S_ISLNK(info.external_attr >> 16) or info.flag_bits & 1:
                raise ValueError('Duplicate, case collision, symlink or encrypted EPUB member')
            names.add(key)
            limit = MAX_DOCUMENT if posixpath.splitext(name)[1].lower() in DOCS | {'.xml', '.opf', '.ncx'} else MAX_MEMBER
            total += info.file_size
            if (info.file_size < 0 or info.compress_size < 0 or info.file_size > limit or total > MAX_TOTAL
                    or info.file_size > max(1, info.compress_size) * MAX_RATIO):
                raise ValueError('EPUB expansion budget exceeded')
        self.entries = {i.filename for i in self._infos if not i.is_dir()}

    def infolist(self):
        return self._infos

    def getinfo(self, name):
        return self._archive.getinfo(name)

    def read(self, name, document=False):
        if name not in self.entries:
            raise ValueError('Missing EPUB member: ' + name)
        limit = MAX_DOCUMENT if document or posixpath.splitext(name)[1].lower() in DOCS | {'.xml', '.opf', '.ncx'} else MAX_MEMBER
        info = self.getinfo(name)
        if info.file_size > limit:
            raise ValueError('EPUB document/member budget exceeded')
        # Never ZipFile.read(): it requests an unbounded decompression read.
        with self._archive.open(name) as stream:
            data = stream.read(min(info.file_size, limit) + 1)
        if len(data) != info.file_size or len(data) > limit:
            raise ValueError('EPUB member size mismatch')
        return data

    def xml(self, name):
        # Includes container, OPF, NCX and legacy XHTML, regardless of extension.
        # _xml rejects DTD/entities (including UTF-16/32) before ElementTree sees it.
        return _xml(self.read(name, document=True))


@contextmanager
def safe_archive(source):
    """Validate all ZIP metadata before opening any member; yield bounded reads.

    Consumers parsing XML must use .xml(name), not parse .read(name) themselves.
    The source handle is retained until the consumer finishes (no reopen gap).
    """
    with zipfile.ZipFile(source) as archive:
        yield _SafeArchive(archive)


def _book(book_id, source):
    prefix = 'books/' + book_id + '/'
    url = prefix + 'index.html'
    with safe_archive(source) as archive:
        entries, read = archive.entries, archive.read
        container = archive.xml('META-INF/container.xml')
        roots = list(_elements(container, 'rootfile'))
        if not roots:
            raise ValueError('EPUB container has no package')
        opf = _name(roots[0].get('full-path', ''))
        package = archive.xml(opf)
        items, ordered = {}, []
        for item in _elements(package, 'item'):
            target, fragment = _reference(opf, item.get('href', ''))
            if fragment:
                raise ValueError('Fragment in EPUB package member')
            if target in entries and (item.get('media-type') in {'application/xhtml+xml', 'text/html'} or posixpath.splitext(target)[1].lower() in DOCS):
                items[item.get('id')] = target
        for ref in _elements(package, 'itemref'):
            target = items.get(ref.get('idref'))
            if target and target not in ordered:
                ordered.append(target)
        for target in list(items.values()) + sorted(entries):
            if posixpath.splitext(target)[1].lower() in DOCS and target not in ordered:
                ordered.append(target)
        images, files = {}, {}
        for name in sorted(entries):
            if posixpath.splitext(name)[1].lower() not in RASTER:
                continue
            data = read(name)
            # Do not publish HTML disguised as a directly linked image file.
            raster = (data.startswith((b'\x89PNG\r\n\x1a\n', b'\xff\xd8\xff', b'GIF87a', b'GIF89a', b'BM'))
                      or (data.startswith(b'RIFF') and data[8:12] == b'WEBP'))
            if raster:
                images[name] = prefix + quote(name, safe='/')
                files[prefix + name] = data
        members, trees = {}, {}
        for number, member in enumerate(ordered, 1):
            tree = _Tree(read(member, document=True)).root
            info, assigned = _index(tree, number, url)
            members[member] = info
            trees[member] = tree, assigned
        toc, sections = [], []
        for member, info in members.items():
            label = info['headings'][0]['text'] if info['headings'] else member
            toc.append('<li><a href="#m' + str(info['number']) + '">' + html.escape(str(info['number']) + '. ' + label) + '</a></li>')
            for heading in info['headings']:
                toc.append('<li><a href="#' + heading['url'].split('#')[1] + '">' + html.escape(heading['text']) + '</a></li>')
            tree, assigned = trees[member]
            sections.append('<section id="m' + str(info['number']) + '">' + _render(tree, member, members, images, assigned) + '</section>')
        page = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width,initial-scale=1">'
                '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; img-src &#39;self&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;">'
                '<title>' + html.escape(book_id) + '</title></head><body><nav aria-label="Contents"><ol>'
                + ''.join(toc) + '</ol></nav><main>' + ''.join(sections) + '</main></body></html>')
        files[url] = page.encode('utf-8')
        return {'url': url, 'members': members, 'images': images}, files


def plan_readers(book_sources):
    """Return (manifest, resource-relative byte files), without writing anything.

    ValueError rejects unsafe packages before decompression. ZIP metadata limits
    apply to all entries, including unused assets. Original raster bytes only;
    unsupported active assets are represented honestly, never executed.
    """
    sources = list(book_sources)
    seen = set()
    for book_id, _ in sources:
        if (not isinstance(book_id, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,99}', book_id)
                or book_id.casefold() in seen or book_id.upper() in {'CON', 'PRN', 'AUX', 'NUL'}
                or re.fullmatch(r'(?:COM|LPT)[1-9]', book_id, re.I)):
            raise ValueError('Unsafe or duplicate book identifier')
        seen.add(book_id.casefold())
    manifest, files = {}, {}
    for book_id, source in sources:
        book, outputs = _book(book_id, source)
        manifest[book_id] = book
        files.update(outputs)
    if sum(map(len, files.values())) > MAX_TOTAL:
        raise ValueError('Combined reader output budget exceeded')
    return manifest, files
