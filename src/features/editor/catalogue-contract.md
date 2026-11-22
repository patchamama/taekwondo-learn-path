# Custom catalogue integration contract (S14 foundation)

## Storage and lifecycle

`src/data/customCards.json` is explicitly imported, with shape
`{ entries: CustomCard[], hiddenIds: string[] }`. It starts empty: no sample content is silently
added to the deployed curriculum. The local editor atomically persists sorted records/unique hidden
IDs here. It never changes `cardOverrides.json`, clip files, or learner progress when creating or
hiding a card. There is no destructive delete endpoint. Hiding and unhiding both work for built-in
and custom IDs; hidden IDs still reserve their names. Invalid requests do not change stored bytes
or record counts.

All new IDs are caller-supplied, immutable and globally unique across every existing card kind,
including hidden cards, self-defence, Hyong and Yudanja. The backend obtains the real built-in
catalogue through Vite's TS/JSON/glob loader, not an independent hand-maintained list or a
client-provided registry. Custom records are re-read on every write. Built-in IDs are cached for the
backend session; restart after changing built-in source files. Vite uses no env file or project
configuration for this internal load. No video downloads, synthesis, or model calls occur.

## Exact creation schema

The discriminated union `CustomCard` and `CustomCatalogue` are exported from
`src/data/customCards.ts`. Every entry requires:

- `id`: existing editor ID syntax (`validId`), max 80 characters, no paths or `..`.
- `kind`: `technique | morpheme | term | form`.
- `ko`, `hangul`: nonempty strings, max 200 characters, trimmed on save.
- `kup`: integer 0–10, **exam number** (10–1 Kup; 0 = 1 Dan), not a slider index.

Localized objects below always require nonempty `en`, `de`, `es` strings, max 4000 characters
per language; saved strings are trimmed. The server rejects unknown top-level fields.

| kind | Additional required fields | Optional fields |
| --- | --- | --- |
| technique | `category: hand \| foot \| stance \| combo`, `parts: string[]`, `names: Loc`, `karate: string` (use `—` for none) | `info: Loc` |
| morpheme | `group: action \| zone \| direction \| tool`, `family` (below), `meaning: Loc` | none |
| term | `group: sino \| native \| command \| basic \| training \| body \| kukkiwon`, `meaning: Loc` | none |
| form, `system: taegeuk` | `kukkiwon: string`, `moves: integer 1–1000`, `symbol: Loc`, `meaning: Loc` | `courseKeup: integer 1–10` |
| form, `system: hyong \| yudanja` | `moves: integer 1–1000`, `symbol: Loc`, `meaning: Loc` | `examDan: integer 1–9` (requires `kup: 0`), `source: string` (max 1000) |

Morpheme families: `height | direction-axis | in-out | motion | action | stance | tool | target |
reinforce | count | other`.

Technique `parts` may be empty, has at most 30 elements, and may repeat a brick for repeated words.
Every referenced ID must already exist **as a morpheme**, even when hidden. Create new bricks first.
A technique category of `form` is not a creation option: actual forms use the form schemas above.

`adaptCustomCards(entries)` exposes `{ techniques, morphemes, terms, forms, hyong, yudanja }` using
the existing `Technique`, `Morpheme`, `Term`, `Form`, and `Hyong` schemas. Their collections consume
these additions before indexes are constructed. Form `kup` becomes `examKup`, except explicit
`examDan` retains Dan semantics. `customKupOf(id)` makes all custom kinds obey existing belt-index
conversion; existing editor level overrides still take priority. Stored custom levels are never
confused with `CardOverride.kup`, which is a **belt index** 0–10.

## Client and HTTP API

Exports in `src/features/editor/api.ts`:

- `customCatalogue(): Promise<CustomCatalogue>` → `GET /api/cards/custom`, including hidden entries.
- `createCard(entry: CustomCard)` → `POST /api/cards/custom`, response `{ ok: true, entry }`.
- `setCardVisibility(id: string, hidden: boolean)` → `PUT /api/cards/:encodedId/visibility`, body
  `{ hidden }`, response `{ ok: true, id, hidden }`.
- Existing `saveCard(id, override)`, `addClip({ cardId, url, start, end })`, `saveClipRanges(...)`,
  `regenerateFrames(...)`, image import and AI assistance APIs remain unchanged.

Successful responses use HTTP 200; validation errors use 400 `{ ok: false, error }`. Examples:
`Card id already exists`, `Invalid parts`, `Invalid names`, `Invalid kup`, `Unknown card id`,
`Invalid hidden`. Localhost/127.0.0.1 host checks remain mandatory; all writes require `X-Editor: 1`
(the client wrappers supply it). No CORS preflight is enabled. The creation UI must display server
errors rather than assuming success or incrementing its own success counters.

Create the record first, then attach clips/images with its returned stable ID. `POST /api/clips/add`
checks membership in the built-in catalogue plus the current custom records before saving. All
card kinds may receive clips, including morphemes, terms and forms; hidden IDs remain valid lookup
references. Unknown IDs return HTTP 400 `{ ok: false, error: 'Unknown card id' }` without changing
stored files or record counts. Invalid ID syntax still returns `Invalid card id`.
Inline `video` or `clips` fields are deliberately rejected, so the UI must use the established media APIs and their
validation/normalization. Clip creation is a separate save, not a multi-file transaction: if it fails,
the valid new card remains stored and the UI should offer retry. URLs are not downloaded by creation.
For forms, the existing `FormMedia` resolves attached media through the same stable ID.

After writes, reload the page (or offer an explicit reload action). Catalogue imports, indexes and
visibility are build/module snapshots, not a client-side mutation store. Vite reloads changed JSON
in development; production hosting requires rebuilding/redeploying the changed data file. A creation
modal must not promise immediate in-place persistence without a reload.

## Visibility and downstream consumers

`isVisible(id, hiddenIds?)` in `src/data/visibility.ts` is an ID-only pure predicate backed by the
additive hidden list. `CARDS` enumerates visible cards; `ALL_CARDS` and `CARD_BY_ID` retain full lookup.
`MORPHEMES`, `MORPHEME_BY_ID` and type-specific collections intentionally retain hidden content for
references/editor access. Never render those collections as a listing without the predicate or
`useBeltFilter().visibleCard`.

Current foundation coverage:

- Belt-filtered techniques, terms, morpheme groups, Kukkiwon and video pages inherit visibility.
- Forms and self-defence lists filter explicitly.
- Lesson introductions/recaps and practice pools exclude hidden IDs. Custom cards enter the practice
  candidate pool and level reading/export pools without manufacturing synthetic curriculum lessons.
- Exercise distractors and decoy chips come from visible `CARDS`; a dependent technique remains
  studyable, but its build-word exercise is omitted if a required brick is hidden.
- Audio manifest, bot knowledge, search and NotebookLM pack inherit visible `CARDS` enumeration.
- Level reading/export inherits the visibility filter; full lookup remains available for explaining
  decompositions of a visible technique, including references to hidden bricks. There is no cascade.

## Deferred UI / incomplete consumers

Creation/hide controls, maximized modal, localized labels and an unhide management view are not part
of this foundation. They must consume the typed API above rather than writing files themselves.
Two existing editor pickers still enumerate full lookup and are outside this write scope:
`src/features/editor/ClipsEditor.tsx` (`eligible`) and `src/features/editor/ImagePicker.tsx`
(`CARDS_WITH_CLIPS`). The subsequent UI work should apply `isVisible` there unless the picker is an
explicit hidden-record management view. Full-lookup references/decomposition rendering are intentional,
not listings. No automated browser exercise of the future creation UI has been performed.
