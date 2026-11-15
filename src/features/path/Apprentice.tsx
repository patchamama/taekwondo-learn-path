interface Props {
  beltColor: string
  stripe?: string
}

/** Little taekwondo apprentice drawn in SVG, origin at the feet. */
export function Apprentice({ beltColor, stripe }: Props) {
  return (
    <g>
      <ellipse cx={0} cy={2} rx={18} ry={5} fill="#0f172a" opacity={0.25} />
      <rect
        x={-12}
        y={-30}
        width={9}
        height={30}
        rx={3}
        fill="#f8fafc"
        stroke="#0f172a"
        strokeWidth={1.5}
      />
      <rect
        x={3}
        y={-30}
        width={9}
        height={30}
        rx={3}
        fill="#f8fafc"
        stroke="#0f172a"
        strokeWidth={1.5}
      />
      <rect
        x={-16}
        y={-66}
        width={32}
        height={42}
        rx={8}
        fill="#f8fafc"
        stroke="#0f172a"
        strokeWidth={1.5}
      />
      <rect
        x={-17}
        y={-44}
        width={34}
        height={7}
        fill={beltColor}
        stroke="#0f172a"
        strokeWidth={1.5}
      />
      {stripe && <rect x={6} y={-44} width={5} height={7} fill={stripe} />}
      <rect
        x={-26}
        y={-62}
        width={10}
        height={26}
        rx={4}
        fill="#f8fafc"
        stroke="#0f172a"
        strokeWidth={1.5}
        transform="rotate(18 -21 -62)"
      />
      <rect
        x={16}
        y={-62}
        width={10}
        height={26}
        rx={4}
        fill="#f8fafc"
        stroke="#0f172a"
        strokeWidth={1.5}
        transform="rotate(-18 21 -62)"
      />
      <circle cx={0} cy={-80} r={14} fill="#f5c9a0" stroke="#0f172a" strokeWidth={1.5} />
      <path d="M -14 -84 Q 0 -102 14 -84 Q 0 -90 -14 -84 Z" fill="#1e293b" />
      <circle cx={-5} cy={-79} r={1.6} fill="#0f172a" />
      <circle cx={5} cy={-79} r={1.6} fill="#0f172a" />
      <path
        d="M -4 -73 Q 0 -70 4 -73"
        stroke="#0f172a"
        strokeWidth={1.3}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}
