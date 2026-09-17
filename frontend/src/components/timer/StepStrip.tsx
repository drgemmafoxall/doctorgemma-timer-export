import { Check } from 'lucide-react'
import { Icon } from '../../lib/icons'
import type { ResolvedPalette } from '../../lib/themes'
import type { TimerConfig } from '../../lib/config'

export default function StepStrip({
  config,
  currentIndex,
  palette,
}: {
  config: TimerConfig
  currentIndex: number
  palette: ResolvedPalette
}) {
  const steps = config.steps
  return (
    <div className="flex w-full max-w-4xl flex-wrap items-stretch justify-center gap-3" data-testid="step-strip">
      {steps.map((step, i) => {
        const isCurrent = i === currentIndex
        const isDone = i < currentIndex
        const mins = Math.round(step.seconds / 60)
        return (
          <div
            key={i}
            className="flex min-w-[110px] flex-col items-center gap-1 rounded-2xl px-4 py-3"
            style={{
              background: palette.surface,
              border: isCurrent ? `4px solid ${palette.accent}` : `1px solid ${palette.secondary}`,
              opacity: isDone ? 0.6 : 1,
              color: palette.text,
            }}
            data-testid={`step-strip-item-${i}`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <div className="flex items-center gap-1">
              {isDone && <Check size={18} strokeWidth={1.6} aria-label="Finished" />}
              {step.icon && <Icon name={step.icon} size={22} style={{ color: palette.timer }} aria-hidden />}
            </div>
            <span className="text-center text-sm font-semibold">{step.label || `Step ${i + 1}`}</span>
            <span className="text-xs opacity-80">
              {mins} {mins === 1 ? 'minute' : 'minutes'}
            </span>
          </div>
        )
      })}
      {config.next && (
        <div
          className="flex min-w-[110px] flex-col items-center gap-1 rounded-2xl px-4 py-3"
          style={{ background: palette.surface, border: `1px dashed ${palette.secondary}`, color: palette.text }}
          data-testid="step-strip-then"
        >
          <div className="flex items-center gap-1">
            {config.next.icon && <Icon name={config.next.icon} size={22} style={{ color: palette.timer }} aria-hidden />}
          </div>
          <span className="text-center text-sm font-semibold">Then: {config.next.label}</span>
        </div>
      )}
    </div>
  )
}
