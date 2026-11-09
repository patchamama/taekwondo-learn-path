#!/usr/bin/env node
// Extracts FRAMES_PER_CLIP evenly spaced stills per technique clip from the course video.
// Needs yt-dlp and ffmpeg on PATH. Output: public/frames/<cardId>/1.jpg ... N.jpg (git-ignored).
// The frames come from a third-party video: keep them for personal study, do not republish.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const VIDEO = 'https://www.youtube.com/watch?v=vQb_6i28QK8'
const FRAMES = 6
const clips = JSON.parse(readFileSync('src/data/clips.json', 'utf8'))
const from = Math.min(...clips.map((c) => c.start))
const to = Math.max(...clips.map((c) => c.end))

const work = join(tmpdir(), 'tkd-frames')
rmSync(work, { recursive: true, force: true })
mkdirSync(work, { recursive: true })

console.log(`Downloading ${from}-${to}s (360p, video only)…`)
execFileSync(
  'yt-dlp',
  [
    '-q',
    '--no-warnings',
    '-f',
    '134',
    '--download-sections',
    `*${from}-${to}`,
    '--force-keyframes-at-cuts',
    '-o',
    join(work, 'seg.%(ext)s'),
    VIDEO,
  ],
  { stdio: 'inherit' },
)
const seg = join(work, 'seg.mp4')

for (const c of clips) {
  const dir = join('public', 'frames', c.cardId)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const len = c.end - c.start - 1 // stay clear of the closing fade
  for (let i = 0; i < FRAMES; i++) {
    // centre of each of N equal slices, so the first/last frames avoid fades
    const t = c.start - from + ((i + 0.5) * len) / FRAMES
    execFileSync(
      'ffmpeg',
      [
        '-loglevel',
        'error',
        '-y',
        '-ss',
        t.toFixed(2),
        '-i',
        seg,
        '-frames:v',
        '1',
        '-vf',
        'scale=320:-1',
        '-q:v',
        '4',
        join(dir, `${i + 1}.jpg`),
      ],
      { stdio: 'inherit' },
    )
  }
  console.log(`✓ ${c.cardId}`)
}
rmSync(work, { recursive: true, force: true })
console.log('Done: public/frames')
