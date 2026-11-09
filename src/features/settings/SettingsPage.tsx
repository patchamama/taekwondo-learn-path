import { useT } from '../../shared/i18n/useT'
import { useAppStore, type VideoLang } from '../../shared/store/useAppStore'

const VIDEO_OPTIONS: { id: VideoLang; key: 'videoAuto' | 'videoEs' | 'videoDe' }[] = [
  { id: 'auto', key: 'videoAuto' },
  { id: 'es', key: 'videoEs' },
  { id: 'de', key: 'videoDe' },
]

export function SettingsPage() {
  const { t } = useT()
  const strict = useAppStore((s) => s.strictOrder)
  const setStrict = useAppStore((s) => s.setStrictOrder)
  const videoLang = useAppStore((s) => s.videoLang)
  const setVideoLang = useAppStore((s) => s.setVideoLang)

  return (
    <section className="mx-auto grid max-w-xl gap-6">
      <h1 className="text-2xl font-bold">{t('settingsTitle')}</h1>

      <div className="rounded-xl border bg-white p-5">
        <label className="flex items-start gap-3 font-medium">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5"
            checked={strict}
            onChange={(e) => setStrict(e.target.checked)}
          />
          <span>{t('strictOrder')}</span>
        </label>
        <p className="mt-2 text-sm text-slate-600">{t('strictOrderHint')}</p>
      </div>

      <fieldset className="rounded-xl border bg-white p-5">
        <legend className="px-1 font-medium">{t('videoLang')}</legend>
        <div className="grid gap-2">
          {VIDEO_OPTIONS.map((o) => (
            <label key={o.id} className="flex items-center gap-3">
              <input
                type="radio"
                name="videoLang"
                checked={videoLang === o.id}
                onChange={() => setVideoLang(o.id)}
              />
              {t(o.key)}
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  )
}
