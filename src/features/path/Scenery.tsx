import { VIEW_H, VIEW_W } from './geometry'

/** Decorative background: sky, sun, mountains, pines and the Do (道) gate at the summit. */
export function Scenery() {
  const pines = [
    [60, 1380],
    [570, 1300],
    [40, 1080],
    [590, 960],
    [70, 760],
    [580, 640],
    [50, 460],
    [585, 330],
  ]
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde7c3" />
          <stop offset="0.45" stopColor="#bfe3f5" />
          <stop offset="1" stopColor="#d9f0d0" />
        </linearGradient>
      </defs>
      <rect width={VIEW_W} height={VIEW_H} fill="url(#sky)" />
      <circle cx={500} cy={95} r={48} fill="#fbbf24" opacity={0.9} />
      <path
        d={`M0 330 L120 190 L230 300 L340 170 L470 310 L560 230 L640 320 L640 ${VIEW_H} L0 ${VIEW_H} Z`}
        fill="#94a3b8"
        opacity={0.35}
      />
      <path
        d={`M0 560 L90 450 L200 540 L320 430 L450 560 L640 470 L640 ${VIEW_H} L0 ${VIEW_H} Z`}
        fill="#64748b"
        opacity={0.25}
      />
      {pines.map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <rect x={-3} y={0} width={6} height={18} fill="#78350f" />
          <path d="M0 -50 L-22 -12 L22 -12 Z M0 -30 L-26 8 L26 8 Z" fill="#166534" />
        </g>
      ))}
      <g transform="translate(320 70)">
        <rect x={-60} y={-8} width={120} height={10} rx={2} fill="#b91c1c" />
        <rect x={-48} y={10} width={96} height={7} fill="#b91c1c" />
        <rect x={-40} y={0} width={9} height={60} fill="#b91c1c" />
        <rect x={31} y={0} width={9} height={60} fill="#b91c1c" />
        <text x={0} y={46} textAnchor="middle" fontSize={26} fill="#7f1d1d">
          道
        </text>
      </g>
    </g>
  )
}
