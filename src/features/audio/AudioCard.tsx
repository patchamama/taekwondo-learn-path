import { useEffect, useMemo, useState } from 'react'
import { AUDIO_ITEMS } from '../../data/audioManifest'
import { useT } from '../../shared/i18n/useT'
import { buildPlayback, selectItems } from './audioPlan'
import { VocabularyPlayer } from './VocabularyPlayer'
import { backendStatus, buildMp3, generateMissing } from './backend'
import { buildAudio } from './buildAudio'
import { transportCopy } from './transportCopy'

const optionsLabel = { en: 'Audio options', de: 'Audiooptionen', es: 'Opciones de audio' } as const

/** Study card: builds a study audio for the belts Study is showing (one belt, or everything up to it). */
export function AudioCard({
  maxBelt,
  onlyBelt,
  onPlayingChange,
}: {
  maxBelt: number
  onlyBelt: number | null
  onPlayingChange?: (playing: boolean) => void
}) {
  const { t, lang } = useT()
  const [vocabulary, setVocabulary] = useState(true)
  const [techniques, setTechniques] = useState(true)
  const [descriptions, setDescriptions] = useState(true)
  const [random, setRandom] = useState(false)
  const [randomSeed] = useState(() => Math.floor(Math.random() * 0x100000000))
  const [japanese, setJapanese] = useState(false)
  const [bidirectional, setBidirectional] = useState(false)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<[number, number] | null>(null)
  const [result, setResult] = useState<{ url: string; missing: number } | null>(null)
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

  const count = useMemo(
    () =>
      selectItems(AUDIO_ITEMS, {
        lang,
        maxBelt,
        onlyBelt,
        vocabulary,
        techniques,
        descriptions,
        japanese,
      }).length,
    [lang, maxBelt, onlyBelt, vocabulary, techniques, descriptions, japanese],
  )

  const steps = useMemo(
    () =>
      buildPlayback(AUDIO_ITEMS, {
        lang,
        maxBelt,
        onlyBelt,
        vocabulary,
        techniques,
        descriptions,
        japanese,
        bidirectional,
        randomSeed: random ? randomSeed : undefined,
      }),
    [
      lang,
      maxBelt,
      onlyBelt,
      vocabulary,
      techniques,
      descriptions,
      japanese,
      bidirectional,
      random,
      randomSeed,
    ],
  )

  const create = async () => {
    setResult(null)
    setError('')
    setBusy([0, 1])
    const plan = steps.map((step) => ('file' in step ? { file: step.file } : step))
    try {
      if (backend) {
        const blob = await buildMp3(plan)
        setResult({ url: URL.createObjectURL(blob), missing: 0 })
      } else {
        const built = await buildAudio(plan, import.meta.env.BASE_URL, (d, n) => setBusy([d, n]))
        setResult({ url: URL.createObjectURL(built.blob), missing: built.missing })
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
      <input
        type="checkbox"
        className="mt-1 h-5 w-5"
        checked={checked}
        onChange={(e) => set(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  )

  return (
    <section
      data-audio-card
      className="grid gap-4 rounded-xl border bg-white p-5"
      aria-labelledby="audio-card-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="audio-card-title" className="text-lg font-semibold">
          🎧 {t('audioTitle')}
        </h2>
        <button
          type="button"
          className="rounded-lg border px-3 py-1 text-sm"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? t('hide') : t('audioOpen')}
        </button>
      </div>
      {open && (
        <>
          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-semibold">{optionsLabel[lang]}</summary>
            <p className="mt-3 text-sm text-slate-600">{t('audioIntro')}</p>
            <div className="mt-3 grid gap-3">
              {box(t('audioVocabulary'), vocabulary, setVocabulary)}
              {box(t('audioTechniques'), techniques, setTechniques)}
              {box(t('audioDescriptions'), descriptions, setDescriptions)}
              {box(t('audioJapanese'), japanese, setJapanese)}
              {box(t('audioBidirectional'), bidirectional, setBidirectional)}
              {box(transportCopy(lang).random, random, setRandom)}
            </div>
          </details>
          <p className="text-sm font-semibold" aria-live="polite" aria-label="audio-count">
            {count} {t('audioSummary')}
          </p>
          {count === 0 && <p className="text-sm text-amber-700">{t('audioEmpty')}</p>}
          <VocabularyPlayer
            steps={steps}
            base={import.meta.env.BASE_URL}
            onRunningChange={onPlayingChange}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              disabled={count === 0 || busy !== null}
              onClick={create}
            >
              {busy ? `${t('audioWorking')} ${busy[0]}/${busy[1]}` : t('audioGenerate')}
            </button>
            {backend && (
              <button
                type="button"
                className="w-fit rounded-lg border px-4 py-2 text-sm"
                disabled={generating}
                onClick={makeMissing}
              >
                {generating ? t('audioWorking') : transportCopy(lang).generateNew}
              </button>
            )}
          </div>
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
                download="taekwondo-vocabulary.mp3"
              >
                {t('audioDownloadMp3')}
              </a>
              {result.missing > 0 && (
                <p className="text-sm text-amber-700">
                  {result.missing} {t('audioMissing')}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
