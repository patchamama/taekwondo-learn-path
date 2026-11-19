# Pottle EPUB video supplements

## Scope and evidence

Thirteen **supplementary** individual YouTube sources were added to cards that already
have course clips: five basic kicks and Taegeuk 1–8. Nothing was removed,
reordered or made the default. No exam techniques, form levels or progression rules
were added. Taegeuk 5 was appended after the previously accepted twelve sources,
following the explicit S8 retry authorization and S9 continuation; its earlier
unreviewed/omitted state remains historical, not its current status.

Source: Pottle EPUB, members `OEBPS/cJG.xhtml` (kicks) and
`OEBPS/cNE_split_001.xhtml` (forms). Channel for every candidate:
**Korean Academy of Taekwondo**. Original titles/durations below were checked in
local `source.info.json` metadata. This is provenance, not copied book instruction.
Each ID links to `https://www.youtube.com/watch?v=ID`; app embeds use the individual
ID and bounded seconds, never a playlist. The dead Woo playlist is excluded.

### What was actually reviewed

- Local evidence root: `.atl/epub-video-review/`; `review-manifest.json` records
  successful video-only, at-most-240p review samples for 13 sources. Taegeuk 5's
  current entry retains its original failed entry verbatim under `priorAttempts`.
- All 12 six-frame `VIDEO_ID/overview.jpg` contact sheets were visually inspected.
  For every available form, an additional `instruction-window.jpg` was inspected:
  16 frames, approximately ten seconds apart, covering 150–310 s (159–319 s for
  Taegeuk 6). Taegeuk 7 and 8 also have `movement-detail.jpg`, 32 frames about two
  seconds apart from 230–294 s and 200–264 s respectively.
- Additional sheets were extracted offline with bounded ffmpeg calls, using
  `-ss START -t 160 -vf 'fps=1/10,scale=320:-1,tile=4x4' -frames:v 1`
  or `-t 64 -vf 'fps=1/2,scale=280:-1,tile=8x4'`. Read row-major; frame times are
  approximate sampling positions, not frame-accurate cuts. The original twelve
  samples were not downloaded or visually re-audited during the Taegeuk 5 follow-up.
- Taegeuk 5 evidence is under `qNpQpJLHyUg/retry-authorized/`: its six-frame
  `overview.jpg`, a new 20-frame `instruction-window.jpg` (120–320 s at approximately
  ten-second intervals, 5×4 layout), and a new 32-frame `movement-detail.jpg`
  (176–240 s at approximately two-second intervals, 8×4 layout) were inspected.
  Extraction used local ffmpeg only; the denser sheet places Front View near 184 s,
  ready near 186 s, opening blocks/hammerfist actions around 188–194 s, kicks and
  turning hand techniques later, ready near 222 s and bow near 224 s, before the
  By Count transition near 226 s. The selected **184–226 s** window follows those
  observed transitions, not a guessed 160-second offset.
- The actual numbered link in Pottle `OEBPS/cNE_split_001.xhtml` identifies
  `qNpQpJLHyUg` as **Tae Geuk Oh Jang (Form 5)**, alongside Wind symbolism and the
  opening low-block/hammerfist sequence. This agrees with the visible fifth-form
  instruction/movement and the app's `taeguk-5`, Taegeuk O Jang, Wind definition.
- This is **sampled visual evidence**, not continuous viewing, an audio review,
  technical certification, confirmation of every form count, or injury-safety
  approval. Low resolution limits foot/hand detail. Matching uses visible movement,
  written instruction context, original metadata and the app's technique/form
  definitions, not phonetic Korean names alone.
- Metadata has no declared language. English titles, on-screen captions and
  instructional graphics support the English labels; speech was not independently
  listened to because these local review files are video-only. English instruction
  labels describe the source context, not an audited transcript or translation.

## Added sources and boundaries

All bounds are seconds, with `0 <= start < end <= metadata duration`. Short kick
sources retain their sampled demonstration including setup/recovery; longer form
sources deliberately select teaching/performance excerpts rather than treating the
whole metadata duration as a justified endpoint. They need not include an entire
lesson or every movement. Endpoints near visible ready/recovery poses are based on
samples, not continuous playback. Original course clips remain available first.

| EPUB member | Card ID | YouTube ID / original title | Start–end / duration | Visual match and reason for bounds |
| --- | --- | --- | --- | --- |
| `cJG.xhtml` | `ap-chagi` | [aKA3TgYmShY](https://www.youtube.com/watch?v=aKA3TgYmShY) — Front Kick | 0–5 / 5 | Knee lift, forward extension and recovery, repeated facing another direction; matches app Front kick, not a lateral thrust. Entire brief demo retains the action/recovery. English-title demo, not a full course. |
| `cJG.xhtml` | `dollyo-chagi` | [bb7UIJJGcrw](https://www.youtube.com/watch?v=bb7UIJJGcrw) — Roundhouse Kick | 0–18 / 18 | Turned supporting leg/hip and arcing kick to the target; caption explicitly says Back Leg Roundhouse Kick. App Roundhouse kick, not front kick. Includes instructor context, bag/partner examples and final extension. English instruction/demo. |
| `cJG.xhtml` | `yop-chagi` | [pFWrNhumO5k](https://www.youtube.com/watch?v=pFWrNhumO5k) — Side Kick | 0–18 / 18 | Side-facing chamber, lateral extension and rechamber; caption Back Leg Side Kick and instructor demonstration. Matches app Side kick. Entire short instructional montage retained. English instruction/demo. |
| `cJG.xhtml` | `naeryo-chagi` | [ZwAs2lOPlSE](https://www.youtube.com/watch?v=ZwAs2lOPlSE) — Ax Kick | 0–3 / 3 | Raised knee/leg followed by downward leg action and landing; matches app Axe kick. Only a three-second demonstration, **not** a teaching course. English-title demo. |
| `cJG.xhtml` | `düt-chagi` | [kjyvvqcTHh0](https://www.youtube.com/watch?v=kjyvvqcTHh0) — Slow Motion Back Kick | 0–11 / 11 | Turn away, chamber, straight rearward thrust at torso dummy and recovery; not a spinning hook arc. Matches app Back kick. Slow-motion setup through landing retained. English-title demo. |
| `cNE_split_001.xhtml` | `taeguk-1` | [MDrNXuqTeE0](https://www.youtube.com/watch?v=MDrNXuqTeE0) — Tae Guek 1 (TG1) il Jang | 160–240 / 414 | After diagram explanation, ready pose through directional low-block/punch and upper-block passages back toward ready. Simple walking/forward stance work agrees with first Taegeuk context in app forms; avoids later Key Points close-ups. English instruction excerpt. |
| `cNE_split_001.xhtml` | `taeguk-2` | [TkMQSBanLUk](https://www.youtube.com/watch?v=TkMQSBanLUk) — Tae Guek 2 (TG2) EE Jang (ie Jang) | 160–240 / 339 | Ready, turns, middle/high-level arm work and directional form performance, ending around ready before further repeated views. Whiteboard I/EE Jang and school WTF-style description establish second-form context beyond romanization. English instruction excerpt. |
| `cNE_split_001.xhtml` | `taeguk-3` | [CxKala6GhsA](https://www.youtube.com/watch?v=CxKala6GhsA) — Tae Guek 3 (TG3) Sam Jang | 160–300 / 449 | Front-kick chambers/extensions, punch combinations and turning hand/block passages across repeated views, returning to ready. Diagram Sam Jang and third-form school description support the app's Taegeuk 3 match. Includes demonstrations rather than only the earlier board explanation. English instruction excerpt. |
| `cNE_split_001.xhtml` | `taeguk-4` | [m5VPW-gRvAI](https://www.youtube.com/watch?v=m5VPW-gRvAI) — Tae Guek 4 (TG4) Sa Jang | 170–280 / 418 | Guarding knife-hand positions, forward hand thrust/block passages, front kick and directional transitions through ready, before Back View title. Sa Jang diagram plus fourth-form context support the match; detailed hand accuracy not certified. English instruction excerpt. |
| `cNE_split_001.xhtml` | `taeguk-6` | [gzae5gZEgcU](https://www.youtube.com/watch?v=gzae5gZEgcU) — Tae Guek 6 (TG6) Yook Jang | **159–309** / 415 | **Original EPUB 159 s offset preserved.** Tail of Yuk Jang diagram, Front View, high/rising arm positions, turns/kicking passages, and repeated directional performance through ready. Flowing/turning context agrees with app sixth-form definition; no independent reason to replace source offset. English instruction excerpt, not pure performance. |
| `cNE_split_001.xhtml` | `taeguk-7` | [F-kDzz1_oqQ](https://www.youtube.com/watch?v=F-kDzz1_oqQ) — TG7 (Tae Guek 7) | 230–278 / 507 | Front View transition/ready, inward crossed-arm preparations, low/upper arm combinations, front kicks and turning stance passages, ending after return/bow before By Count. Chil Jang diagram and red-belt school metadata distinguish seventh-form context; two-second samples support this window. English instruction excerpt. |
| `cNE_split_001.xhtml` | `taeguk-8` | [pxZQUm5SYjQ](https://www.youtube.com/watch?v=pxZQUm5SYjQ) — Tae Guek 8 (TG8) Pal jang | 200–248 / 476 | Front View/ready, advancing kick sequence, reinforced arm positions, forward strikes and directional turns, returning/bowing before By Count. Pal Jang board and eighth-form description support the match. Samples do not certify the airborne phase of the form's kick sequence. English instruction excerpt. |
| `cNE_split_001.xhtml` | `taeguk-5` | [qNpQpJLHyUg](https://www.youtube.com/watch?v=qNpQpJLHyUg) — Tae Guek 5 (TG5) Oh Jang | **184–226 / 502** | Front View title/ready, low-block and hammerfist-like opening actions, front kicks, lateral kick and elbow/turning hand passages, return to ready/bow before By Count. Numbered Form 5 EPUB link, Oh Jang diagram and source school description jointly support the match to the app's fifth Taegeuk; no full sequence/count certification. English instruction excerpt. |

Every addition is `similarity: "similar"`: the sources are appropriate supplements,
but no club-identical execution, stance convention or grading standard was proven.
App references checked: basic English kick definitions in `src/data/techniques.ts`
and numbered Taegeuk identities/club versus Kukkiwon names in `src/data/forms.ts`.
The school's belt labels do **not** replace the club's exam levels.

## Taegeuk 5 history and safety

The original Taegeuk 5 preparation failed with a network Read timeout at 10 seconds,
download exit 1 and status `download-failed-or-no-media`. It was correctly omitted
from the accepted twelve-source unit; no retry or fallback occurred in that unit.
Those failed logs and raw attempt records remain untouched. The local manifest now
preserves the complete old entry in `priorAttempts` rather than erasing the failure.

The user's S8 **“retoma lo de taegeuk 5”** explicitly authorized a new attempt.
Parent job 17 succeeded (exit 0): duration 502 s, 5,297,610 bytes, video-only at most
240p. Its `retry-authorized/attempt.json`, source metadata/media and overview remain
unchanged. S9 explicitly resumed the interrupted review. The new sample was reviewed
and bounds selected locally before the thirteenth record was appended. No further
network access, download, provider fallback or automatic timeout retry was used.

All 13 additions explicitly use `silentSafe: false`. Named English titles/captions,
instruction context and the incomplete audio review make them unsuitable for silent
identification quizzes. Public `buildVideoRounds` still uses only silent-safe clips;
existing named form recordings likewise do not become safe because of this work.

Previous metadata reported all 13 candidates public and playable in embeds; that is
**not** proof of complete iframe playback, regional availability or future access.
No continuous live YouTube embed playback was tested in this unit. Local sampled
files are ignored review artifacts, **not full backups** or archival proof; no media
or book material is committed or published. Archive and local catalogue delivery are
separate work units. Training should follow the instructor; no unsupervised contact,
height, flexibility or performance recommendation is implied.

## Public behavior verification

`src/data/epubClips.test.ts` exercises `CLIPS`, `CLIPS_BY_CARD`, canonical cards,
`embedUrl`, the real `ClipViewer` source tabs and `buildVideoRounds`. It verifies all
13 mappings/bounds/labels, the unchanged forty-record legacy external prefix, course
defaults, selectable supplement embeds and silent-pool exclusion. Fixed fingerprints
protect both the legacy forty and the full previously accepted fifty-two external
records, including the original twelve supplements; tests never read Git history. Content matching is
manual sampled evidence above, not something those automated checks can prove.

Independent Risk item 6 final verification remains the parent's responsibility.
