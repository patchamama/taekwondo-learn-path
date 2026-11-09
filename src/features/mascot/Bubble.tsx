import type { ReactNode } from 'react'
import { Horangi, type Mood } from './Horangi'

interface Props {
  mood?: Mood
  beltColor?: string
  children: ReactNode
  tone?: 'neutral' | 'good' | 'bad'
}

const TONES = {
  neutral: 'bg-white border-slate-300',
  good: 'bg-emerald-50 border-emerald-400',
  bad: 'bg-rose-50 border-rose-400',
}

/** Horangi + speech bubble. */
export function Bubble({ mood = 'happy', beltColor, children, tone = 'neutral' }: Props) {
  return (
    <div className="flex items-end gap-3" role="status">
      <div className="shrink-0">
        <Horangi mood={mood} beltColor={beltColor} size={84} />
      </div>
      <div className={`relative rounded-2xl border-2 px-4 py-3 text-sm shadow-sm ${TONES[tone]}`}>
        <span
          className="absolute -left-2 bottom-5 h-3 w-3 rotate-45 border-b-2 border-l-2 bg-inherit"
          style={{ borderColor: 'inherit' }}
        />
        {children}
      </div>
    </div>
  )
}
