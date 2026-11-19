# Local video archive (not published)

**Start with metadata, not downloads.** This standard-library tool inventories the seven local EPUBs and current application clip data, then estimates capacity. No media belongs in Git or a public catalogue. Earlier free-space readings (including **5.25 GiB** and the plan's **5.49 GB**) are historical, not current capacity. S8 selected **`video/epub-backup/`** inside this repository; its capacity-blocked snapshots remain historical. S1 now explicitly authorizes the exact external archive **`/Volumes/sdd_1TB/taekwondo-resources/video/epub-backup`**; this is a new destination, not a retry or permission to choose another disk. No permission to fill disk or silently choose a lower quality is implied.

## Commands

Run from the repository root. `plan` contacts YouTube for metadata unless dry-run; non-dry `backup` downloads media and `clips` exports it. These require explicit authorization and sufficient whole-job capacity. The T7 implementation only migrated local metadata and refreshed capacity offline; it did not repeat the 100 metadata requests or download/export media.

```sh
# Offline JSON inventory to stdout; no output files or processes:
python3 scripts/archive-epub-videos.py inventory
python3 scripts/archive-epub-videos.py plan --dry-run

# One-time local metadata migration, no network/media (exit 3 if capacity-blocked):
python3 scripts/archive-epub-videos.py migrate-metadata

# Read-only current inventory/ranges + retained metadata + current free-space check:
python3 scripts/archive-epub-videos.py backup --dry-run
python3 scripts/archive-epub-videos.py clips --dry-run

# Explicitly persist the reconciled offline plan/capacity as a NEW snapshot:
python3 scripts/archive-epub-videos.py refresh-offline

# Historical parent command, NOT needed again for migration:
# python3 scripts/archive-epub-videos.py plan --root .atl/epub-resources/archive --timeout 120 --job-seconds 14400

# Read local persisted progress; no network or rehash:
python3 scripts/archive-epub-videos.py status

# Only after reviewing the manifest, estimated sizes, failures and capacity:
python3 scripts/archive-epub-videos.py backup --timeout 1800 --job-seconds 86400
python3 scripts/archive-epub-videos.py clips --timeout 1800 --job-seconds 86400
```

`--root` defaults to `video/epub-backup/` and must remain inside that root or the previously authorized `.atl/epub-resources/archive/`. Descendants of either root remain allowed; other repository paths are not authorized. Symlink components, absolute child paths and traversal are rejected. The only additional root is the exact S1 external archive above (no descendants as CLI roots, siblings, aliases or arbitrary `/Volumes` paths). Any other disk requires a **new explicit human authorization and scoped implementation change**; there is deliberately no bypass flag. Do not scan for alternate disks. Use one archive writer at a time; manifests are immutable but this is not a concurrent job scheduler.

`--dry-run` is **process-free and read-only**: no manifests, audits, counters or files change. On `plan` it only prints offline inventory, so it cannot claim a capacity estimate. On `backup`, `clips` or `refresh-offline` it reconciles current authorized inventory/ranges in memory with retained metadata, then calculates the unchanged conservative **whole-job** requirement against current free space. A capacity block returns **3**, not a download failure. `status` reads persisted counts only; it does not reconcile or refresh capacity.

`refresh-offline` (without dry-run) explicitly appends one new immutable snapshot with the reconciled ranges, inventory SHA-256, timestamp, pending metadata IDs, and current capacity (`capacity_checked_at`, `capacity_basis`, `destination`). It never launches processes, queries metadata or performs media actions. Run this to persist new accepted ranges without repeating 100 network metadata queries. Migration deliberately rejects `--dry-run`; use `refresh-offline --dry-run` to inspect an already migrated destination.

`migrate-metadata` copies only `audit/*.json` and `manifests/*.json` from the legacy root, byte-for-byte. Existing destination files must match exactly; any unknown/conflicting bytes stop migration before copies begin. Source history is preserved. No media or review samples are moved. It appends a new snapshot with migration provenance and current capacity; historical argv, failures and disk measurements are never rewritten. Migration has only two fixed pairs: legacy → exact internal default, or exact internal default → exact S1 external archive. There is no arbitrary source/destination flag. Each copied file is verified byte-for-byte after exclusive creation; identical destination files are skipped without mutation, and all conflicts are checked before writes. Keep a single writer active.

## External SSD: parent-only execution after independent Risk2 review

The following are **instructions, not executed operations or completion evidence**. Keep one archive writer active. The external volume must be mounted on a different device from the repository, with the authorized `taekwondo-resources` base already present and writable. The tool never creates the mount/base. Shared guards reject symlinks, aliases, traversal, device substitution and mount loss before I/O, capacity checks and subprocess dispatch; process polling stops the process group on mount loss. It never falls back internally. Device/path checks are not a filesystem lock: physical removal or adversarial replacement between checks remains an OS-level race.

```sh
# Explicit migration of EXISTING internal JSON history only; no media/network:
python3 scripts/archive-epub-videos.py migrate-metadata --root /Volumes/sdd_1TB/taekwondo-resources/video/epub-backup
# Retain the old internal 7.43 GB snapshot; append fresh external capacity/ranges:
python3 scripts/archive-epub-videos.py refresh-offline --root /Volumes/sdd_1TB/taekwondo-resources/video/epub-backup
# Read-only, process-free checks against the external filesystem:
python3 scripts/archive-epub-videos.py backup --dry-run --root /Volumes/sdd_1TB/taekwondo-resources/video/epub-backup
python3 scripts/archive-epub-videos.py clips --dry-run --root /Volumes/sdd_1TB/taekwondo-resources/video/epub-backup
# Only after independent review and explicit parent execution authorization:
python3 scripts/archive-epub-videos.py backup --root /Volumes/sdd_1TB/taekwondo-resources/video/epub-backup --timeout 1800 --job-seconds 86400
python3 scripts/archive-epub-videos.py clips --root /Volumes/sdd_1TB/taekwondo-resources/video/epub-backup --timeout 1800 --job-seconds 86400
python3 scripts/archive-epub-videos.py status --root /Volumes/sdd_1TB/taekwondo-resources/video/epub-backup
```

External metadata writes have their own capacity gate: **2 GiB reserve + 256 MiB headroom + exact new bytes**, checked before any metadata directory/file creation and again at write boundaries. Migration preflights the sum of missing history files plus the exact serialized new checkpoint; byte-identical history costs zero new bytes and is never rewritten. This metadata-only gate does **not** require the ~30 GB media budget. The checkpoint can truthfully report media capacity blocked (exit 3) even when metadata migration itself fits and succeeds. In contrast, a metadata-reserve denial prints `Archive error: External metadata capacity denied: reserve/headroom required; no further writes`, exits 3, and does not append a capacity snapshot or create destination directories/files. If space disappears mid-migration, further writes stop; previously copied, byte-verified files remain without deletion. There is no rollback or retry. External JSON serialization is bounded to 12 MiB; migration history is bounded to 4096 files / 256 MiB. Internal/legacy JSON-write behavior is unchanged.

Migration retains immutable historical JSON (the existing 201 files are a historical inventory, not a hard-coded count). It does not rewrite historical argv, capacity readings or attempts. Missing/invalid source manifests fail closed; no fabricated accessible/completed sources. `refresh-offline` reconciles retained metadata into the current **100-source / 217-range** plan and appends state without clearing later failures/retry blocks. Only verified complete original/export records can be reused. Migration is not authorization to retry a timeout. Existing private media are not migrated by this metadata-only command.

Download templates, fragment/temporary paths, ffmpeg outputs, probes and audit/manifests use the external archive. Media subprocesses use external `cwd` and `TMPDIR`/`TMP`/`TEMP`; yt-dlp also explicitly sets its temporary directory to external `originals/` (or the fresh explicit retry attempt's own `temp/` directory). There is no ~30 GB internal staging step. The initial ~627 GB external free-space reading is historical too: fresh `refresh-offline` and dry-runs measure that mounted filesystem. Capacity reserve/headroom, 720p ceiling, conservative estimates and zero automatic retries remain unchanged. A persisted `status` count is not fresh media verification or completion evidence.

## Bounded recovery: first full-backup attempts only

`backup --unattempted-only` is additive and **backup-only**; other actions reject it before archive I/O. Default backup and all clip behavior are unchanged. It is not a retry switch. It selects accessible sources with **no `backup` key at all** and no true/unknown retry state or unknown prior-attempt evidence. Empty, null, complete, incomplete, blocked and unknown backup records are all excluded without mutation. Attempt-named fields, `prior_failure`, `retry_resolution`, `backup_history` and `prior_backup` conservatively block selection; only the exact resolved S8/L25 review-sample evidence for `qNpQpJLHyUg` is recognized as **not** a full-backup attempt. No retry flags or old failure/partial files are cleared.

```sh
# Parent only, after independent recovery acceptance; read-only/process-free:
python3 scripts/archive-epub-videos.py backup --unattempted-only --dry-run --root /Volumes/sdd_1TB/taekwondo-resources/video/epub-backup
# Parent only, after reviewing the exact selected/skipped IDs and capacity:
python3 scripts/archive-epub-videos.py backup --unattempted-only --root /Volumes/sdd_1TB/taekwondo-resources/video/epub-backup --timeout 1800 --job-seconds 86400
```

Dry-run reports `unattempted_recovery.selected_ids`, `skipped` IDs/reasons, `attempted_ids`, `outstanding_ids` and `status`, without writes or processes. Actual recovery appends this evidence in immutable manifest snapshots before dispatch and at checkpoints. Skipped source records remain unchanged, including derived clip fields; capacity still budgets the **whole reconciled job**, not just selected downloads. Unknown backup records are conservatively budgeted as absent in an in-memory capacity view only. The first **new** failure stops the invocation, retains audit/partials, and adds its retry block. Device/mount/temp-path, reserve/headroom and metadata-write safeguards remain mandatory.

The parent-verified starting state is 14 complete + one incomplete HTTP 403 source (`8wX0JzYe8n0`) + 85 unattempted. The intended selection is precisely those 85 first attempts; this implementation does not retry the HTTP 403 source, upgrade dependencies or bypass access controls. Even if all selected downloads succeed, the outstanding failed source makes actual recovery return **4 / partial**, not 100/100 success. Dry-run can return 0 for a valid capacity-sufficient plan while reporting partial recorded completion. Clips remain under a separate parent plan. These commands and isolated tests are not evidence of physical recovery completion.

Differential verification is retained in one private scratch script under ignored `.atl/ssd-recovery/`, never in the permanent test suite. Its exact pre-T5 source before-image and SHA-256 document the untracked bootstrap baseline without claiming a `HEAD` version. The comparison executes that before-image with the original script `__file__`, comparing exit/stdout/stderr and snapshots across unchanged public commands against identical changed-range fixtures. Permanent tests retain behavioral regressions only. Only the new flag/help and its explicit sibling rejection are intended interface differences.

## Explicit retry of selected incomplete originals

`backup --retry-source ID` is a repeatable, **backup-only** authorization for one fresh attempt per selected incomplete source in this invocation. It is incompatible with `--unattempted-only`; default commands remain unchanged. All requested IDs must be unique, valid inventory IDs with `backup.status == "incomplete"`, accessible retained metadata, and positive finite duration/size. Complete, absent, blocked and ambiguous backup records are rejected before dispatch. Invalid selections do not write snapshots or launch processes. No old JSON flags are manually reset.

```sh
# Parent only: inspect the exact two authorized failures and whole-job capacity.
ROOT=/Volumes/sdd_1TB/taekwondo-resources/video/epub-backup
python3 scripts/archive-epub-videos.py backup --root "$ROOT" --retry-source 8wX0JzYe8n0 --retry-source xsiqce4w3v0 --dry-run
# Only after independent acceptance and reviewing the exact read-only selection:
python3 scripts/archive-epub-videos.py backup --root "$ROOT" --retry-source 8wX0JzYe8n0 --retry-source xsiqce4w3v0 --timeout 1800 --job-seconds 3600
```

Dry-run reports `explicit_retry_recovery`: selected/skipped IDs, prior selected states, authorization basis, attempted/outstanding IDs and recorded completion. It does not imply a successful download. Real execution checkpoints authorization/prior state before dispatch. Each selected source appends `full_backup_retries` with the previous backup record and retry guard, attempt ID, path, audit and status. A new exclusive `originals/retry-<ID>-<nanoseconds>/` directory holds that attempt's output and `temp/`; collisions abort without fallback. `--no-continue --no-overwrites` prevents resuming or replacing old partials/unverified finals. No previous file or history is moved, deleted or overwritten.

Completion requires successful process, the existing video-height ceiling/duration checks, positive byte count and SHA-256. Only then is the new verified path active, with a scoped `full_backup_retry_resolution`; historical review resolution and failure evidence remain. A failed new attempt retains its audit/partial files and retry block; the first failure stops the invocation, without restarting it or automatically attempting another source. If the second ID was not reached, any separate invocation must first review the evidence and select **only** the still-authorized, unattempted ID; never relaunch an attempted ID under the same round. A later failure cannot be cleared by an earlier success record.

All unselected source records and **all clip records, including selected sources' clips**, remain unchanged. The in-memory budget still covers the whole current reconciled job, plus attempt metadata/temp headroom; reserve, external metadata gates, mount checks and process-group protections remain. A retry preflight capacity denial returns 3 without snapshots/directories/processes. The commands above do not authorize clips, upgrades, authentication/DRM workarounds, publication or further retries. Existing calls already extract from fresh canonical YouTube URLs; neither an old-version warning nor HTTP 403 alone proves the underlying cause. This documentation is not evidence of actual recovery.

## Capacity and truthful quality

- The format selector is `bv[height<=720]+ba/b[height<=720]`: best available **up to** 720p, never a fallback above 720p. Actual selected format IDs/heights remain in the estimate. Lower-than-720p availability is reported, not described as 720p.
- Each selected stream uses `filesize` (also accepts `file_size`), then `filesize_approx` / `file_size_approx`, then `tbr * 1000 / 8 * duration`. Approximate/bitrate estimates are explicitly uncertain. A missing estimate blocks media operations.
- Whole-job planning includes originals, exported clips, merge/intermediate space, retained fragments, uncertainty, **2 GiB reserve plus 256 MiB monitoring headroom**. Originals budget five times the selected-stream estimate; exports budget twice the bounded output estimate. This deliberately overestimates peak storage rather than promising a fit.
- Capacity is rechecked before each operation. Processes are polled at 250 ms intervals and their process group is stopped if free space approaches the reserve. A timeout stops the entire process group. No retries follow a failed operation in the same invocation.
- Exports have an explicit size bound and bitrate ceiling. `yt-dlp` uses a per-stream maximum file size as an additional guard. Unknown/approximate sizes are not guarantees: the monitoring margin cannot protect against another process consuming disk faster than polling. Do not run other large disk jobs alongside this archive.
- No cleanup, media deletion, automatic quality downgrade, or automatic retry is provided. Failed partial outputs remain local and count against subsequent real free-space checks. The tool preserves source streams/fragments with `--keep-video --keep-fragments`; reserve additional space when these are retained.

Metadata processes use `/opt/homebrew/bin/yt-dlp`, `--ignore-config`, `--no-cache-dir`, `--skip-download`, `--dump-single-json`, no playlists, zero network/fragment/extractor/file-access retries, bounded socket/process/job timeouts. There are no cookies, authentication, DRM or regional/access bypasses. `ffmpeg` and `ffprobe` must already be on PATH. Root package dependencies are unchanged.

## Inventory and clip meaning

Inventory parses `COURSE_VIDEOS` and `SELF_DEFENSE_VIDEO` from `src/data/clips.ts`, `clips.json`, active `curriculum/kup*.json` clip arrays, `clips-selfdefense.json` (`sd-` only), and `clips-external.json`. Both course dubs receive the same card ranges. It reads XHTML/XML hrefs and visible URL text directly from all seven EPUB ZIPs without extraction or DRM handling. Stable eleven-character YouTube IDs deduplicate across app and EPUB associations, including concurrent additions of EPUB sources to the external clip table. The expected initial union is 43 app sources + 57 EPUB sources = 100 unique IDs. Playlist/channel URLs are not videos and are not imported.

Each EPUB association preserves book path, ZIP member, nearest preceding anchor ID/name, original URL, href/text origin and start offset. A missing anchor stays null; a nearest preceding anchor is a navigation aid, not a claimed exact fragment match. In particular Taegeuk 6 retains offset **159**, and the Chun-Ji source retains offset **9**. All app card IDs and start/end ranges remain attached to their source.

- `curated-app-range`: uses the application's existing boundaries, **not new technical/exam approval**. The archive tool does not infer new exam content or certify the pre-existing curation.
- `review-preview-not-technically-reviewed`: up to 30 seconds at each uncovered EPUB offset, or from zero when no curated mapping/offset exists. This covers accessible sources without inventing teaching bounds. An out-of-duration range or offset is rejected with an explicit reason; no silent clipping of curated ranges.
- A complete source of at most 30 seconds is reused by path/hash for an exactly whole-source preview, avoiding a hidden duplicate.
- Other clips decode/reencode to avoid keyframe-only seeking. Start/end rounding is frame/audio-dependent; `ffprobe` checks exported duration within 250 ms. Originals are not edited. Source duration must match planned metadata within two seconds. These checks do not establish visual instructional suitability.

The historical review-sample failure for `qNpQpJLHyUg` (Taegeuk 5: timeout after ten seconds, exit 1) remains recorded at `.atl/epub-video-review/qNpQpJLHyUg/download.stderr.log` and in old snapshots. **S8/L25 explicitly authorized resuming this specific review**. Its successful, video-only 240p attempt is recorded in `.atl/epub-video-review/qNpQpJLHyUg/retry-authorized/attempt.json` (502 s / 5,297,610 bytes), not in the backup directory. The tool resolves only that specific historical review failure when this matching authorized success exists, records `retry_resolution` with provenance, and preserves `prior_failure`. This is not a full backup, visual acceptance, or a blanket retry override. Other IDs, other failure actions and subsequent backup failures retain their retry guards; a resolved source cannot clear a later failure automatically. Capacity checks remain mandatory.

### Offline reconciliation before media execution

Both `backup` and `clips` automatically reconcile **before capacity calculation and execution**, even when no explicit refresh has been run. Explicit `--retry-source` uses that reconciled capacity view but restores retained source/clip records before execution; only selected backup/attempt state changes. The saved metadata/audits, original backup records/hashes, prior failures and retry blocks are retained. This path does not resolve retry flags again from S8 review evidence. It derives active specs from current app/EPUB associations and the retained duration, including Taegeuk 5's accepted **184–226 s** excerpt. A positional export key is not identity: records are carried over only for the same source ID, start, end and label, and hash verification still governs actual reuse.

Obsolete specs are retained as `retired_clips` evidence, not active export obligations; no historical files are deleted. Existing EPUB previews at uncovered original offsets remain separately labeled previews, never substitutes for a new curated range. New sources or missing duration/size metadata remain unknown/not-planned and block the whole job with an unknown estimate; no fake accessibility or remote query is introduced. Earlier snapshots remain byte-identical.

## Catalogue reading API (schema version 1)

All generated files stay under the selected root:

| Path | Contract |
| --- | --- |
| `manifests/<nanoseconds>.json` | Immutable progress snapshot. Read the lexicographically latest filename for current state. Updates checkpoint after each source/operation. |
| `audit/<id>-<action>-<nanoseconds>.json` | Full per-process `stdout`, `stderr`, `exit_code`, `timed_out`, optional `capacity_stopped`, elapsed time and exact argv. Metadata stdout contains the entire raw JSON, not just extracted fields. |
| `originals/<id>.mkv` | Default final source after successful process, probe and SHA-256 checks; intermediate stream/fragment files may also exist. |
| `originals/retry-<id>-<nanoseconds>/<id>.mkv` | Fresh explicit retry original; only playable if its active backup record is complete. Old namespaces remain untouched. |
| `audit/<id>-<nanoseconds>-explicit-backup.json` | Exclusive process audit for that explicit attempt; referenced by its retained retry history. |
| `clips/<id>-<key>-<attempt-nanoseconds>.mp4` | Unique export attempt, including failed/incomplete outputs. Never assume file existence means completion. |

A manifest contains `schema_version`, `created_at`, `epub_count`, `sources`, and (after planning) `capacity` and `policy`. Each source has `id`, `url`, `associations`, and after metadata `availability` (`accessible`, `unavailable`, `not-planned`), `duration`, `estimate`, `metadata_audit`, `clips`, or `reason`. Metadata success describes accessibility at planning time only. Unknown estimation does not prove an unavailable video; consult the full audit and reason.

Catalogue consumers should index `sources` by `id`, join their own book/member/anchor rows against `associations`, and render a local media link **only** when `backup.status` or `clips[].export.status` is `complete`. Such records carry `path` (root-relative), `sha256`, `bytes`, `duration`, `verified_at`, and may carry `reused_original`. Paths must resolve inside the same root. Do not expose `incomplete`, `blocked`, `blocked-explicit-retry-required` or `missing-original` records as playable backups. `status` reports persisted counts, not fresh hash verification; backup/clip actions rehash before reuse. Missing/unavailable sources remain in the manifest with reasons and audit pointers. Earlier failure snapshots/audits are never overwritten.

Python readers can use standard `json` and `pathlib`:

```python
root = Path('video/epub-backup')
manifest = json.loads(sorted((root / 'manifests').glob('*.json'))[-1].read_text())
by_id = {source['id']: source for source in manifest['sources']}
# Gate any link on complete status, then validate the relative path under root.
```

### Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Requested action succeeded; offline inventory/dry-plan also returns 0. |
| 2 | Invalid input/path/manifest, missing tool, or local I/O/structural error. A missing executable during metadata is also recorded as source-unavailable and may result in 4. |
| 3 | Explicit capacity block (including unknown size) or job/per-operation deadline; no new media process starts. Previously saved metadata remains; explicit retry preflight denial writes no new evidence. |
| 4 | Partial result: unavailable/unplanned source, failed output verification/process, missing verified original, or prior failure needing explicit retry. |

## Offline verification

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest scripts/test_archive_epub_videos.py scripts/test_epub_resource_catalogue.py
```

Tests use in-memory EPUB fixtures and mocked processes, plus read-only current inventory checks. They never query metadata or download media. Historical metadata succeeded for 100/100 sources; migration retains that evidence without asserting current remote availability. The earlier T7 dry-run observed 0 complete originals and 0 exports, 216 historical planned specs, 30,539,091,735 bytes required, and 7,584,641,024 bytes free (about 7.06 GiB). These are historical measurements before reconciling the newly accepted Taegeuk 5 excerpt. The corrected read-only checks planned **217 specs** across the same **100 metadata sources**, including 184–226 s, and required **30,638,010,135 bytes** for the whole job; the clips dry-run observed **7,446,306,816 bytes free** (~6.93 GiB), exit 3. Original/export complete counts remain zero. Both dry-runs left all 103 persisted manifests and their counters unchanged; the parent can persist this updated plan with `refresh-offline`. Reserve remains 2 GiB plus monitoring headroom. Capacity varies; consult a fresh offline check. No real ffmpeg export or full backup was performed.
