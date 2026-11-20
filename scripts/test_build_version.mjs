import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

for (const [previous, commit] of [[null, null], ['0.18.0', '0123456789abcdef0123456789abcdef01234567']]) {
  test(`build metadata matches the package version, previous metadata: ${previous}`, () => {
    const root = mkdtempSync(join(tmpdir(), 'taekwondo-build-version-'))
    try {
      mkdirSync(join(root, 'dist'))
      writeFileSync(join(root, 'package.json'), JSON.stringify({ version: '0.19.0' }))
      const metadataPath = join(root, 'dist', 'version.json')
      if (previous !== null) writeFileSync(metadataPath, JSON.stringify({ version: previous }))
      const script = fileURLToPath(new URL('./write-build-version.mjs', import.meta.url))
      const result = spawnSync(process.execPath, [script], {
        cwd: root, env: { ...process.env, GITHUB_SHA: commit ?? '' }, encoding: 'utf8',
      })
      assert.equal(result.status, 0, result.stderr)
      assert.equal(result.stdout, 'App version: v0.19.0\n')
      assert.equal(result.stderr, '')
      assert.equal(readFileSync(metadataPath, 'utf8'), JSON.stringify({ version: '0.19.0', commit }, null, 2) + '\n')
      assert.deepEqual(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')), { version: '0.19.0' })
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
}
