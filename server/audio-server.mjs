#!/usr/bin/env node
// Tiny local backend for the vocabulary audio (no dependencies, localhost only).
//   GET  /api/health          → { ok, ffmpeg, provider }
//   POST /api/audio/build     → joins pre-generated clips + silences into one MP3 with ffmpeg
//   POST /api/audio/generate  → runs scripts/generate-audio.mjs (creates clips for new terms)
// Started by start.sh / start.bat; the Vite dev server proxies /api to it.
import { spawn, spawnSync } from 'node:child_process'
import { handleEditor } from './editor.mjs'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')
const PORT = Number(process.env.AUDIO_PORT ?? 8787)
const MAX_BODY = 12 * 1024 * 1024
const MAX_STEPS = 20000
const CLIP = /^audio\/(ko|en|de|es|ja|info-en|info-de|info-es)\/[a-z0-9-]+-[0-9a-f]{8}\.mp3$/

const hasFfmpeg = () => !spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).error
let generating = false

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' })
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > MAX_BODY) {
        reject(new Error('Body too large'))
        req.destroy()
      } else chunks.push(c)
    })
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const ffmpeg = (args) =>
  new Promise((ok, fail) => {
    const p = spawn('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: ['ignore', 'ignore', 'pipe'] })
    let err = ''
    p.stderr.on('data', (d) => (err += d))
    p.on('error', fail)
    p.on('close', (code) => (code === 0 ? ok() : fail(new Error(err.split('\n')[0] || `ffmpeg exit ${code}`))))
  })

/** plan: [{ file } | { silence }] → one mp3 (every clip is 16 kHz mono, so the concat demuxer is safe). */
async function build(plan) {
  if (!Array.isArray(plan) || plan.length === 0 || plan.length > MAX_STEPS) throw new Error('Invalid plan')
  const tmp = mkdtempSync(join(tmpdir(), 'tkd-build-'))
  try {
    const silences = new Map()
    const lines = []
    for (const step of plan) {
      if (step && typeof step.silence === 'number') {
        const s = Math.round(Math.min(Math.max(step.silence, 0), 10) * 10) / 10
        if (!silences.has(s)) {
          const f = join(tmp, `silence-${s}.mp3`)
          await ffmpeg(['-f', 'lavfi', '-i', 'anullsrc=r=16000:cl=mono', '-t', String(s), '-b:a', '24k', f])
          silences.set(s, f)
        }
        lines.push(`file '${silences.get(s)}'`)
      } else if (step && typeof step.file === 'string' && CLIP.test(step.file)) {
        const f = join(PUBLIC, step.file)
        if (existsSync(f)) lines.push(`file '${f}'`) // clips that are not generated yet are skipped
      } else {
        throw new Error('Invalid plan step')
      }
    }
    if (lines.length === 0) throw new Error('No clips available; run the audio generator first')
    const list = join(tmp, 'list.txt')
    writeFileSync(list, lines.join('\n'))
    const out = join(tmp, 'out.mp3')
    await ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-ac', '1', '-ar', '16000', '-b:a', '32k', out])
    return readFileSync(out)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

function generate() {
  return new Promise((ok) => {
    const p = spawn(process.execPath, [join(ROOT, 'scripts', 'generate-audio.mjs')], { cwd: ROOT })
    let output = ''
    p.stdout.on('data', (d) => (output += d))
    p.stderr.on('data', (d) => (output += d))
    p.on('close', (code) => ok({ ok: code === 0, output: output.slice(-4000) }))
  })
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return send(res, 200, { ok: true, ffmpeg: hasFfmpeg(), generating, editor: true })
    }
    if (await handleEditor(req, res, url, { root: ROOT, send, readBody })) return
    if (req.method === 'POST' && url.pathname === '/api/audio/build') {
      const { plan } = JSON.parse(await readBody(req))
      return send(res, 200, await build(plan), 'audio/mpeg')
    }
    if (req.method === 'POST' && url.pathname === '/api/audio/generate') {
      if (generating) return send(res, 409, { ok: false, output: 'Already generating' })
      generating = true
      try {
        return send(res, 200, await generate())
      } finally {
        generating = false
      }
    }
    send(res, 404, { ok: false })
  } catch (e) {
    send(res, 400, { ok: false, error: String(e.message ?? e) })
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Audio server on http://127.0.0.1:${PORT}`))
