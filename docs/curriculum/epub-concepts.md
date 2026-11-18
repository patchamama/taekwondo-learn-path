# Concept readings: source trace and integration contract

Ten original, equivalent English/German/Spanish reading modules connect concepts to purpose and beginner application. The named `ConceptsPage` export consumes `CONCEPTS` directly; it is ready for the later course/navigation integrator, not routed in this unit. Quiz questions are unchanged.

## Integration quick path

- Import `CONCEPTS` from `src/data/concepts.ts`. Each `Concept` has stable `id`, `title: Loc`, `paragraphs: Loc[]`, `sources: ConceptSource[]`, and optional `optional: boolean`. No belt prerequisites are implied.
- Import the **named** `ConceptsPage` from `src/features/concepts/ConceptsPage.tsx`. It uses `useT()` and the existing selected-language store, without props or new dependencies. Topic links target the exact concept IDs.
- Preserve separate discoverable `meditation`, `warmup-mobility`, `stretching` and `conditioning` topics when integrating lessons, study links and manuals. Meditation is optional, with an equally valid non-breath-focused alternative.
- Do not put these paragraphs in `theory.question`; readings and assessment remain separate.

## EPUB evidence

Read directly using Python `zipfile.ZipFile` and `xml.etree.ElementTree`; no EPUB was extracted, rewritten or removed. Below, all members are under `OEBPS/`. Pointers identify discussion context, not endorsement of every assertion in a chapter. Exercises and quantities below are original conservative editorial examples, not copied source prescriptions.

Book keys:

- **sharp**: Clint Sharp, *Taekwondo: A Comprehensive Guide to Tae Kwon Do Techniques…* (supplied filename ending `- Clint Sharp.epub`).
- **pottle**: Bill Pottle & Katie Pottle, *Taekwondo: A Practical Guide to the World's Most Popular Martial Art: 2025 Update*.
- **mcwhorter**: Bryan McWhorter, *Ultimate Tae Kwon Do: A Training Guide for Martial Arts*.

| Concept ID | Book / member | Chapter and relevant headings | Editorial use |
| --- | --- | --- | --- |
| movement | sharp `c84.xhtml`; mcwhorter `cJ8.xhtml` | Ch. 4 Fundamental Movements / The Stances; Ch. Eight How to Train for Form | Base, balance, relaxation, coordinated transitions; accommodate different bodies, not fixed book measurements. |
| technique-purpose | sharp `c84.xhtml`; mcwhorter `c9Y.xhtml`, `cJ8.xhtml` | Fundamental Movements; Ch. Four The Five Components of an Effective Striking Weapon; Ch. Eight Tradition and Technique | Distinguish purpose, pathway, recovery, timing and mechanics; no source force numbers or harmful applications. |
| blocks | sharp `cYG.xhtml` | Ch. 11 The Art of Blocking / Basic Principles; How Blocks Are Classified | Explain line, distance, timing and independent naming dimensions; solo air rehearsal, no impact testing. |
| patterns | sharp `cFT.xhtml`; pottle `cNE_split_001.xhtml` | Ch. 6 The 24 Essential Patterns; Ch. 6 Forms / Why Forms? / Levels of Knowing | Sequence versus quality; distinguish ITF Chang-Hon, traditional Hyung and Kukkiwon Taegeuk, not a merged syllabus. |
| principles | sharp `cJC.xhtml` | Ch. 7 The Five Tenets / Analyzing the Tenets | Turn values into decisions, including boundaries, rest and speaking up. |
| meditation | sharp `cDF.xhtml`; mcwhorter `cYR.xhtml` | Ch. 5 Meditation / Breath and Focus / Mindfulness; Ch. Fourteen Overcoming Fear / Controlling Fear | Optional attention practice, ordinary continuous breathing and external-focus alternative; no clinical/performance promises. |
| warmup-mobility | sharp `c11H.xhtml`; pottle `c2GV.xhtml` | Ch. 12 Stretches and Drills / Different Kinds of Stretches; Stretching | Gradual easy movement and active controlled range; seated/supported alternatives and stopping cues. |
| stretching | sharp `c11H.xhtml`; pottle `c2GV.xhtml` | Ch. 12 / Leg Stretches; Stretching / Stretching Form | Gentle warmed-up stretch; supported calf example, optional approximately 10 seconds per side, release/rest, never forced. |
| conditioning | sharp `c148.xhtml`; pottle `c2D4.xhtml`, `c2GV.xhtml` | Ch. 13 The Taekwondo Habit / Exercise; Ch. 14 Training / Good Vs Bad Pain; Weight Training (Bing Zhao) | Distinguish conditioning from technique and exhaustion; optional 3 controlled chair rises, supported alternatives, recovery. |
| practice | sharp `c148.xhtml`; pottle `c2D4.xhtml`; mcwhorter `c9Y.xhtml` | Ch. 13 / Practice Regularly / Meditate and Visualize; Ch. 14 / Progress Vs Time / Process Vs Outcome; Ch. Four / Have Fun / Repetition Leads to Successes | Feedback loop and small process goals; no fixed repetition quota, competition mandate or pain-based progression. |

## Exclusions and contrasts

Sharp's stance chapter contains conflicting fixed measurements and a blanket ball-of-foot cue; these are not imported. Block labels and mechanics vary by organization, so club terms remain authoritative. The ITF patterns chapter is not treated as a universal form syllabus or a reliable historical fact list (including its Ko Dang/Juche listing).

Sharp's meditation chapter recommends maximal breath retention and makes broad health/performance claims. Both are excluded. Ordinary uninterrupted breathing, optional eyes-open observation and stopping for distress replace those instructions. The tenets chapter's injury-endurance movie examples, absolute obedience, ancient continuity and guaranteed success claims are not taught.

Sharp's stretches include neck pulling, partner back lifts and extreme spinal/leg positions. Pottle's stretching discussion includes stretching beyond pain, PNF and forced end-range positions. None are taught. Pottle's training discussion advocates pushing perceived limits and normalizes pain; the modules instead allow stopping without having to classify pain. No injury treatment, ice protocol, nutrition/weight cutting, immune guarantees, rehabilitation prescription or lifting program is reproduced.

McWhorter's repetition, mechanics and fear chapters are used selectively for attentive practice, purpose and asking for context. Vulnerable-target instruction, weapons, impact-force claims, large daily strike totals, compulsory competition and pressure to ignore fear are excluded. Solo practice is not presented as sufficient for unpredictable encounters.

## Coverage and verification limits

- S1–S3, S6–S7, S9: explanatory concept → purpose → application paragraphs in all three languages; ten individually anchored topics, including separate meditation and exercise categories.
- Same optional quantities in each language: approximately 10 seconds per side for the gentle calf example; 3 chair rises for the conditioning example. Neither is a required dose. Rest, adaptation, normal breathing and stopping limits accompany them.
- Data tests check IDs, source-pointer shape, language fields and substantive paragraph structure. Component tests render every paragraph and anchor in all languages and exercise live language changes. These are structural/rendering tests, not language, medical or safety certification.
- Risk item 6 remains for independent final source, terminology, translation and instructional-safety verification. Course navigation and manual coverage remain later integration work. No new dependencies, shared strings, routes, progression rules or quiz content are changed here.
