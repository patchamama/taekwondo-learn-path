// Optional language-model helper for the local editor and the site bot.
// Nothing is sent anywhere unless LLM_PROVIDER is defined (in the environment or in the git-ignored .env.local):
//   LLM_PROVIDER=ollama                     local model, no key (LLM_MODEL=llama3.1, OLLAMA_URL=http://127.0.0.1:11434)
//   LLM_PROVIDER=openai  + OPENAI_API_KEY   (LLM_MODEL=gpt-4o-mini; LLM_BASE_URL for any OpenAI-compatible server)
//   LLM_PROVIDER=anthropic + ANTHROPIC_API_KEY (LLM_MODEL=claude-haiku-4-5)

const LANG_NAME = { en: 'English', de: 'German', es: 'Spanish' }

/** Reads the provider settings. `enabled` is false unless a provider is explicitly defined and usable. */
export function aiConfig(env = process.env) {
  const provider = (env.LLM_PROVIDER ?? '').toLowerCase()
  if (provider === 'ollama') {
    return { enabled: true, provider, model: env.LLM_MODEL ?? 'llama3.1', baseUrl: env.OLLAMA_URL ?? 'http://127.0.0.1:11434', key: '' }
  }
  if (provider === 'openai') {
    const key = env.OPENAI_API_KEY ?? env.LLM_API_KEY ?? ''
    return { enabled: Boolean(key), provider, model: env.LLM_MODEL ?? 'gpt-4o-mini', baseUrl: env.LLM_BASE_URL ?? 'https://api.openai.com/v1', key }
  }
  if (provider === 'anthropic') {
    const key = env.ANTHROPIC_API_KEY ?? env.LLM_API_KEY ?? ''
    return { enabled: Boolean(key), provider, model: env.LLM_MODEL ?? 'claude-haiku-4-5', baseUrl: 'https://api.anthropic.com/v1', key }
  }
  return { enabled: false, provider: '', model: '', baseUrl: '', key: '' }
}

/** Public part of the configuration (never the key). */
export const aiPublic = (cfg) => ({ enabled: cfg.enabled, provider: cfg.provider, model: cfg.model })

/** The first {...} block of a model answer, parsed as JSON. */
export function parseJsonObject(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('The model did not return JSON')
  return JSON.parse(text.slice(start, end + 1))
}

export function buildTranslatePrompt({ from, targets, text, context = {} }) {
  const names = targets.map((l) => LANG_NAME[l]).join(', ')
  const system =
    'You translate taekwondo vocabulary and short descriptions for a learning app. Keep Korean terms, romanizations and proper names unchanged. ' +
    'Use the usual taekwondo terminology of each language. Reply with ONLY a JSON object whose keys are the language codes ' +
    `${targets.map((l) => `"${l}"`).join(', ')} and whose values are the translations.`
  const ctx = [context.ko && `Korean term (romanized): ${context.ko}`, context.hangul && `Hangul: ${context.hangul}`].filter(Boolean).join('\n')
  const user = `${ctx ? ctx + '\n' : ''}Translate from ${LANG_NAME[from]} into ${names}:\n${text}`
  return { system, user }
}

const trimError = (cfg, body) => String(body).split(cfg.key || '\u0000').join('***').slice(0, 200)

/** One question → one answer text, with whichever provider is configured. */
export async function chat(cfg, { system, user }) {
  if (!cfg.enabled) throw new Error('No language model is configured (set LLM_PROVIDER)')
  const headers = { 'Content-Type': 'application/json' }
  let url
  let body
  if (cfg.provider === 'anthropic') {
    url = `${cfg.baseUrl}/messages`
    headers['x-api-key'] = cfg.key
    headers['anthropic-version'] = '2023-06-01'
    body = { model: cfg.model, max_tokens: 1500, system, messages: [{ role: 'user', content: user }] }
  } else if (cfg.provider === 'ollama') {
    url = `${cfg.baseUrl}/api/chat`
    body = { model: cfg.model, stream: false, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }
  } else {
    url = `${cfg.baseUrl}/chat/completions`
    headers.Authorization = `Bearer ${cfg.key}`
    body = { model: cfg.model, temperature: 0.2, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }
  }
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`${cfg.provider} ${res.status}: ${trimError(cfg, await res.text())}`)
  const data = await res.json()
  if (cfg.provider === 'anthropic') return data.content?.map((c) => c.text ?? '').join('') ?? ''
  if (cfg.provider === 'ollama') return data.message?.content ?? ''
  return data.choices?.[0]?.message?.content ?? ''
}

/** Translates one text into the asked languages; only those languages are returned. */
export async function translate(cfg, { from, targets, text, context }) {
  if (!LANG_NAME[from] || !targets.length || targets.some((l) => !LANG_NAME[l])) throw new Error('Invalid languages')
  if (typeof text !== 'string' || !text.trim() || text.length > 4000) throw new Error('Invalid text')
  const answer = parseJsonObject(await chat(cfg, buildTranslatePrompt({ from, targets, text, context })))
  return Object.fromEntries(targets.filter((l) => typeof answer[l] === 'string').map((l) => [l, answer[l].trim()]))
}
