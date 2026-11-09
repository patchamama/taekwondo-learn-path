import { BELTS } from '../../data/belts'
import { Apprentice } from './Apprentice'
import { BeltIcon } from './BeltIcon'
import { Scenery } from './Scenery'
import { beltPoints, roadPath, VIEW_H, VIEW_W } from './geometry'

interface Props {
  currentIndex: number
  selectedIndex: number
  onSelect: (i: number) => void
  youAreHere: string
}

export function PathMap({ currentIndex, selectedIndex, onSelect, youAreHere }: Props) {
  const pts = beltPoints(BELTS.length)
  const full = roadPath(pts)
  const done = roadPath(pts.slice(0, currentIndex + 1))
  const me = pts[currentIndex]
  const belt = BELTS[currentIndex]

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full rounded-2xl shadow-lg"
      role="img"
      aria-label="Learning path"
    >
      <Scenery />
      <path
        d={full}
        fill="none"
        stroke="#92400e"
        strokeWidth={46}
        strokeLinecap="round"
        opacity={0.85}
      />
      <path d={full} fill="none" stroke="#d6b88a" strokeWidth={36} strokeLinecap="round" />
      <path
        d={full}
        fill="none"
        stroke="#fff"
        strokeWidth={3}
        strokeDasharray="4 14"
        strokeLinecap="round"
      />
      {currentIndex > 0 && (
        <path
          d={done}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={10}
          strokeLinecap="round"
          data-testid="done-road"
        />
      )}
      {BELTS.map((b, i) => {
        const p = pts[i]
        const reached = i <= currentIndex
        const selected = i === selectedIndex
        return (
          <g
            key={b.id}
            transform={`translate(${p.x} ${p.y})`}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(i)}
            tabIndex={0}
            role="button"
            aria-label={`${b.rank} – ${b.name.en}`}
            aria-pressed={selected}
            className="cursor-pointer outline-none focus-visible:[&>circle]:stroke-sky-500"
          >
            <circle
              r={36}
              fill={reached ? '#fffbeb' : '#e2e8f0'}
              stroke={selected ? '#0ea5e9' : '#0f172a'}
              strokeWidth={selected ? 5 : 2.5}
            />
            <g transform="translate(0 -4)">
              <BeltIcon color={b.color} stripe={b.stripe} width={46} />
            </g>
            <text y={18} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">
              {b.rank}
            </text>
          </g>
        )
      })}
      <g
        style={{
          transform: `translate(${me.x}px, ${me.y - 40}px)`,
          transition: 'transform 900ms ease-in-out',
        }}
        data-testid="apprentice"
      >
        <g transform="scale(0.75)">
          <Apprentice beltColor={belt.color} stripe={belt.stripe} />
        </g>
        <g transform="translate(0 -100)">
          <rect x={-44} y={-16} width={88} height={22} rx={11} fill="#0f172a" />
          <text textAnchor="middle" y={0} fontSize={12} fill="#fff">
            {youAreHere}
          </text>
        </g>
      </g>
    </svg>
  )
}
