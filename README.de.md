# 🥋 Taekwondo Learn

**[English](README.md) · [Deutsch](README.de.md) · [Español](README.es.md)**

> Taekwondo über die koreanischen Wörter selbst lernen — auf Deutsch, Englisch und Spanisch.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06b6d4?logo=tailwindcss&logoColor=white) ![Tests](https://img.shields.io/badge/tests-Vitest-6e9f18?logo=vitest&logoColor=white)

**Live-Seite:** https://patchamama.github.io/taekwondo-learn-path/ — Passwortgeschützt (beim Betreuer erfragen).

## Warum diese App

Die meisten Taekwondo-Unterlagen sind einsprachig und lassen Technikbezeichnungen auswendig lernen. Hier wird jeder Name in seine koreanischen Bestandteile zerlegt (_olgul_ = Gesicht/hoch + _macki_ = Block), sodass neue Techniken erschließbar werden. Gebaut für eine Schülerin mit Karate-Hintergrund beim Ho-Sin-Sul Berlin e.V.

## Funktionen

- **Lernpfad** mit Gürtelkarte (10 Kup → 1 Dan), Lektionen, Quiz, XP und Serien
- **Lese-Ansicht** pro Gürtel, kumulativ oder nur das Neue, exportierbar als **PDF, Word und Markdown**
- **Konzepte & Praxis** (`#/concepts`): dreisprachige Lesetexte zu Bewegung, Technikzweck, Blocks, Formen und Grundsätzen sowie freiwilliger Meditation, Aufwärmen, Dehnen und anpassbaren Übungen. Kontextlinks stehen in Lektionseinleitungen und der Gürtel-Leseansicht; Lesen verändert weder Quiz-Ergebnisse noch Gürtelfortschritt.
- **Techniken, Formen, Begriffe** mit Wortzerlegung, Hangul, Audio, Karate-Entsprechungen und dem Gürtel, ab dem jede Karte vorkommt
- **Videos und Bildfolgen** pro Technik, vergrößerbar, dazu Video-Quiz (stummer Clip → Technik wählen)
- **Formen**: Taegeuk (mit Laufwegen), Hyong/Tul und Meisterformen (Yudanja)
- **Kukkiwon-Namen** neben der Vereinsschreibweise, mit Hinweisen in drei Sprachen
- **Prüfungsregeln, Korea-Fakten und Wikipedia-Hintergrund** mit Quellen
- **Selbstverteidigung** und ein Gürtelfilter (Regler + „nur neu in diesem Gürtel“) in jeder Liste

## Steuerung für Lernen und Üben

- Der globale Kup-Regler schließt frühere Stufen ein und markiert auch deren Schaltflächen. Eine Kup-Schaltfläche wählt nur diese Stufe; erneutes Anklicken kehrt zur kumulativen Auswahl zurück. Bei einer Einzelstufe springt der Regler zurück, ohne den gewählten Gürtel zu ändern.
- Die Leseansicht hat eine eigene URL-basierte Auswahl, unabhängig vom globalen Filter und gespeicherten Fortschritt. Gürtel- und Leselinks lassen sich in neuen Tabs öffnen.
- Freies Üben funktioniert ohne abgeschlossene Lektionen und folgt dem globalen Kup-Filter. Ein Filterwechsel beginnt eine neue Sitzung; Antworten und Sprachwechsel behalten die aktuelle Sitzung bei.
- Das Zahnrad oben rechts öffnet die Einstellungen. Der dortige QR-Code verweist auf die Website-URL.

## Schnellstart

Benötigt [Node.js](https://nodejs.org) 20+.

```bash
git clone https://github.com/patchamama/taekwondo-learn-path.git
cd taekwondo-learn-path
./start.sh      # macOS / Linux  (Windows: start.bat)
```

## Vokabel-Audio und lokales Backend

Unter **Einstellungen → Vokabel-Audio** erstellst du ein Lern-Audio: das koreanische Wort, 2 Sekunden Pause, dann die Bedeutung in der App-Sprache. Der Gürtelfilter bestimmt den Inhalt (ein Gürtel oder alles bis zu einem Gürtel); am Ende lassen sich die Technikbeschreibungen und der japanische (Karate-)Begriff anhängen.

- `./start.sh` (macOS/Linux) oder `start.bat` (Windows) startet die App **und** ein kleines lokales Backend und öffnet den Browser. Mit dem Backend fügt **ffmpeg** das Audio zusammen, Download als **MP3**. Auf der statischen Seite (ohne Backend) nutzt die Seite WAV.
- Die Clips liegen in `public/audio/` und werden mit `node scripts/generate-audio.mjs` erzeugt. Nach neuen Begriffen erneut ausführen: Es entstehen nur fehlende Clips (oder den Knopf „Audio für neue Begriffe erzeugen“ bei laufendem Backend nutzen). Benötigt `ffmpeg`.
- Stimmen: macOS `say` (Standard unter macOS), Windows-Sprachstimmen, `espeak-ng` unter Linux oder **OpenAI** (`--provider openai`) für besseres Koreanisch. Für OpenAI eine git-ignorierte `.env.local` mit `OPENAI_API_KEY=dein-schlüssel` anlegen; der Schlüssel wird weder eingecheckt noch anderswohin gesendet. `--sample` schreibt 12 koreanische Wörter je Anbieter nach `audio-sample/` zum Vergleich per Gehör.

## Skripte

| Befehl                     |                                     |
| -------------------------- | ----------------------------------- |
| `npm run dev`              | Entwicklungsserver                  |
| `npm test`                 | Unit- und Komponententests (Vitest) |
| `npm run test:release`      | Tests der Build-Versionsmetadaten    |
| `npm run lint`             | ESLint                              |
| `npm run build`            | Typprüfung und Produktions-Build    |
| `npm run frames -- [course | selfdefense                         | external]` | Videobilder extrahieren (braucht `ffmpeg`, `yt-dlp`) |

## Technik

React 19 · TypeScript · Vite · Tailwind CSS · Zustand (Fortschritt in `localStorage`) · HashRouter · Vitest + Testing Library · `docx` für den Word-Export

## Veröffentlichung

Jeder Push auf `main` startet die Tests und veröffentlicht auf GitHub Pages (`.github/workflows/deploy.yml`). Die veröffentlichte Version fragt ein Passwort ab; das ist eine Hürde, keine echte Sicherheit.

Vor jeder App-Veröffentlichung die Version in `package.json` und `package-lock.json` erhöhen und committen: `npm version patch --no-git-tag-version` für Fehlerkorrekturen, `minor` für neue Funktionen. Keine veröffentlichte App-Version wiederverwenden oder erst nach dem Build erhöhen. Frontend-Banner, die erzeugte `version.json` der Website sowie GitHub-Deployment-Job und Zusammenfassung zeigen dieselbe Version. CI veröffentlicht die eingecheckte Version und ändert sie nicht.

## Inhalte und Quellen

Die Inhalte stammen aus den Prüfungs-PDFs des Vereins (in `docs/`), den Kukkiwon-Konventionen, Wikipedia (CC BY-SA 4.0, paraphrasiert mit Links) und öffentlichen YouTube-Videos. Alle Quellen samt Verlässlichkeit stehen in [`docs/sources.md`](docs/sources.md). Karate-Entsprechungen und erzeugte Kukkiwon-Schreibweisen sind als ungeprüft markiert: bitte mit dem Trainer abklären.

Die neuen Lesetexte sind eigene, auf EPUBs gestützte Paraphrasen; siehe [Quellennachweise zu den Konzepten](docs/curriculum/epub-concepts.md) und [EPUB-Quellen- und Genehmigungsübersicht](docs/epub-sources.md). Die von der besitzenden Person erklärte Nutzungserlaubnis ist keine öffentliche Buchlizenz. Übungsbeispiele sind freiwillige Lernhilfen, keine individuelle Gesundheitsberatung.

## Hinweise

Die Videobilder stammen aus Videos Dritter und dienen dem Lernen. Die Umschrift unterscheidet sich zwischen Verein, Kukkiwon und ITF; die App zeigt die Varianten nebeneinander.
