import { useEffect, useRef, useState } from 'react'
import { useT } from '../../shared/i18n/useT'
import { Bubble } from '../mascot/Bubble'
import { SpeakButton } from '../../shared/components/SpeakButton'

interface Props {
  ok: boolean
  message: string
  correctText?: string
  hangul?: string
  beltColor: string
  /** the wrong answer will come back at the end */
  retryNote: boolean
  /** 0 = stay until Continue; otherwise close after this many seconds */
  seconds: number
  /** after the time, continue by itself instead of only closing the window */
  autoContinue: boolean
  onContinue: () => void
  onClose: () => void
}

/** Centred result of an answer. Closes with Escape; "Continue" moves on. */
export function ResultModal({
  ok,
  message,
  correctText,
  hangul,
  beltColor,
  retryNote,
  seconds,
  autoContinue,
  onContinue,
  onClose,
}: Props) {
  const { t } = useT()
  const callbacks = useRef({ onContinue, onClose })
  useEffect(() => {
    callbacks.current = { onContinue, onClose }
  })
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (seconds <= 0) return
    const tick = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000)
    return () => clearInterval(tick)
  }, [seconds])
  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(
      () => (autoContinue ? callbacks.current.onContinue() : callbacks.current.onClose()),
      seconds * 1000,
    )
    return () => clearTimeout(timer)
  }, [seconds, autoContinue])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ok ? t('logCorrect') : t('logWrong')}
        className="grid w-full max-w-md gap-4 rounded-2xl bg-white p-5 shadow-xl"
      >
        <Bubble mood={ok ? 'cheer' : 'oops'} beltColor={beltColor} tone={ok ? 'good' : 'bad'}>
          <p className="font-semibold">{message}</p>
          {!ok && correctText && (
            <p className="mt-1">
              {t('correctAnswer')}: <b>{correctText}</b>
            </p>
          )}
          {!ok && retryNote && <p className="mt-1 text-xs text-rose-700">{t('askedAgain')}</p>}
          {hangul && <SpeakButton text={hangul} className="mt-1" />}
        </Bubble>
        {seconds > 0 && left > 0 && (
          <p className="text-center text-xs text-slate-500">
            {t(autoContinue ? 'countdownContinue' : 'countdownClose').replace('{n}', String(left))}
          </p>
        )}
        <button
          autoFocus
          onClick={onContinue}
          className={`rounded-xl py-3 font-bold text-white ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`}
        >
          {t('continue')}
        </button>
      </div>
    </div>
  )
}
