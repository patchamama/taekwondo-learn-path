export type Mood = 'happy' | 'cheer' | 'think' | 'oops'

interface Props {
  mood?: Mood
  size?: number
  beltColor?: string
}

/** Horangi (호랑이): the tiger, Korea's most iconic animal, is your instructor. */
export function Horangi({ mood = 'happy', size = 96, beltColor = '#f5f5f0' }: Props) {
  const mouth =
    mood === 'cheer'
      ? 'M -12 22 Q 0 38 12 22 Z'
      : mood === 'oops'
        ? 'M -9 30 Q 0 22 9 30'
        : mood === 'think'
          ? 'M -7 27 L 9 25'
          : 'M -11 24 Q 0 34 11 24'
  return (
    <svg
      viewBox="-70 -75 140 150"
      width={size}
      height={size}
      role="img"
      aria-label={`Horangi the tiger (${mood})`}
    >
      <circle cx={-46} cy={-40} r={20} fill="#f59e0b" stroke="#0f172a" strokeWidth={3} />
      <circle cx={46} cy={-40} r={20} fill="#f59e0b" stroke="#0f172a" strokeWidth={3} />
      <circle cx={-46} cy={-40} r={9} fill="#fde68a" />
      <circle cx={46} cy={-40} r={9} fill="#fde68a" />
      <ellipse cx={0} cy={5} rx={58} ry={54} fill="#fb923c" stroke="#0f172a" strokeWidth={3.5} />
      <path
        d="M -8 -48 L 0 -30 L 8 -48 M -26 -44 L -18 -28 M 26 -44 L 18 -28 M -56 0 L -40 4 M -55 18 L -40 14 M 56 0 L 40 4 M 55 18 L 40 14"
        stroke="#0f172a"
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx={0} cy={26} rx={30} ry={22} fill="#fff7ed" />
      <path d="M -6 12 L 6 12 L 0 20 Z" fill="#0f172a" />
      <path
        d={mouth}
        stroke="#0f172a"
        strokeWidth={3}
        strokeLinecap="round"
        fill={mood === 'cheer' ? '#b91c1c' : 'none'}
      />
      {mood === 'think' ? (
        <>
          <circle cx={-22} cy={-4} r={7} fill="#fff" stroke="#0f172a" strokeWidth={2} />
          <circle cx={22} cy={-4} r={7} fill="#fff" stroke="#0f172a" strokeWidth={2} />
          <circle cx={-19} cy={-6} r={3} fill="#0f172a" />
          <circle cx={25} cy={-6} r={3} fill="#0f172a" />
        </>
      ) : mood === 'cheer' ? (
        <>
          <path
            d="M -30 -2 Q -22 -12 -14 -2"
            stroke="#0f172a"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 14 -2 Q 22 -12 30 -2"
            stroke="#0f172a"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx={-22} cy={-2} r={5} fill="#0f172a" />
          <circle cx={22} cy={-2} r={5} fill="#0f172a" />
          <circle cx={-20} cy={-4} r={1.6} fill="#fff" />
          <circle cx={24} cy={-4} r={1.6} fill="#fff" />
        </>
      )}
      {mood === 'oops' && (
        <path
          d="M 34 -26 Q 40 -14 34 -8 Q 28 -14 34 -26 Z"
          fill="#7dd3fc"
          stroke="#0f172a"
          strokeWidth={1.5}
        />
      )}
      <rect
        x={-52}
        y={-30}
        width={104}
        height={9}
        rx={4}
        fill={beltColor}
        stroke="#0f172a"
        strokeWidth={2.5}
      />
    </svg>
  )
}
