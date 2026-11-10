#!/usr/bin/env node
// Extracts 6 stills per technique clip, favouring the most dynamic moments of the clip.
// Needs ffmpeg (and yt-dlp when no local copy exists). Output: public/frames/<source>/<cardId>/1..6.jpg (git-ignored).
// The frames come from third-party videos: keep them for personal study, do not republish.
//
// Sources: `course` (the dubbed beginners→black belt course) and `selfdefense` (the 720p Kukkiwon-style
// compilation). External YouTube examples are embed-only (no frames).
// Set TKD_VIDEO / TKD_SELFDEFENSE_VIDEO to point at your local copies.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'

const FRAMES = 6
const VIDEOS = join(homedir(), 'Movies/Hapkido-Taekwondo/Videos')
const SOURCES = [
  {
    key: 'course',
    clipsFile: 'src/data/clips.json',
    local: [
      process.env.TKD_VIDEO,
      join(VIDEOS, 'Taekwondo_[dnYQ1Y0acrE].mp4'), // German dub, same visuals as the Spanish one
      join(VIDEOS, 'Taekwondo-spanisch_[vQb_6i28QK8].mp4'),
    ],
    youtube: 'https://www.youtube.com/watch?v=vQb_6i28QK8',
    ytFormat: '134', // 360p video-only
  },
  {
    key: 'selfdefense',
    clipsFile: 'src/data/clips-selfdefense.json',
    local: [
      process.env.TKD_SELFDEFENSE_VIDEO,
      join(VIDEOS, 'Taekowndo - Self Defense_[crp_bNCaPqE].mp4'),
    ],
    youtube: 'https://www.youtube.com/watch?v=crp_bNCaPqE',
    ytFormat: 'bv*[height<=720]',
    skipStart: 7, // every chapter opens with a title card
    studioOnly: true, // keep only demo frames (grey studio), not title/explanation slides
  },
]

// Motion-based picking: sample at PROBE_FPS in low-res grayscale, measure how much each frame differs
// from the previous one, ignore camera cuts (huge jumps) and fades (very dark), and take the most
// dynamic frame of each slice so kicks/blocks show the technique mid-movement, not the preparation.
const PROBE_FPS = 5
const W = 64
const H = 36
const CUT = 40 // mean abs diff (0-255) above which we assume a camera cut
const DARK = 25 // mean brightness below which we assume a fade
const BRIGHT = 180 // mean brightness above which we assume a white title/explanation slide (self-defence compilation)

function probe(seg, startSec, lenSec) {
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
      `fps=${PROBE_FPS},scale=${W}:${H}`,
      '-pix_fmt',
      'rgb24',
      '-f',
      'rawvideo',
      '-',
    ],
    { maxBuffer: 512 * 1024 * 1024 },
  )
  const size = W * H * 3
  const frames = []
  for (let o = 0; o + size <= buf.length; o += size) frames.push(buf.subarray(o, o + size))
  return frames
}

// Luma plus the fraction of "grey studio" pixels (low saturation, mid brightness). The self-defence
// compilation alternates demos in a grey studio with white, navy and gold title/explanation slides.
function analyse(rgb) {
  const luma = new Uint8Array(W * H)
  let studio = 0
  for (let p = 0; p < W * H; p++) {
    const r = rgb[p * 3]
    const g = rgb[p * 3 + 1]
    const b = rgb[p * 3 + 2]
    const l = (r * 299 + g * 587 + b * 114) / 1000
    luma[p] = l
    if (Math.abs(r - g) < 22 && Math.abs(g - b) < 28 && l > 55 && l < 175) studio++
  }
  return { luma, studio: studio / (W * H) }
}

function pickTimes(seg, startSec, lenSec, count, needStudio) {
  const frames = probe(seg, startSec, lenSec).map(analyse)
  const info = frames.map((f, i) => {
    let sum = 0
    for (const v of f.luma) sum += v
    let diff = 0
    if (i > 0)
      for (let k = 0; k < f.luma.length; k++) diff += Math.abs(f.luma[k] - frames[i - 1].luma[k])
    return {
      t: i / PROBE_FPS,
      bright: sum / f.luma.length,
      motion: i > 0 ? diff / f.luma.length : 0,
      studio: f.studio,
    }
  })
  const ok = (x) =>
    x.bright > DARK && x.bright < BRIGHT && x.motion < CUT && (!needStudio || x.studio > 0.5)
  // Spread the picks over the usable frames only, so slides/fades never take a slot.
  const usable = info.filter(ok)
  const pool = usable.length >= count * 2 ? usable : info
  const picks = []
  for (let s = 0; s < count; s++) {
    const lo = Math.floor((s * pool.length) / count)
    const hi = Math.floor(((s + 1) * pool.length) / count)
    // inner 70% of the slice keeps neighbouring picks apart
    const margin = Math.floor((hi - lo) * 0.15)
    const inner = pool.slice(lo + margin, Math.max(lo + margin + 1, hi - margin))
    const best = inner.reduce((a, b) => (b.motion > a.motion ? b : a), inner[0])
    picks.push(best.t)
  }
  return picks
}

function run(source) {
  let clips = JSON.parse(readFileSync(source.clipsFile, 'utf8'))
  if (source.key === 'course') {
    // curriculum slices (7 Kup → 1 Dan) carry their own course clips
    const dir = 'src/data/curriculum'
    for (const f of readdirSync(dir).filter((n) => /^kup.*\.json$/.test(n))) {
      clips = clips.concat(JSON.parse(readFileSync(join(dir, f), 'utf8')).clips ?? [])
    }
  }
  if (clips.length === 0) {
    console.log(`[${source.key}] no clips, skipping`)
    return
  }
  let seg = source.local.filter(Boolean).find((f) => existsSync(f))
  let from = 0
  let work = null
  if (seg) {
    console.log(`[${source.key}] using local video: ${seg}`)
  } else {
    from = Math.min(...clips.map((c) => c.start))
    const to = Math.max(...clips.map((c) => c.end))
    work = join(tmpdir(), `tkd-frames-${source.key}`)
    rmSync(work, { recursive: true, force: true })
    mkdirSync(work, { recursive: true })
    console.log(`[${source.key}] no local copy, downloading ${from}-${to}s with yt-dlp…`)
    execFileSync(
      'yt-dlp',
      [
        '-q',
        '--no-warnings',
        '-f',
        source.ytFormat,
        '--download-sections',
        `*${from}-${to}`,
        '--force-keyframes-at-cuts',
        '-o',
        join(work, 'seg.%(ext)s'),
        source.youtube,
      ],
      { stdio: 'inherit' },
    )
    seg = join(work, 'seg.mp4')
  }

  for (const c of clips) {
    const dir = join('public', 'frames', source.key, c.cardId)
    if (!process.env.FORCE && existsSync(join(dir, `${FRAMES}.jpg`))) continue
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })
    const skip = Math.min(source.skipStart ?? 0, (c.end - c.start) / 2)
    const times = pickTimes(
      seg,
      c.start - from + skip,
      c.end - c.start - skip,
      FRAMES,
      Boolean(source.studioOnly),
    ).map((t) => t + skip)
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
          'scale=480:-1',
          '-q:v',
          '3',
          join(dir, `${i + 1}.jpg`),
        ],
        { stdio: 'inherit' },
      )
    })
    console.log(
      `✓ ${source.key}/${c.cardId}  ${times.map((t) => (c.start + t).toFixed(1)).join(' ')}`,
    )
  }
  if (work) rmSync(work, { recursive: true, force: true })
}

// External YouTube examples: one short download per clip (720p max), frames in public/frames/ext-<videoId>/<cardId>
function runExternal() {
  const clips = JSON.parse(readFileSync('src/data/clips-external.json', 'utf8'))
  for (const c of clips) {
    const dir = join('public', 'frames', `ext-${c.videoId}`, c.cardId)
    if (!process.env.FORCE && existsSync(join(dir, `${FRAMES}.jpg`))) continue
    const work = join(tmpdir(), `tkd-frames-ext-${c.videoId}-${c.cardId}`)
    rmSync(work, { recursive: true, force: true })
    mkdirSync(work, { recursive: true })
    try {
      execFileSync(
        'yt-dlp',
        [
          '-q',
          '--no-warnings',
          '-f',
          'bv*[height<=720]',
          '--download-sections',
          `*${c.start}-${c.end}`,
          '--force-keyframes-at-cuts',
          '-o',
          join(work, 'seg.%(ext)s'),
          `https://www.youtube.com/watch?v=${c.videoId}`,
        ],
        { stdio: 'inherit' },
      )
      const seg = readdirSync(work).map((n) => join(work, n))[0]
      rmSync(dir, { recursive: true, force: true })
      mkdirSync(dir, { recursive: true })
      const times = pickTimes(seg, 0, c.end - c.start, FRAMES, false)
      times.forEach((t, i) =>
        execFileSync('ffmpeg', [
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
          'scale=480:-1',
          '-q:v',
          '3',
          join(dir, `${i + 1}.jpg`),
        ]),
      )
      console.log(`✓ ext-${c.videoId}/${c.cardId}`)
    } catch (e) {
      console.log(`✗ ext-${c.videoId}/${c.cardId}: ${e.message.split('\n')[0]}`)
    } finally {
      rmSync(work, { recursive: true, force: true })
    }
  }
}

// optional filter: `npm run frames -- course`, `-- selfdefense` or `-- external`
// Existing frames are kept; set FORCE=1 to regenerate everything.
const only = process.argv[2]
for (const s of SOURCES) if (!only || only === s.key) run(s)
if (!only || only === 'external') runExternal()
// remove the old flat layout (frames used to live directly in public/frames/<cardId>)
console.log('Done: public/frames')
