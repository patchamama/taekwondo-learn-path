# Sources of information

Everything the app uses, where it came from and how much to trust it. Videos and frames are third-party material for personal study: the app only embeds YouTube players; extracted frames stay local and git-ignored.

Trust levels: **club** = official club document, **video** = shown/said in the video, **book** = printed Textbook, **mine** = written by the assistant from the above or from general knowledge (verify with the sensei).

## 1. Club documents (Ho-Sin-Sul Berlin e.V., local PDFs in `docs/`)

| File | Used for |
|---|---|
| `HoSinSul-TKD-PO-Pruefungsprogramm_2025-01.pdf` | exam programme per Kup/Dan: techniques, stances, forms, step sparring, theory |
| `HoSinSul-TKD-PO-Formen.pdf` | Poomse vs. Hyong, Taegeuk/Palgwae/Yudanja meanings and move counts |
| `HoSinSul-TKD-PO-Koreanische-Fachbegriffe.pdf` | numbers, commands, body parts, belt names and colours |
| `HoSinSul-TKD-PO-Korea_2025-01.pdf` | history timeline, Choi Hong Hi, geography, key data, flags (page History) |
| `HoSinSul-TKD-PO-Regularien_2025-01.pdf` | exam rules page: scoring, repeats, breaking, preparation times, minimum ages |

Known PDF slips corrected in the app: Pyongwon and Sipjin hangul (the PDF writes 태백 and 싶진; the app uses 평원 and 십진). Details: `docs/curriculum/forms.md`.

## 2. Videos used for clips, frames and chapters

| Video | Link | Use |
|---|---|---|
| Beginners → black belt course, Spanish dub | https://www.youtube.com/watch?v=vQb_6i28QK8 | course clips, chapter map (`docs/video/chapters.md`), captions in `docs/video/transcript-es-*.tsv` |
| Same course, German dub | https://www.youtube.com/watch?v=dnYQ1Y0acrE | same timings; captions in `docs/video/transcript-de-*.tsv` |
| Kukkiwon self-defence compilation (91 min, 69 chapters) | https://www.youtube.com/watch?v=crp_bNCaPqE | self-defence page, Taegeuk and master-form clips (`docs/video/self-defense-course-map.md`) |

Local copies of these videos were used only to find timestamps and to extract frames. The chapter list and course notes that accompany the compilation (README and one note per chapter) were used for the chapter titles; the descriptions in the app are **mine**.

### External example videos (embed only)
Channels and videos for techniques the course does not show (jumping front kick, axe kicks, knife-hand low block, parallel stance, four-direction drills, breakfalls, three-step sparring). Full table with channel, tradition and verification level: `docs/video/external-sources.md` and `external-sources.json`.

Video ids: azqXl4ys3WY, qqlObIyF-tw, p-D4m0rYRvQ, a5rTS4TF9Mg, ekrf7IC3M7o, ZsYCYXvsE6A, JofvBwiKnu0, YG2SdJZKt7w, 5wq3dWNff5s, 5KJhsjbGupg, fd_JU5l3AVE, R0TFrXZLwog, bEBOFNsIsSI, 0Qyq0bJ-KMg, BtO89xZjCuI, KLSIkAwxvnI, sg8DsZ9pDnQ, _l90hPtxjek (all as `https://youtu.be/<id>`).

## 3. Books

- Kim Un-yong (1997), *Taekwondo Textbook*, Kukkiwon, Seoul (English edition). Source of the Kukkiwon names (Revised Romanization), hangul and printed page numbers in `src/data/kukkiwon.json` and `docs/kukkiwon-terminology.md`. Page numbers are **printed** pages; PDF page = printed + 4.
- Bibliography cited by the club PDFs (Kachel 2011, Kang 2016, Kildare) appears in `docs/kukkiwon-terminology.md` where it supported a fact.

## 4. Derived or generated content (verify before relying on it)

| Content | How it was made | Trust |
|---|---|---|
| Kukkiwon-style names of 7 Kup → 1 Dan techniques (119) | mechanical transliteration of the hangul by `scripts/kukkiwon-translit.py` | mine, `unverified` |
| Hangul of 7 Kup → 1 Dan techniques and terms | composed from the course material and the club PDFs | mine; known doubt: paro/pandae |
| Technique descriptions (`info`), lesson tips, theory beyond the PDFs | written from the above and general knowledge | mine; items marked "general knowledge" in the app |
| Karate equivalents | general karate knowledge, approximate, never quizzed | mine, verify with the sensei |
| Clip identities for 7 Kup → 1 Dan | frame montages; see `docs/curriculum/clip-review.md` | 3 confirmed, most plausible, `bituro-chagi` doubtful |
| Self-defence titles and descriptions | from chapter names | mine |
| Study plan and curriculum notes | `docs/study-plan-9-8-kup.md`, `docs/curriculum/*.md` | mine, from the club PDFs |

## 5. Technology

- Korean speech: the browser's Web Speech API (voice quality depends on the installed ko-KR voice).
- Video embeds: YouTube IFrame via `youtube-nocookie.com`.
- Frame extraction: `ffmpeg` and `yt-dlp` run locally by `scripts/extract-frames.mjs`.

## 6. Sister project (Hapkido-Learn)

Built from the same method with videos QPROtyBoPEk (Spanish dub), igKJbAfpW1o and an interview (hjUuPJr0Ec4), plus a NotebookLM notebook (https://notebook.google.com/notebook/e46f4416-b8ba-4e43-b9f3-b4a0af256665). Its own sources are listed in that repository (`docs/notebooklm/`, `AGENT-HANDOFF.md`).

## 7. Web research (second round)

### Extra YouTube demonstrations (embed only)
29 more clips found by a research pass and checked for embedding with yt-dlp: all 24 ITF Hyong forms (mostly the TKDTube channel, Joel Denis; one performer, same hall) plus `oe-santul-macki`, `momdollyo-pandae-dollyo-chagi`, `batangson-an-macki`, `kima-sogi` and `an-palmok-gawi-macki`. Video ids and labels are in `src/data/clips-external.json`. Channels: Academie Grand Lyon; Dr. Jason Han; Exceed TKD (Kukkiwon); Global Fitness & Martial Arts Institute (ITF); Golden Kick Taekwondo Cayman Islands; Juergen Englerth; Lupo Taekwondo (Kukkiwon); Online Taekwondo | Kukkiwon Digital Academy; Rudolf Kang (ITF HQ Korea); Shannon TKD Team (ITF); Sonkal (ITF); Sonkal - Taekwon-Do ITF school; TKD KICKS VT; TKDCoaching.com; TKDTube (Joel Denis); Taekwondo Preschool (Kukkiwon); TaekwondoMika (ITF); Thailand Hapkido Association (other); irishtkdassociation (ITF); kenji1to6 (ITF).
Doubts: the form identity comes from the uploader's title (movements were not counted against the pattern); Se-Yong and Ko-Dang clips show names on screen (not silent-safe); `kima-sogi` and `an-palmok-gawi-macki` are "similar", not exact.

### Drawings (Wikimedia Commons)
The eight Taegeuk floor-pattern diagrams (`public/diagrams/taeguk-N.png`, data in `src/data/diagrams.json`) are by Jim Northrup, licence CC BY-SA 4.0; each card shows author, licence and link. ShareAlike applies to derived images. Not used: CC0 stance SVGs (artwork not checked against the cards) and one AI-generated SVG (unclear basis).

### Not integrated yet
About 100 techniques and combos still have no clip. Wikipedia (ko/en/de/es) facts and long-video subtitles, and the book "Taekwondo perfect" (Kim and Gil), are being researched; they are added here when verified.
