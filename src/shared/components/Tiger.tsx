import { Horangi } from '../../features/mascot/Horangi'

interface Props {
  ok: boolean
  variant?: number
  beltColor: string
}

/** Reuse Horangi's artwork; short celebrations never delay the quiz.
 * motion-safe leaves the same readable expression without movement for reduced motion.
 */
export function Tiger({ ok, variant = 0, beltColor }: Props) {
  return (
    <div
      data-testid="feedback-tiger"
      className={`shrink-0 ${ok && variant % 2 === 0 ? 'motion-safe:animate-bounce' : 'motion-safe:animate-pulse'}`}
      style={{ animationDuration: '600ms', animationIterationCount: 2 }}
    >
      <Horangi mood={ok ? (variant % 2 === 0 ? 'cheer' : 'happy') : 'oops'} beltColor={beltColor} size={84} />
    </div>
  )
}
