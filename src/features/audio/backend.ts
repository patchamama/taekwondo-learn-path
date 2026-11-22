import type { PlanStep } from './audioPlan'

/** True when the local audio backend (start.sh / start.bat) answers and can run ffmpeg. */
export async function backendStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/health')
    if (!res.ok) return false
    const body = (await res.json()) as { ok?: boolean; ffmpeg?: boolean }
    return Boolean(body.ok && body.ffmpeg)
  } catch {
    return false
  }
}

/** Asks the backend to join the clips with ffmpeg and return one MP3. */
export async function buildMp3(plan: PlanStep[]): Promise<Blob> {
  const res = await fetch('/api/audio/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.blob()
}

/** Asks the backend to generate the clips of newly added terms. */
export async function generateMissing(): Promise<{ ok: boolean; output: string }> {
  const res = await fetch('/api/audio/generate', { method: 'POST' })
  return res.json() as Promise<{ ok: boolean; output: string }>
}
