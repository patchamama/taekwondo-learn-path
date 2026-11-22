import { useT } from '../../shared/i18n/useT'
import { useAppStore, type VideoLang } from '../../shared/store/useAppStore'
import { SiteQrCode } from './SiteQrCode'

const VIDEO_OPTIONS: { id: VideoLang; key: 'videoAuto' | 'videoEs' | 'videoDe' }[] = [
  { id: 'auto', key: 'videoAuto' },
  { id: 'es', key: 'videoEs' },
  { id: 'de', key: 'videoDe' },
]

export function SettingsPage() {
  const { t } = useT()
  const strict = useAppStore((s) => s.strictOrder)
  const setStrict = useAppStore((s) => s.setStrictOrder)
  const listening = useAppStore((s) => s.listening)
  const setListening = useAppStore((s) => s.setListening)
  const videoLang = useAppStore((s) => s.videoLang)
  const setVideoLang = useAppStore((s) => s.setVideoLang)
  const autoCheck = useAppStore((s) => s.quizAutoCheck)
  const setAutoCheck = useAppStore((s) => s.setQuizAutoCheck)
  const resultMode = useAppStore((s) => s.quizResultMode)
  const setResultMode = useAppStore((s) => s.setQuizResultMode)
  const autoContinue = useAppStore((s) => s.quizAutoContinue)
  const setAutoContinue = useAppStore((s) => s.setQuizAutoContinue)
  const maxQuestions = useAppStore((s) => s.quizMaxQuestions)
  const setMaxQuestions = useAppStore((s) => s.setQuizMaxQuestions)
  const scheme = useAppStore((s) => s.beltScheme)
  const setScheme = useAppStore((s) => s.setBeltScheme)

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

      <div className="rounded-xl border bg-white p-5">
        <label className="flex items-start gap-3 font-medium">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5"
            checked={listening}
            onChange={(e) => setListening(e.target.checked)}
          />
          <span>{t('listening')}</span>
        </label>
        <p className="mt-2 text-sm text-slate-600">{t('listeningHint')}</p>
      </div>

      <div className="grid gap-4 rounded-xl border bg-white p-5">
        <label className="flex items-start gap-3 font-medium">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5"
            checked={autoCheck}
            onChange={(e) => setAutoCheck(e.target.checked)}
          />
          <span>{t('quizAutoCheck')}</span>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {t('quizResultMode')}
          <select
            className="w-fit rounded border px-2 py-1 font-normal"
            value={resultMode}
            onChange={(e) => setResultMode(e.target.value as typeof resultMode)}
          >
            <option value="button">{t('quizResultButton')}</option>
            <option value="3s">{t('quizResult3')}</option>
            <option value="5s">{t('quizResult5')}</option>
          </select>
        </label>
        <label className="flex items-start gap-3 text-sm font-medium">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5"
            checked={autoContinue}
            disabled={resultMode === 'button'}
            onChange={(e) => setAutoContinue(e.target.checked)}
          />
          <span>{t('quizAutoContinue')}</span>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {t('quizMaxQuestions')}
          <input
            type="number"
            min={3}
            max={40}
            className="w-24 rounded border px-2 py-1 font-normal"
            value={maxQuestions}
            onChange={(e) => setMaxQuestions(Number(e.target.value))}
          />
        </label>
      </div>

      <fieldset className="rounded-xl border bg-white p-5">
        <legend className="px-1 font-medium">{t('beltScheme')}</legend>
        <div className="grid gap-2">
          {(['club', 'traditional'] as const).map((id) => (
            <label key={id} className="flex items-start gap-3">
              <input
                type="radio"
                name="beltScheme"
                className="mt-1"
                checked={scheme === id}
                onChange={() => setScheme(id)}
              />
              <span>{t(id === 'club' ? 'beltSchemeClub' : 'beltSchemeTrad')}</span>
            </label>
          ))}
        </div>
      </fieldset>

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

      <SiteQrCode />
    </section>
  )
}
