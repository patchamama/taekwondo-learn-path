import type { Belt } from '../../data/belts'
import { useBelts } from '../store/useBelts'
import { useT } from '../i18n/useT'
import { useBeltFilter } from '../hooks/useBeltFilter'

const swatch = (b: Belt) =>
  b.stripe ? `linear-gradient(${b.color} 55%, ${b.stripe} 55%)` : b.color

/** Slider 10 Kup → 1 Dan (cumulative) plus one button per belt to show only what is new there. */
export function BeltRangeSlider() {
  const { t } = useT()
  const BELTS = useBelts()
  const { max, setMax, only, setOnly } = useBeltFilter()
  const belt = BELTS[only ?? max]
  return (
    <div className="grid gap-2 border-t bg-slate-50 px-4 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="belt-range" className="font-medium">
          {t('levelFilter')}
        </label>
        <input
          id="belt-range"
          type="range"
          min={0}
          max={BELTS.length - 1}
          step={1}
          value={max}
          onChange={(e) => {
            setOnly(null)
            setMax(Number(e.target.value))
          }}
          aria-valuetext={belt.rank}
          className="w-48 accent-amber-500"
        />
        <span className="flex items-center gap-2 font-semibold">
          <span
            className="inline-block h-4 w-10 rounded border border-slate-900"
            style={{ background: swatch(belt) }}
          />
          {belt.rank}
        </span>
      </div>
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label={t('beltOnlyNew')}
      >
        <span className="font-medium">{t('beltOnlyNew')}</span>
        <button
          type="button"
          aria-pressed={only === null}
          onClick={() => setOnly(null)}
          className={`rounded-full border px-3 py-0.5 ${only === null ? 'bg-slate-900 text-white' : 'bg-white'}`}
        >
          {t('beltAll')}
        </button>
        {BELTS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-pressed={only === i}
            onClick={() => setOnly(only === i ? null : i)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${only === i ? 'bg-slate-900 text-white' : 'bg-white'}`}
          >
            <span
              aria-hidden
              className="inline-block h-3 w-5 rounded-sm border"
              style={{ background: swatch(b) }}
            />
            {b.rank}
          </button>
        ))}
      </div>
    </div>
  )
}
