let cached: Promise<Record<string, number>> | null = null

/** Clip durations (seconds) written by `scripts/generate-audio.mjs`; empty when the file is not there. */
export function loadDurations(base: string): Promise<Record<string, number>> {
  cached ??= (async () => {
    try {
      const res = await fetch(`${base}audio/durations.json`)
      return res.ok ? ((await res.json()) as Record<string, number>) : {}
    } catch {
      return {}
    }
  })()
  return cached
}
