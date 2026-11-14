# 🥋 Taekwondo Learn

**[English](README.md) · [Deutsch](README.de.md) · [Español](README.es.md)**

> Learn Taekwondo through the Korean words themselves — in English, German and Spanish.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06b6d4?logo=tailwindcss&logoColor=white) ![Tests](https://img.shields.io/badge/tests-Vitest-6e9f18?logo=vitest&logoColor=white)

**Live site:** https://patchamama.github.io/taekwondo-learn-path/ — Protected by a password (ask the maintainer).

## Why this app

Most Taekwondo material is in one language and treats technique names as things to memorise. Here every name is broken into its Korean parts (_olgul_ = face/high + _macki_ = block), so new techniques become guessable. Built for a student coming from karate who trains at Ho-Sin-Sul Berlin e.V.

## Features

- **Learning path** with a belt-by-belt map (10 Kup → 1 Dan), lessons, quizzes, XP and streaks
- **Study (reading) view** per belt, cumulative or only what is new, exportable to **PDF, Word and Markdown**
- **Techniques, forms, terms** with Korean word breakdown, hangul, audio, karate equivalents and the belt where each card first appears
- **Videos and frame strips** per technique, maximizable, plus video quizzes (silent clip → pick the technique)
- **Forms**: Taegeuk (with floor diagrams), Hyong/Tul and master forms (Yudanja)
- **Kukkiwon names** next to club spelling, with notes in three languages
- **Exam rules, Korea facts and Wikipedia background** with sources
- **Self-defence** chapters and a belt filter (slider + "only new at this belt" buttons) on every list

## Quick start

Requires [Node.js](https://nodejs.org) 20+.

```bash
git clone https://github.com/patchamama/taekwondo-learn-path.git
cd taekwondo-learn-path
./start.sh      # macOS / Linux  (Windows: start.bat)
```

## Scripts

| Command                    |                                   |
| -------------------------- | --------------------------------- |
| `npm run dev`              | dev server                        |
| `npm test`                 | unit and component tests (Vitest) |
| `npm run lint`             | ESLint                            |
| `npm run build`            | type-check and production build   |
| `npm run frames -- [course | selfdefense                       | external]` | extract video frames (needs `ffmpeg`, `yt-dlp`) |

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · Zustand (progress in `localStorage`) · HashRouter · Vitest + Testing Library · `docx` for Word export

## Deployment

Every push to `main` runs tests and deploys to GitHub Pages (`.github/workflows/deploy.yml`). The published build asks for a password; this is a deterrent, not real security.

## Content and sources

Content comes from the club's exam PDFs (in `docs/`), the Kukkiwon textbook conventions, Wikipedia (CC BY-SA 4.0, paraphrased with links) and public YouTube videos. Every source and its trust level is listed in [`docs/sources.md`](docs/sources.md). Karate equivalents and generated Kukkiwon spellings are marked as unverified: check with your instructor.

## Notes

Video frames come from third-party videos and are kept for study. Romanisation differs between clubs, Kukkiwon and ITF; the app shows the variants side by side.
