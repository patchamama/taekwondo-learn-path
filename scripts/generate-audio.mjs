#!/usr/bin/env node
// Generates the pre-recorded vocabulary clips in public/audio (mp3, mono) with a text-to-speech provider
// and ffmpeg. Only missing files are created, so run it again after adding new terms.
//
//   node scripts/generate-audio.mjs                    # missing clips, default provider for this OS
//   node scripts/generate-audio.mjs --provider openai  # better Korean; needs OPENAI_API_KEY (.env.local)
//   node scripts/generate-audio.mjs --sample           # 12 Korean words per provider in audio-sample/
//   node scripts/generate-audio.mjs --dry-run          # only count what is missing
// Other flags: --force, --only ko|en|de|es|ja|info, --limit N, --jobs N (parallel requests; default 4 for openai)
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined)

/** .env.local (git-ignored) may hold OPENAI_API_KEY=...; real environment variables win. */
function loadEnv() {
  const file = join(ROOT, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadEnv()

const PROVIDER = opt('provider') ?? process.env.AUDIO_PROVIDER ?? { darwin: 'say', win32: 'windows' }[process.platform] ?? 'espeak'

// track → [macOS voice, espeak-ng voice, locale prefix for Windows voices, OpenAI voice]
const VOICES = {
  ko: ['Yuna', 'ko', 'ko', 'nova'],
  en: ['Samantha', 'en', 'en', 'nova'],
  de: ['Anna', 'de', 'de', 'nova'],
  es: ['Paulina', 'es', 'es', 'nova'],
  ja: ['Kyoko', 'ja', 'ja', 'nova'],
}
const LANG_NAME = { ko: 'Korean', en: 'English', de: 'German', es: 'Spanish', ja: 'Japanese' }
const voiceOf = (track) => VOICES[track.replace('info-', '')]

const run = (cmd, a, o = {}) => execFileSync(cmd, a, { stdio: ['ignore', 'ignore', 'pipe'], ...o })

function toMp3(input, output, info) {
  mkdirSync(dirname(output), { recursive: true })
  // trim leading/trailing silence (TTS engines pad clips) so the planned pauses stay exact
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,' +
    'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse'
  const encode = (filter) =>
    run('ffmpeg', ['-y', '-v', 'error', '-i', input, ...(filter ? ['-af', filter] : []), '-ac', '1', '-ar', '16000', '-b:a', info ? '16k' : '24k', output])
  encode(trim)
  // very short words can be trimmed to nothing: keep them untrimmed instead
  if (statSync(output).size < 600) encode(null)
}

async function synth(track, text, wav) {
  const [mac, esp, win, oa] = voiceOf(track)
  const lang = track.replace('info-', '')
  if (PROVIDER === 'say') return run('say', ['-v', mac, '-o', wav, '--data-format=LEI16@22050', text])
  if (PROVIDER === 'espeak') return run('espeak-ng', ['-v', esp, '-w', wav, text])
  if (PROVIDER === 'windows') {
    const ps =
      `Add-Type -AssemblyName System.Speech;$s=New-Object System.Speech.Synthesis.SpeechSynthesizer;` +
      `$v=$s.GetInstalledVoices()|?{$_.VoiceInfo.Culture.Name -like '${win}*'}|select -First 1;` +
      `if($v){$s.SelectVoice($v.VoiceInfo.Name)};$s.SetOutputToWaveFile($env:TTS_OUT);$s.Speak($env:TTS_TEXT);$s.Dispose()`
    return run('powershell', ['-NoProfile', '-Command', ps], { env: { ...process.env, TTS_OUT: wav, TTS_TEXT: text } })
  }
  if (PROVIDER === 'openai') {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is missing: put it in .env.local (see .env.local.example)')
    const body = JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL ?? 'gpt-4o-mini-tts',
      voice: process.env.OPENAI_TTS_VOICE ?? oa,
      input: text,
      instructions: `Speak ${LANG_NAME[lang]}, clearly and at a calm pace, as in a language lesson.`,
      response_format: 'wav',
    })
    // rate limits (429) and server errors are retried with a growing pause
    for (let attempt = 1; ; attempt++) {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body,
      })
      if (res.ok) return writeFileSync(wav, Buffer.from(await res.arrayBuffer()))
      if ((res.status === 429 || res.status >= 500) && attempt < 6) {
        await new Promise((r) => setTimeout(r, 1500 * 2 ** (attempt - 1)))
        continue
      }
      throw new Error(`OpenAI TTS ${res.status}: ${(await res.text()).slice(0, 200)}`)
    }
  }
  throw new Error(`Unknown provider "${PROVIDER}"`)
}

async function loadManifest() {
  const { createServer } = await import('vite')
  const server = await createServer({ root: ROOT, logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { AUDIO_ITEMS, clipsOf } = await server.ssrLoadModule('/src/data/audioManifest.ts')
    return AUDIO_ITEMS.flatMap((item) => clipsOf(item).map((c) => ({ ...c, id: item.id })))
  } finally {
    await server.close()
  }
}

async function main() {
  if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).error) {
    throw new Error('ffmpeg is required (https://ffmpeg.org/download.html)')
  }
  const tmp = mkdtempSync(join(tmpdir(), 'tkd-audio-'))
  try {
    if (flag('sample')) {
      const out = join(ROOT, 'audio-sample', PROVIDER)
      const words = ['사범', '도장', '차렷', '경례', '앞차기', '옆차기', '몸통지르기', '아래막기', '얼굴막기', '앞굽이', '주춤서기', '태극']
      for (const [i, w] of words.entries()) {
        await synth('ko', w, join(tmp, 's.wav'))
        toMp3(join(tmp, 's.wav'), join(out, `${String(i + 1).padStart(2, '0')}-${w}.mp3`), false)
      }
      console.log(`Samples written to ${out}`)
      return
    }
    const only = opt('only')
    let todo = (await loadManifest()).filter((c) => (only ? c.track === only || c.track.startsWith(`${only}-`) : true))
    const total = todo.length
    if (!flag('force')) todo = todo.filter((c) => !existsSync(join(ROOT, 'public', c.file)))
    const missing = todo.length
    if (opt('limit')) todo = todo.slice(0, Number(opt('limit')))
    console.log(`${total - missing}/${total} clips present, ${todo.length} of ${missing} missing to generate with "${PROVIDER}"`)
    if (flag('dry-run')) return
    let done = 0
    let next = 0
    const jobs = Math.max(1, Number(opt('jobs') ?? (PROVIDER === 'openai' ? 4 : 1)))
    const worker = async (n) => {
      const wav = join(tmp, `clip-${n}.wav`)
      while (next < todo.length) {
        const c = todo[next++]
        try {
          await synth(c.track, c.text, wav)
          toMp3(wav, join(ROOT, 'public', c.file), c.track.startsWith('info-'))
        } catch (e) {
          console.error(`FAILED ${c.track}/${c.id}: ${String(e.message ?? e).split('\n')[0]}`)
          process.exitCode = 1
        }
        if (++done % 100 === 0) console.log(`${done}/${todo.length}`)
      }
    }
    await Promise.all(Array.from({ length: jobs }, (_, n) => worker(n)))
    console.log(`Done: ${done} processed${process.exitCode ? ' (some failed, see above)' : ''}`)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
