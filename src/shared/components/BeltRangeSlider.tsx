import { BELTS } from '../../data/belts'
import { useT } from '../i18n/useT'
import { useBeltFilter } from '../hooks/useBeltFilter'

/** Slider from 10 Kup to 1 Dan; everything above the chosen belt is filtered out of the lists. */
export function BeltRangeSlider() {
  const { t } = useT()
  const { max, setMax } = useBeltFilter()
  const belt = BELTS[max]
  return (
    <div className="flex flex-wrap items-center gap-3 border-t bg-slate-50 px-4 py-2 text-sm">
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
        onChange={(e) => setMax(Number(e.target.value))}
        aria-valuetext={belt.rank}
        className="w-48 accent-amber-500"
      />
      <span className="flex items-center gap-2 font-semibold">
        <span
          className="inline-block h-4 w-10 rounded border border-slate-900"
          style={{
            background: belt.stripe
              ? `linear-gradient(90deg, ${belt.color} 70%, ${belt.stripe} 70%)`
              : belt.color,
          }}
        />
        {belt.rank}
      </span>
    </div>
  )
}
