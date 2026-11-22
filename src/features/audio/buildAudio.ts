import { encodeWav } from './wav'
import type { PlanStep } from './audioPlan'

const RATE = 16000

export interface BuiltAudio {
  blob: Blob
  seconds: number
  /** clips that could not be loaded (not generated yet) */
  missing: number
}

/** Fetches the clips of a plan, decodes them and joins them with the planned silences into one WAV. */
export async function buildAudio(
  plan: PlanStep[],
  base: string,
  onProgress: (done: number, total: number) => void = () => {},
): Promise<BuiltAudio> {
  const ctx = new AudioContext({ sampleRate: RATE })
  const parts: Float32Array[] = []
  let missing = 0
  try {
    for (let i = 0; i < plan.length; i++) {
      const step = plan[i]
      if ('silence' in step) {
        parts.push(new Float32Array(Math.round(step.silence * RATE)))
      } else {
        try {
          const res = await fetch(base + step.file)
          if (!res.ok) throw new Error(String(res.status))
          const audio = await ctx.decodeAudioData(await res.arrayBuffer())
          parts.push(audio.getChannelData(0).slice())
        } catch {
          missing++
        }
      }
      onProgress(i + 1, plan.length)
    }
  } finally {
    await ctx.close()
  }
  const total = parts.reduce((n, p) => n + p.length, 0)
  const samples = new Float32Array(total)
  let at = 0
  for (const p of parts) {
    samples.set(p, at)
    at += p.length
  }
  return { blob: new Blob([encodeWav(samples, RATE)], { type: 'audio/wav' }), seconds: total / RATE, missing }
}
