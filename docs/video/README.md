# Course video transcripts

Auto-generated YouTube captions (original language), cleaned to `startSec<TAB>endSec<TAB>text`.
Used only to find where each technique is demonstrated (see `src/data/clips.ts`).
Auto captions misspell Korean terms ("Aremaquí" = arae-macki, "Tolio Chagui" = dollyo-chagi, ...).

- Spanish: https://www.youtube.com/watch?v=vQb_6i28QK8
- German: https://www.youtube.com/watch?v=dnYQ1Y0acrE

Both videos are the same course (6011 s) dubbed; timestamps match within ~2 s.
Chapters (Spanish): beginners 48 s · 8th Kup 1708 s · 7th Kup 1962 s · advanced 2227 s · 6th 3081 s · 5th 3346 s · 4th 3643 s · 3rd 3983 s · red 4326 s · 2nd 5119 s · 1st 5537 s.
The course uses another school's terminology: it can differ from the club PDFs.

## Clip boundaries and frames
- Clip ranges (`src/data/clips.json`) sit between the course's black fades (ffmpeg `blackdetect`), so they never include the French title cards ("Les positions", "Les blocages", …).
- `npm run frames` downloads the 360p video-only stream for the clip range (yt-dlp format 134) and extracts 6 evenly spaced stills per technique into `public/frames/<cardId>/1..6.jpg`.
- `public/frames` is git-ignored: the stills come from a third-party video, so keep them for personal study and do not republish them. The app hides the strip (or shows a hint) when they are missing.
- Needs `yt-dlp` and `ffmpeg` installed (`brew install yt-dlp ffmpeg`).
