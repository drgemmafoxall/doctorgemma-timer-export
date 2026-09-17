import { useState } from 'react'
import { RotateCcw, X, ArrowRight } from 'lucide-react'
import { Icon } from '../../lib/icons'
import type { ResolvedPalette } from '../../lib/themes'
import type { TimerConfig } from '../../lib/config'

const btn =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full font-heading font-semibold bg-sage text-charcoal hover:bg-forest transition-colors'

export default function FinishScreen({
  config,
  palette,
  playful,
  onRestart,
}: {
  config: TimerConfig
  palette: ResolvedPalette
  playful: boolean
  onRestart: () => void
}) {
  const [closeFailed, setCloseFailed] = useState(false)
  const isNowNext = config.kind === 'now-next'
  const isFirstThen = config.kind === 'first-then'

  const handleClose = () => {
    window.close()
    // If the browser refuses to close the tab, tell the person it's safe to close.
    window.setTimeout(() => setCloseFailed(true), 200)
  }

  return (
    <div className="relative flex flex-col items-center gap-8 text-center" data-testid="finish-screen" style={{ color: palette.text }}>
      {playful && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="absolute bottom-0 dg-float-up"
              style={{
                left: `${10 + i * 10}%`,
                width: 14,
                height: 14,
                borderRadius: 9999,
                background: palette.accent,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div style={{ color: palette.timer }}>
        <Icon name={config.theme.destination} size={96} aria-hidden />
      </div>

      <h1 className="font-heading font-bold" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }} data-testid="finish-message">
        {config.theme.messages.finish}
      </h1>

      {isNowNext && config.next && (
        <div className="flex flex-col items-center gap-2" data-testid="finish-next">
          <p className="text-lg">Next:</p>
          <div className="flex items-center gap-3">
            {config.next.icon && <Icon name={config.next.icon} size={64} style={{ color: palette.timer }} aria-hidden />}
            <span className="font-heading font-bold" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              {config.next.label}
            </span>
          </div>
        </div>
      )}

      {isFirstThen && config.next && (
        <div className="flex items-center gap-2 text-lg" data-testid="finish-then">
          <span>Then:</span>
          {config.next.icon && <Icon name={config.next.icon} size={28} style={{ color: palette.timer }} aria-hidden />}
          <span className="font-semibold">{config.next.label}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" className={btn} onClick={onRestart} data-testid="finish-restart">
          <RotateCcw size={20} strokeWidth={1.6} aria-hidden />
          Restart
        </button>
        <button type="button" className={btn} onClick={handleClose} data-testid="finish-close">
          <X size={20} strokeWidth={1.6} aria-hidden />
          Close timer
        </button>
      </div>
      {closeFailed && (
        <p className="text-base" data-testid="close-hint">
          You can close this tab now.
        </p>
      )}
    </div>
  )
}

export function NextCard({ label, palette }: { label: string; palette: ResolvedPalette }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center" data-testid="next-card" style={{ color: palette.text }}>
      <ArrowRight size={40} strokeWidth={1.6} style={{ color: palette.timer }} aria-hidden />
      <p className="font-heading font-bold" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        Next: {label}
      </p>
    </div>
  )
}
