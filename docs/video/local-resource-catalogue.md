# Catálogo EPUB para revisión local

**El recurso de revisión está en `resources/epub/index.html` y `resources/epub/resources.md`, dentro de este repositorio.** No es una ruta pública del curso. El generador inspecciona los siete EPUB, conserva nombres de fuente y produce resúmenes originales en español, tres vistas exclusivas (Catálogo, Vídeos e Imágenes) y lectores HTML completos privados con originales y procedencia. No descarga vídeos ni modifica traducciones, clips, currículo o dependencias.

## Abrir y regenerar

1. Después de integrar y verificar ambos componentes (catálogo y lector), desde la raíz: `python3 scripts/build-epub-resource-catalogue.py`. La regeneración real corresponde al orquestador; las pruebas usan planificación pura o destinos temporales aislados.
2. Abrir `resources/epub/index.html` directamente como archivo local. JSON, CSS y JavaScript van integrados: no hay `fetch`, CDN, framework ni servidor obligatorio.
3. Usar los contadores enlazados: **57 vídeos EPUB**, **56 fuentes del curso**, **100 vídeos en la unión** o **1.732 imágenes seleccionadas**. Cada vídeo tiene una sola tarjeta por ID con todos sus contextos, qué referencia describe y offsets; los ámbitos no se mezclan sin indicarlo. Cambiar de vista desde un contador restablece los filtros para mostrar el conjunto completo. Después se puede buscar por técnica, libro o capítulo y filtrar por estilo, vídeo e imagen.
4. En Imágenes, todas las tarjetas incluyen información, SHA-256, procedencia y enlaces al **original del libro** y al contexto. La imagen pequeña es sólo presentación CSS del original, no un archivo derivado. Abrir una imagen: título, libro, capítulo, miembro y hash acompañan el visor. Anterior/siguiente y flechas recorren la sección filtrada; Escape cierra y devuelve foco al activador. El diálogo bloquea el desplazamiento del fondo.
5. Para vídeos remotos, pulsar primero el visor y después **Cargar vídeo remoto**. Sólo entonces se contacta el dominio de privacidad mejorada de YouTube con un ID individual.
6. Las decisiones Conservar/Proponer retirar no borran archivos ni cambian la aplicación. Exportarlas a JSON antes de cerrar: sólo están en memoria.

Todo el contenido de las tarjetas, las etiquetas JSON resaltadas, las descripciones del curso y las políticas ya está en el HTML inicial; no hay «Mostrar más», lotes posteriores ni bloques desplegables cerrados. Los filtros sólo ocultan elementos existentes. Se permite `loading="lazy"` nativo para los originales, sin retrasar la creación de tarjetas.

Los enlaces de libro, capítulo y miembro abren otra pestaña con `noopener noreferrer`. Cada miembro muestra **sólo su número consecutivo** (orden spine, después documentos restantes); el título accesible conserva libro/capítulo/ruta. Un capítulo apunta a un fragmento o encabezado real del miembro y, si no hay coincidencia, al propio miembro. Las referencias sintéticas del curso no reciben enlaces de libro inventados.

El destino predeterminado es `resources/epub/`. `--output` acepta sólo esa raíz exacta, la raíz histórica `.atl/epub-resources/` o `/Volumes/sdd_1TB/taekwondo-resources/resources/epub`;  no permite directorios arbitrarios, descendientes, traversal ni componentes symlink. Los archivos ya movidos y las 1.619 imágenes existentes se reutilizan sin reescritura, preservando bytes y mtime en nanosegundos. No volver a moverlos ni regenerar imágenes para cambiar de ubicación.

Si un navegador restringe medios `file://`, el servidor opcional debe exponer **sólo** el catálogo (los enlaces al respaldo hermano no estarán disponibles con este servidor limitado; usar `file://` para ellos):

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory resources/epub
```

No servir la raíz del proyecto ni el directorio de EPUB. El generador no inicia servidores.

## Copia externa: ejecutar sólo después de revisión independiente T3

**Estas órdenes son para el padre; implementarlas no acredita que la copia exista.**
El único permiso externo es `/Volumes/sdd_1TB/taekwondo-resources`, ya existente.
El guard exige montaje real, dispositivo distinto del proyecto, ausencia de symlinks
incluidos ancestros y directorios escribibles. Nunca crea el volumen/base ni cae al disco interno.
El `--output` externo exige la cadena exacta de abajo: rechaza `//`, segmentos `/./`
y barra final antes de leer o planificar; no normaliza alias para aceptarlos.

```sh
python3 scripts/external_resource_backup.py copy-resources --dry-run
python3 scripts/external_resource_backup.py copy-resources
# Antes de cada regeneración externa: preservar los derivados mutables actuales.
python3 scripts/external_resource_backup.py snapshot-catalogue --dry-run
python3 scripts/external_resource_backup.py snapshot-catalogue
python3 scripts/build-epub-resource-catalogue.py --output /Volumes/sdd_1TB/taekwondo-resources/resources/epub
```

| Destino relativo a la base externa | Contenido / contrato |
|---|---|
| `books/epub/` | Los siete EPUB originales completos, incluidos CSS, fuentes y todos sus miembros; no sólo lectores saneados |
| `resources/epub/` | Todo el árbol privado actual; referencia histórica: 5.150 archivos / 278.039.140 bytes, no un resultado de esta ejecución |
| `video/epub-backup/` | Archivo independiente T1; enlaces del catálogo `../../video/epub-backup/`, nunca metadatos internos como sustituto |
| `evidence/<operación>-<UUID>/` | Manifiesto SHA-256/tamaño exclusivo; snapshot previo de los cuatro informes raíz y `books/<id>/index.html` mutables |

La copia revisa todos los conflictos antes de escribir; un destino diferente aborta,
uno idéntico se omite sin cambiar mtime. Los nuevos archivos se abren exclusivamente,
se verifican por bytes/SHA-256 y nunca reemplazan archivos del usuario. No se modifican
bytes ni mtime de fuentes. El dry-run sólo lee: no crea directorios, manifiestos,
contadores persistentes ni procesos. Se mide el SSD con reserva de 2 GiB y margen
para evidencia; el catálogo conserva además su presupuesto total de 280 MiB.
Los snapshots son únicos y no reescriben activos ni historial. La regeneración sí
reemplaza derivados mutables: confirmar primero el manifiesto del snapshot.
La pérdida de montaje es fatal, no «respaldo pendiente» exitoso. No hay borrado ni
recuperación automática: una interrupción puede dejar un archivo parcial nuevo que
requiere inspección del padre; no se elimina ni se sobrescribe al reintentar.
Las comprobaciones se repiten antes de I/O, pero no son una transacción atómica
contra desmontaje o sustitución hostil concurrente de directorios: no ejecutar junto
a otro escritor o mientras se desconecta/modifica el árbol. Las mediciones internas
anteriores siguen siendo históricas y nunca prueban éxito externo.

## Presupuesto externo y AppleDouble (recuperación T6)

**El límite sigue siendo 280 MiB de contenido lógico.** Sólo en la salida externa
exacta se separan sidecars AppleDouble comprobados; ni el nombre `._` ni el magic
por sí solos conceden una excepción. No se borra ni modifica ningún sidecar.

El perfil admitido es deliberadamente estrecho: archivo regular sin symlinks,
como máximo 8 KiB, compañero existente regular o directorio hermano, AppleDouble
v2/macOS con tabla exacta FinderInfo/ResourceFork no solapada y dentro del archivo,
reservados FinderInfo válidos, cabecera ATTR y entradas alineadas con nombres
únicos reconocidos (`com.apple.provenance`, `com.apple.quarantine`,
`com.apple.lastuseddate#PS`), rangos contiguos y padding nulo. El resource fork debe
ser el formato vacío de 286 bytes con cabecera y mapa coherentes; no se admiten
forks con recursos. Los valores de atributos no se registran. Otras versiones,
atributos, forks, archivos truncados/falsificados o compañeros ausentes siguen
contando como contenido y pueden impedir la generación; no se omiten por nombre.

| Campo de la estimación externa | Significado |
|---|---|
| `totalBytes` | Contenido lógico final, sujeto a 280 MiB |
| `metadataBytes`, `metadataFiles` | Sólo metadata validada retenida fuera de ese límite |
| `physicalBytes` | Contenido final más todos los bytes de metadata retenida |
| `retainedPhysicalBytes` | Bytes existentes no reemplazados por el plan, incluida metadata |
| `writeBytes` | Escrituras exactas planificadas |
| `metadataHeadroomBytes` | Margen conservador de 8 KiB por archivo que cambiaría |

El espacio libre real del SSD ya descuenta todos los archivos existentes; no se
suman bytes de metadata al espacio disponible. La planificación exige conservar
2 GiB tras escrituras y margen; se mantienen los rechecks anteriores por escritura.
Las salidas interna e histórica mantienen su contabilidad y formato de informe.

### Preflight sólo lectura para el padre, después de aceptación independiente

No ejecutar todavía generación ni suponer que los 5.167 sidecars cumplen el perfil.
Este script propuesto planifica en memoria y muestra sólo contabilidad, sin escribir:

```sh
PYTHONPATH=scripts PYTHONDONTWRITEBYTECODE=1 python3 - <<'PY'
import importlib.util
import json
from pathlib import Path
p = Path('scripts/build-epub-resource-catalogue.py').resolve()
spec = importlib.util.spec_from_file_location('catalogue_preflight', p)
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)
c.OUT = c.validate_output(str(c.EXTERNAL_OUTPUT))
data, files = c.build_catalogue()
print(json.dumps(c.validate_plan(c.OUT, files), sort_keys=True))
PY
```

Si deniega capacidad, conservar todo y comunicar la contabilidad; no borrar,
renombrar sidecars ni ampliar el límite. El chequeo de un único ejemplo no acredita
la clasificación de todos los archivos del SSD.

## Cobertura observada

La generación de esta unidad produjo **840 entradas de fuente**, incluidas referencias de capítulo y conceptos, no 840 técnicas distintas. De ellas, **778 no tienen un vídeo vinculado**; 62 filas con enlaces representan **57 IDs únicos** (Pottle 56; McWhorter 1). Las variantes de nombre y el mismo vídeo en distintos contextos se conservan. No se autoimportan los 57 al curso.

Se leyeron las **224 referencias TOC** y los **570 miembros XHTML del spine**; **511 miembros** se clasificaron como relevantes. Los miembros no equivalen a capítulos: muchas imágenes o continuaciones ocupan un miembro separado, mientras Gold concentra el contenido en uno. En McMillan el NCX sólo contiene Cover: se inspeccionan los encabezados reales del spine.

| Libro | TOC | Miembros leídos / relevantes | Entradas | Imágenes seleccionadas / inventariadas |
|---|---:|---:|---:|---:|
| Gold, teoría ITF | 4 | 2 / 1 | 51 | 74 / 303 |
| Hillson, hyung clásico | 36 | 213 / 203 | 82 | 120 / 124 |
| McMillan, sparring | 1 | 110 / 107 | 78 | 1.312 / 2.843 |
| Woo, Taegeuk | 38 | 164 / 145 | 224 | 120 / 131 |
| Sharp, guía general | 17 | 21 / 13 | 165 | 37 / 39 |
| Pottle, guía práctica | 105 | 33 / 26 | 178 | 62 / 66 |
| McWhorter, entrenamiento | 23 | 27 / 16 | 62 | 7 / 14 |

El curso actual se reconstruye por separado desde las fichas y clips existentes, con ambas locuciones del curso: la instantánea actual tiene **168 asociaciones y 56 fuentes**, incluidos los **13 suplementos** aceptados por muestreo de T1 sobre las 43 fuentes anteriores. La unión con los 57 EPUB sigue siendo **100 fuentes**, con 13 compartidas por incorporación explícita, no por adivinación del catálogo. La generación anterior de 167 asociaciones / 55 fuentes / 12 suplementos queda como dato histórico; el padre regeneró el catálogo tras aceptar Taegeuk 5.

## Selección de contenido e imágenes

- Categorías: patadas, bloqueos, posiciones, manos/brazos, formas, principios, meditación, calentamiento/estiramientos, acondicionamiento, práctica/combate, historia, otros recursos y contexto avanzado.
- Se combinan TOC, capítulos reales, encabezados, terminología Woo, técnicas/combinaciones McMillan, conceptos y movimientos clásicos Hillson y nomenclatura conservadora Sharp/Gold. Los resúmenes del catálogo no transcriben secuencias paso a paso y no se realiza OCR. Los lectores completos sí conservan el contenido estático saneado, exclusivamente para consulta privada local.
- Sólo se afirman correspondencias canónicas con evidencia de movimiento/contexto. Se reutilizan etiquetas en/de/es y descripciones actuales cuando existe correspondencia; se distinguen del resumen original del EPUB. Las variantes ITF, Chang-Hon, hyung clásico, Kukkiwon y los enfoques mixtos/específicos se conservan.
- Cada imagen mantiene bytes originales, miembro ZIP, SHA-256, tamaño, dimensiones y referencias de capítulo/encabezado. **Todos los captions se marcan sin verificar**: una asociación estructural no identifica la técnica dibujada.
- Política declarada: imágenes referenciadas en secciones relevantes; cabecera PNG/JPEG/GIF reconocible; mínimo 96 px por lado y 20.000 px²; relación máxima 8:1; máximo 12 MiB por miembro. Excluye nombres de portada/logo/anuncio y secciones promocionales/biográficas. Valida cabecera y CRC, no todos los píxeles.
- Resultado: **1.732 referencias a imágenes seleccionadas**, con **1.619 SHA-256 distintos**; no son 1.732 originales únicos. Las referencias suman 124.129.700 bytes (118,4 MiB). Se omiten 1.788 de las 3.520 imágenes inventariadas por razones explícitas en la auditoría. En McMillan, 1.527 se excluyen por tamaño/tira y cuatro por nombre decorativo/sección irrelevante. No se afirman 2.843 imágenes identificadas ni se reconstruyen tiras.
- Puede quedar alguna foto contextual/decorativa de tamaño grande; revisar antes de elegir imágenes didácticas. No se presentan fotos de stock como identificación técnica certificada.
- No se corrigen originales blancos mediante sustitución silenciosa. Se confirmó que **McMillan `OEBPS/image_rsrcEP8.jpg`** es idéntica al original: **9.481 bytes**, SHA-256 `63116ce3db98b1147d71d606f09ec606fcfa893ea4c183401446a8d2bc076c12`. Su blanco/borde pertenece al original; no demuestra la causa de todas las demás imágenes blancas.
- El presupuesto de **280 MiB se aplica a toda la salida**, incluidos lectores, originales, copias seleccionadas, informes y archivos preexistentes retenidos. Antes de cualquier escritura se validan todas las rutas, conflictos archivo/directorio, symlinks, bytes inmutables y la estimación exacta. La capacidad debe cubrir los bytes que realmente se escribirán además de la **reserva de 2 GiB**; se vuelve a comprobar antes de escribir. Los archivos idénticos no se reescriben. No se omiten imágenes por presupuesto para conseguir una generación parcial: si no cabe el plan completo, se rechaza. No hay limpieza automática ni cambios del archivo de vídeo independiente.

## Vídeo: estados que no se deben confundir

| Evidencia | Lo que acredita | Lo que no acredita |
|---|---|---|
| Auditoría previa de 13 prioritarios | Metadatos públicos y permiso de embed declarados | Reproducción completa, disponibilidad futura o revisión de cada movimiento |
| Plan archivador: 100 accesibles | Éxito de metadatos en esa instantánea | Descarga ni respaldo completo; embed de los otros 44 EPUB |
| Muestras 240p sin audio | Material de revisión local | Copia completa con audio ni archivo de respaldo |
| Informe T1 actual de 13 suplementos | Muestreo visual del fragmento documentado en `docs/video/epub-supplements.md` | Visionado continuo, audio, certificación técnica o seguridad |
| Taegeuk 5 `qNpQpJLHyUg` | Fallo histórico preservado; reintento específico S8/L25 exitoso, muestra 240p sin audio en `retry-authorized/attempt.json` | La muestra preparada por sí sola no acredita revisión visual, integración ni respaldo completo |
| `backup.status == complete` / `clips[].export.status == complete` y comprobaciones locales | Archivo completo según registro, bytes y SHA-256 válidos | Que un preview sea la fuente entera o que el códec funcione en todos los navegadores |

Se mantienen los inicios originales **159 s** de Taegeuk 6 y **9 s** de Chun-Ji. Los límites de los suplementos actuales aparecen en su sección separada: no reemplazan los offsets de los enlaces EPUB. La playlist Woo `PL5CF4C717FADAC486` consta como inexistente según auditoría previa; no se usa como `videoId`.

El plan histórico `1795025879926142000.json` declaró **30,54 GB requeridos / 5,49 GB libres / reserva 2 GiB**, `allowed: false`; los 5,49 GB son una medición histórica, no actual. S8 ya eligió **`video/epub-backup/`**. T7 copió sólo 201 archivos JSON de auditoría/manifiestos, byte por byte, conservando el historial original, y añadió instantáneas de migración/capacidad sin red. El dry-run anterior observó **7.584.641.024 bytes libres (~7,06 GiB)** para **30.539.091.735 bytes** requeridos; son mediciones históricas. Tras reconciliar offline el nuevo rango 184–226 s, los checks actuales planifican **217 exports** y **30.638.010.135 bytes** requeridos; el dry-run de clips observó **7.446.306.816 bytes libres (~6,93 GiB)**, todavía insuficientes más reserva y margen. No se persistió este cálculo: los dry-runs son de sólo lectura y el padre puede guardar una instantánea nueva con `refresh-offline`. Hay **100 fuentes con metadatos históricos / 0 originales completos / 0 exports completos**. El destino está elegido pero bloqueado por capacidad, no pendiente de otra decisión de ubicación. Esta unidad no descarga, rebaja calidad, borra archivos ni llena el disco.

## Integración con el archivador y esquema

El generador lee una vez la instantánea lexicográficamente más reciente de `video/epub-backup/manifests/*.json` (en salida histórica explícita, conserva el adaptador `.atl/epub-resources/archive/manifests/*.json`), conforme a `docs/video/local-archive.md`. No espera un archivo futuro ni consulta un trabajo activo repetidamente. Regenerar después de cambios de archivo o revisión; el HTML no hace peticiones para actualizarse.

- Manifiesto del archivador: `schema_version: 1`, `sources[]` indexado por `id`; se conservan asociaciones libro/miembro/anchor/offset. El catálogo mantiene el miembro y anchor precedente de sus enlaces propios.
- Sólo `backup.status == complete` o `clips[].export.status == complete` son candidatos. Se rechazan rutas absolutas, traversal, enlaces simbólicos, extensiones ajenas, ausencia, bytes distintos o hash inválido.
- La ruta del registro es estrictamente relativa al archivo, sin `..`, rutas absolutas, escapes URL ni symlinks. Tras validar estado completo, bytes y SHA-256 se construye **por separado** el prefijo de navegador confiable `../../video/epub-backup/<path>` desde el nuevo `index.html`. Python y JavaScript permiten únicamente ese prefijo exacto o el legado `archive/<path>`, no un permiso genérico para traversal. La salida histórica explícita conserva enlaces `archive/<path>`. Nunca se usan archivos de `.atl/epub-video-review` como respaldo.
- La revisión visual se deriva de los clips reales presentes en la aplicación y de su evidencia en `docs/video/epub-supplements.md`, además de una muestra acreditada. El reintento S8 exitoso por sí solo sólo acreditó la muestra; la revisión posterior de T1 aceptó **184–226 s** de Taegeuk 5 y el catálogo actual contiene **13 fuentes aceptadas por muestreo**. No implica visionado continuo ni respaldo completo.
- Antes de presupuestar o ejecutar `backup`/`clips`, el archivador reconcilia offline los rangos actuales con los metadatos guardados. `refresh-offline` permite persistir explícitamente esa actualización; `backup --dry-run` y `clips --dry-run` sólo la calculan en memoria, sin procesos ni cambios de manifiestos. No hace falta repetir 100 consultas remotas para incluir el nuevo fragmento.
- Un export se muestra sólo si cubre el offset/rango solicitado. Su tiempo de reproducción es relativo al clip: una exportación que empieza en 159 s se reproduce desde 0 s, no vuelve a saltar 159 s dentro del clip.
- Se prefieren exports completos aplicables y se distinguen de fuentes enteras. Un MKV original puede no reproducirse en el navegador; se muestra error y fuente remota, sin afirmar compatibilidad.
- El adaptador es opcional: ausencia, esquema incompatible o registros incompletos mantienen «Respaldo pendiente». En salida externa, errores de montaje/I/O son fatales; no se consulta el archivo interno. La planificación nunca satisface el estado completo.

| Salida del catálogo | Contenido |
|---|---|
| `catalogue.json`, `schemaVersion: 1` | `books`, `rows`, `images`, `audit`, `readers`; nombres, resúmenes, tradición, correspondencia, metadatos, revisión atribuida y procedencia; `images[].originalPath` enlaza el original del lector |
| `catalogue-audit.json` | TOC/miembros, selección/omisiones por libro, límites, snapshot/capacidad del archivo y huella |
| `resources.md` | Resumen de cobertura, tablas completas por categoría, galería indexada con enlaces/hash y descripciones del curso separadas |
| `index.html` | Visor autónomo español, filtros, contadores, estados vacíos, diálogos y exportación de decisiones |
| `media/images/*` | Copias seleccionadas originales conservadas sin cambiar bytes/mtime, con nombres por libro/hash |
| `books/<id>/index.html`, `books/<id>/**` | Lectores estáticos completos saneados, TOC y activos originales; sólo los siete IDs autorizados, nunca fuera de `books/` |

El permiso de reutilización local de imágenes fue afirmado por el propietario. Se conserva copyright y **no** se afirma dominio público, licencia CC ni autorización para publicar resúmenes/imágenes. La copia externa explícita puede conservar EPUB privados completos, pero no hay enlaces públicos al libro completo; los lectores HTML completos también permanecen excluidos de publicación. Las afirmaciones médicas/históricas y reglas se atribuyen a la fuente; se omiten instrucciones peligrosas de sumisión, estrangulación, deshidratación, acondicionamiento por impactos o acrobacias autónomas.

## Verificación y revisión pendiente

```sh
PYTHONPATH=scripts PYTHONDONTWRITEBYTECODE=1 python3 -m unittest scripts.test_external_resource_backup scripts.test_epub_resource_catalogue scripts.test_archive_epub_videos scripts.test_epub_html_reader
```

El contrato puro `scripts.epub_html_reader.plan_readers([(book_id, PathEPUB), ...])` devuelve `(manifest, files)` sin escribir. `files` contiene rutas relativas `books/<id>/...` y bytes. `manifest[book_id]` contiene `url`, `members` e `images`; cada miembro conserva `number`, `url`, `anchors` (fragmento original → URL real) y `headings` (`text`, `url`). El generador adapta los siete libros, valida este plan y lo integra con la salida completa antes de escribir. No cambia el estado de los 217 exports del archivador.

La entrada pública del generador y el planificador comparten `safe_archive(source)`: valida **todo el directorio ZIP antes de abrir cualquier miembro** (rutas, colisiones, symlinks, cifrado, cantidad, tamaños y ratio de expansión). Sus lecturas tienen límites explícitos; `.xml(name)` rechaza DTD y entidades antes de ElementTree, incluidos UTF-16/32. El parser histórico usa esta misma puerta para **container, OPF, NCX y XHTML**; no depende de que `attach_readers` se ejecute después. Las regresiones llaman `main()` con EPUB hostiles e instrumentan descompresión, parser y escrituras para demostrar orden, rechazo y conservación de fuentes/datos/contadores. El plan válido debe seguir siendo idéntico byte por byte a la salida aceptada; esta corrección de entrada no requiere regenerar recursos si esa comparación pasa.

Las pruebas offline cubren vistas exclusivas, todos los registros en HTML/DOM inicial, ámbitos 57/56/100, enlaces numéricos y originales, escape del marcado estático y JSON (incluido `</script>`), presupuesto total y reserva exactos, preservación de bytes/mtime, integración con el plan real de siete libros y spine/TOC, asociación estructural de imágenes, política de selección, guards de miembros y rutas, escape del JSON integrado, IDs/offsets, falta de vídeo, incertidumbre, puerta `complete`, tiempos relativos de clip, estabilidad de IDs, enlaces de informes y hashes de todas las imágenes generadas. Se compara además una imagen de cada libro contra el miembro ZIP original. Las pruebas focales ejecutan también la puerta real de rutas JavaScript con Node y el catálogo nuevo renderizado desde el código actual y el plan real de lectores en un directorio temporal `file://` con Chrome aislado, sin red; no regeneran `resources/epub/`. No requieren repetir las suites/lint/build de la aplicación.

La regresión focal T6 usa el módulo aislado `.atl/browser-verification/node_modules/playwright-core/index.mjs` y Chrome instalado con sandbox, sobre `file://` y contexto offline. Reprodujo RED (Tab del último control de imagen dejaba foco en BODY) y pasó GREEN tras una única corrección: Tab/Shift+Tab en imagen, vídeo, iframe/control dinámico local, uno/cero controles; también flechas, Escape, retorno de foco, restauración del scroll y Tab normal con el diálogo cerrado. Los candidatos de foco se recalculan y excluyen controles ocultos/deshabilitados; sustituir el botón de carga mantiene el foco. La nueva regresión sobre todas las tarjetas también detectó que el evento nativo `close` podía llegar después de comprobar la restauración del scroll: el cierre ahora restaura scroll/foco sincrónicamente y conserva el manejador idempotente del evento. Esta prueba necesita ese runtime preparado por el orquestador y no carga un iframe remoto real. Ejecutar las pruebas con `PYTHONDONTWRITEBYTECODE=1` evita nuevos artefactos de bytecode.

No se afirma prueba visual completa del visor: el orquestador debe comprobar `file://`, móvil/escritorio, filtros, galería filtrada, teclado/foco, error de medios y la carga remota explícita en su runtime aislado. Usar sólo el catálogo local, nunca servir EPUB ni raíz del proyecto. Ningún archivo multimedia o catálogo local se debe incluir en un commit o publicación.
