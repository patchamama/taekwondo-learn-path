import { Mp3Encoder } from '@breezystack/lamejs'

const KBPS = 32
const FRAME = 1152

/** Mono MP3 encoded in the browser, so the download is an MP3 even without the local backend. */
export function encodeMp3(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const encoder = new Mp3Encoder(1, sampleRate, KBPS)
  const pcm = new Int16Array(samples.length)
  for (let i = 0; i < samples.length; i++) {
    const c = Math.max(-1, Math.min(1, samples[i]))
    pcm[i] = c < 0 ? c * 0x8000 : c * 0x7fff
  }
  const parts: Uint8Array[] = []
  for (let i = 0; i < pcm.length; i += FRAME) {
    const chunk = encoder.encodeBuffer(pcm.subarray(i, i + FRAME))
    if (chunk.length) parts.push(chunk)
  }
  const tail = encoder.flush()
  if (tail.length) parts.push(tail)
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const p of parts) {
    out.set(p, at)
    at += p.length
  }
  return out.buffer
}
