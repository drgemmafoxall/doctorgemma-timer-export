import { TimeNumber, type DisplayProps } from './Digital'

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]
}

function wedgePath(angle: number): string {
  const R = 40
  const a = Math.min(359.999, Math.max(0.0001, angle))
  const [sx, sy] = polar(R, 0)
  const [ex, ey] = polar(R, a)
  const large = a > 180 ? 1 : 0
  return `M50,50 L${sx.toFixed(2)},${sy.toFixed(2)} A${R},${R} 0 ${large} 1 ${ex.toFixed(2)},${ey.toFixed(2)} Z`
}

export default function ShadedDisc({
  palette,
  remainingSeconds,
  fraction,
  config,
  size,
}: DisplayProps) {
  const sixty = config.display.discScale === 'sixty-minutes'
  const angle = sixty
    ? Math.min(360, (remainingSeconds / 3600) * 360)
    : Math.max(0, fraction) * 360

  const dim = size === 'fill' ? 'min(80vmin, 80vh)' : size === 'extra-large' ? 'min(60vmin, 60vh)' : 'min(46vmin, 46vh)'

  const ticks = sixty ? 60 : 12
  return (
    <div className="flex flex-col items-center gap-4" data-testid="display-shaded-disc">
      <svg viewBox="0 0 100 100" style={{ width: dim, height: dim }} aria-hidden>
        <circle cx="50" cy="50" r="44" fill={palette.surface} stroke={palette.secondary} strokeWidth="1.5" />
        {angle > 0.01 && <path d={wedgePath(angle)} fill={palette.timer} />}
        {Array.from({ length: ticks }).map((_, i) => {
          const major = i % 5 === 0
          const [x1, y1] = polar(44, (i / ticks) * 360)
          const [x2, y2] = polar(major ? 39 : 41.5, (i / ticks) * 360)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={palette.text}
              strokeOpacity={major ? 0.5 : 0.25}
              strokeWidth={major ? 1 : 0.6}
              strokeLinecap="round"
            />
          )
        })}
        <circle cx="50" cy="50" r="2.5" fill={palette.text} />
      </svg>
      {config.display.showNumbers && (
        <TimeNumber
          palette={palette}
          remainingSeconds={remainingSeconds}
          showSeconds={config.display.showSeconds}
        />
      )}
    </div>
  )
}
