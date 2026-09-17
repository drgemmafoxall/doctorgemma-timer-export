import { TimeNumber, type DisplayProps } from './Digital'

export default function Sand({ palette, remainingSeconds, fraction, config, size, still }: DisplayProps) {
  const f = Math.min(1, Math.max(0, fraction))
  const topLevel = 8 + (1 - f) * 40 // top of remaining top-sand (empties downward)
  const bottomLevel = 92 - (1 - f) * 40 // bottom sand rises
  const dim = size === 'fill' ? 'min(70vmin, 78vh)' : size === 'extra-large' ? 'min(52vmin, 56vh)' : 'min(40vmin, 44vh)'
  return (
    <div className="flex flex-col items-center gap-4" data-testid="display-sand">
      <svg viewBox="0 0 100 100" style={{ width: dim, height: dim }} aria-hidden>
        <defs>
          <clipPath id="sand-top">
            <polygon points="14,8 86,8 50,49" />
          </clipPath>
          <clipPath id="sand-bottom">
            <polygon points="50,51 86,92 14,92" />
          </clipPath>
        </defs>
        {/* frame */}
        <line x1="10" y1="8" x2="90" y2="8" stroke={palette.text} strokeWidth="3" strokeLinecap="round" />
        <line x1="10" y1="92" x2="90" y2="92" stroke={palette.text} strokeWidth="3" strokeLinecap="round" />
        <polygon points="14,8 86,8 50,49" fill={palette.surface} stroke={palette.secondary} strokeWidth="1.2" />
        <polygon points="50,51 86,92 14,92" fill={palette.surface} stroke={palette.secondary} strokeWidth="1.2" />
        {/* top sand */}
        <rect x="0" y={topLevel} width="100" height={50 - topLevel + 2} fill={palette.timer} clipPath="url(#sand-top)" />
        {/* bottom sand */}
        <rect x="0" y={bottomLevel} width="100" height={92 - bottomLevel} fill={palette.timer} clipPath="url(#sand-bottom)" />
        {/* falling stream (only when moving) */}
        {!still && f > 0 && f < 1 && <line x1="50" y1="49" x2="50" y2="60" stroke={palette.timer} strokeWidth="1.4" strokeLinecap="round" />}
      </svg>
      {config.display.showNumbers && (
        <TimeNumber palette={palette} remainingSeconds={remainingSeconds} showSeconds={config.display.showSeconds} />
      )}
    </div>
  )
}
