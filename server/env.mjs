import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Reads KEY=value lines of .env.local (git-ignored). Real environment variables win. Values are never logged. */
export function loadEnv(root) {
  const file = join(root, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
