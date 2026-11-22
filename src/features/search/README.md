# Global search

The magnifying glass immediately before Settings opens a local site-search dialog.
Enter a term in English, German, Spanish or Korean (at least two characters per
search token). Search reuses the assistant's knowledge corpus and relevance ranking,
without sending a question to the assistant or requiring an API. Results are grouped
into vocabulary/techniques, concepts, history, background and exam theory; within
each section they are ranked by relevance. Titles and excerpts follow the interface
language where translations exist. Links open the existing learning pages (cards
open their belt's study page, not a new card-detail route).

The dialog focuses the query field, keeps Tab/Shift+Tab within its controls, and
returns focus to the magnifying glass after Escape, Close, or opening a result.
Clear search resets the input and focuses it again. Empty and unmatched searches
have distinct messages. Search text is not persisted when the dialog closes.

UI copy lives in `copy.ts` for en/de/es without changing shared locale contracts.
The existing wrapping navigation and Settings link are left intact. The overlay
uses a viewport-bounded scrollable results region and 44px-minimum controls.

Automated coverage: `src/shared/components/Layout.test.tsx` exercises the actual
layout and corpus, translated queries, grouping, route activation, empty/no-results,
keyboard/focus management and navigation/settings regression. Real-browser checks
remain necessary for narrow viewport reflow, zoom, virtual keyboards, screen-reader
announcements and visible focus/scrolling through long result lists.
