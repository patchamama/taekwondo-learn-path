import { log } from 'node:console'
import { readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'

// npm runs build scripts from the package root, including isolated build fixtures.
const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
const commit = process.env.GITHUB_SHA || null
writeFileSync('dist/version.json', JSON.stringify({ version, commit }, null, 2) + '\n')
log(`App version: v${version}`)
