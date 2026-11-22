import { useEffect, useMemo, useState } from 'react'
import { framesFor } from '../audio/images'

/** A clip shown as its stills in sequence (light: no video iframe per option). */
export function ClipTile({ cardId, label }: { cardId: string; label: string }) {
  const frames = useMemo(() => framesFor(cardId), [cardId])
  const [n, setN] = useState(0)
  const [broken, setBroken] = useState(false)
  useEffect(() => {
    if (frames.length < 2) return
    const timer = setInterval(() => setN((v) => (v + 1) % frames.length), 600)
    return () => clearInterval(timer)
  }, [frames])
  if (frames.length === 0 || broken) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-lg bg-slate-100 text-xs text-slate-500">
        {label}
      </div>
    )
  }
  return (
    <img
      src={frames[n]}
      alt={label}
      onError={() => setBroken(true)}
      className="aspect-video w-full rounded-lg bg-black object-contain"
    />
  )
}
