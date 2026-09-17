import { TimeNumber, type DisplayProps } from './Digital'

function blockLabel(perBlockSeconds: number): string {
  if (perBlockSeconds >= 60) {
    const m = Math.round(perBlockSeconds / 60)
    return `Each block is ${m} ${m === 1 ? 'minute' : 'minutes'}`
  }
  const s = Math.round(perBlockSeconds)
  return `Each block is ${s} ${s === 1 ? 'second' : 'seconds'}`
}

export default function LightsOut({ palette, remainingSeconds, fraction, config, size, still }: DisplayProps) {
  const totalSeconds = config.steps.reduce((a, s) => a + s.seconds, 0)
  const totalMinutes = totalSeconds / 60
  const blocks = Math.min(10, Math.max(1, Math.round(totalMinutes) || 1))
  const perBlockSeconds = totalSeconds / blocks
  const blocksLeft = Math.max(0, Math.ceil(fraction * blocks))
  const blockH = size === 'fill' ? '18vh' : size === 'extra-large' ? '13vh' : '9vh'
  return (
    <div className="flex w-full flex-col items-center gap-5" data-testid="display-lights-out">
      <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-3">
        {Array.from({ length: blocks }).map((_, i) => {
          const on = i < blocksLeft
          return (
            <div
              key={i}
              className="flex-1 rounded-2xl"
              style={{
                minWidth: '48px',
                height: blockH,
                background: on ? palette.timer : palette.surface,
                border: `2px solid ${palette.secondary}`,
                opacity: on ? 1 : 0.2,
                transition: still ? undefined : 'opacity 0.3s ease, background-color 0.3s ease',
              }}
              aria-hidden
            />
          )
        })}
      </div>
      <p className="text-base font-medium" style={{ color: palette.text }}>
        {blockLabel(perBlockSeconds)}
      </p>
      {config.display.showNumbers && (
        <TimeNumber palette={palette} remainingSeconds={remainingSeconds} showSeconds={config.display.showSeconds} />
      )}
    </div>
  )
}
