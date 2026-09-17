import type { ResolvedPalette } from '../../../lib/themes'
import type { TimerConfig } from '../../../lib/config'
import { formatClock, formatMMSS } from '../../../lib/config'

export type DisplayProps = {
  palette: ResolvedPalette
  remainingSeconds: number
  fraction: number // remaining fraction of whole timer, 1 -> 0
  still: boolean
  size: 'large' | 'extra-large' | 'fill'
  config: TimerConfig
  stepEndFractions?: number[]
}

const FONT: Record<DisplayProps['size'], string> = {
  large: 'clamp(3rem, 14vw, 9rem)',
  'extra-large': 'clamp(4rem, 18vw, 14rem)',
  fill: 'clamp(4rem, 24vw, 40rem)',
}

export function TimeNumber({
  palette,
  remainingSeconds,
  showSeconds,
}: {
  palette: ResolvedPalette
  remainingSeconds: number
  showSeconds: boolean
}) {
  return (
    <div
      className="tabular-nums font-heading font-bold"
      style={{ color: palette.text, fontSize: 'clamp(1.5rem, 5vw, 2.75rem)' }}
      data-testid="time-number"
    >
      {showSeconds ? formatMMSS(remainingSeconds) : formatClock(remainingSeconds, false)}
    </div>
  )
}

export default function Digital({ palette, remainingSeconds, size, config }: DisplayProps) {
  const text = formatClock(remainingSeconds, config.display.showSeconds)
  return (
    <div
      className="text-center font-heading font-extrabold leading-none tabular-nums"
      style={{ color: palette.timer, fontSize: FONT[size] }}
      data-testid="display-digital"
      aria-hidden
    >
      {text}
    </div>
  )
}
