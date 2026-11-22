import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseIndexMarkdown, parseTranscript, searchLines } from './library.mjs'

test('parses the course chapter table', () => {
  const md = '| Start | Chapter | Notes |\n|---|---|---|\n| 47 (0:47) | Ceintures blanches | intro |\n| 822 | Les positions | moa, **gibon** |\n'
  assert.deepEqual(parseIndexMarkdown(md, 'chapters'), [
    { t: 47, text: 'Ceintures blanches · intro' },
    { t: 822, text: 'Les positions · moa, gibon' },
  ])
})

test('parses the self-defense course map rows with a seconds column', () => {
  const md = '| 01 | 0:00:00 | 0 | Jireugi | Oenjumeogjireugi *(note)* |\n| 02 | 0:00:34 | 34 | Chigi | Sonnalbakkatchigi |\n| | | | **Group** | |\n'
  const rows = parseIndexMarkdown(md, 'selfdefense')
  assert.equal(rows.length, 2)
  assert.equal(rows[1].t, 34)
  assert.match(rows[1].text, /Chigi/)
})

test('parses transcripts and searches with accents and case ignored', () => {
  const tsv = '0\t48\tProgramm für die Anfänger\n48\t50\tWeißer und gelber Gürtel\n'
  const lines = parseTranscript(tsv)
  assert.equal(lines.length, 2)
  assert.deepEqual(searchLines(lines, 'ANFANGER').map((l) => l.t), [0])
  assert.deepEqual(searchLines(lines, 'weißer gurtel').map((l) => l.t), [48])
  assert.deepEqual(searchLines(lines, ''), [])
})
