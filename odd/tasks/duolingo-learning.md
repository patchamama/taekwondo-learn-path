# Duolingo-style learning path (10 Kup → 8 Kup)
Objective: gamified trilingual (EN/DE/ES) lessons with Korean TTS and a tiger instructor, up to 8 Kup. Branch: main. Runner: vitest.

## Specs
- S1 "el primer eslabon debe de ser el 10 Kup que es el cinturón blanco" → belts start at 10 Kup (source: Regularien §1.11).
- S2 "tipo avance con el sistema de duolingo" → ordered units/lessons, unlock in sequence, XP, streak, stars, practice mode.
- S3 "un instructor que puede ser algún animal muy referenciado en el korea" → Horangi the tiger gives tips, feedback, recap.
- S4 "integrar algún tts de idioma koreano de calidad" → Web Speech API, best ko-KR voice picked by score.
- S5 "lee los pdfs e integra todo" → terms (numbers, commands, body, training), history timeline, theory quiz from PDFs.
- S6 "hazlo hasta cinturón negro solo rellenando por ahora lo que queremos hacer" → path to 1 Dan, content only to 8 Kup.

## Tasks
- E1 S1 inline – 10 Kup belt, hangul data, cards, theory — v0.2.0 — done
- E2 S2 inline – exercise engine (meaning/recall/listen/build/karate/theory) + tests — done
- E3 S2 inline – progress store, unlock, belt-from-units, streak/XP + tests — done
- E4 S3,S4 inline – Horangi, bubble, SpeakButton, speech lib + tests — done
- E5 S2 inline – LessonPlayer, LessonPage, PracticePage, PathPage integration — done
- E6 S5 inline – TermsPage, HistoryPage timeline, 26 lessons content — done

## Log
- L1 2026-11-09 user: "has commit desde ya. Arregla que el primer eslabon debe de ser el 10 Kup que es el cinturón blanco. Continua con el resto de tareas ... fase 3 y no pares hasta lograr una version funcional ..."
- Correction: earlier claim "no 10 Kup" was wrong; Regularien lists 10. Kup weiß (Mu-Kup).
- Open: videos (phase 4), karate equivalents need sensei review, TTS quality depends on device voices.
