import { useSyncExternalStore } from 'react'
import { getLastSpoken, subscribeSpoken } from '../lib/speech'
import { useT } from '../i18n/useT'

/** Small pill showing where the last spoken word came from (recording or browser voice) and a download link. */
export function AudioSourceBadge() {
  const { t } = useT()
  const info = useSyncExternalStore(subscribeSpoken, getLastSpoken)
  if (!info) return null
  const label =
    info.source === 'mp3'
      ? t('srcMp3')
      : info.source === 'blocked'
        ? t('srcBlocked')
        : t('srcBrowser')
  const tone =
    info.source === 'mp3'
      ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
      : 'border-amber-400 bg-amber-50 text-amber-900'
  return (
    <div
      role="status"
      className={`fixed bottom-3 left-3 z-30 flex max-w-xs items-center gap-2 rounded-full border px-3 py-1 text-xs shadow ${tone}`}
    >
      <span lang="ko" className="font-semibold">
        {info.text}
      </span>
      <span>{label}</span>
      {info.file && (
        <a
          href={import.meta.env.BASE_URL + info.file}
          download={info.file.split('/').pop()}
          className="underline"
          aria-label={`${t('srcDownload')}: ${info.text}`}
        >
          ⬇ {t('srcDownload')}
        </a>
      )}
    </div>
  )
}
