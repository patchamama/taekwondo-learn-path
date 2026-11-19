#!/usr/bin/env python3
"""Offline, stdlib-only EPUB resource catalogue. No network or app mutations.

Output is restricted to the two private local roots and the exact external grant. Source book
text is inspected in memory; selected original images and complete sanitized
static readers remain private local outputs. Run from any cwd with no arguments.
"""
import sys
sys.dont_write_bytecode = True
import argparse
import ast
import hashlib
import html
import io
import json
import math
import posixpath
import re
import shutil
import struct
import urllib.parse
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter
from pathlib import Path, PurePosixPath

try:
    from scripts import epub_html_reader as reader
except ModuleNotFoundError:
    import epub_html_reader as reader

from external_resource_backup import EXTERNAL_BASE, EXTERNAL_OUTPUT, EXTERNAL_ARCHIVE, guard_external

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'resources/epub'
LEGACY_OUT = ROOT / '.atl/epub-resources'
ARCHIVE = ROOT / 'video/epub-backup'
BROWSER_PREFIX = '../../video/epub-backup/'
MAX_BYTES = 280 * 1024 * 1024
RESERVE = 2 * 1024**3
CATEGORIES = ['Patadas', 'Bloqueos', 'Posiciones', 'Manos y brazos', 'Formas', 'Principios', 'Meditación', 'Calentamiento y estiramientos', 'Acondicionamiento', 'Práctica y combate', 'Historia', 'Otros recursos útiles', 'Contexto avanzado — no practicar sin supervisión', 'Curso actual — separado de EPUB']
BOOKS = {
 'gold': ('Adam Gold', 'ITF / Chang-Hon', 'Teoría ITF', 'Teoría, terminología y requisitos propios de Iondo; no son el programa de exámenes de esta aplicación.'),
 'hillson': ('Ted Hillson', 'Hyung clásico / Chung Do Kwan', '21 Hyung clásicos', 'Secuencias clásicas con variantes y aplicaciones interpretativas; no equivalen automáticamente a Taegeuk o tul ITF.'),
 'mcmillan': ('Scott McMillan', 'ITF / TAGB — enfoque del autor', 'Sparring Our Way', 'Progresión de fundamentos, combinaciones y cuatro fases del combate; reglas y puntuaciones dependen de asociación y época.'),
 'woo': ('Sung Woo', 'Kukkiwon / WT', 'Taegeuk 1–8', 'Referencias técnicas, terminología y secuencias ilustradas Taegeuk; los colores de cinturón son específicos de esta fuente.'),
 'sharp': ('Clint Sharp', 'Mixto / no verificado', 'Guía completa', 'Panorama general que mezcla vocabulario ITF y Kukkiwon; las afirmaciones históricas y sanitarias requieren contraste.'),
 'pottle': ('Bill Pottle', 'Kukkiwon / WT + ITF explícito', 'Guía práctica 2025', 'Manual de Korean Academy of Taekwondo: técnicas, formas, competición y entrenamiento; incluye material avanzado fuera del curso.'),
 'mcwhorter': ('Bryan McWhorter', 'Específico del autor / no verificado', 'Ultimate Tae Kwon Do', 'Organiza la práctica mediante metas, velocidad, precisión, potencia, mecánica y estrategias de combate; no acredita una federación única.'),
}
# Source-specific paraphrases, not translated chapter text.
CHAPTER_SUMMARIES = {
 'sharp': {
  'c2A': ('Historia', 'Recorre antecedentes, ocupación japonesa, asociaciones y difusión; contrastar cronología y relatos de origen con fuentes académicas.'),
  'c3X': ('Historia', 'Presenta maestros de la expansión internacional del taekwondo; útil para ubicar linajes, no para inferir equivalencias técnicas.'),
  'c63': ('Otros recursos útiles', 'Describe gradación, terminología y trabajo por parejas; tiempos y cinturones corresponden a la fuente, no al curso.'),
  'c84': ('Posiciones', 'Relaciona bases de apoyo, equilibrio, bloqueos y ataques elementales; combina nombres de distintas tradiciones.'),
  'cDF': ('Meditación', 'Vincula atención, respiración y visualización con práctica consciente; beneficios clínicos citados no están verificados ni sustituyen atención sanitaria.'),
  'cFT': ('Formas', 'Introduce patrones Chang-Hon, nombres y contexto; conserva variantes de nomenclatura y la selección histórica del autor, sin imponerla al curso.'),
  'cJC': ('Principios', 'Explica cortesía, integridad, perseverancia, autocontrol y espíritu indomable como conducta cotidiana.'),
  'cMP': ('Manos y brazos', 'Distingue puños, superficies de mano y reglas de uso; potencia y legalidad deportiva no equivalen a seguridad.'),
  'cS9': ('Patadas', 'Compara familias de patadas, apoyo y preparación física; separa variantes saltadas y objetivos de entrenamiento.'),
  'cWB': ('Práctica y combate', 'Reúne defensa personal y escapes de agarres; se cataloga el contexto, no instrucciones para lesiones, estrangulaciones o confrontaciones.'),
  'cYG': ('Bloqueos', 'Clasifica defensas por altura, dirección, superficie y apoyo; la semejanza nominal no prueba que dos escuelas ejecuten igual.'),
  'c11H': ('Calentamiento y estiramientos', 'Diferencia movilidad y estiramientos y propone práctica individual y con blancos; evitar estirar con dolor o forzar rangos.'),
  'c148': ('Práctica y combate', 'Aborda continuidad, disciplina y organización de la práctica; la regularidad debe adaptarse a recuperación y capacidad individual.'),
 },
 'pottle': {
  'c4Z': ('Historia', 'Relaciona filosofía, asociaciones e historia institucional; los relatos históricos son atribuidos a la fuente, no certificados.'),
  'c9S': ('Otros recursos útiles', 'Expone etiqueta, grados, evaluación y uso del cinturón en el contexto de la escuela KAT.'),
  'cFM': ('Posiciones', 'Compara apoyos, distribución del peso y orientación en posiciones tradicionales y de combate.'),
  'cJG': ('Patadas', 'Organiza patadas principales, avanzadas y de exhibición por superficies y contexto; los enlaces no prueban correspondencia visual.'),
  'cMJ': ('Manos y brazos', 'Presenta superficies de golpeo con puño, canto, palma y dedos; no se reproducen instrucciones de ataque a zonas vulnerables.'),
  'cN5': ('Bloqueos', 'Lámina de bloqueos con preparación y posición final; nomenclatura exacta de cada imagen pendiente de revisión visual.'),
  'cNE_split_000': ('Bloqueos', 'Compara bloqueos básicos y avanzados y añade golpes y boxeo; revisar variantes de cámara y aplicación con instructor.'),
  'cNE_split_001': ('Formas', 'Distingue niveles de aprendizaje y formas WT e ITF; conserva tiempos originales de enlaces sin elegir finales de clip.'),
  'c19A': ('Formas', 'Aborda evaluación deportiva de poomsae y preparación; criterios sujetos a reglamentos vigentes.'),
  'c1E9': ('Práctica y combate', 'Analiza distancia, fintas, selección de técnicas y contraataques; tablas de competición no son instrucciones de defensa real.'),
  'c1SA': ('Contexto avanzado — no practicar sin supervisión', 'Panorama de armas tradicionales y de exhibición; referencia cultural, no guía operativa.'),
  'c1UN': ('Contexto avanzado — no practicar sin supervisión', 'Clasifica acrobacias por ejes de giro; excluido de la práctica autónoma y del programa de exámenes.'),
  'c1VN': ('Contexto avanzado — no practicar sin supervisión', 'Relaciona rompimientos y análisis físico; el catálogo no prescribe impactos ni pruebas de resistencia corporal.'),
  'c1Y3': ('Práctica y combate', 'Presenta combate preacordado de un paso propio de KAT como contexto de trabajo por parejas supervisado.'),
  'c22F': ('Otros recursos útiles', 'Agrupa lenguaje coreano por uso, grados, cuerpo y técnicas; las romanizaciones se conservan como variantes de fuente.'),
  'c2D4': ('Acondicionamiento', 'Trata límites, recuperación, lesiones y nutrición; se rechazan pautas de deshidratación o recorte de peso y no se ofrecen consejos médicos.'),
  'c2GV': ('Calentamiento y estiramientos', 'Reúne fuerza y movilidad; cargas, rangos y progresión necesitan supervisión, sin reproducir dosis de la fuente.'),
  'c2M9': ('Calentamiento y estiramientos', 'Propone ejercicios por parejas; no se recomienda presión externa para forzar estiramientos ni saltar sobre compañeros.'),
  'c2MW': ('Práctica y combate', 'Ubica competición como parte del aprendizaje y describe organización de torneos; comprobar normas actuales.'),
  'c2NU': ('Principios', 'Introduce magnitudes físicas y giro para analizar técnica; modelos y unidades de la fuente necesitan contraste.'),
  'c2S5': ('Práctica y combate', 'Propone registrar resultados para comparar métodos y observar progreso sin convertir marcas en obligaciones físicas.'),
  'c2SR': ('Otros recursos útiles', 'Sugiere usos de IA para estudiar; respuestas y análisis automáticos requieren contraste humano y no sustituyen entrenamiento presencial.'),
  'c2TC': ('Práctica y combate', 'Describe apoyo familiar, motivación y acompañamiento; sostener blancos y ayudar físicamente requiere formación.'),
  'c2W4': ('Contexto avanzado — no practicar sin supervisión', 'Incluye grappling y sumisiones ajenas al núcleo del curso; se omiten instrucciones de estrangulación, luxación y sometimiento.'),
  'c30Y': ('Historia', 'Compara artes marciales y apertura entre estilos como contexto cultural, sin afirmar equivalencia curricular.'),
  'c31N': ('Otros recursos útiles', 'Ofrece registro de progreso y competiciones; útil como idea de seguimiento personal, sin copiar plantillas del libro.'),
 },
 'mcwhorter': {
  'c2J': ('Práctica y combate', 'Plantea una práctica orientada a objetivos y disfrute; el vídeo introductorio no demuestra ninguna técnica concreta.'),
  'c3E': ('Historia', 'Relato autobiográfico de práctica y docencia; testimonio personal, no cronología general del taekwondo.'),
  'c4Y': ('Historia', 'Presenta distintas modalidades y beneficios atribuidos; la fecha de origen mencionada debe contrastarse.'),
  'c6Z': ('Práctica y combate', 'Divide objetivos grandes en avances pequeños y reconocibles; propone adaptar expectativas al nivel de aprendizaje.'),
  'c9Y': ('Práctica y combate', 'Relaciona repetición, blancos, ritmo y cinco componentes del golpeo; no certifica las comparaciones de impacto de la fuente.'),
  'cD5': ('Acondicionamiento', 'Distingue aceleración y tiempo de inicio a impacto; trabajo explosivo sólo con preparación y progresión supervisada.'),
  'cFM': ('Práctica y combate', 'Usa blancos para recibir retroalimentación de precisión; no se recomiendan fuego, vidrio, objetos cortantes ni rompimientos improvisados.'),
  'cHC': ('Principios', 'Relaciona velocidad, palancas y alineación con potencia; las explicaciones físicas se presentan como modelo del autor.'),
  'cJ8': ('Principios', 'Diferencia mecánica para velocidad y potencia mediante coordinación del cuerpo; aquí form significa ejecución, no una secuencia poomsae.'),
  'cM1': ('Formas', 'Distingue patrones tradicionales y libres y comenta sus beneficios; no afirma que memorizar formas garantice eficacia de combate.'),
  'cN1': ('Práctica y combate', 'Compara contacto nulo, ligero y pleno y puntuación por parada o continua; protección y reglas son imprescindibles.'),
  'cPB': ('Práctica y combate', 'Organiza estrategia mediante tiempo, distancia y ángulos y contrasta trayectorias rectas y curvas.'),
  'cT6': ('Práctica y combate', 'Compara atacante, contraatacante y dos formas de evasión; son perfiles de análisis, no identidades fijas.'),
  'cVR': ('Acondicionamiento', 'Reúne flexibilidad, fuerza, resistencia y atención como atributos de mejora; no se adoptan afirmaciones hormonales sin verificar.'),
  'cYR': ('Meditación', 'Aborda miedo y atención en competición; distinguir activación emocional de riesgos reales y no asumir riesgos innecesarios.'),
  'c10J': ('Principios', 'Relaciona liderazgo, cuidado de otros y madurez con los cinco principios; conserva el marco personal del autor.'),
 }
}
CATEGORY_SUMMARY = {
 'Patadas': 'Referencia a una familia de golpeo con el pie; revisar apoyo, trayectoria y variante de escuela con instructor, sin practicar impactos desde el catálogo.',
 'Bloqueos': 'Referencia defensiva según altura, dirección o superficie; nombre similar no confirma preparación ni aplicación equivalentes entre estilos.',
 'Posiciones': 'Referencia a una base de apoyo y orientación; distribución del peso y medidas dependen de la tradición, no se extrapolan al curso.',
 'Manos y brazos': 'Referencia a superficie o familia de golpeo de mano/brazo; no se enseñan ataques a zonas vulnerables ni uso lesivo.',
 'Formas': 'Referencia a una secuencia o a su interpretación dentro de esta tradición; no cambia el programa de exámenes ni acredita equivalencia entre formas.',
 'Principios': 'Concepto de conducta, atención o análisis del movimiento para contrastar con la enseñanza presencial.',
 'Meditación': 'Tema de atención, respiración o visualización; no representa evidencia clínica ni sustituye atención profesional.',
 'Calentamiento y estiramientos': 'Recurso de movilidad y preparación; evitar dolor, rebotes forzados y presión externa para aumentar el rango.',
 'Acondicionamiento': 'Tema de preparación física; ajustar progresión y recuperación y rechazar golpes para endurecer cabeza o cuerpo.',
 'Práctica y combate': 'Tema de práctica o análisis táctico; contacto y trabajo por parejas sólo con reglas, protección y supervisión.',
 'Historia': 'Referencia histórica o biográfica atribuida al libro; requiere contraste y no acredita una tradición técnica por sí sola.',
 'Otros recursos útiles': 'Referencia de estudio y organización propia de la fuente; no se traslada automáticamente al currículo actual.',
 'Contexto avanzado — no practicar sin supervisión': 'Sólo contexto avanzado para revisión: no es una recomendación de práctica ni incorporación al curso. Se omiten instrucciones peligrosas.',
}


def text(e):
    return ' '.join(''.join(e.itertext()).split())


def tag(e):
    return e.tag.rsplit('}', 1)[-1]


def stable_id(*parts):
    return hashlib.sha256('\0'.join(parts).encode()).hexdigest()[:20]


def safe_member(base, ref):
    ref = urllib.parse.unquote(ref)
    parsed = urllib.parse.urlsplit(ref)
    if parsed.scheme or parsed.netloc or '\\' in ref or '\x00' in ref or parsed.path.startswith('/'):
        raise ValueError('Unsafe EPUB member')
    name = posixpath.normpath(posixpath.join(posixpath.dirname(base), parsed.path))
    if name == '..' or name.startswith('../'):
        raise ValueError('EPUB member escapes root')
    return name


def youtube(url):
    p = urllib.parse.urlsplit(url)
    if p.scheme not in ('https', 'http') or (p.hostname or '').lower() not in ('youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'):
        return None
    q = urllib.parse.parse_qs(p.query)
    vid = p.path.strip('/') if p.hostname == 'youtu.be' else q.get('v', [''])[0]
    if not re.fullmatch(r'[A-Za-z0-9_-]{11}', vid):
        return None
    stamp = q.get('t', q.get('start', ['0']))[0]
    if re.fullmatch(r'\d+s?', stamp):
        start = int(stamp.rstrip('s'))
    else:
        m = re.fullmatch(r'(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?', stamp)
        start = sum(int(x or 0)*mult for x, mult in zip(m.groups(), (3600, 60, 1))) if m else 0
    return {'videoId': vid, 'start': start, 'url': f'https://www.youtube.com/watch?v={vid}' + (f'&t={start}s' if start else '')}


def read_book(source):
    """Read package spine (not lexicographic filenames), TOC and actual XML blocks."""
    with reader.safe_archive(source) as z:
        container = z.xml('META-INF/container.xml')
        opf = next(e.get('full-path') for e in container.iter() if tag(e) == 'rootfile')
        safe_member('', opf)
        root = z.xml(opf)
        items = {e.get('id'): safe_member(opf, e.get('href')) for e in root.iter() if tag(e) == 'item'}
        spine = [items[e.get('idref')] for e in root.iter() if tag(e) == 'itemref']
        toc = []
        for member in items.values():
            if member.endswith('.ncx'):
                for node in z.xml(member).iter():
                    if tag(node) == 'navPoint':
                        label = next((x for x in node if tag(x) == 'navLabel'), None)
                        content = next((x for x in node if tag(x) == 'content'), None)
                        if label is not None and content is not None:
                            toc.append({'title': text(label), 'member': safe_member(member, content.get('src')), 'reference': content.get('src')})
        toc_map = {}
        for item in toc:
            toc_map.setdefault(item['member'], item['title'])
        docs, current = [], 'Sin capítulo identificado'
        for member in spine:
            if not member.lower().endswith(('.html', '.xhtml', '.htm')):
                continue
            info = z.getinfo(member)
            if info.file_size > 12*1024**2:
                raise ValueError('Oversized chapter: ' + member)
            tree = z.xml(member)
            current = toc_map.get(member, current)
            blocks, images, videos = [], [], []
            chapter_at_start = current
            heading = current
            anchor = ''
            for node in tree.iter():
                kind, value = tag(node), text(node)
                anchor = node.get('id') or node.get('name') or anchor
                if kind == 'p' and value.upper().rstrip('.') in ('WORKING THE FUNDAMENTALS', 'THE BASIC PRINCIPLES OF SPARRING', 'COMPETITION SPARRING SYSTEMS AND STRATEGIES', 'INFORMATION FOR THE COMPETITOR', 'THE TENETS OF TAEKWON-DO', 'TAEKWON-DO OATH AND DOJANG RULES', 'GRADING SYSTEM AND BELT COLOURS', 'PATTERNS', 'ATTACKING AND BLOCKING TOOLS', 'HAND TECHNIQUES', 'FOOT TECHNIQUES', 'STANCES', 'SPARRING (MATSOGI)', 'GRADING REQUIREMENTS'):
                    current = value
                    if not blocks or chapter_at_start == 'Sin capítulo identificado': chapter_at_start = value
                if kind in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6') and value:
                    heading = value
                # Several converted EPUBs use paragraphs instead of semantic headings.
                if kind == 'p' and 6 < len(value) < 200 and (re.match(r'(?i)(TECHNIQUE|COMBINATION)\s*[-–]', value) or (value.isupper() and len(value) < 110)):
                    heading = value
                if kind in ('p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'li') and value:
                    blocks.append({'text': value, 'tag': kind, 'heading': heading, 'chapter': current, 'lead': text(node[0]) if len(node) else '', 'anchor': anchor})
                if kind in ('img', 'image'):
                    ref = node.get('src') or node.get('{http://www.w3.org/1999/xlink}href') or node.get('href')
                    if ref:
                        try:
                            images.append({'member': safe_member(member, ref), 'heading': heading, 'chapter': current, 'alt': node.get('alt', '')})
                        except ValueError:
                            images.append({'member': '', 'heading': heading, 'rejected': 'unsafe-member'})
                if kind == 'a':
                    video = youtube(node.get('href', ''))
                    if video:
                        videos.append({**video, 'name': value or heading, 'heading': heading, 'sourceAnchor':anchor or None})
            docs.append({'member': member, 'chapter': chapter_at_start, 'blocks': blocks, 'images': images, 'videos': videos})
        return {'toc': toc, 'documents': docs, 'title': next((text(e) for e in root.iter() if tag(e) == 'title'), '')}


def image_dimensions(data):
    """Header validation only: not a promise of pixel-level visual identification."""
    try:
        if data.startswith(b'\x89PNG\r\n\x1a\n') and data[12:16] == b'IHDR':
            return struct.unpack('>II', data[16:24])
        if data.startswith((b'GIF87a', b'GIF89a')):
            return struct.unpack('<HH', data[6:10])
        if data[:2] == b'\xff\xd8' and data[-2:] == b'\xff\xd9':
            stream = io.BytesIO(data[2:])
            while True:
                marker = stream.read(1)
                if not marker:
                    break
                if marker != b'\xff':
                    continue
                code = stream.read(1)
                while code == b'\xff':
                    code = stream.read(1)
                if code in (b'\xd8', b'\xd9'):
                    continue
                length = struct.unpack('>H', stream.read(2))[0]
                if length < 2:
                    return None
                if code and code[0] in (0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf):
                    segment = stream.read(5)
                    height, width = struct.unpack('>HH', segment[1:5])
                    return width, height
                stream.seek(length-2, 1)
    except (struct.error, ValueError, OverflowError):
        return None
    return None


def image_reason(member, dimensions, relevant):
    if re.search(r'(?i)(cover|logo|advert|banner|titlepage|copyright)', posixpath.basename(member)):
        return 'decorative-name'
    if not dimensions or min(dimensions) <= 0 or max(dimensions) > 30000:
        return 'unsupported-or-corrupt-header'
    w, h = dimensions
    if min(w, h) < 96 or w*h < 20000 or max(w/h, h/w) > 8:
        return 'tiny-or-strip'
    if not relevant:
        return 'outside-relevant-section'
    return None


def category(name, fallback='Otros recursos útiles'):
    n = name.casefold()
    if re.search(r'grappl|chok|submission|arm bar|wrist lock|weapon|sword|nunch|bo staff|tumbling|trick|flash kick|corkscrew|butterfly twist|\b540\b|\b720\b|\b900\b|\b1080\b|swipe|l kick|pancake|360 degree', n):
        return CATEGORIES[12]
    if re.search(r'stretch|warm.?up|flexibility|hamstring', n): return CATEGORIES[7]
    if re.search(r'conditioning|strength|weight train|nutrition|hydration|stamina|agility|squat|bungee|leg raise|hurdle|hoop ladder', n): return CATEGORIES[8]
    if re.search(r'meditat|mindful|breath|fear', n): return CATEGORIES[6]
    if re.search(r'block|makki|makgi|markki', n): return CATEGORIES[1]
    if re.search(r'stance|sogi|seogi|serki|sugi', n): return CATEGORIES[2]
    if re.search(r'kick|chagi|chargi|charki|chigi.*knee|knee strike|foot techniques', n): return CATEGORIES[0]
    if re.search(r'punch|fist|strike|thrust|jirugi|jireuki|taerigi|palm|knife.hand|ridge.hand|hand techniques|sang bansin', n): return CATEGORIES[3]
    if re.search(r'tae.?\s*ge?uk|poomsae|\bform|\bhyung|\btul\b|pattern|chun ji|choong.moo', n): return CATEGORIES[4]
    if re.search(r'histor|ancient|modern history|journey|masters', n): return CATEGORIES[10]
    if re.search(r'tenet|courtesy|integrity|persever|self.control|indomitable|balance|torque|biophys|philosophy|mind\b', n): return CATEGORIES[5]
    if re.search(r'sparr|drill|timing|distance|angles|strategy|strategies|faking|feign|pressuri|movement|practice|training|competition|goal|osper', n): return CATEGORIES[9]
    return fallback


ALIASES = {
 'front kick': 'ap-chagi', 'roundhouse kick': 'dollyo-chagi', 'side kick': 'yop-chagi',
 'ax kick': 'naeryo-chagi', 'back kick': 'düt-chagi',
}
PRIORITY = {'aKA3TgYmShY','bb7UIJJGcrw','pFWrNhumO5k','ZwAs2lOPlSE','kjyvvqcTHh0','MDrNXuqTeE0','TkMQSBanLUk','CxKala6GhsA','m5VPW-gRvAI','qNpQpJLHyUg','gzae5gZEgcU','F-kDzz1_oqQ','pxZQUm5SYjQ'}
FORM_IDS = dict(zip(['MDrNXuqTeE0','TkMQSBanLUk','CxKala6GhsA','m5VPW-gRvAI','qNpQpJLHyUg','gzae5gZEgcU','F-kDzz1_oqQ','pxZQUm5SYjQ'], ['taeguk-'+str(i) for i in range(1,9)]))


def canonical(name, style):
    # Deliberately exact, context-gated aliases: no fuzzy cross-tradition matching.
    if 'Kukkiwon' not in style:
        return None
    return ALIASES.get(name.strip().casefold())


def row_state(row):
    if not row.get('videos'):
        return 'Sin vídeo vinculado'
    if all(v.get('archiveAvailability') == 'unavailable' for v in row['videos']):
        return 'No disponible según plan de archivo; consultar motivo/auditoría'
    if all(v.get('availability') == 'unknown' for v in row['videos']):
        return 'Disponibilidad desconocida · revisión visual pendiente'
    return 'Metadatos públicos/embed (auditoría previa) · '+('muestreo visual T1 documentado; no visionado completo' if any(v.get('visualReview')=='sampled-by-T1' for v in row['videos']) else 'revisión visual pendiente')


def sample_state(sample):
    if sample.get('status') == 'ready':
        return 'Muestra de revisión preparada; vídeo de baja resolución sin audio, no respaldo completo'
    if sample.get('status') == 'download-failed-or-no-media':
        return 'La descarga de muestra falló; revisión visual pendiente (no implica vídeo remoto no disponible)'
    return 'Sin muestra de revisión acreditada; no respaldo completo'


def review_samples():
    path = ROOT / '.atl/epub-video-review/review-manifest.json'
    if not path.is_file() or path.is_symlink() or path.stat().st_size > 2*1024**2:
        return {}
    try:
        data = json.loads(path.read_text())
        result = {v['videoId']: sample_state(v) for v in data if isinstance(v, dict) and re.fullmatch(r'[A-Za-z0-9_-]{11}', v.get('videoId', ''))}
        if authorized_review_sample('qNpQpJLHyUg'):
            result['qNpQpJLHyUg'] = sample_state({'status':'ready'}) + '; reintento específico autorizado S8/L25, historial anterior conservado'
        return result
    except (ValueError, OSError, TypeError):
        return {}


def documented_sample_reviews(samples):
    evidence = ROOT/'docs/video/epub-supplements.md'
    if not evidence.is_file(): return {}
    report = evidence.read_text()
    clips = json.loads((ROOT/'src/data/clips-external.json').read_text())
    return {clip['videoId']:clip for clip in clips
            if clip.get('videoId') in PRIORITY
            and f"https://www.youtube.com/watch?v={clip['videoId']}" in report
            and ('preparada' in samples.get(clip['videoId'], '') or authorized_review_sample(clip['videoId']))
            and clip.get('similarity')=='similar' and clip.get('silentSafe') is False}


def authorized_review_sample(video_id):
    if video_id != 'qNpQpJLHyUg': return False
    path = ROOT/'.atl/epub-video-review/qNpQpJLHyUg/retry-authorized/attempt.json'
    if any(p.is_symlink() for p in (path, *path.parents)) or not path.is_file() or path.stat().st_size > 65536: return False
    try:
        attempt = json.loads(path.read_text())
        return (attempt.get('videoId') == video_id and attempt.get('status') == 'ready'
                and attempt.get('downloadExit') == 0 and attempt.get('authorization') == 'S8: retoma lo de taegeuk 5')
    except (OSError, ValueError): return False


def valid_record_path(value):
    return isinstance(value, str) and re.fullmatch(r'(?!.*\.\.)[A-Za-z0-9_./ -]+\.(mp4|webm|m4v|ogv|mkv)', value, re.I) is not None and not value.startswith('/')


def valid_local_video_path(value):
    # Strip one exact trusted prefix, then apply the strict record-path gate.
    return isinstance(value, str) and any(value.startswith(prefix) and valid_record_path(value[len(prefix):]) for prefix in (BROWSER_PREFIX, 'archive/'))


def archive_record_eligible(record):
    if not isinstance(record, dict) or record.get('status') != 'complete': return False
    name = record.get('path', '')
    return (isinstance(name, str) and valid_record_path(name)
            and re.fullmatch(r'[0-9a-f]{64}', record.get('sha256', '')) is not None
            and type(record.get('bytes')) is int and record['bytes'] > 0
            and type(record.get('duration')) in (int, float) and math.isfinite(record['duration']) and record['duration'] > 0
            and bool(record.get('verified_at')))


def local_media_for(video, sources):
    source = sources.get(video['videoId'], {})
    for media in source.get('media', []):
        start = video.get('start', 0)
        end = video.get('end')
        if media['sourceStart'] <= start < media['sourceEnd'] and (end is None or end <= media['sourceEnd'] + .25):
            return {**media, 'playStart': max(0, start-media['sourceStart']),
                    'playEnd': end-media['sourceStart'] if end is not None else media['duration']}
    return None


def validated_archive(out):
    """Consume one latest immutable archiver snapshot; never poll active jobs.

    Only complete backup/export records become candidates; regular file size and
    SHA-256 are rechecked. A preview is not a full source, and clip timeline zero
    is not source timeline zero. No review-sample directory is a backup source.
    """
    result, notes = {}, []
    archive, prefix = archive_pair(out)
    destination_label = str(archive) if out == EXTERNAL_OUTPUT else 'video/epub-backup'
    def recheck():
        if out == EXTERNAL_OUTPUT: guard_external(EXTERNAL_ARCHIVE, kind='archive')
    recheck()  # Mount errors are fatal, outside the pending-manifest handler.
    directory = archive/'manifests'
    if any(p.is_symlink() for p in (directory, archive, *archive.parents)):
        return result, ['Respaldo pendiente: directorio de archivo no admitido.']
    recheck()
    manifests = sorted(directory.glob('*.json'))
    recheck()
    if not manifests:
        return result, ['Respaldo pendiente: no hay manifiestos en el destino autorizado.']
    manifest = manifests[-1]
    if manifest.is_symlink() or manifest.stat().st_size > 12*1024**2:
        return result, ['Manifiesto no admitido: enlace simbólico o tamaño excesivo.']
    try:
        recheck()
        data = json.loads(manifest.read_text())
        if data.get('schema_version') != 1 or not isinstance(data.get('sources'), list):
            return result, ['Manifiesto presente con esquema no compatible; respaldo pendiente de validación.']
        verified_count = 0
        for source in data['sources']:
            vid = source.get('id', '')
            if not re.fullmatch(r'[A-Za-z0-9_-]{11}', vid): continue
            result[vid] = {'availability':source.get('availability','not-planned'), 'reason':source.get('reason'), 'media':[], 'associations':source.get('associations',[])}
            candidates = [(clip.get('export'), 'clip', clip.get('start', 0), clip.get('end', 0)) for clip in source.get('clips', [])]
            backup = source.get('backup')
            candidates.append((backup, 'source', 0, backup.get('duration', 0) if isinstance(backup, dict) else 0))
            for record, kind, start, end in candidates:
                if not archive_record_eligible(record): continue
                name = prefix+record['path']
                path = archive/record['path']
                recheck()
                if any(p.is_symlink() for p in [path,*path.parents]) or not path.is_file(): continue
                if archive.resolve() not in path.resolve().parents or path.stat().st_size != record['bytes']: continue
                digest = hashlib.sha256()
                recheck()
                with path.open('rb') as f:
                    for chunk in iter(lambda: f.read(1024**2), b''): digest.update(chunk)
                if digest.hexdigest() != record['sha256']: continue
                result[vid]['media'].append({'path':name,'kind':kind,'sourceStart':start,'sourceEnd':end,'duration':record['duration'],'sha256':record['sha256'],'bytes':record['bytes']})
                verified_count += 1
        accessible = sum(s.get('availability')=='accessible' for s in data['sources'])
        capacity = data.get('capacity', {})
        result['_snapshot'] = {'filename':manifest.name,'sourceCount':len(data['sources']),'metadataAccessibleCount':accessible,'completeMediaValidated':verified_count,'capacity':capacity}
        notes.append(f'Instantánea {manifest.name}: {accessible}/{len(data["sources"])} fuentes con metadatos accesibles; {verified_count} archivos completos validados por ruta, bytes y SHA-256. Metadatos accesibles no equivalen a respaldo; previews no equivalen a fuente completa.')
        if capacity.get('allowed') is False:
            notes.append(f'Archivo de vídeo bloqueado por capacidad: requiere {capacity.get("required_bytes",0)/1e9:.2f} GB; libres en la medición de esta instantánea {capacity.get("free_bytes",0)/1e9:.2f} GB; reserva {capacity.get("reserve_bytes",0)/1024**3:.2f} GiB. El plan no constituye un respaldo completo. Destino elegido: {destination_label}/; bloqueado por capacidad, no por falta de decisión de destino. Las mediciones anteriores son históricas; este generador no refresca capacidad ni descarga medios.')
    except (OSError, ValueError, TypeError, KeyError, AttributeError) as exc:
        recheck()
        if out == EXTERNAL_OUTPUT and isinstance(exc, OSError): raise
        result = {}
        notes.append('Respaldo pendiente: manifiesto ilegible (' + type(exc).__name__ + ').')
    recheck()
    return result, notes


# Named source terminology retained without copying instructional passages.
SHARP_NAMES = {
 'c84': 'The Walking Stance|The Horse-Riding Stance|Back Stance|Tiger Stance|Front Stance|Low Block|Inside Block|Face Block|Straight Punch|Front Kick|Knife Hand Strike|Side Kick|Round Kick',
 'cDF': 'Breath and Focus|Mindfulness and Taekwondo|Breath and Body Control',
 'cFT': 'Chon Ji|Dan Gun|Do San|Won Hyo|Yul Gok|Joong Gun|Toi Gye|Hwa Rang|Choong Moo|Kwang Gae|Po Eun|Ge Baek|Eui Am|Choong Jang|Ko Dang|Sam-IL|Yoo-Sin|Choi Yong|Yon Gae|Ul-Ji|Moon-Moo|So-San|Se Jong|Tong-IL',
 'cMP': 'The Jab|Straight or Cross Punch|Uppercut|Hook Punch|Back Fist|Hammer Fist|Extended Knuckle Punch|Spear Hand Strike|Ridge Hand Strike',
 'cS9': 'The Front Kick|The Side Kick|The Roundhouse Kick|The Back Kick|The Outer/Inner Crescent Kick|The Hook Kick|The Ax Kick|The Knee Strike|The Scissor Kick|Flying Side and Back Kicks|Pull Down Stretch|Box Jumps',
 'cWB': 'Footwork|Frontal Choke|Collar Grab|Shoulder Grab|Rear Shoulder Grab|Hair Grab|Linear Techniques|Circular Techniques',
 'cYG': 'High Block|Middle Block|Low Block|Inward Block|Outward Block|Front Block|Side Block|The Outer Forearm Block|Inner Forearm Block|Rising Block|Guarding Block|Twisting Block|Scissors Block|Cross Block or X Block|Palm Block|Single Forearm Block|Twin Forearm Block|Double Knife Hand Block|Double Forearm Block|Nine Block|Push Kick|Cut Kick|Mountain Block',
 'c11H': 'Back Stretches|Waist Rotations|Leg Stretches|Shadow Sparring|Heavy Bag Sparring|Dummy Sparring|Circle Sparring',
 'cJC': 'Courtesy|Integrity|Perseverance|Self-Control|Indomitable Spirit',
}


def relevant_document(key, doc):
    member_key = Path(doc['member']).stem
    if key in CHAPTER_SUMMARIES:
        return member_key in CHAPTER_SUMMARIES[key]
    if key == 'gold': return member_key == 'c9'
    if key == 'mcmillan':
        return member_key not in ('c0', 'c9', 'cJ') and any(re.search(r'(?i)fundamentals|principles of sparring|information for the competitor|competition sparring', b['text']) for b in doc['blocks'])
    if key == 'hillson':
        return not re.search(r'(?i)dedication|acknowledg|bibliography|about the|introduction|contents|sin capítulo', doc['chapter'])
    if key == 'woo':
        return not re.search(r'(?i)author|preface|free gift|contents|sin capítulo', doc['chapter'])
    return False


def named_entries(key, doc, fallback):
    """Conservative source-specific rules, explicit uncertainty for image-only text."""
    stem = Path(doc['member']).stem
    blocks = doc['blocks']
    names = []
    for b in blocks:
        value = b['text']
        if b['tag'].startswith('h') and 4 < len(value) < 180:
            names.append(value)
        if key == 'woo' and ((stem in ('cMS','cNH','cPJ','cR0','cRT')) or 'Study Guide' in doc['chapter']):
            if '(' in value and 8 < len(value) < 180 and not re.match(r'^\d', value): names.append(value)
        if key == 'gold' and value.isupper() and 5 < len(value) < 95:
            if re.search(r'STANCE|SPARRING|TENETS|COURTESY|INTEGRITY|PERSEVERANCE|SELF CONTROL|INDOMITABLE|HAND TECHNIQUES|FOOT TECHNIQUES|PATTERNS|OATH|BELT COLOURS|BODY|TOOLS|SANG BANSIN|HABANSIN|KUP|BASIC MOVEMENTS|DIRECTIONAL EXERCISES|TERMINOLOGY', value): names.append(value)
        if key == 'hillson' and doc['chapter'] == 'Glossary' and b.get('lead') and len(b['lead']) < 65:
            names.append(b['lead'])
        if key == 'mcmillan':
            if re.match(r'(?i)(TECHNIQUE\s*[-–]|COMBINATION\s*[-–]|(?:INITIATE ATTACK|EVADE AND|PRESSURISING|MOVEMENT|STRENGTH and CONDITIONING|AGILITY EXERCISE|FLEXIBILITY EXERCISE).{0,65}(?:DRILL|EXAMPLE)|PHASE [1-4]|.*OSPER|.*BICYCLE WHEEL|.*ICEBERG PRINCIPLE)', value) and len(value) < 210:
                value = re.sub(r'(?i),?\s*continue(?:d)?\.?\s*$', '', value).rstrip('.')
                names.append(value)
        if key == 'pottle' and stem == 'cFM' and re.search(r'(?i)stance', value) and len(value) < 75:
            names.append(value)
    fulltext = ' '.join(b['text'] for b in blocks)
    for name in SHARP_NAMES.get(stem, '').split('|') if key == 'sharp' else []:
        if name and name.casefold() in fulltext.casefold(): names.append(name)
    if key == 'hillson':
        for name in ['front stance','back stance','horse stance','crane stance','elongated front stance','low block','high block','double knife-hand block','double-arm block','double-fist block','half mountain block','fist X-block','knife-hand strike','middle-target punch','reverse middle-target punch','U-punch','uppercut','spear hand','palm-heel strike','ridge-hand strike','back-fist strike','hammer-fist strike','front kick','side kick','roundhouse kick','spinning side kick','returning wave kick','crescent kick','jumping front kick','cross step','torque','reciprocating motion']:
            if name.casefold() in fulltext.casefold(): names.append(name)
    if key == 'gold':
        for name in ['Chon-Ji','Dan-Gun','Do-San','Won-Hyo','Yul-Gok','Joong-Gun','Toi-Gye','Hwa-Rang','Choong-Moo']:
            if name.replace('-',' ').casefold() in fulltext.casefold() or name.casefold() in fulltext.casefold(): names.append(name)
    return list(dict.fromkeys(names))


def load_app_labels():
    labels = {}
    source = (ROOT/'src/data/techniques.ts').read_text()
    pattern = r"t\(\s*'([^']+)'\s*,\s*\[[^]]*\]\s*,\s*\d+\s*,\s*'[^']+'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'"
    for match in re.finditer(pattern, source):
        ident, en, de, es = match.groups()
        labels[ident] = {'en': en, 'de': de, 'es': es}
    for file in sorted((ROOT/'src/data/curriculum').glob('*.json')):
        data = json.loads(file.read_text())
        for item in data.get('techniques', []):
            if item.get('names'): labels[item['id']] = item['names']
    forms = (ROOT/'src/data/forms.ts').read_text()
    # Forms are source-confirmed by the eight video IDs, not parsed from free names.
    for ident, ko in re.findall(r"id: '([^']+)',\s*ko: '([^']+)'", forms):
        labels.setdefault(ident, {'es': ko, 'en': ko, 'de': ko})
    return labels


def load_app_info():
    result = {}
    quoted = r"'(?:[^'\\\\]|\\\\.)*'"
    pattern = r"'([^']+)': L\(\s*("+quoted+r"),\s*("+quoted+r"),\s*("+quoted+r"),?\s*\)"
    for match in re.finditer(pattern, (ROOT/'src/data/techniqueInfo.ts').read_text()):
        ident, *values = match.groups()
        result[ident] = dict(zip(('en','de','es'), (ast.literal_eval(v) for v in values)))
    for path in sorted((ROOT/'src/data/curriculum').glob('*.json')):
        for item in json.loads(path.read_text()).get('techniques', []):
            if isinstance(item.get('info'),dict): result[item['id']] = item['info']
    return result


def archive_pair(output):
    if output == EXTERNAL_OUTPUT:
        validate_output(output)
        guard_external(EXTERNAL_ARCHIVE, kind='archive')
        return EXTERNAL_ARCHIVE, BROWSER_PREFIX
    if output == ROOT/'resources/epub': return ARCHIVE, BROWSER_PREFIX
    if output == LEGACY_OUT: return LEGACY_OUT/'archive', 'archive/'
    raise ValueError('Unknown output/archive pair')


def capacity_root(output):
    if output == EXTERNAL_OUTPUT:
        guard_external(EXTERNAL_OUTPUT, kind='catalogue')
        return EXTERNAL_BASE
    return ROOT


def validate_output(output):
    if Path(output) == EXTERNAL_OUTPUT:
        return guard_external(output, kind='catalogue')
    output = Path(output).absolute()
    if '..' in output.parts or output not in (ROOT/'resources/epub', LEGACY_OUT):
        raise ValueError('Output must be resources/epub or .atl/epub-resources')
    if any(p.is_symlink() for p in (output, *output.parents)):
        raise ValueError('Output symlinks are forbidden')
    return output


def planned_path(name):
    """Exact resource-root output families; reject aliases before any writes."""
    if (not isinstance(name, str) or not name or re.search(r'[\x00-\x20\x7f\\\\:%?#]', name)
            or any(p in ('', '.', '..') for p in name.split('/'))):
        raise ValueError('Unsafe planned path: '+repr(name))
    parts = name.split('/')
    if name in ('index.html', 'resources.md', 'catalogue.json', 'catalogue-audit.json'):
        return name
    if len(parts) == 3 and parts[:2] == ['media', 'images'] and re.fullmatch(r'[A-Za-z0-9_.-]+', parts[2]):
        return name
    if len(parts) >= 3 and parts[0] == 'books' and parts[1] in BOOKS:
        return name
    raise ValueError('Unmanaged planned path: '+name)


def validated_appledouble(output, path):
    """Conservative macOS v2 ATTR + empty-resource-fork profile, <=8 KiB.

    Unknown forms are content, not exemptions. No xattr values are logged.
    Reserved resource-header bytes are system/application-use bytes per format;
    the resource data is empty and its complete map must match the empty map.
    """
    if output != EXTERNAL_OUTPUT or not path.name.startswith('._') or len(path.name) <= 2:
        return False
    validate_output(output)
    companion = path.with_name(path.name[2:])
    if any(p.is_symlink() for p in (path, companion, *path.parents)):
        return False
    if not path.is_file() or not (companion.is_file() or companion.is_dir()):
        return False
    size = path.stat().st_size
    if not 134 <= size <= 8192: return False
    validate_output(output)
    with path.open('rb') as stream: raw = stream.read(8192)
    validate_output(output)
    if len(raw) != size: return False
    try:
        if struct.unpack_from('>II16sH', raw) != (0x51607, 0x20000, b'Mac OS X        ', 2):
            return False
        ident, start, length, fork_id, fork_start, fork_length = struct.unpack_from('>6I', raw, 26)
        if (ident, start, fork_id) != (9, 50, 2): return False
        end = start + length
        if length < 84 or fork_start != end or fork_length != 286 or end + fork_length != size:
            return False
        # FinderInfo's reserved words and the two-byte alignment padding.
        if any(raw[start+14:start+16] + raw[start+20:start+24] + raw[start+26:start+28] + raw[start+32:start+34]):
            return False
        attr = start + 34
        magic, debug, total, data_start, data_length, r1, r2, r3, flags, count = struct.unpack_from('>8I2H', raw, attr)
        if (magic, debug, total, r1, r2, r3, flags) != (0x41545452, 0, end, 0, 0, 0, 0):
            return False
        if not 1 <= count <= 16 or not attr+36 <= data_start <= data_start+data_length <= end:
            return False
        pos, ranges, names = attr+36, [], set()
        recognized = {b'com.apple.provenance', b'com.apple.quarantine', b'com.apple.lastuseddate#PS'}
        for _ in range(count):
            if pos+11 > data_start: return False
            off, size, entry_flags, namelen = struct.unpack_from('>IIHB', raw, pos)
            name_end = pos+11+namelen
            aligned = (name_end+3) & ~3
            if not 2 <= namelen <= 128 or aligned > data_start: return False
            name = raw[pos+11:name_end]
            if name[-1:] != b'\0' or name[:-1] not in recognized or name in names or entry_flags:
                return False
            if any(raw[name_end:aligned]) or not data_start <= off < off+size <= data_start+data_length:
                return False
            names.add(name); ranges.append((off, off+size)); pos = aligned
        if any(raw[pos:data_start]) or any(raw[data_start+data_length:end]): return False
        cursor = data_start
        for lo, hi in sorted(ranges):
            if lo != cursor: return False  # No overlaps, aliases, gaps or unaccounted payload.
            cursor = hi
        if cursor != data_start+data_length: return False
        fork = raw[fork_start:]
        if struct.unpack_from('>4I', fork) != (256, 256, 0, 30): return False
        if fork[256:272] != fork[:16]: return False
        return struct.unpack_from('>IHHHHH', fork, 272) == (0, 0, 0, 28, 30, 0xffff)
    except (ValueError, struct.error):
        return False


def validate_plan(output, files, free=None):
    """Whole-output footprint and exact additional writes, including retained files."""
    output = validate_output(output)
    for name, raw in files.items():
        validate_output(output)
        planned_path(name)
        if not isinstance(raw, bytes): raise ValueError('Planned content must be bytes')
        target = output/name
        if any(p.is_symlink() for p in (target, *target.parents)):
            raise ValueError('Planned output symlink: '+name)
        if target.exists() and not target.is_file(): raise ValueError('Not a regular output file: '+name)
        for parent in target.parents:
            if parent == output: break
            if parent.exists() and not parent.is_dir(): raise ValueError('Output parent is not a directory: '+name)
            if parent.relative_to(output).as_posix() in files: raise ValueError('Planned file/directory collision: '+name)
    existing, metadata = {}, {}
    if output.exists():
        for path in output.rglob('*'):
            validate_output(output)
            if path.is_symlink(): raise ValueError('Existing output symlink: '+str(path))
            if path.is_file():
                name = path.relative_to(output).as_posix()
                existing[name] = path.stat().st_size
                if name not in files and validated_appledouble(output, path):
                    metadata[name] = existing[name]
    write_bytes, write_count = 0, 0
    for name, raw in files.items():
        target = output/name
        validate_output(output)
        identical = name in existing and target.read_bytes() == raw
        # Existing selected copies and original reader assets are immutable.
        immutable = name.startswith('media/images/') or (name.startswith('books/') and not name.endswith('/index.html'))
        if name in existing and immutable and not identical:
            raise ValueError('Existing asset hash mismatch: '+name)
        if not identical:
            write_bytes += len(raw)
            write_count += 1
    retained = sum(size for name,size in existing.items() if name not in files)
    physical = retained + sum(map(len, files.values()))
    metadata_bytes = sum(metadata.values())
    total = physical - metadata_bytes
    free = shutil.disk_usage(capacity_root(output)).free if free is None else free
    if total > MAX_BYTES: raise OSError('Whole catalogue output exceeds 280 MiB budget')
    # Free space already charges retained physical bytes, including metadata.
    # Conservatively reserve another bounded sidecar for every changed file.
    headroom = write_count * 8192 if output == EXTERNAL_OUTPUT else 0
    if free - write_bytes - headroom < RESERVE: raise OSError('Need 2 GiB reserve after exact planned writes')
    estimate = {'totalBytes':total, 'writeBytes':write_bytes}
    if output == EXTERNAL_OUTPUT:
        estimate.update(metadataBytes=metadata_bytes, metadataFiles=len(metadata),
                        physicalBytes=physical, retainedPhysicalBytes=retained,
                        metadataHeadroomBytes=headroom)
    return estimate


def write_plan(output, files):
    estimate = validate_plan(output, files)
    for name, raw in files.items():
        validate_output(output)
        target = output/name
        if any(p.is_symlink() for p in (target, *target.parents)):
            raise ValueError('Output symlink appeared: '+name)
        if target.exists() and target.read_bytes() == raw: continue
        headroom = 8192 if output == EXTERNAL_OUTPUT else 0
        if shutil.disk_usage(capacity_root(output)).free - len(raw) - headroom < RESERVE: raise OSError('Disk reserve reached')
        validate_output(output)
        target.parent.mkdir(parents=True, exist_ok=True)
        validate_output(output)
        target.write_bytes(raw)
    return estimate


def attach_readers(data, book_sources, planner=None):
    if planner is None:
        planner = reader.plan_readers
    manifest, files = planner(book_sources)
    for name in files:
        planned_path(name)
        if not name.startswith('books/'): raise ValueError('Reader may only plan books/ files')
    def check_url(url, book_id):
        parsed = urllib.parse.urlsplit(url)
        if parsed.scheme or parsed.netloc or parsed.query: raise ValueError('Nonlocal reader URL')
        path = urllib.parse.unquote(parsed.path)
        planned_path(path)
        if not path.startswith('books/'+book_id+'/') or path not in files:
            raise ValueError('Reader URL has no planned file: '+url)
    if set(manifest) != {key for key,_ in book_sources}: raise ValueError('Missing reader book')
    for key, book in manifest.items():
        check_url(book['url'],key)
        for member in book['members'].values():
            if type(member['number']) is not int or member['number'] < 1: raise ValueError('Invalid member number')
            for url in [member['url'], *member['anchors'].values(), *(h['url'] for h in member['headings'])]: check_url(url,key)
        for url in book['images'].values(): check_url(url,key)
    data['readers'] = manifest
    for image in data['images']:
        image['originalPath'] = manifest[image['bookId']]['images'][image['member']]
    return files


def build_catalogue():
    validate_output(OUT)
    if shutil.disk_usage(capacity_root(OUT)).free < RESERVE + MAX_BYTES:
        raise OSError('Need 2 GiB reserve plus 280 MiB bounded extraction budget')
    media = OUT/'media/images'
    planned_files, book_sources = {}, []
    if any(p.is_symlink() for p in (OUT/'media', media)):
        raise ValueError('Media symlinks are forbidden')
    existing_bytes = 0
    for path in media.rglob('*'):
        validate_output(OUT)
        if path.is_file(): existing_bytes += path.stat().st_size
    used = existing_bytes
    labels = load_app_labels()
    app_info = load_app_info()
    books, rows, images, audit_books = [], [], [], []
    local, archive_notes = validated_archive(OUT)
    samples = review_samples()
    reviewed = documented_sample_reviews(samples)
    row_lookup = {}

    def add(key, doc, name, cat, summary, video=None, overview=False):
        name = ' '.join(name.split())
        ident = stable_id(key, cat, name.casefold())
        style = BOOKS[key][1]
        if key == 'pottle' and video:
            if video['videoId'] in FORM_IDS or video['name'] in ('KORYO','KEUMGANG','TAEBACK','PYONGWON','SHIPJIN','JITAE','CHUNKWON','HANSOO','ILYEO'): style = 'Kukkiwon / WT'
            elif video['name'] in ('Chun Ji', 'Choong-Moo'): style = 'ITF / Chang-Hon'
        app_id = FORM_IDS.get(video['videoId']) if video else None
        if not app_id: app_id = canonical(name, style)
        if video and video['videoId'] in reviewed:
            app_id = reviewed[video['videoId']]['cardId']
        if app_id not in labels: app_id = None
        if ident not in row_lookup:
            row = {'id': ident, 'bookId': key, 'name': name, 'sourceLanguage': 'en (nombres coreanos según fuente)', 'category': cat, 'chapter': doc['chapter'], 'members': [], 'style': style, 'summaryEs': summary, 'canonicalAppId': app_id, 'appNames': labels.get(app_id), 'mappingConfidence': ('muestreo T1 y contexto; similar, no ejecución idéntica al club' if video and video['videoId'] in reviewed else 'movimiento/contexto explícito; equivalencia visual pendiente') if app_id else 'sin correspondencia canónica afirmada', 'videos': [], 'imageIds': [], 'overview': overview, 'notes': 'Referencia local de estudio; no instrucción autónoma. Copyright conservado. ' + ('Nombre/caption de fuente; identificación exacta no verificada.' if not app_id else 'Conservar variante de escuela.')}
            row_lookup[ident] = row
            rows.append(row)
        row = row_lookup[ident]
        if doc['member'] not in row['members']: row['members'].append(doc['member'])
        if video and not any(v['videoId']==video['videoId'] and v['start']==video['start'] for v in row['videos']):
            v = dict(video)
            media = local_media_for(v, local)
            review = reviewed.get(v['videoId'])
            visual_note = (f"Muestreo visual T1 documentado, sólo fragmento {review['start']}–{review['end']}s; no visionado continuo, audio ni certificación. Fuente: docs/video/epub-supplements.md." if review else 'Revisión visual pendiente; la disponibilidad de metadatos o de una muestra no la acredita.')
            v.update({'visualReviewEs':visual_note, 'appSupplement':review, 'localMedia':media, 'archiveAvailability':local.get(v['videoId'],{}).get('availability','not-planned'), 'archiveReason':local.get(v['videoId'],{}).get('reason')})
            v.update({'availability': 'metadata-public-embed-prior-audit' if v['videoId'] in PRIORITY else 'unknown', 'visualReview': 'sampled-by-T1' if review else 'pending', 'reviewSampleEs': samples.get(v['videoId'], 'Sin muestra de revisión acreditada'), 'backup': ('validated-full-source' if media['kind']=='source' else 'validated-preview-not-full-source') if media else 'pending', 'localPath': media['path'] if media else None, 'context': 'advanced-reference-only' if cat == CATEGORIES[12] else 'relevant-source-reference', 'metadataEvidence': 'Auditoría previa suministrada por el orquestador; no consultada por este generador.'})
            row['videos'].append(v)
        if video:
            linked = next(v for v in row['videos'] if v['videoId']==video['videoId'] and v['start']==video['start'])
            context = {'member':doc['member'], 'chapter':doc['chapter'], 'heading':video.get('heading'), 'sourceAnchor':video.get('sourceAnchor')}
            if context not in linked.setdefault('references',[]): linked['references'].append(context)
        return row

    for key, (needle, style, short, note) in BOOKS.items():
        candidates = list((ROOT/'docs/clint-sharp').glob('*'+needle+'*.epub'))
        if len(candidates) != 1: raise ValueError('Expected exactly one EPUB for '+needle)
        file = candidates[0]
        book_sources.append((key, file))
        book = read_book(file)
        digest = hashlib.sha256()
        with file.open('rb') as f:
            for chunk in iter(lambda: f.read(1024**2), b''): digest.update(chunk)
        books.append({'id': key, 'title': book['title'] or file.stem, 'shortTitle': short, 'filename': file.name, 'sha256': digest.hexdigest(), 'author': needle, 'style': style, 'noteEs': note, 'copyright': 'Todos los derechos reservados a sus titulares. Reutilización local de imágenes afirmada por el propietario; no es autorización de publicación.', 'toc': book['toc']})
        counts = Counter()
        refs, by_member, relevant_docs = {}, {}, []
        chapter_text = {}
        for doc in book['documents']:
            relevant = relevant_document(key, doc)
            counts['spine_members_read'] += 1
            if relevant:
                relevant_docs.append(doc['member'])
                chapter_text.setdefault(doc['chapter'], []).append(' '.join(b['text'] for b in doc['blocks']))
                stem = Path(doc['member']).stem
                fallback, summary = CHAPTER_SUMMARIES.get(key, {}).get(stem, (category(doc['chapter'], 'Formas' if key in ('woo','hillson') else 'Práctica y combate'), note))
                if key == 'gold': fallback, summary = 'Principios', note
                overview = add(key, doc, doc['chapter'], fallback, summary, overview=True)
                for entry in book['toc']:
                    if entry['member'] == doc['member'] and entry['title'] != doc['chapter']:
                        toc_cat = category(entry['title'], fallback)
                        add(key, {**doc, 'chapter':entry['title']}, entry['title'], toc_cat, CATEGORY_SUMMARY.get(toc_cat, summary), overview=True)
                for name in named_entries(key, doc, fallback):
                    cat = category(name, fallback)
                    if fallback == CATEGORIES[12]: cat = fallback
                    section = next((b['chapter'] for b in doc['blocks'] if b['text'].rstrip('.') == name), doc['chapter'])
                    if key == 'hillson' and any(name == t['title'] for t in book['toc'] if re.match(r'Kuk Mu|Pyong An|Ch|Pal |Ship|Yun|Ja |Kang|Kang Sang', t['title'])): cat='Formas'
                    add(key, {**doc, 'chapter':section}, name, cat, CATEGORY_SUMMARY.get(cat, summary))
                for ref in doc['images']:
                    if ref['member']:
                        refs.setdefault(ref['member'], []).append({'document': doc['member'], 'chapter': doc['chapter'], **ref, 'category': fallback})
            # Inventory every individual source video, even when a frontmatter link.
            for video in doc['videos']:
                fallback = category(doc['chapter'], 'Otros recursos útiles')
                cat = category(video['name'], fallback)
                if fallback == CATEGORIES[12] or re.search(r'(?i)advanced kicks|demo kicks', video.get('heading','')): cat=CATEGORIES[12]
                add(key, doc, video['name'], cat, CATEGORY_SUMMARY.get(cat, note), video)
            for ref in doc['images']:
                by_member.setdefault(ref['member'], []).append(doc['member'])
        if key == 'hillson':
            features = [('front stance','bases adelantadas'),('back stance','bases atrasadas'),('horse stance','base de jinete'),('crane stance','equilibrio sobre un apoyo'),('knife-hand','trabajo de mano abierta'),('high block','defensas altas'),('low block','defensas bajas'),('side kick','patadas laterales'),('front kick','patadas frontales'),('elbow','referencias de codo'),('spear','trabajo de punta de mano'),('X-block','bloqueos cruzados')]
            for row in rows:
                if row['bookId'] != key or not row['overview'] or row['category'] != 'Formas': continue
                corpus = ' '.join(chapter_text.get(row['chapter'], [])).casefold()
                found = [es for en, es in features if en.casefold() in corpus]
                if found:
                    row['summaryEs'] = 'La referencia clásica reúne '+', '.join(found[:5])+'. Se resume el repertorio, no la secuencia de ejecución; conservar variantes y aplicaciones como interpretaciones de la fuente.'
        with reader.safe_archive(file) as z:
            image_members = [i for i in z.infolist() if i.filename.lower().endswith(('.jpg','.jpeg','.png','.gif','.svg','.webp'))]
            for info in image_members:
                counts['image_members'] += 1
                reason = None
                if info.file_size > 12*1024**2:
                    reason, raw, dimensions = 'oversized-member', b'', None
                else:
                    raw = z.read(info.filename)
                    dimensions = image_dimensions(raw)
                    reason = image_reason(info.filename, dimensions, info.filename in refs)
                if reason:
                    counts['omitted_'+reason] += 1
                    continue
                ref = refs[info.filename][0]
                sha = hashlib.sha256(raw).hexdigest()
                suffix = Path(info.filename).suffix.lower()
                rel = f'media/images/{key}-{sha}{suffix}'
                validate_output(OUT)
                target = OUT/rel
                if target.is_symlink(): raise ValueError('Image target symlink')
                if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() != sha:
                    raise ValueError('Existing image hash mismatch: '+rel)
                if not target.exists() and rel not in planned_files:
                    used += len(raw)
                planned_files[rel] = raw
                image_id = stable_id(key, info.filename)
                # Heading association is structural, not an assertion of pictured technique.
                caption = f"{ref['heading']} · {Path(info.filename).name}"
                cat = category(ref['heading'], ref['category'])
                image = {'id': image_id, 'bookId': key, 'path': rel, 'member': info.filename, 'sha256': sha, 'bytes': len(raw), 'width': dimensions[0], 'height': dimensions[1], 'category': cat, 'title': caption, 'captionConfidence': 'unverified-structural-reference', 'captionEs': 'Sin verificar: referencia de capítulo/encabezado, no identificación visual exacta.', 'references': refs[info.filename]}
                images.append(image)
                counts['selected_images'] += 1
                counts['selected_bytes'] += len(raw)
        audit_books.append({'bookId': key, 'toc_entries': len(book['toc']), 'relevant_members': relevant_docs, **dict(counts)})
    for row in rows:
        row['imageIds'] = [im['id'] for im in images if im['bookId']==row['bookId'] and any(ref['document'] in row['members'] and (row['overview'] or ref['heading'].casefold()==row['name'].casefold()) for ref in im['references'])]
        row['videoStateEs'] = row_state(row)
    # Current course sources remain clearly separated, with existing card mappings.
    current = []
    def course_file(path, source, default):
        for clip in json.loads(path.read_text()):
            if source=='selfdefense' and not clip['cardId'].startswith('sd-'): continue
            vids = [clip.get('videoId')] if clip.get('videoId') else default
            for vid in vids:
                if not vid: continue
                current.append({**clip, 'videoId': vid, 'source': source})
    course_file(ROOT/'src/data/clips.json', 'course', ['vQb_6i28QK8','dnYQ1Y0acrE'])
    course_file(ROOT/'src/data/clips-selfdefense.json', 'selfdefense', ['crp_bNCaPqE'])
    course_file(ROOT/'src/data/clips-external.json', 'external', [])
    for path in sorted((ROOT/'src/data/curriculum').glob('*.json')):
        for clip in json.loads(path.read_text()).get('clips', []):
            for vid in ['vQb_6i28QK8','dnYQ1Y0acrE']:
                current.append({**clip,'videoId':vid,'source':'course'})
    for clip in current:
        card = clip['cardId']; vid = clip['videoId']
        media = local_media_for(clip, local)
        rows.append({'id':stable_id('current',card,vid,str(clip['start']),str(clip['end'])), 'bookId':'current', 'name':labels.get(card,{}).get('es',card), 'category':CATEGORIES[13], 'chapter':'Datos actuales de la aplicación · '+clip['source'], 'members':['src/data/clips*.json / curriculum'], 'style':'Curso actual; verificar variante por ficha', 'summaryEs':'Clip ya presente en el curso; no atribuido al EPUB ni candidato nuevo. Se conservan límites existentes.', 'canonicalAppId':card,'appNames':labels.get(card),'mappingConfidence':'ficha actual de la aplicación','notes':'No cambia selección, orden ni programa.', 'imageIds':[], 'videos':[{'videoId':vid,'start':clip['start'],'end':clip['end'],'url':f'https://www.youtube.com/watch?v={vid}&t={clip["start"]}s','availability':'current-course-not-rechecked','visualReview':'not-claimed','backup':('validated-full-source' if media['kind']=='source' else 'validated-preview-not-full-source') if media else 'pending','localPath':media['path'] if media else None,'localMedia':media}], 'videoStateEs':'Curso actual · disponibilidad no comprobada aquí'})
    for row in rows:
        row['appInfo'] = app_info.get(row.get('canonicalAppId'))
    audit = {'schemaVersion':1,'generation':'offline / stdlib / sin solicitudes de red','books':audit_books,'bookCount':len(books),'sourceRowCount':sum(r['bookId']!='current' for r in rows),'currentCourseRows':len(current),'sourceVideoIds':sorted({v['videoId'] for r in rows if r['bookId']!='current' for v in r['videos']}),'currentCourseVideoIds':sorted({c['videoId'] for c in current}),'imageCount':len(images),'imageBytes':sum(i['bytes'] for i in images),'managedImageBytesOnDisk':used,'diskReserveBytes':RESERVE,'maxManagedBytes':MAX_BYTES,'archiveNotes':archive_notes,'archivePlan':local.get('_snapshot'),'imagePolicyEs':'Sólo miembros referenciados en secciones relevantes, cabecera PNG/JPEG/GIF reconocible; mínimo 96 px por lado, 20.000 px², relación máxima 8:1 y 12 MiB por miembro. Se excluyen nombres decorativos, portada, anuncios y secciones biográficas/promocionales. Verificación de cabecera/CRC, no decodificación visual de todos los píxeles. Imágenes grandes de contexto pueden seguir siendo decorativas: captions sin verificar. No se reconstruyen tiras ni se afirma identificar cada imagen.', 'limitsEs':['Nomenclatura seleccionada por reglas específicas y revisión de capítulos; no es transcripción ni índice exhaustivo de cada movimiento en cada forma.', 'Texto contenido sólo en imágenes no tiene OCR; se conserva la lámina con referencia sin inventar nombres.', 'McMillan: el TOC NCX sólo contiene Cover; se inspecciona toda la secuencia spine y sus encabezados reales.', 'Este generador no reproduce ni revisa vídeos: atribuye al informe T1 el muestreo visual de 12 suplementos, no visionado continuo ni audio. Taegeuk 5 sigue sin revisar. Sólo 13 tienen evidencia previa específica de metadatos públicos/embed; el plan de archivo describe accesibilidad de metadatos, no reproducción.', 'Playlist de Woo PL5CF4C717FADAC486: no existe según auditoría previa; nunca se usa como videoId. Canal y playlist no son vídeos individuales.', 'Los lectores HTML completos y archivos originales son exclusivamente locales; no se publican EPUB ni medios y no se infiere licencia abierta del permiso local.', 'Afirmaciones históricas, clínicas, físicas y reglamentos deben contrastarse; se omiten instrucciones peligrosas.']}
    data = {'schemaVersion':1,'language':'es','books':books,'rows':rows,'images':images,'audit':audit}
    planned_files.update(attach_readers(data, book_sources))
    return data, planned_files


def mdcell(value):
    return str(value).replace('|','\\|').replace('\n',' ').replace('<','&lt;').replace('>','&gt;')


def render_markdown(data):
    audit=data['audit']; books={b['id']:b for b in data['books']}
    lines=['# Recursos de siete EPUB — revisión local', '', '**No publicado.** Resúmenes originales en español; nombres en inglés/coreano conservados de la fuente. No es un manual de ejecución ni una autorización de publicación.', '', f"{audit['bookCount']} libros · {audit['sourceRowCount']} filas de fuente · {len(audit['sourceVideoIds'])} vídeos EPUB únicos · {audit['imageCount']} imágenes seleccionadas ({audit['imageBytes']/1024**2:.1f} MiB).", '', '[Abrir visor local](index.html) · [Datos estructurados](catalogue.json) · [Auditoría y límites](catalogue-audit.json)', '', '## Cobertura por libro', '', '| Libro / tradición | Alcance y límites | TOC / miembros leídos / relevantes | Filas | Imágenes seleccionadas / inventariadas |', '|---|---|---|---:|---:|']
    for b, a in zip(data['books'],audit['books']):
        lines.append('| '+' | '.join(map(mdcell,[b['shortTitle']+' — '+b['author']+' / '+b['style'],b['noteEs'],f"{a['toc_entries']} / {a['spine_members_read']} / {len(a['relevant_members'])}",sum(r['bookId']==b['id'] for r in data['rows']),f"{a.get('selected_images',0)} / {a['image_members']}"]))+' |')
    lines+=['','## Seguridad, derechos y estados','',*['- '+s for s in audit['limitsEs']], '- '+audit['imagePolicyEs'], *['- '+s for s in audit['archiveNotes']], '', 'Los vídeos sólo se solicitan al pulsar «Cargar vídeo remoto». Los archivos locales sólo se ofrecen cuando ruta, existencia y hash de manifiesto son válidos. «Sin vídeo vinculado» no significa que una técnica no tenga vídeos en Internet.', '', '## Filtro de imágenes: cuentas por libro','', '| Libro | Seleccionadas | Omisiones por motivo |', '|---|---:|---|']
    for a in audit['books']:
        lines.append(f"| {books[a['bookId']]['shortTitle']} | {a.get('selected_images',0)} | "+mdcell('; '.join(f'{k.removeprefix("omitted_")}: {v}' for k,v in a.items() if k.startswith('omitted_')))+' |')
    for cat in CATEGORIES:
        subset=[r for r in data['rows'] if r['category']==cat]
        lines += ['', '## '+cat+f' ({len(subset)})', '', '| Técnica / concepto (nombre fuente) | Resumen original / precaución | Vídeo / estado | Libro · capítulo · miembro | Estilo / correspondencia | Imágenes |', '|---|---|---|---|---|---|']
        for r in subset:
            vids='; '.join(f"[{v['videoId']}]({v['url']}) inicio {v['start']}s"+(f" fin {v['end']}s" if 'end' in v else '')+' · '+v['backup']+' · '+v.get('reviewSampleEs','')+' · '+v.get('visualReviewEs','') for v in r['videos'])
            pics=[im for im in data['images'] if im['id'] in r['imageIds']]
            imlinks='; '.join(f"[{im['id']}]({im['path']}) (sin verificar)" for im in pics[:5])+(f' · {len(pics)} total en visor/datos' if len(pics)>5 else '')
            lines.append('| '+' | '.join(map(mdcell,[r['name'], r['summaryEs'], (vids+' · ' if vids else '')+r['videoStateEs'], books.get(r['bookId'],{}).get('shortTitle','Curso actual')+' · '+r['chapter']+' · '+', '.join(r['members']), r['style']+' · '+(r.get('canonicalAppId') or 'sin mapear')+' · '+r['mappingConfidence'], imlinks or 'Sin imagen asociada']))+' |')
    lines+=['', '## Galería completa: imágenes por sección', '', 'Los títulos siguientes son referencias estructurales, no identificaciones visuales certificadas. El visor permite anterior/siguiente dentro de la sección filtrada.']
    for cat in CATEGORIES:
        pics=[i for i in data['images'] if i['category']==cat]
        if not pics: continue
        lines += ['', '### '+cat, '', '| Imagen local (sin verificar) | Fuente / capítulo / miembro | SHA-256 |', '|---|---|---|']
        for im in pics:
            ref=im['references'][0]
            lines.append('| '+' | '.join(map(mdcell,[f"[{im['title']}]({im['path']})",books[im['bookId']]['shortTitle']+' · '+ref['chapter']+' · '+ref['document']+' → '+im['member'],im['sha256']]))+' |')
    glossary = {r['canonicalAppId']:r for r in data['rows'] if r.get('canonicalAppId') and r.get('appInfo')}
    lines += ['', '## Descripciones actuales del curso (no resúmenes del EPUB)', '', 'Se reutilizan las etiquetas y descripciones existentes sin cambiar traducciones. Las otras lenguas están en los datos y el visor.', '', '| ID actual / etiqueta española | Descripción española del curso |', '|---|---|']
    for ident, row in sorted(glossary.items()):
        lines.append('| '+mdcell(ident+' / '+(row.get('appNames') or {}).get('es',row['name']))+' | '+mdcell(row['appInfo'].get('es',''))+' |')
    return '\n'.join(lines)+'\n'


def esc(value):
    return html.escape(str(value if value is not None else ''), quote=True)


def highlight_json(value):
    source = json.dumps(value, ensure_ascii=False, indent=2)
    pattern = r'("(?:\\.|[^"\\])*"\s*:?)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b'
    out, end = [], 0
    for token in re.finditer(pattern, source):
        out.append(esc(source[end:token.start()]))
        kind = ('key' if token.group(1).rstrip().endswith(':') else 'string') if token.group(1) else ('number' if token.group(2) else 'literal')
        out.append('<span class="json-'+kind+'">'+esc(token.group())+'</span>')
        end = token.end()
    return '<pre class="json"><code>'+''.join(out)+esc(source[end:])+'</code></pre>'


def reader_link(url, label, title=''):
    return f'<a href="{esc(url)}" target="_blank" rel="noopener noreferrer" title="{esc(title)}">{esc(label)}</a>'


def render_references(data, row):
    key = row['bookId']
    book = next((b for b in data['books'] if b['id']==key), {})
    reader = data.get('readers',{}).get(key)
    title = book.get('shortTitle','Curso actual')
    if not reader or key == 'current':
        return esc(title)+'<p>'+esc(row['chapter'])+'</p><span class="muted">'+esc(', '.join(row['members']))+'</span>'
    members = [reader['members'][m] for m in row['members'] if m in reader['members']]
    chapter_url = members[0]['url'] if members else reader['url']
    # Only real targets from the actual member: anchor, TOC fragment, heading, member.
    for member_name in row['members']:
        if member_name not in reader['members']: continue
        member = reader['members'][member_name]
        anchors = [v.get('sourceAnchor') for v in row.get('videos',[]) if v.get('sourceAnchor')]
        toc = [t for t in book.get('toc',[]) if t['title'].casefold()==row['chapter'].casefold() and t['member'] == member_name]
        anchors += [urllib.parse.unquote(urllib.parse.urlsplit(t['reference']).fragment) for t in toc]
        matched = next((member['anchors'][a] for a in anchors if a in member['anchors']), None)
        matched = matched or next((h['url'] for h in member['headings'] if h['text'].casefold()==row['chapter'].casefold()),None)
        if matched:
            chapter_url = matched
            break
    numbered = ' '.join(reader_link(m['url'],m['number'],title+' · '+row['chapter']+' · '+name) for name,m in sorted(((name,reader['members'][name]) for name in row['members'] if name in reader['members']),key=lambda pair:pair[1]['number']))
    return reader_link(reader['url'],title)+'<p>'+reader_link(chapter_url,row['chapter'])+'</p><span class="muted">'+numbered+'</span>'


def render_video(data, row, video, index):
    offset = f"Inicio {video['start']}s"+(f" · fin {video['end']}s" if 'end' in video else '')
    state = ('No disponible según plan de archivo · '+str(video.get('archiveReason') or 'consultar auditoría') if video.get('archiveAvailability')=='unavailable' else 'Curso actual · no comprobado aquí' if row['bookId']=='current' else 'Metadatos públicos/embed · revisión visual atribuida, no visionado completo' if video.get('availability')=='metadata-public-embed-prior-audit' else 'Disponibilidad desconocida · revisión visual pendiente')
    contexts = ''.join('<p>'+render_references(data,{'bookId':row['bookId'],'chapter':ref['chapter'],'members':[ref['member']],'videos':[{'sourceAnchor':ref.get('sourceAnchor')}]})+' · '+esc(ref.get('heading',''))+'</p>' for ref in video.get('references',[]))
    backup = ('Fuente local verificada' if video.get('localMedia',{}).get('kind')=='source' else 'Clip local verificado · NO respaldo completo') if video.get('localPath') else 'Respaldo pendiente'
    return f'<p><button data-video="{esc(row["id"])}" data-vindex="{index}">Ver {esc(video["videoId"])}</button><br>{esc(offset)} · {esc(state)}<br>{esc(backup)}<br>{esc(video.get("reviewSampleEs",""))}<br>{esc(video.get("visualReviewEs",""))}</p>'+contexts


def render_content(data):
    rows, images = data['rows'], data['images']
    catalogue = []
    for ci, cat in enumerate(CATEGORIES):
        subset = [r for r in rows if r['category']==cat]
        if not subset: continue
        rendered = []
        for r in subset:
            names = '<h4>Etiquetas del curso en/de/es</h4>'+highlight_json(r['appNames']) if r.get('appNames') else ''
            info = '<h4>Descripción actual del curso (no EPUB)</h4>'+''.join(f'<p lang="{lang}"><strong>{lang.upper()}</strong> {esc(r["appInfo"].get(lang,""))}</p>' for lang in ('es','en','de')) if r.get('appInfo') else ''
            videos = ''.join(render_video(data,r,v,j) for j,v in enumerate(r['videos'])) or '<span class="badge">Sin vídeo vinculado</span>'
            rendered.append(f'<tr data-row="{esc(r["id"])}"><td data-label="Técnica / concepto"><strong>{esc((r.get("appNames") or {}).get("es",r["name"]))}</strong><p>Fuente: {esc(r["name"])}</p>{names}<p>{len(r["imageIds"])} imágenes asociadas</p>{info}</td><td data-label="Resumen / precaución">{esc(r["summaryEs"])}<p class="muted">{esc(r["notes"])}</p></td><td data-label="Vídeo / estado">{videos}</td><td data-label="Libro / capítulo / miembro">{render_references(data,r)}</td><td data-label="Estilo / revisión">{esc(r["style"])}<p>{esc(r.get("canonicalAppId") or "Sin mapear")} · {esc(r["mappingConfidence"])}</p><label>Decisión<select data-decision="{esc(r["id"])}"><option value="pending">Pendiente</option><option value="keep">Conservar</option><option value="remove">Proponer retirar</option></select></label></td></tr>')
        catalogue.append(f'<section id="section-{ci}" data-category="{esc(cat)}"><h2>{esc(cat)}</h2><table><thead><tr><th>Técnica / concepto</th><th>Resumen / precaución</th><th>Vídeo / estado</th><th>Libro / capítulo / miembro</th><th>Estilo / revisión</th></tr></thead><tbody>'+''.join(rendered)+'</tbody></table></section>')
    gallery = []
    for im in images:
        original = im.get('originalPath') or data.get('readers',{}).get(im['bookId'],{}).get('images',{}).get(im['member']) or im['path']
        contexts = ''.join('<p>'+render_references(data,{'bookId':im['bookId'],'chapter':ref['chapter'],'members':[ref['document']]})+' · '+esc(ref.get('heading',''))+'</p>' for ref in im['references'])
        gallery.append(f'<article class="note" data-image-card="{esc(im["id"])}"><button class="tile" data-image="{esc(im["id"])}"><img class="thumb" loading="lazy" src="{esc(original)}" alt="Referencia sin verificar: {esc(im["title"])}"><strong>{esc(im["title"])}</strong><span class="badge">Sin verificar</span></button><p>{reader_link(original,"Imagen original del libro",im["member"])}</p>{contexts}<p class="source">{esc(im["member"])} · {esc(im["width"])} × {esc(im["height"])} · {esc(im["bytes"])} bytes · SHA-256 {esc(im["sha256"])}<br>{esc(im["captionEs"])}</p></article>')
    by_video = {}
    for r in rows:
        for j,v in enumerate(r['videos']): by_video.setdefault(v['videoId'],[]).append((r,j,v))
    videos = []
    for vid, contexts in by_video.items():
        content = []
        for r,j,v in contexts:
            scope = 'course' if r['bookId']=='current' else 'epub'
            content.append(f'<div data-video-context="{esc(r["id"])}" data-origin="{scope}"><h3>{esc(r["name"])}</h3><p>{esc(r["summaryEs"])} · {esc(r["style"])}</p>{render_references(data,r)}{render_video(data,r,v,j)}</div>')
        videos.append(f'<article class="note" data-video-card="{esc(vid)}"><h2>{esc(vid)}</h2>'+''.join(content)+'</article>')
    return '<section id="view-catalogue" data-view-panel="catalogue">'+''.join(catalogue)+'</section><section id="view-videos" data-view-panel="videos" hidden><h2>Vídeos únicos · todos los contextos y offsets</h2>'+''.join(videos)+'</section><section id="view-images" data-view-panel="images" hidden><h2>Todas las imágenes seleccionadas · originales y procedencia</h2><div class="gallery">'+''.join(gallery)+'</div></section>'


def render_html(data):
    payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
    epub = set(data['audit'].get('sourceVideoIds',[]))
    course = set(data['audit'].get('currentCourseVideoIds',[]))
    totals = f'<a href="#coverage-title">{len(data["books"])} libros</a> · <a href="#view-catalogue" data-view="catalogue">{esc(data["audit"].get("sourceRowCount",0))} entradas de fuente</a> · <a href="#view-videos" data-view="videos" data-scope="epub">{len(epub)} vídeos EPUB únicos</a> · <a href="#view-images" data-view="images">{len(data["images"])} imágenes seleccionadas</a>. Curso actual separado: <a href="#view-videos" data-view="videos" data-scope="course">{len(course)} fuentes</a>. <a href="#view-videos" data-view="videos" data-scope="union">Unión: {len(epub|course)} vídeos únicos</a>.'
    # Replace template markers before injecting any untrusted data/markup.
    coverage = []
    for book in data['books']:
        audit = next((a for a in data['audit'].get('books',[]) if a['bookId']==book['id']),{})
        coverage.append('<p><strong>'+esc(book['shortTitle']+' — '+book['author'])+'</strong> · '+esc(book['style'])+'<br>'+esc(book['noteEs'])+'<br><span class="muted">TOC: '+esc(audit.get('toc_entries',0))+'; miembros XML leídos: '+esc(audit.get('spine_members_read',0))+'; relevantes: '+str(len(audit.get('relevant_members',[])))+'; imágenes: '+esc(audit.get('selected_images',0))+'/'+esc(audit.get('image_members',0))+'. '+esc(book['copyright'])+'</span></p>')
    limits = '<p>'+esc(data['audit'].get('imagePolicyEs',''))+'</p><ul>'+''.join('<li>'+esc(s)+'</li>' for s in data['audit'].get('limitsEs',[]))+'</ul><h3>Omisiones de imágenes por libro</h3>'
    for audit in data['audit'].get('books',[]):
        limits += '<p>'+esc(audit['bookId'])+': '+esc('; '.join(k.removeprefix('omitted_')+': '+str(v) for k,v in audit.items() if k.startswith('omitted_')) or 'ninguna')+'</p>'
    replacements = {'__CONTENT__':render_content(data), '__TOTALS__':totals, '__DATA__':payload, '__COVERAGE__':''.join(coverage), '__LIMITS__':limits, '__ARCHIVE__':esc(' '.join(data['audit'].get('archiveNotes',[])))}
    return re.sub(r'__CONTENT__|__TOTALS__|__DATA__|__COVERAGE__|__LIMITS__|__ARCHIVE__',lambda match:replacements[match.group()],HTML_TEMPLATE)


HTML_TEMPLATE = r'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><title>Recursos EPUB · revisión local</title>
<style>
[hidden]{display:none!important}.json{white-space:pre-wrap;overflow-wrap:anywhere;background:#f8fafc;padding:10px}.json-key{color:#075985;font-weight:bold}.json-string{color:#166534}.json-number{color:#9a3412}.json-literal{color:#6b21a8}.gallery{align-items:start}article.note{margin:12px 0}:root{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#0f172a;background:#f1f5f9;color-scheme:light}*{box-sizing:border-box}body{margin:0}main{max-width:1440px;margin:auto;padding:24px}h1{font-size:1.9rem}h2{margin-top:2rem}p,li{line-height:1.6}a{color:#0369a1;overflow-wrap:anywhere}button,input,select{font:inherit;padding:10px;border:1px solid #94a3b8;border-radius:8px;background:#fff;color:inherit;min-height:44px}button{cursor:pointer}button:hover{background:#e2e8f0}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #38bdf8;outline-offset:3px}label{display:flex;flex-direction:column;gap:5px;min-width:0}.filters{display:grid;grid-template-columns:2fr repeat(4,1fr);gap:12px;background:#fff;padding:16px;border-radius:12px}.actions{display:flex;flex-wrap:wrap;gap:12px;margin:12px 0}.note,.coverage{background:#fff;border:1px solid #cbd5e1;padding:16px;border-radius:12px}.badge{display:inline-block;border:1px solid #b45309;color:#92400e;background:#fef3c7;border-radius:6px;padding:3px 6px;font-size:.85rem}table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:.9rem}th,td{padding:12px 10px;text-align:left;vertical-align:top;border-bottom:1px solid #cbd5e1;overflow-wrap:anywhere}th{color:#0f172a;background:#e2e8f0}th:nth-child(1){width:17%}th:nth-child(2){width:25%}th:nth-child(3){width:19%}th:nth-child(4){width:23%}th:nth-child(5){width:16%}td p{margin:.3rem 0}.muted{color:#475569;font-size:.86rem}.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}.thumb{width:100%;height:140px;object-fit:contain;background:#f8fafc}.tile{padding:10px;text-align:left;display:flex;flex-direction:column;gap:8px;height:100%;font-size:.85rem}.tile span{overflow-wrap:anywhere}dialog{width:min(1100px,95vw);max-height:94dvh;padding:20px;background:#fff;color:inherit;border:1px solid #94a3b8;border-radius:12px;overflow:auto}dialog::backdrop{background:#020617df}.viewer img{display:block;max-width:100%;max-height:62dvh;object-fit:contain;margin:auto;background:white}.viewer video,.viewer iframe{display:block;width:100%;max-height:60dvh;aspect-ratio:16/9;border:0;background:#000}.dialogbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.dialogbar h2{margin:0;flex:1;overflow-wrap:anywhere}.source{overflow-wrap:anywhere}nav{display:flex;gap:12px;flex-wrap:wrap}summary{cursor:pointer;padding:12px 0}#empty{padding:24px;border:1px dashed #94a3b8}noscript{display:block;padding:20px} @media(max-width:800px){main{padding:12px}.filters{grid-template-columns:1fr 1fr}.filters label:first-child{grid-column:1/-1}table,tbody,tr,td{display:block;width:100%}thead{display:none}tr{border:1px solid #475569;border-radius:10px;margin-bottom:14px;padding:6px}td{border:none;padding:7px}td:before{content:attr(data-label);display:block;font-weight:600;color:#334155;margin-bottom:4px}.gallery{grid-template-columns:repeat(auto-fill,minmax(135px,1fr))}h1{font-size:1.5rem}} @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style></head><body><main><header><span class="badge">LOCAL · NO PUBLICADO · REVISIÓN PENDIENTE</span><h1>Recursos de los siete EPUB</h1><p>Resumen de estudio en español. Los nombres originales ingleses/coreanos se conservan; no son instrucciones para entrenar sin supervisión. No se modifica el curso.</p><nav><a href="resources.md">Informe Markdown completo</a><a href="catalogue.json">Datos y procedencia</a><a href="catalogue-audit.json">Auditoría</a><a href="#controls">Buscar recursos</a></nav></header>
<section aria-labelledby="coverage-title"><h2 id="coverage-title">Cobertura y límites</h2><p id="totals">__TOTALS__</p><div id="coverage" class="coverage">__COVERAGE__</div><h3>Política de selección, derechos y limitaciones</h3><div id="limits">__LIMITS__</div><p id="archive" class="note">__ARCHIVE__</p></section>
<section id="controls" aria-labelledby="search-title"><h2 id="search-title">Buscar y comparar</h2><div class="filters"><label>Buscar técnica, libro o capítulo<input id="q" type="search" placeholder="Ej.: side kick, Woo, meditación"></label><label>Libro<select id="book"><option value="">Todos</option></select></label><label>Estilo<select id="style"><option value="">Todos</option></select></label><label>Vídeo<select id="hasVideo"><option value="">Con o sin vídeo</option><option value="yes">Con vídeo vinculado</option><option value="no">Sin vídeo vinculado</option></select></label><label>Imagen<select id="hasImage"><option value="">Con o sin imagen</option><option value="yes">Con imagen asociada</option><option value="no">Sin imagen asociada</option></select></label></div><div class="actions"><button id="reset">Restablecer</button><button id="export">Exportar decisiones JSON</button></div><p id="result-count" role="status" aria-live="polite"></p><p class="muted">Orden: sección temática y orden de fuente. Los filtros afectan tablas y galerías. «Sin vídeo» significa sin enlace en esta entrada, no ausencia en Internet. Decisiones sólo en memoria hasta exportarlas.</p></section><p id="empty" hidden>Sin resultados. Amplía la búsqueda o pulsa Restablecer.</p><nav class="actions" aria-label="Vista de recursos"><a href="#view-catalogue" data-view="catalogue">Catálogo</a><a href="#view-videos" data-view="videos" data-scope="epub">Vídeos EPUB</a><a href="#view-images" data-view="images">Imágenes</a></nav><div id="video-scopes" class="actions" hidden><button data-scope="epub">Sólo EPUB</button><button data-scope="course">Sólo curso actual</button><button data-scope="union">Unión EPUB + curso</button></div><div id="sections">__CONTENT__</div><noscript>Este visor necesita JavaScript local. Lee resources.md para todas las tablas, enlaces y límites sin JavaScript.</noscript>
</main><dialog id="modal" aria-labelledby="modal-title" tabindex="-1"><div class="dialogbar"><h2 id="modal-title"></h2><button id="close">Cerrar</button></div><p id="modal-source" class="source"></p><div id="viewer" class="viewer"></div><div class="actions"><button id="prev">← Anterior</button><span id="position" aria-live="polite"></span><button id="next">Siguiente →</button></div></dialog>
<script id="catalogue-data" type="application/json">__DATA__</script><script>
'use strict';
const D=JSON.parse(document.getElementById('catalogue-data').textContent), $=id=>document.getElementById(id), books=new Map(D.books.map(b=>[b.id,b])), decisions=new Map();
const categories=['Patadas','Bloqueos','Posiciones','Manos y brazos','Formas','Principios','Meditación','Calentamiento y estiramientos','Acondicionamiento','Práctica y combate','Historia','Otros recursos útiles','Contexto avanzado — no practicar sin supervisión','Curso actual — separado de EPUB'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const bookTitle=id=>books.get(id)?.shortTitle||'Curso actual';
const videoLabel=v=>v.archiveAvailability==='unavailable'?'No disponible según plan de archivo · '+(v.archiveReason||'consultar auditoría'):v.availability==='metadata-public-embed-prior-audit'?'Metadatos públicos/embed · '+(v.visualReview==='sampled-by-T1'?'muestreo T1 documentado (no completo)':'visual pendiente'):v.archiveAvailability==='accessible'?'Metadatos accesibles según plan · embed/visual no acreditados':v.availability==='current-course-not-rechecked'?'Curso actual · no comprobado aquí':'Disponibilidad desconocida · visual pendiente';
D.books.forEach(b=>$('book').add(new Option(b.shortTitle,b.id)));$('book').add(new Option('Curso actual (no EPUB)','current'));
[...new Set(D.rows.map(r=>r.style))].sort().forEach(s=>$('style').add(new Option(s,s)));
let filteredRows=[], filteredImages=[], returnFocus=null, gallery=[], galleryIndex=0, mode='', view='catalogue', videoScope='epub';
const allRows=new Map(D.rows.map(r=>[r.id,r]));
function filters(){return {q:norm($('q').value),book:$('book').value,style:$('style').value,video:$('hasVideo').value,image:$('hasImage').value}}
function rowMatches(r,f){return (!f.book||r.bookId===f.book)&&(!f.style||r.style===f.style)&&(!f.video||(r.videos.length>0)===(f.video==='yes'))&&(!f.image||(r.imageIds.length>0)===(f.image==='yes'))&&(!f.q||norm([r.name,r.chapter,r.summaryEs,r.members.join(' '),r.style,bookTitle(r.bookId),books.get(r.bookId)?.author,...Object.values(r.appNames||{})].join(' ')).includes(f.q))}
function render(){
 const f=filters();filteredRows=D.rows.filter(r=>rowMatches(r,f));const rowImages=new Set(filteredRows.flatMap(r=>r.imageIds));
 filteredImages=D.images.filter(im=>{const style=books.get(im.bookId)?.style;return (!f.book||im.bookId===f.book)&&(!f.style||style===f.style||filteredRows.some(r=>r.style===f.style&&r.imageIds.includes(im.id)))&&(!f.video||rowImages.has(im.id))&&f.image!=='no'&&(!f.q||rowImages.has(im.id)||norm([im.title,bookTitle(im.bookId),...im.references.map(x=>x.chapter+' '+x.document)].join(' ')).includes(f.q))});
 $('result-count').textContent=`${filteredRows.length} / ${D.rows.length} filas · ${filteredImages.length} / ${D.images.length} imágenes · filtros activos: ${Object.values(f).filter(Boolean).length}`;$('empty').hidden=!!(filteredRows.length||filteredImages.length);
 const rowIds=new Set(filteredRows.map(r=>r.id)),imageIds=new Set(filteredImages.map(im=>im.id));
 document.querySelectorAll('[data-row]').forEach(el=>el.hidden=!rowIds.has(el.dataset.row));
 document.querySelectorAll('[data-category]').forEach(el=>el.hidden=![...el.querySelectorAll('[data-row]')].some(row=>!row.hidden));
 document.querySelectorAll('[data-image-card]').forEach(el=>el.hidden=!imageIds.has(el.dataset.imageCard));
 let videoCount=0;
 document.querySelectorAll('[data-video-card]').forEach(card=>{
  let matches=0;
  card.querySelectorAll('[data-video-context]').forEach(el=>{el.hidden=!rowIds.has(el.dataset.videoContext)||(videoScope!=='union'&&videoScope!==el.dataset.origin);if(!el.hidden)matches++});
  card.hidden=!matches;if(matches)videoCount++;
 });
 document.querySelectorAll('[data-view-panel]').forEach(el=>el.hidden=el.dataset.viewPanel!==view);
 $('video-scopes').hidden=view!=='videos';
 document.querySelectorAll('[data-view]').forEach(el=>{if(el.dataset.view===view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
 document.querySelectorAll('button[data-scope]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.scope===videoScope)));
 const count=view==='videos'?videoCount:view==='images'?filteredImages.length:filteredRows.length;
 $('empty').hidden=count>0;
 $('result-count').textContent=view==='videos'?`${videoCount} vídeos únicos · ámbito ${videoScope==='epub'?'EPUB':videoScope==='course'?'curso actual':'unión EPUB + curso'} · todos los contextos coincidentes`:view==='images'?`${filteredImages.length} / ${D.images.length} imágenes seleccionadas`:`${filteredRows.length} / ${D.rows.length} filas`;
}
function openModal(trigger){returnFocus=trigger;$('modal').showModal();document.body.style.overflow='hidden';$('close').focus()}
function restoreModal(){if($('modal').open)return;$('viewer').replaceChildren();document.body.style.overflow='';if(returnFocus?.isConnected)returnFocus.focus();else $('q').focus()}
function closeModal(){if($('modal').open)$('modal').close();restoreModal()}
$('modal').addEventListener('close',restoreModal);
$('modal').addEventListener('cancel',e=>{e.preventDefault();closeModal()});$('close').onclick=closeModal;
function showImage(){const im=gallery[galleryIndex],ref=im.references[0];$('modal-title').textContent=im.title;$('modal-source').textContent=`SIN VERIFICAR · ${bookTitle(im.bookId)} · ${ref.chapter} · ${ref.document} → ${im.member}. ${im.captionEs} SHA-256 ${im.sha256}`;const img=document.createElement('img');img.src=im.originalPath||im.path;img.alt=im.title+' — sin verificar';$('viewer').replaceChildren(img);$('position').textContent=`${galleryIndex+1} / ${gallery.length} · ${im.category}`;$('prev').hidden=$('next').hidden=false;$('prev').disabled=galleryIndex===0;$('next').disabled=galleryIndex===gallery.length-1}
function step(delta){if(mode==='image'){galleryIndex=Math.max(0,Math.min(gallery.length-1,galleryIndex+delta));showImage()}}
$('prev').onclick=()=>step(-1);$('next').onclick=()=>step(1);
function modalFocusableControls(){
 return [...$('modal').querySelectorAll('a[href],area[href],button,input,select,textarea,iframe,video[controls],audio[controls],[tabindex],[contenteditable="true"]')].filter(el=>el.tabIndex>=0&&!el.matches(':disabled')&&el.getAttribute('aria-disabled')!=='true'&&!el.closest('[hidden],[inert]')&&el.getClientRects().length&&getComputedStyle(el).visibility==='visible');
}
// Recompute on each Tab: loading a video can replace a button with an iframe.
// Native dialog tabbing alone can leave activeElement on BODY in Chrome.
document.addEventListener('keydown',e=>{
 if(e.key!=='Tab'||!$('modal').open)return;
 const controls=modalFocusableControls(),first=controls[0],last=controls[controls.length-1],active=document.activeElement;
 if(!controls.length){e.preventDefault();$('modal').focus();return;}
 if(controls.length===1||!$('modal').contains(active)||!controls.includes(active)||(e.shiftKey?active===first:active===last)){
  e.preventDefault();(e.shiftKey?last:first).focus();
 }
},true);
function keepModalFocus(){
 if(!$('modal').open)return;
 const controls=modalFocusableControls(),active=document.activeElement;
 if(!controls.includes(active)&&(active!==$('modal')||controls.length))(controls[0]||$('modal')).focus();
}
document.addEventListener('focusin',keepModalFocus);
// A loaded video may remove the focused load button; retain focus after mutation.
new MutationObserver(keepModalFocus).observe($('modal'),{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','tabindex','style','inert','aria-disabled']});
$('modal').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeModal()}if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}if(e.key==='ArrowRight'){e.preventDefault();step(1)}});
function validLocalVideoPath(value){
 if(typeof value!=='string')return false;
 const prefix=['../../video/epub-backup/','archive/'].find(p=>value.startsWith(p));
 if(!prefix)return false;
 const record=value.slice(prefix.length);
 return !record.startsWith('/')&&!record.includes('..')&&/^[A-Za-z0-9_./ -]+\.(mp4|webm|m4v|ogv|mkv)$/i.test(record);
}
function showVideo(r,v){mode='video';$('modal-title').textContent=r.appNames?.es||r.name;$('modal-source').textContent=`${bookTitle(r.bookId)} · ${r.chapter} · ${r.members.join(', ')} · ${videoLabel(v)} · inicio fuente ${v.start}s · ${v.reviewSampleEs||''} · ${v.visualReviewEs||''}`;$('prev').hidden=$('next').hidden=true;$('position').textContent='';$('viewer').replaceChildren();const a=document.createElement('a');a.href=v.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Abrir fuente original (requiere Internet)';
 if(validLocalVideoPath(v.localPath)){const video=document.createElement('video');video.controls=true;video.preload='metadata';video.src=v.localPath;video.addEventListener('loadedmetadata',()=>{video.currentTime=v.localMedia?.playStart||0});if(v.localMedia?.playEnd!==undefined)video.addEventListener('timeupdate',()=>{if(video.currentTime>=v.localMedia.playEnd)video.pause()});video.onerror=()=>{const p=document.createElement('p');p.textContent='El archivo local no se puede reproducir; comprueba respaldo o fuente.';$('viewer').append(p)};$('viewer').append(video);}
 else {const p=document.createElement('p');p.textContent='Respaldo pendiente. No se ha comprobado visualmente este vídeo aquí. El reproductor remoto requiere Internet y contactará YouTube sólo si lo autorizas.';const button=document.createElement('button');button.textContent='Cargar vídeo remoto';button.onclick=()=>{if(!/^[A-Za-z0-9_-]{11}$/.test(v.videoId))return;const frame=document.createElement('iframe');const end=v.end!==undefined?'&end='+Number(v.end):'';frame.src='https://www.youtube-nocookie.com/embed/'+v.videoId+'?start='+Number(v.start||0)+end+'&rel=0';frame.title=r.name;frame.allow='fullscreen; encrypted-media; picture-in-picture';frame.allowFullscreen=true;button.replaceWith(frame)};$('viewer').append(p,button);}$('viewer').append(a);
}
$('sections').addEventListener('click',e=>{const imButton=e.target.closest('[data-image]'),vButton=e.target.closest('[data-video]');if(imButton){const im=D.images.find(x=>x.id===imButton.dataset.image);gallery=filteredImages.filter(x=>x.category===im.category);galleryIndex=gallery.findIndex(x=>x.id===im.id);mode='image';showImage();openModal(imButton)}if(vButton){const r=allRows.get(vButton.dataset.video);showVideo(r,r.videos[Number(vButton.dataset.vindex)]);openModal(vButton)}});
document.addEventListener('click',e=>{const target=e.target.closest('[data-view],[data-scope]');if(!target)return;e.preventDefault();if(target.dataset.view){view=target.dataset.view;['q','book','style','hasVideo','hasImage'].forEach(id=>$(id).value='')}if(target.dataset.scope)videoScope=target.dataset.scope;render()});
$('sections').addEventListener('change',e=>{if(e.target.dataset.decision)decisions.set(e.target.dataset.decision,e.target.value)});
['q','book','style','hasVideo','hasImage'].forEach(id=>$(id).addEventListener(id==='q'?'input':'change',render));
$('reset').onclick=()=>{['q','book','style','hasVideo','hasImage'].forEach(id=>$(id).value='');render();$('q').focus()};
$('export').onclick=()=>{const content={schemaVersion:1,catalogue:'local-epub-review',decisions:[...decisions].map(([id,decision])=>({id,decision}))};const url=URL.createObjectURL(new Blob([JSON.stringify(content,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='epub-review-decisions.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
render();
</script></body></html>'''


def main(argv=None):
    global OUT
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', default=OUT, help='Only resources/epub, legacy .atl/epub-resources, or the exact external catalogue root')
    args = parser.parse_args(argv)
    try:
        # Preserve raw external spelling until the shared guard has checked it.
        output = validate_output(args.output)
    except ValueError as exc:
        parser.error(str(exc))
    OUT = output
    data, files = build_catalogue()
    outputs = {'catalogue.json':json.dumps(data,ensure_ascii=False,indent=2)+'\n', 'catalogue-audit.json':json.dumps(data['audit'],ensure_ascii=False,indent=2)+'\n', 'resources.md':render_markdown(data), 'index.html':render_html(data)}
    files.update({name:content.encode('utf-8') for name,content in outputs.items()})
    estimate = write_plan(OUT, files)
    print(json.dumps({'outputEstimate':estimate}))
    print(json.dumps({k:v for k,v in data['audit'].items() if k in ('bookCount','sourceRowCount','currentCourseRows','imageCount','imageBytes','sourceVideoIds','currentCourseVideoIds','archiveNotes')},ensure_ascii=False,indent=2))
    print(f'Generated {OUT}/index.html and resources.md; no network, no publication.')


if __name__ == '__main__':
    main()
