import { TimeNumber, type DisplayProps } from './Digital'

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]
}

export default function SimpleClock({
  palette,
  remainingSeconds,
  config,
  size,
  still,
}: DisplayProps) {
  const angle = Math.min(360, (remainingSeconds / 3600) * 360)
  const [hx, hy] = polar(34, angle)
  const dim =
    size === 'fill' ? 'min(80vmin, 80vh)' : size === 'extra-large' ? 'min(60vmin, 60vh)' : 'min(46vmin, 46vh)'
  return (
    <div className="flex flex-col items-center gap-4" data-testid="display-simple-clock">
      <svg viewBox="0 0 100 100" style={{ width: dim, height: dim }} aria-hidden>
        <circle cx="50" cy="50" r="44" fill={palette.surface} stroke={palette.text} strokeOpacity={0.35} strokeWidth="1.5" />
        {Array.from({ length: 12 }).map((_, i) => {
          const [x1, y1] = polar(44, (i / 12) * 360)
          const [x2, y2] = polar(38, (i / 12) * 360)
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={palette.text} strokeOpacity={0.5} strokeWidth="1.2" strokeLinecap="round" />
          )
        })}
        <line
          x1="50"
          y1="50"
          x2={hx}
          y2={hy}
          stroke={palette.timer}
          strokeWidth="3"
          strokeLinecap="round"
          style={still ? undefined : { transition: 'all 0.3s linear' }}
        />
        <circle cx="50" cy="50" r="3" fill={palette.timer} />
      </svg>
      {config.display.showNumbers && (
        <TimeNumber palette={palette} remainingSeconds={remainingSeconds} showSeconds={config.display.showSeconds} />
      )}
    </div>
  )
}
