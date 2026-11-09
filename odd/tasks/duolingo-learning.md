# Duolingo-style learning path (10 Kup → 8 Kup)
Objective: gamified trilingual (EN/DE/ES) lessons with Korean TTS and a tiger instructor, up to 8 Kup. Branch: main. Runner: vitest.

## Specs
- S1 "el primer eslabon debe de ser el 10 Kup que es el cinturón blanco" → belts start at 10 Kup (source: Regularien §1.11).
- S2 "tipo avance con el sistema de duolingo" → ordered units/lessons, unlock in sequence, XP, streak, stars, practice mode.
- S3 "un instructor que puede ser algún animal muy referenciado en el korea" → Horangi the tiger gives tips, feedback, recap.
- S4 "integrar algún tts de idioma koreano de calidad" → Web Speech API, best ko-KR voice picked by score.
- S5 "lee los pdfs e integra todo" → terms (numbers, commands, body, training), history timeline, theory quiz from PDFs.
- S6 "hazlo hasta cinturón negro solo rellenando por ahora lo que queremos hacer" → path to 1 Dan, content only to 8 Kup.

- S7 "los equivalentes al karate son como información pero no se debe de preguntar" → karate shown as info only, never quizzed.
- S8 "que no se bloqueen las lecciones ... en configuracion poner un check" → settings checkbox, lessons open by default.
- S9 videos ES/DE → embedded time-ranged clips (no download), silent quiz + name-first quiz, transcripts in docs/video.

## Tasks
- E1 S1 inline – 10 Kup belt, hangul data, cards, theory — v0.2.0 — done
- E2 S2 inline – exercise engine (meaning/recall/listen/build/karate/theory) + tests — done
- E3 S2 inline – progress store, unlock, belt-from-units, streak/XP + tests — done
- E4 S3,S4 inline – Horangi, bubble, SpeakButton, speech lib + tests — done
- E5 S2 inline – LessonPlayer, LessonPage, PracticePage, PathPage integration — done
- E6 S5 inline – TermsPage, HistoryPage timeline, 26 lessons content — done
- E7 S7 inline – remove karate exercise type — v0.3.0 — done
- E8 S8 inline – strictOrder + videoLang settings page — done
- E9 S9 inline – clips data (15 techniques), ClipPlayer, VideosPage, VideoQuizPage + tests — done
- E10 S9 inline – verify clip boundaries (blackdetect + contact sheets), clips.json, frame extraction script, FrameStrip, frames quiz — v0.3.1 — done
- E11 S9 inline – full visual review of the course (chapter map), 6 new clips, 4 missing club techniques added, local-video frames — v0.4.0 — done
- E12 S9 inline – multi-source clips (course / selfdefense / external), ClipViewer tabs, frames per source — v0.5.0 — done
- E13 inline – Taegeuk 1-8 forms (cards, clips, Forms page), Kukkiwon vocabulary, Bonus unit — done
- E14 delegated – YouTube research for missing techniques (11 external clips integrated) — done
- E15 delegated+inline – Kukkiwon documentation, Kukkiwon names page, 22 self-defence clips with studio-only frames — v0.6.0 — done

## Log
- L1 2026-11-09 user: "has commit desde ya. Arregla que el primer eslabon debe de ser el 10 Kup que es el cinturón blanco. Continua con el resto de tareas ... fase 3 y no pares hasta lograr una version funcional ..."
- Correction: earlier claim "no 10 Kup" was wrong; Regularien lists 10. Kup weiß (Mu-Kup).
- Open: videos (phase 4), karate equivalents need sensei review, TTS quality depends on device voices.
- L2 2026-11-09 user: "los equivalentes al karate son como información pero no se debe de preguntar. ... no se bloqueen las lecciones ... check ... Los videos en español: vQb_6i28QK8 y en alemán: dnYQ1Y0acrE ... shorts ... quiz ... subtitulos"
- Finding: both videos are one 100-min course (beginners→black belt), dubbed; auto captions only; clips verified visually for ap-chagi and hansonnal-mok-chicki; others unverified.
- L3 2026-11-10 user: "extraigan fotogramas que puedan mostrar también en algunas partes la técnica con un consecutivo, aparte del video"
- Finding: the course has French title cards between sections; boundaries now taken from black fades. Frames are git-ignored (third-party content).
- L4 2026-11-10 user: "habría que revisar mejor el video pues casi todas las patadas y técnicas están ahí ... no salen en los subtitulos ... tengo una copia ... /Users/mandy/Movies/Hapkido-Taekwondo/Videos"
- Finding: my TECHNIQUES list had omitted 4 PDF items (hansonnal-arae-macki, momtong-hansonnal-packat-macki, sonnal-momtong-kotoro-macki, goduro-packat-palmok-packat-macki). Added.
- L5 2026-11-10 user: "busca en youtube si existen técnicas que no aparecen ... integra el tercer video ... Self Defense ... documenta ... romanización Kukkiwon ... formas taeguk ... subagente Hapkido-Learn ..."
- Finding: narani-sogi is a false friend (club: toes in; Kukkiwon narani seogi: parallel). Self-defence compilation shows technique names on screen (never silent-safe); its Taegeuk chapters show self-defence applications, not the full forms.
