import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { aiConfig, aiPublic, buildTranslatePrompt, chat, parseJsonObject, translate } from './ai.mjs'

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

test('aiConfig infers OpenAI only with a key and no chosen provider', () => {
  assert.equal(aiConfig({}).enabled, false)
  assert.equal(aiConfig({ OPENAI_API_KEY: '' }).enabled, false)
  assert.equal(aiConfig({ LLM_API_KEY: 'generic' }).enabled, false)
  for (const LLM_PROVIDER of [undefined, '']) {
    const cfg = aiConfig({ LLM_PROVIDER, OPENAI_API_KEY: 'test-key' })
    assert.deepEqual(cfg, { enabled: true, provider: 'openai', model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1', key: 'test-key' })
    assert.deepEqual(aiPublic(cfg), { enabled: true, provider: 'openai', model: 'gpt-4o-mini' })
  }
  for (const LLM_PROVIDER of ['disabled', 'none', 'off', 'nonsense']) {
    assert.deepEqual(aiConfig({ LLM_PROVIDER, OPENAI_API_KEY: 'test-key' }), { enabled: false, provider: '', model: '', baseUrl: '', key: '' })
  }
})

test('aiConfig preserves explicit provider choices even with an OpenAI key', () => {
  assert.equal(aiConfig({ LLM_PROVIDER: 'ollama', OPENAI_API_KEY: 'ignored' }).provider, 'ollama')
  assert.equal(aiConfig({ LLM_PROVIDER: 'anthropic', OPENAI_API_KEY: 'ignored' }).enabled, false)
  assert.equal(aiConfig({ LLM_PROVIDER: 'ANTHROPIC', ANTHROPIC_API_KEY: 'a', OPENAI_API_KEY: 'ignored' }).key, 'a')
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

test('translate supports Japanese targets, names Japanese, and filters unexpected output', async () => {
  let request
  globalThis.fetch = async (_url, init) => {
    request = JSON.parse(init.body)
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"ja":" 前蹴り ","en":"ignored"}' } }] }) }
  }
  assert.deepEqual(await translate(aiConfig({ OPENAI_API_KEY: 'test-key' }), {
    from: 'en', targets: ['ja'], text: 'front kick', context: { ko: 'ap-chagi', hangul: '앞차기' },
  }), { ja: '前蹴り' })
  assert.match(request.messages[1].content, /into Japanese:/)
  assert.match(request.messages[1].content, /ap-chagi/)
  assert.match(request.messages[0].content, /equivalent.*invent/i)
})

test('translate rejects unsupported languages and Japanese sources without calling a provider', async () => {
  let calls = 0
  globalThis.fetch = async () => { calls++; throw new Error('unexpected request') }
  const cfg = aiConfig({ LLM_PROVIDER: 'ollama' })
  for (const [from, targets] of [['ja', ['en']], ['en', ['fr']], ['en', []]]) {
    await assert.rejects(() => translate(cfg, { from, targets, text: 'kick' }), { message: 'Invalid languages' })
  }
  assert.equal(calls, 0)
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

import { answerQuestion, buildChatPrompt } from './ai.mjs'

test('buildChatPrompt grounds the model in the given passages and the language of the question', () => {
  const { system, user } = buildChatPrompt({
    question: 'What is ap-chagi?',
    lang: 'en',
    contexts: [{ title: 'ap-chagi 앞차기', text: 'Front kick for a pad.', url: '/study/1' }],
  })
  assert.match(system, /ONLY/)
  assert.match(system, /same language as the question/i)
  assert.match(user, /\[1\] ap-chagi 앞차기/)
  assert.match(user, /Front kick for a pad\./)
  assert.match(user, /What is ap-chagi\?/)
})

test('buildChatPrompt limits what is sent to the model', () => {
  const many = Array.from({ length: 30 }, (_, i) => ({ title: `t${i}`, text: 'x'.repeat(5000), url: '/x' }))
  const { user } = buildChatPrompt({ question: 'q', lang: 'es', contexts: many })
  assert.ok(user.length < 20000)
  assert.ok(!user.includes('t9]'))
})

test('answerQuestion rejects an empty question or missing context and returns the model text', async () => {
  const cfg = aiConfig({ LLM_PROVIDER: 'ollama' })
  await assert.rejects(() => answerQuestion(cfg, { question: '  ', lang: 'en', contexts: [{ title: 't', text: 'x', url: '/' }] }))
  await assert.rejects(() => answerQuestion(cfg, { question: 'q', lang: 'en', contexts: [] }))
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ message: { content: '  A front kick.  ' } }) })
  assert.equal(await answerQuestion(cfg, { question: 'q', lang: 'en', contexts: [{ title: 't', text: 'x', url: '/' }] }), 'A front kick.')
})
