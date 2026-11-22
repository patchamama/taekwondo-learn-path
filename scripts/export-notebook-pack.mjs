#!/usr/bin/env node
// Writes the Markdown sources to upload to NotebookLM (notebooklm-pack/): the techniques and terms by Kup,
// concepts, history, background facts, theory and an index of the videos, with links to the site and to the
// exact moment of each video. Then in NotebookLM: "Add source" → upload the files (max 50 sources).
//
//   node scripts/export-notebook-pack.mjs [--base https://patchamama.github.io/taekwondo-learn-path/] [--out notebooklm-pack]
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const opt = (n, d) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : d)
const base = opt('base', 'https://patchamama.github.io/taekwondo-learn-path/')
const out = resolve(ROOT, opt('out', 'notebooklm-pack'))

const { createServer } = await import('vite')
const server = await createServer({ root: ROOT, logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' })
try {
  const { buildKnowledge } = await server.ssrLoadModule('/src/features/bot/knowledge.ts')
  const { buildPack } = await server.ssrLoadModule('/src/features/bot/pack.ts')
  const files = buildPack(buildKnowledge(), base)
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  for (const f of files) writeFileSync(join(out, f.name), f.content)
  const words = files.reduce((n, f) => n + f.content.split(/\s+/).length, 0)
  console.log(`${files.length} files, about ${words.toLocaleString('en')} words written to ${out}`)
} finally {
  await server.close()
}
