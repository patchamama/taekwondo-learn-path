# Reading exports and card editing

Study uses one export row: choose **Este nivel / Todos los niveles** (localized in
English and German too), then select a file icon. The default is the current
level, not the cumulative reading filter. The current-level export follows belt
navigation; all levels exports the full document. Markdown, Word and PDF icons
have accessible names and native title tooltips, with keyboard focus indicators
and 44px button targets. The row may reflow at narrow widths or increased zoom.

Markdown still downloads `.md`, Word generates `.docx` on demand, and PDF opens
the browser print dialog (choose Save as PDF). Popup-blocked and print hints
remain unchanged. Document builders, file names, serialization and download
helpers are unchanged.

`ExportBar` retains `build` and optional `label`. Optional `compact` renders SVG
icons instead of text; optional `scope` inserts a caller-owned scope control.
Without either, Background, Exam and History keep their original text buttons,
document callbacks and PDF feedback.

## Existing card editor

Editing opens a viewport-sized native modal dialog. The browser makes the
background inert and contains keyboard focus; Close receives initial focus,
Escape cancels the dialog without saving, and focus returns to the opener on
unmount. Closing still discards unsaved input, as with the previous Close action.
The header and save/reset actions remain outside the scrolling body. All text,
translations, belt, image and clip controls retain their existing save APIs.
The nested image picker closes independently without discarding editor drafts.

This slice does not add card creation, deletion or a custom catalogue. A future
creation editor must adopt the maximized presentation separately (S16).

Tests check scope against actual built documents in all three interface languages,
file-icon accessibility, legacy export behavior, editor layout/lifecycle and
existing saves, reset, images and AI translations. JSDOM stubs the native dialog
open/close methods: browser-level Tab containment, Escape key dispatch and visual
scrolling still need interactive browser verification.
