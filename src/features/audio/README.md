# Study audio

## Transport

The icon controls offer Play, Stop, Previous/Next unique term or technique, and backward/forward jumps of **2, 5, 10 and 15 seconds**. Every icon has a localized English, German and Spanish accessible name and native tooltip. Controls wrap on narrow screens and have 44px minimum targets. Unavailable controls are disabled (empty selection, stopped/running state, first/last item, start/end of the timeline).

Previous/Next follows the selection's unique item order, skipping pauses, meaning clips and repeated question/description passes. It plays from that item's first clip. Time jumps and the progress bar instead traverse the entire forward/reverse/description timeline, including pauses and offsets inside recordings. They clamp at zero/end, keep playing if already playing, and only move the marker while stopped. Stop cancels pending progress-bar seeks; Play resumes the marker or restarts at the beginning after completion. Navigation does not clear already revealed cards.

Playback speed offers **0.5×, 0.75×, 1×, 1.25×, 1.5× and 2×**, applies immediately to the active recording and subsequent clips, and scales remaining pauses. Time remains expressed in source-timeline seconds, not speed-adjusted wall time. Missing recordings fall back to browser speech in the clip's language, at the selected rate, without model requests. Autoplay permission failures do not trigger that fallback. The shared Korean speech helper/API is unchanged.

Browser limits: installed speech voices and autoplay policies vary. Web Speech has no reliable intra-utterance time-seek or live-rate API: a seek into a synthesized clip or a speed change while synthesizing restarts that utterance; the timeline still targets the correct clip. Timeline durations use the existing estimates when recorded duration metadata is unavailable. Real-device voice quality, MP3 metadata seeking, keyboard/screen-reader output and responsive appearance require browser verification.

The selected belts and vocabulary/technique options determine the unique items in the review. The counter next to elapsed time and the progress bar shows the current item's position in that selection (`5/20`), not the number of audio clips. Before playback it shows `0/total`; filtering resets playback and the counter, including when the new selection has the same number of clips.

The normal review says Korean, pauses for two seconds, and says the interface-language meaning. The optional Japanese term follows the forward pair only. Bidirectional review completes **all** forward pairs first, then asks all selected items in the same course order with meaning, a two-second pause, and Korean.

When appended descriptions are enabled, they remain **after both question passes**. Each available technique description is introduced by the existing Korean MP3 and the localized meaning, followed by the localized description. The Descriptions chapter starts at this Korean introduction. The technique card and available image remain visible while the description is spoken and after playback ends. Seeking directly into a description also shows its card.
