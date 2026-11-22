import { canSpeak, speakKorean } from '../lib/speech'
import { useT } from '../i18n/useT'

interface Props {
  text: string
  slow?: boolean
  className?: string
}

export function SpeakButton({ text, slow = false, className = '' }: Props) {
  const { t } = useT()
  if (!canSpeak(text)) return null
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        speakKorean(text, slow)
      }}
      aria-label={`${slow ? t('slow') : t('speak')}: ${text}`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-lg hover:bg-sky-200 ${className}`}
    >
      {slow ? '🐢' : '🔊'}
    </button>
  )
}
