interface Props {
  color: string
  stripe?: string
  width?: number
}

export function BeltIcon({ color, stripe, width = 44 }: Props) {
  const h = width * 0.3
  return (
    <g>
      <rect
        x={-width / 2}
        y={-h / 2}
        width={width}
        height={h}
        rx={3}
        fill={color}
        stroke="#0f172a"
        strokeWidth={1.5}
      />
      {stripe && <rect x={width * 0.12} y={-h / 2} width={width * 0.14} height={h} fill={stripe} />}
      <rect
        x={-4}
        y={-h / 2 - 3}
        width={8}
        height={h + 6}
        rx={2}
        fill={color}
        stroke="#0f172a"
        strokeWidth={1.5}
      />
    </g>
  )
}
