import { useState } from 'react'
import type { AudioSection } from '../../data/audioManifest'
import { SECTION_ORDER } from '../../data/audioManifest'
import type { StringKey } from '../../shared/i18n/strings'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'

const SECTION_LABEL: Record<AudioSection, StringKey> = {
  words: 'studyWords',
  hand: 'catHand',
  foot: 'catFoot',
  stance: 'catStance',
  combo: 'catCombo',
  terms: 'studyTerms',
  forms: 'navForms',
}

export const FORMATS: { id: string; label: StringKey }[] = [
  { id: 'meaning', label: 'fmtMeaning' },
  { id: 'recall', label: 'fmtRecall' },
  { id: 'listen', label: 'fmtListen' },
  { id: 'listenmeaning', label: 'fmtListenMeaning' },
  { id: 'frames', label: 'fmtFrames' },
  { id: 'video', label: 'fmtVideo' },
  { id: 'pickclip', label: 'fmtPickClip' },
  { id: 'build', label: 'fmtBuild' },
]

/** Foldable panel above Practice: which sections and which question formats to practise. */
export function PracticeOptions({ available }: { available: Record<string, number> }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const sections = useAppStore((s) => s.practiceSections)
  const setSections = useAppStore((s) => s.setPracticeSections)
  const formats = useAppStore((s) => s.practiceFormats)
  const setFormats = useAppStore((s) => s.setPracticeFormats)
  const hangulOnly = useAppStore((s) => s.hangulOnly)
  const setHangulOnly = useAppStore((s) => s.setHangulOnly)
  const clipLayout = useAppStore((s) => s.clipLayout)
  const setClipLayout = useAppStore((s) => s.setClipLayout)

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

  return (
    <section className="rounded-xl border bg-white p-3 text-sm">
      <button
        type="button"
        className="font-semibold"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ⚙ {t('practiceOptions')} {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="mt-3 grid gap-4">
          <fieldset className="grid gap-1">
            <legend className="mb-1 font-semibold text-slate-600">{t('practiceSections')}</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {SECTION_ORDER.map((id) => (
                <label
                  key={id}
                  className={`flex items-center gap-2 ${available[id] ? '' : 'opacity-50'}`}
                >
                  <input
                    type="checkbox"
                    checked={sections.includes(id)}
                    onChange={() => setSections(toggle(sections, id))}
                  />
                  <span>{t(SECTION_LABEL[id])}</span>
                  <span aria-hidden className="text-xs text-slate-400">
                    ({available[id] ?? 0})
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="grid gap-1">
            <legend className="mb-1 font-semibold text-slate-600">{t('practiceFormats')}</legend>
            <div className="grid gap-1 sm:grid-cols-2">
              {FORMATS.map((f) => (
                <label key={f.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formats.includes(f.id)}
                    onChange={() => setFormats(toggle(formats, f.id))}
                  />
                  <span>{t(f.label)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hangulOnly}
              onChange={(e) => setHangulOnly(e.target.checked)}
            />
            <span>{t('hangulOnly')}</span>
          </label>

          <fieldset className="flex flex-wrap gap-x-4 gap-y-1">
            <legend className="mb-1 font-semibold text-slate-600">{t('clipLayout')}</legend>
            {(['row', 'grid'] as const).map((id) => (
              <label key={id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="clipLayout"
                  checked={clipLayout === id}
                  onChange={() => setClipLayout(id)}
                />
                <span>{t(id === 'row' ? 'clipLayoutRow' : 'clipLayoutGrid')}</span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
    </section>
  )
}
