#!/usr/bin/env node
// Extracts 6 stills per technique clip from the course video, favouring the most dynamic moments.
// Needs yt-dlp and ffmpeg on PATH. Output: public/frames/<cardId>/1.jpg ... N.jpg (git-ignored).
// The frames come from a third-party video: keep them for personal study, do not republish.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'

const VIDEO = 'https://www.youtube.com/watch?v=vQb_6i28QK8'
const FRAMES = 6
const clips = JSON.parse(readFileSync('src/data/clips.json', 'utf8'))

// Prefer a local copy (better quality, no download). Set TKD_VIDEO to its path. The German dub
// (dnYQ1Y0acrE) and the Spanish one (vQb_6i28QK8) have identical visuals and timing.
const LOCAL_CANDIDATES = [
  process.env.TKD_VIDEO,
  join(homedir(), 'Movies/Hapkido-Taekwondo/Videos/Taekwondo_[dnYQ1Y0acrE].mp4'),
  join(homedir(), 'Movies/Hapkido-Taekwondo/Videos/Taekwondo-spanisch_[vQb_6i28QK8].mp4'),
].filter(Boolean)
const local = LOCAL_CANDIDATES.find((f) => existsSync(f))

let seg
let from
const work = join(tmpdir(), 'tkd-frames')
if (local) {
  console.log(`Using local video: ${local}`)
  seg = local
  from = 0
} else {
  from = Math.min(...clips.map((c) => c.start))
  const to = Math.max(...clips.map((c) => c.end))
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
  seg = join(work, 'seg.mp4')
}

// Motion-based picking: sample at PROBE_FPS in low-res grayscale, measure how much each frame differs
// from the previous one, ignore camera cuts (huge jumps) and fades (very dark), and take the most
// dynamic frame of each slice so kicks/blocks show the technique mid-movement, not the preparation.
const PROBE_FPS = 5
const W = 64
const H = 36
const CUT = 40 // mean abs diff (0-255) above which we assume a camera cut
const DARK = 25 // mean brightness below which we assume a fade

function probe(startSec, lenSec) {
  const buf = execFileSync(
    'ffmpeg',
    [
      '-loglevel',
      'error',
      '-ss',
      startSec.toFixed(2),
      '-t',
      lenSec.toFixed(2),
      '-i',
      seg,
      '-vf',
      `fps=${PROBE_FPS},scale=${W}:${H},format=gray`,
      '-f',
      'rawvideo',
      '-',
    ],
    { maxBuffer: 256 * 1024 * 1024 },
  )
  const size = W * H
  const frames = []
  for (let o = 0; o + size <= buf.length; o += size) frames.push(buf.subarray(o, o + size))
  return frames
}

function pickTimes(startSec, lenSec, count) {
  const frames = probe(startSec, lenSec)
  const info = frames.map((f, i) => {
    let sum = 0
    for (const v of f) sum += v
    let diff = 0
    if (i > 0) for (let k = 0; k < f.length; k++) diff += Math.abs(f[k] - frames[i - 1][k])
    return { t: i / PROBE_FPS, bright: sum / f.length, motion: i > 0 ? diff / f.length : 0 }
  })
  const picks = []
  for (let s = 0; s < count; s++) {
    const lo = Math.floor((s * info.length) / count)
    const hi = Math.floor(((s + 1) * info.length) / count)
    // inner 70% of the slice keeps neighbouring picks apart
    const margin = Math.floor((hi - lo) * 0.15)
    const inner = info.slice(lo + margin, Math.max(lo + margin + 1, hi - margin))
    const slice = inner.filter((x) => x.bright > DARK && x.motion < CUT)
    const best = (slice.length ? slice : inner).reduce(
      (a, b) => (b.motion > a.motion ? b : a),
      inner[0],
    )
    picks.push(best.t)
  }
  return picks
}

for (const c of clips) {
  const dir = join('public', 'frames', c.cardId)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const times = pickTimes(c.start - from, c.end - c.start, FRAMES)
  times.forEach((t, i) => {
    execFileSync(
      'ffmpeg',
      [
        '-loglevel',
        'error',
        '-y',
        '-ss',
        (c.start - from + t).toFixed(2),
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
  })
  console.log(`✓ ${c.cardId}  ${times.map((t) => (c.start + t).toFixed(1)).join(' ')}`)
}
if (!local) rmSync(work, { recursive: true, force: true })
console.log('Done: public/frames')
