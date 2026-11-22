import { useEffect, useRef, useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { AUDIO_ITEMS } from '../../data/audioManifest'
import { useT } from '../../shared/i18n/useT'
import type { PlaybackRole, PlaybackStep } from './audioPlan'

const ITEM_BY_ID = new Map(AUDIO_ITEMS.map((i) => [i.id, i]))

type Said = { id: string; parts: Partial<Record<PlaybackRole, true>> }

/**
 * Plays the plan clip by clip and writes each word only after it has been said, so you can see how it is spelled.
 * Playing clip by clip (instead of the joined file) keeps the text exactly in step with the voice.
 */
export function VocabularyPlayer({ steps, base }: { steps: PlaybackStep[]; base: string }) {
  const { t, loc } = useT()
  const [running, setRunning] = useState(false)
  const [said, setSaid] = useState<Said[]>([])
  const cancel = useRef<() => void>(() => {})
  // leaving the card (or changing the selection) must silence the voice
  useEffect(() => () => cancel.current(), [])

  const play = async () => {
    let cancelled = false
    let release: () => void = () => {}
    let current: HTMLAudioElement | null = null
    cancel.current = () => {
      cancelled = true
      current?.pause()
      release()
    }
    setSaid([])
    setRunning(true)
    for (const step of steps) {
      if (cancelled) break
      if ('silence' in step) {
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, step.silence * 1000)
          release = () => {
            clearTimeout(timer)
            resolve()
          }
        })
        continue
      }
      const ok = await new Promise<boolean>((resolve) => {
        const audio = new Audio(base + step.file)
        current = audio
        release = () => resolve(false)
        audio.onended = () => resolve(true)
        audio.onerror = () => resolve(false)
        audio.play().catch(() => resolve(false))
      })
      if (cancelled) break
      if (ok) {
        setSaid((prev) => {
          const at = prev.findIndex((s) => s.id === step.id)
          if (at === -1) return [...prev, { id: step.id, parts: { [step.role]: true } }]
          const next = [...prev]
          next[at] = { ...next[at], parts: { ...next[at].parts, [step.role]: true } }
          return next
        })
      }
    }
    setRunning(false)
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        className="w-fit rounded-lg border px-4 py-2"
        onClick={() => (running ? cancel.current() : play())}
        disabled={steps.length === 0}
      >
        {running ? `⏹ ${t('audioStop')}` : `▶ ${t('audioPlay')}`}
      </button>
      <ol aria-live="polite" aria-label={t('audioTranscript')} className="grid gap-2">
        {[...said].reverse().map((s) => {
          const item = ITEM_BY_ID.get(s.id)
          const card = CARD_BY_ID[s.id]
          if (!item || !card) return null
          return (
            <li key={s.id} className="rounded-lg border bg-slate-50 p-3">
              {s.parts.ko && (
                <p className="text-lg font-bold">
                  <span lang="ko">{item.hangul}</span>{' '}
                  <span className="text-sm font-normal text-slate-500">{card.ko}</span>
                </p>
              )}
              {s.parts.meaning && <p>{loc(item.meaning)}</p>}
              {s.parts.ja && (
                <p className="text-sm text-slate-600">
                  <span lang="ja">{item.ja}</span>
                  {card.karate
                    ? ` (${card.karate
                        .split('/')[0]
                        .replace(/\(.*?\)/g, '')
                        .trim()})`
                    : ''}
                </p>
              )}
              {s.parts.info && item.info && (
                <p className="mt-1 text-sm text-slate-700">{loc(item.info)}</p>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
