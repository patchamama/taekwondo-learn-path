import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { aiConfig, buildTranslatePrompt, chat, parseJsonObject, translate } from './ai.mjs'

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

test('aiConfig is disabled unless a provider is defined', () => {
  assert.equal(aiConfig({}).enabled, false)
  assert.equal(aiConfig({ OPENAI_API_KEY: 'k' }).enabled, false) // a TTS key alone does not enable the assistant
  assert.deepEqual(aiConfig({ LLM_PROVIDER: 'ollama' }), { enabled: true, provider: 'ollama', model: 'llama3.1', baseUrl: 'http://127.0.0.1:11434', key: '' })
  assert.equal(aiConfig({ LLM_PROVIDER: 'openai' }).enabled, false) // needs a key
  const o = aiConfig({ LLM_PROVIDER: 'openai', OPENAI_API_KEY: 'sk-x', LLM_MODEL: 'gpt-4o' })
  assert.equal(o.enabled, true)
  assert.equal(o.model, 'gpt-4o')
  assert.equal(aiConfig({ LLM_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: 'a' }).model, 'claude-haiku-4-5')
  assert.equal(aiConfig({ LLM_PROVIDER: 'nonsense' }).enabled, false)
})

test('parseJsonObject finds the JSON inside a chatty answer', () => {
  assert.deepEqual(parseJsonObject('Here you go:\n```json\n{"de":"Tritt","es":"patada"}\n```'), { de: 'Tritt', es: 'patada' })
  assert.throws(() => parseJsonObject('no json here'))
})

test('buildTranslatePrompt names the terms, languages and keeps Korean untouched', () => {
  const { system, user } = buildTranslatePrompt({ from: 'en', targets: ['de', 'es'], text: 'front kick', context: { ko: 'ap-chagi', hangul: '앞차기' } })
  assert.match(system, /taekwondo/i)
  assert.match(system, /JSON/)
  assert.match(user, /front kick/)
  assert.match(user, /German/)
  assert.match(user, /Spanish/)
  assert.match(user, /ap-chagi/)
})

test('translate calls an OpenAI-compatible endpoint and returns only the asked languages', async () => {
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"de":"Fronttritt","es":"patada frontal","en":"ignored"}' } }] }) }
  }
  const cfg = aiConfig({ LLM_PROVIDER: 'openai', OPENAI_API_KEY: 'sk-x' })
  const out = await translate(cfg, { from: 'en', targets: ['de', 'es'], text: 'front kick' })
  assert.deepEqual(out, { de: 'Fronttritt', es: 'patada frontal' })
  assert.equal(calls[0].url, 'https://api.openai.com/v1/chat/completions')
  assert.equal(calls[0].init.headers.Authorization, 'Bearer sk-x')
  assert.equal(JSON.parse(calls[0].init.body).model, 'gpt-4o-mini')
})

test('translate works with a local Ollama server and with Anthropic', async () => {
  let seen
  globalThis.fetch = async (url, init) => {
    seen = { url, init }
    return { ok: true, json: async () => ({ message: { content: '{"de":"Tritt"}' } }) }
  }
  assert.deepEqual(await translate(aiConfig({ LLM_PROVIDER: 'ollama' }), { from: 'en', targets: ['de'], text: 'kick' }), { de: 'Tritt' })
  assert.equal(seen.url, 'http://127.0.0.1:11434/api/chat')
  assert.equal(JSON.parse(seen.init.body).stream, false)
  globalThis.fetch = async (url, init) => {
    seen = { url, init }
    return { ok: true, json: async () => ({ content: [{ type: 'text', text: '{"de":"Tritt"}' }] }) }
  }
  await translate(aiConfig({ LLM_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: 'a' }), { from: 'en', targets: ['de'], text: 'kick' })
  assert.equal(seen.url, 'https://api.anthropic.com/v1/messages')
  assert.equal(seen.init.headers['x-api-key'], 'a')
})

test('errors from the provider are reported without leaking the key', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 401, text: async () => 'bad key sk-SECRET' })
  const cfg = aiConfig({ LLM_PROVIDER: 'openai', OPENAI_API_KEY: 'sk-SECRET' })
  await assert.rejects(() => chat(cfg, { system: 's', user: 'u' }), (e) => /401/.test(e.message) && !/sk-SECRET/.test(e.message))
})
