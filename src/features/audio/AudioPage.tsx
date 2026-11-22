import { useEffect, useMemo, useState } from 'react'
import { AUDIO_ITEMS } from '../../data/audioManifest'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'
import { buildPlan, selectItems, type AudioOptions } from './audioPlan'
import { backendStatus, buildMp3, generateMissing } from './backend'
import { buildAudio } from './buildAudio'

export function AudioPage() {
  const { t, lang } = useT()
  const maxBelt = useAppStore((s) => s.maxBelt)
  const onlyBelt = useAppStore((s) => s.onlyBelt)
  const [vocabulary, setVocabulary] = useState(true)
  const [techniques, setTechniques] = useState(true)
  const [descriptions, setDescriptions] = useState(false)
  const [japanese, setJapanese] = useState(false)
  const [busy, setBusy] = useState<[number, number] | null>(null)
  const [result, setResult] = useState<{ url: string; missing: number; mp3: boolean } | null>(null)
  const [backend, setBackend] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    backendStatus().then((ok) => alive && setBackend(ok))
    return () => {
      alive = false
    }
  }, [])

  const options: AudioOptions = { lang, maxBelt, onlyBelt, vocabulary, techniques, descriptions, japanese }
  const count = useMemo(
    () => selectItems(AUDIO_ITEMS, { lang, maxBelt, onlyBelt, vocabulary, techniques, descriptions, japanese }).length,
    [lang, maxBelt, onlyBelt, vocabulary, techniques, descriptions, japanese],
  )

  const create = async () => {
    setResult(null)
    setError('')
    setBusy([0, 1])
    const plan = buildPlan(AUDIO_ITEMS, options)
    try {
      if (backend) {
        const blob = await buildMp3(plan)
        setResult({ url: URL.createObjectURL(blob), missing: 0, mp3: true })
      } else {
        const built = await buildAudio(plan, import.meta.env.BASE_URL, (d, n) => setBusy([d, n]))
        setResult({ url: URL.createObjectURL(built.blob), missing: built.missing, mp3: false })
      }
    } catch (e) {
      setError(String((e as Error).message ?? e))
    }
    setBusy(null)
  }

  const makeMissing = async () => {
    setGenerating(true)
    setError('')
    try {
      const r = await generateMissing()
      if (!r.ok) setError(r.output)
    } catch (e) {
      setError(String((e as Error).message ?? e))
    }
    setGenerating(false)
  }

  const box = (label: string, checked: boolean, set: (v: boolean) => void) => (
    <label className="flex items-start gap-3">
      <input type="checkbox" className="mt-1 h-5 w-5" checked={checked} onChange={(e) => set(e.target.checked)} />
      <span>{label}</span>
    </label>
  )

  return (
    <section className="mx-auto grid max-w-xl gap-5">
      <h1 className="text-2xl font-bold">{t('audioTitle')}</h1>
      <p className="text-sm text-slate-600">{t('audioIntro')}</p>
      <div className="grid gap-3 rounded-xl border bg-white p-5">
        {box(t('audioVocabulary'), vocabulary, setVocabulary)}
        {box(t('audioTechniques'), techniques, setTechniques)}
        {box(t('audioDescriptions'), descriptions, setDescriptions)}
        {box(t('audioJapanese'), japanese, setJapanese)}
      </div>
      <p className="text-sm font-semibold" aria-live="polite">
        {count} {t('audioSummary')}
      </p>
      {count === 0 && <p className="text-sm text-amber-700">{t('audioEmpty')}</p>}
      <button
        type="button"
        className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        disabled={count === 0 || busy !== null}
        onClick={create}
      >
        {busy ? `${t('audioWorking')} ${busy[0]}/${busy[1]}` : t('audioGenerate')}
      </button>
      {backend && (
        <button type="button" className="w-fit rounded-lg border px-4 py-2 text-sm" disabled={generating} onClick={makeMissing}>
          {generating ? t('audioWorking') : t('audioGenerateMissing')}
        </button>
      )}
      {error && (
        <p role="alert" className="whitespace-pre-wrap text-sm text-red-700">
          {error}
        </p>
      )}
      {result && (
        <div className="grid gap-2">
          <audio controls src={result.url} className="w-full" />
          <a
            className="w-fit rounded-lg border px-4 py-2"
            href={result.url}
            download={result.mp3 ? 'taekwondo-vocabulary.mp3' : 'taekwondo-vocabulary.wav'}
          >
            {result.mp3 ? t('audioDownloadMp3') : t('audioDownload')}
          </a>
          {result.missing > 0 && (
            <p className="text-sm text-amber-700">
              {result.missing} {t('audioMissing')}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
