# Local catalogue and clip editor

## Create and manage cards (S14, S16)

With the local editor backend running, the global header offers **New card** and **Hidden cards**.
These controls stay absent when editor health is unavailable. Creation opens a viewport-sized native
`dialog`, with initial close-button focus, native background inertness/keyboard containment, a scrolling
body and persistent actions. Closing restores the opener; unsaved creation input asks for confirmation.
EN/DE/ES interface labels and all three content languages are supported.

Choose hand, foot, stance or combination (techniques), Taegeuk, Hyong or Yudanja (forms), word brick
(morpheme), or term. Each option sends only its schema fields:

- Techniques: localized names, optional localized description (all three languages when provided),
  ordered space-separated brick IDs (repeats allowed), and Karate equivalent (`—` for none).
- Word bricks: group, family and localized meaning. Terms: their own group and localized meaning.
- Forms: move count, localized symbol and meaning; Taegeuk additionally needs Kukkiwon romanization
  and optionally course Keup. Hyong/Yudanja accept source and optional exam Dan (requires exam level 0).
- All kinds require stable globally unique ID, Korean romanization, Hangul and exam level. Creation
  levels are actual Kup numbers 10–1 or 0 for Dan, not the existing edit override's belt index.
  Referenced bricks must already exist; hidden bricks remain valid references. Server validation and
  collision messages are displayed without discarding the draft or attaching media on rejection.

Creation first stores the entity through `createCard`, then attaches an optional video URL and clip
seconds with `addClip` using the returned stable ID. URLs and ranges use the existing API contract;
no downloads, frame regeneration or AI calls occur. If attachment fails, **Card saved; video was not
saved** explicitly identifies the partial save. **Retry video only** never creates another entity.
A session locks the successful creation fields and prevents concurrent or repeated creation submissions.

**Add image…** becomes available only after the entity exists. Choose images from the existing picker,
review/remove the selections, and explicitly **Save images** via the override API. Image failures retain
selections and identify the already-saved card; retries save images only. Media saves are not a combined
transaction. After any writes, **Reload catalogue** updates module/index snapshots; production requires
rebuilding/redeploying the saved data. Do not assume immediate in-place catalogue updates.

Existing card editors include **Hide card** with an explicit **Confirm hide / Keep visible** choice.
Hiding only writes visibility: it never deletes a record or resets saved text, images, clips, progress or
references. Unsaved editor text is not implicitly saved by hiding. **Hidden cards** deliberately lists
hidden built-in/custom records and offers **Unhide**, followed by explicit reload. Ordinary new-video
choices and clip-frame image listings exclude hidden IDs with `isVisible`; reference lookups stay intact.

Automated component tests cover schemas, language fields, collisions/rejections, duplicate-submit guards,
partial media recovery, visibility-only writes, hidden picker filtering, modal structure and focus return.
Native top-layer/Tab/Escape behavior, responsive layout and zoom still need a real-browser check; JSDOM
only mocks `showModal`/`close` and does not prove browser focus trapping or visual fit.

## Clip editing

Open **Edit card** with the localhost editor backend running. The clip section also appears for techniques without video.

- Choose a source clip, play its local original, and use **Mark start / Mark end** without pausing playback. Times are rounded to tenths of a second; numeric fields and the existing ± second controls remain available. **Seek to start** returns to the proposed boundary. The duration is shown beside the source clock. Playback is the full source so marking can extend the old range.
- **Save clips** sends only changed indices. The server merges these into previously saved retimings, preserving other indices and other cards. An explicit empty array still resets that card's retimings. Duplicate indices and ranges collapsing after rounding are rejected before writing.
- **Automatically regenerate frames** is on by default (the previous behavior). Turn it off to save ranges without requiring a local original or FFmpeg. When on, saving extracts six frames for each changed clip; playback uses the new range after reload. This does not encode standalone video files or download sources. A frame-generation error can occur after the range/video has been saved; reload to see the saved data before retrying.
- **Add video** selects an existing technique without video, an HTTPS YouTube watch/shorts/embed or youtu.be URL, and start/end seconds. No arbitrary URLs or downloads are allowed. Times must be finite, between 0 and 100000, and end must exceed start after rounding. It appends to the existing external-clip data format, preserving prior records; existing video associations cannot be replaced this way.
- Source playback streams only an already-local original via `/api/video/source?id=…`, with byte-range seeking. If unavailable or not browser-decodable, enter times manually and disable regeneration. No player retention/cache is implemented here.
- Optional **Translate source text** is enabled only by server health advertising AI. Select EN/DE/ES and enter source text. The existing `/api/ai/translate` service returns the other two languages. Review/edit and copy suggestions into card text fields; suggestions never save automatically. No browser keys, model calls on mount, or automatic source extraction. Japanese remains a supported secondary API target, unchanged.

All clip writes require a localhost Host and `X-Editor: 1`; browser Origin, when supplied, must match the local HTTP origin. Rejected input does not alter stored data. Saving ranges and regenerating frames are separate operations, not a multi-file transaction.

Scope: S8 editing/creation and S10 editor-side translation assistance. Retained cross-card playback, application-wide clip progress/fullscreen, and source acquisition belong to separate work.
