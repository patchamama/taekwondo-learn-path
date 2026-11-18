# Find concept readings from the course

**Concepts & practice / Konzepte & Praxis / Conceptos y práctica** opens the existing ten-topic reading page at `#/concepts`, in the selected app language. Lesson introductions and every belt study page now link to these readings without changing assessment or progression.

## Quick path

1. Open the persistent reading navigation row immediately below the existing app header, or open a lesson introduction or **Study / Lernen / Estudio**.
2. Follow a topic link. For example, `#/concepts#meditation` opens optional meditation; `#warmup-mobility`, `#stretching` and `#conditioning` identify separate exercise readings within that route.
3. Use the existing Path or Study navigation to continue the course. Reading is not a completion requirement and awards no XP, stars or belts.

## Integration seams

| Surface | Connection |
| --- | --- |
| App | Named `ConceptsPage`, no props; nested route and persistent, wrapping navigation row. Existing Layout/header links stay unchanged. |
| Lesson introduction | Relevant links selected from actual card kinds/groups and IDs: action/technique → purpose, stance → movement, macki → blocks, form → patterns, theory/basic/command → principles. Practice habits and optional preparation remain available. Existing tip, cards and Start button remain. |
| Belt study | Concept/purpose links plus a visibly separate optional preparation group with individually named meditation, warm-up, stretching and conditioning links. Existing belt links, cumulative checkbox, practice link, content and exports remain. |
| Standalone page adapter | `ConceptReadingRoute` converts native topic fragments to HashRouter-safe `#/concepts#topic` hrefs before paint. Normal activation uses router navigation; modified/new-tab activation retains a valid URL. Known topic hashes scroll on entry/navigation; repeated activation scrolls again. The authored component and all its paragraphs remain unchanged. |
| Localization | Integration labels use `useT`; topic labels reuse `Concept.title: Loc`. Language changes preserve topic identity. No duplicated long prose or new dependencies. |

The adapter intentionally lives in `src/App.tsx`: the standalone reading component and shared Layout are outside this unit's edit surfaces. Its native `#topic` links would otherwise be interpreted as new HashRouter paths. If the reading component's navigation contract changes, revisit this boundary adapter.

## Coverage and invariants

- **S1–S3, S7:** the EPUB-grounded trilingual readings are consumed in the running app, not just stored as reference data. See [source trace and editorial exclusions](epub-concepts.md) and [permission ledger](../epub-sources.md).
- **S6:** movement, technique purpose, blocks, patterns, principles, practice habits and separate exercise topics are discoverable. Every topic is rendered and linked; no unused reading module is introduced.
- **S9:** meditation has an explicitly named topic and a separate preparation group alongside warm-up, stretching and adaptable exercises. Existing optional/safety prose is retained, not weakened or copied into quiz prompts.
- No curriculum IDs, store implementation, answer sets, exercise generators, completion counters or belt-earning code changed. Public tests confirm reading/starting and study-toggle interactions do not award progress; existing quiz/progression tests remain in the full suite.
- Mobile structure uses a wrapping navigation row, wrapping lesson links, and one-column study links until the existing `sm` breakpoint. No fixed width is added. This is structural evidence, not a real-device visual check.

## Observed verification

Runner: foreground commands with 30-second timeouts; no timeout occurred.

- RED: `npm test -- --run src/App.test.tsx src/features/learn/LessonPage.test.tsx src/features/study/StudyPage.test.tsx` exited 1: 3 files failed, 10 tests failed / 6 passed. Failures were absent route/navigation and contextual links.
- First implementation check: same command exited 1, 3 failed / 13 passed; a new broad `10 Kup` selector matched two pre-existing links. Corrected once to an exact accessible name.
- Expanded triangulation check: same command exited 1, 4 failed / 18 passed. Existing Techniques has no h1, and Saju is a drill rather than a form; corrected each test assumption once (existing rendered headings; actual `b-taeguk-a` form lesson). No production fix was needed for those failures.
- GREEN: same focused command exited 0: 3 files / 22 tests passed. Covers all three languages, actual lesson-to-route links, all topic URLs, live language switching, direct entry, legacy navigation, contextual stance/form/theory links, locked lessons, Start, study cumulative toggle, existing diagrams and exports.
- `npm test -- --run` exited 0: 35 files / 172 tests passed in 4.33 seconds. Previously reported concurrent media failures did not recur in this run.

Risk items **3** (shared app/navigation/lesson/study seams) and **6** (language/source/instructional safety) remain for the parent's independent final verification. No browser/mobile visual runner, lint or build was delegated here. No CLI or shared parser changed; a differential CLI check is not applicable.
