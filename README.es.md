# 🥋 Taekwondo Learn

**[English](README.md) · [Deutsch](README.de.md) · [Español](README.es.md)**

> Aprende Taekwondo a través de las propias palabras coreanas — en español, inglés y alemán.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06b6d4?logo=tailwindcss&logoColor=white) ![Tests](https://img.shields.io/badge/tests-Vitest-6e9f18?logo=vitest&logoColor=white)

**Sitio publicado:** https://patchamama.github.io/taekwondo-learn-path/ — Protegido con contraseña (pídela a quien lo mantiene).

## Por qué esta app

La mayoría del material de Taekwondo está en un solo idioma y pide memorizar los nombres de las técnicas. Aquí cada nombre se descompone en sus partes coreanas (_olgul_ = cara/alto + _macki_ = bloqueo), así que las técnicas nuevas se pueden deducir. Hecha para una alumna que viene del karate y entrena en Ho-Sin-Sul Berlin e.V.

## Funciones

- **Ruta de aprendizaje** con mapa de cinturones (10 Kup → 1 Dan), lecciones, quizzes, XP y rachas
- **Vista de lectura** por cinturón, acumulada o solo lo nuevo, exportable a **PDF, Word y Markdown**
- **Conceptos y práctica** (`#/concepts`): lecturas en tres idiomas sobre movimiento, propósito de las técnicas, bloqueos, formas y principios, además de meditación opcional, calentamiento, estiramientos y ejercicios adaptables. Hay enlaces contextuales en las introducciones de lecciones y el estudio por cinturón; leer no cambia los resultados del quiz ni el progreso de cinturones.
- **Técnicas, formas y términos** con desglose de palabras, hangul, audio, equivalentes de karate y el cinturón en que aparece cada tarjeta
- **Vídeos y tiras de fotogramas** por técnica, maximizables, y quizzes de vídeo (clip sin sonido → elige la técnica)
- **Formas**: Taegeuk (con diagramas del recorrido), Hyong/Tul y formas de maestro (Yudanja)
- **Nombres Kukkiwon** junto a la grafía del club, con notas en tres idiomas
- **Reglas de examen, datos de Corea y contexto de Wikipedia** con fuentes
- **Defensa personal** y un filtro de cinturón (barra + botones «solo lo nuevo de este cinturón») en cada lista

## Controles de Estudio y Práctica

- La barra global de Kup incluye los niveles anteriores y también marca sus botones. Un botón de Kup selecciona solo ese nivel; al pulsarlo de nuevo se vuelve al modo acumulado. En modo individual, el control de la barra vuelve al inicio sin cambiar el cinturón elegido.
- Estudio tiene su propio selector basado en la URL, independiente del filtro global y del progreso guardado. Los enlaces de cinturones y lecturas se pueden abrir en pestañas nuevas.
- La práctica libre funciona sin lecciones completadas y sigue el filtro global de Kup. Cambiar el filtro inicia una sesión nueva; responder y cambiar de idioma mantienen la sesión actual.
- El engranaje superior derecho abre Ajustes. Su código QR apunta a la URL del sitio.

## Inicio rápido

Requiere [Node.js](https://nodejs.org) 20+.

```bash
git clone https://github.com/patchamama/taekwondo-learn-path.git
cd taekwondo-learn-path
./start.sh      # macOS / Linux  (Windows: start.bat)
```

## Scripts

| Comando                    |                                             |
| -------------------------- | ------------------------------------------- |
| `npm run dev`              | servidor de desarrollo                      |
| `npm test`                 | pruebas unitarias y de componentes (Vitest) |
| `npm run lint`             | ESLint                                      |
| `npm run build`            | comprobación de tipos y build de producción |
| `npm run frames -- [course | selfdefense                                 | external]` | extraer fotogramas de los vídeos (requiere `ffmpeg`, `yt-dlp`) |

## Tecnología

React 19 · TypeScript · Vite · Tailwind CSS · Zustand (progreso en `localStorage`) · HashRouter · Vitest + Testing Library · `docx` para exportar a Word

## Despliegue

Cada push a `main` ejecuta los tests y publica en GitHub Pages (`.github/workflows/deploy.yml`). La versión publicada pide una contraseña; es un freno, no seguridad real.

## Contenido y fuentes

El contenido viene de los PDFs de examen del club (en `docs/`), las convenciones del Kukkiwon, Wikipedia (CC BY-SA 4.0, parafraseada con enlaces) y vídeos públicos de YouTube. Todas las fuentes y su fiabilidad están en [`docs/sources.md`](docs/sources.md). Los equivalentes de karate y las grafías Kukkiwon generadas están marcados como no verificados: confírmalos con tu instructor.

Las nuevas lecturas son paráfrasis originales basadas en los EPUB; consulta las [notas de fuentes de conceptos](docs/curriculum/epub-concepts.md) y el [registro de fuentes y permisos EPUB](docs/epub-sources.md). El permiso de reutilización declarado por la persona propietaria no es una licencia pública de los libros. Los ejercicios son ejemplos opcionales, no orientación sanitaria individual.

## Notas

Los fotogramas proceden de vídeos de terceros y se conservan para estudio. La romanización difiere entre club, Kukkiwon e ITF; la app muestra las variantes lado a lado.
