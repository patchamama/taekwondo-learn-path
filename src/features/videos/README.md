# Clip playback

`ClipPlayer` is the shared excerpt surface used by practice, review, forms and video
cards. It shows elapsed time / clip duration, a progress bar, replay, play/pause
(when `controls` is enabled), and maximize. `ClipViewer` supplies its own maximize
action so its source tabs and frame strip are included as well.

## Retained sources

`playerCache.ts` owns one YouTube IFrame API player per resolved video ID. Existing
language preference resolution is unchanged: an explicit video language wins over
the interface language. Changing timestamps on the same video seeks the existing
player; switching videos retains the old iframe, paused and hidden. Only the most
recently acquired clip owns playback. Unmount releases playback, not the cached
source. Late API events cannot restart an inactive source.

The host stays under a document-level cache for the app lifetime. It is positioned
over the active component's aspect-ratio placeholder on scroll, resize and the
progress clock. The iframe is not moved into a card or modal: reparenting an iframe
can reload its browsing context even if React does not remount it. Maximize moves
the placeholder and shared controls, not the source iframe.

Native YouTube controls and iframe keyboard focus are disabled. Playback controls
stay in the component/modal's keyboard cycle; the positioned iframe is display-only.
Muted practice requests call the API's `mute` before playback and do not offer an
unmute control. Start/end use fractional seconds and are enforced through seeking
and a 50 ms progress clock. This polling is not frame-accurate trimming, and browser
background timer throttling can delay end enforcement. YouTube buffering, keyframe
seeking and autoplay restrictions still apply.

All retained API players are destroyed on `pagehide`, or when the app's `#root` is
emptied or removed. The progress clock, observer and positioning listeners are
removed at the same time. Video data is streamed by YouTube, not downloaded or
persisted by the app. The existing privacy-enhanced embed URL is retained; the
supported IFrame API script is loaded from YouTube once on demand.

## Verification and browser limits

The component tests mock public YouTube API events and methods. They cover source
identity, seek/replay, fractional bounds and progress, mute/autoplay preferences,
inactive-source stopping, late callbacks, maximize identity and teardown. Practice
tests additionally assert that advancing a question pauses and hides its source.

JSDOM cannot verify actual network buffering, autoplay permission, YouTube errors,
visual alignment/stacking, or mobile viewport behavior. Check these in a real browser
before delivery, particularly scrolling and maximizing within other modal surfaces.
