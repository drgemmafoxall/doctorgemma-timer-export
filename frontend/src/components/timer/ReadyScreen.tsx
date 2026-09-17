import { useEffect, useRef, type ReactNode } from 'react'
import type { ResolvedPalette } from '../../lib/themes'
import type { TimerConfig } from '../../lib/config'

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  const parts: string[] = []
  if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`)
  if (s > 0) parts.push(`${s} ${s === 1 ? 'second' : 'seconds'}`)
  return parts.join(' ') || '0 seconds'
}

export default function ReadyScreen({
  config,
  palette,
  totalSeconds,
  onStart,
  preview,
}: {
  config: TimerConfig
  palette: ResolvedPalette
  totalSeconds: number
  onStart: () => void
  preview: ReactNode
}) {
  const isAudio = config.kind === 'audio'
  const btnRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    btnRef.current?.focus()
  }, [])
  return (
    <div className="flex flex-col items-center gap-8 text-center" data-testid="ready-screen" style={{ color: palette.text }}>
      <h1 className="font-heading font-bold" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}>
        {config.steps[0].label || config.theme.themeName}
      </h1>
      <div aria-hidden className="pointer-events-none opacity-95">
        {preview}
      </div>
      <p className="text-lg" data-testid="ready-total-time">
        Total time: {formatDuration(totalSeconds)}
      </p>
      <button
        ref={btnRef}
        type="button"
        onClick={onStart}
        className="inline-flex min-h-[64px] items-center justify-center rounded-full bg-sage px-12 font-heading text-xl font-bold text-charcoal transition-colors hover:bg-forest"
        data-testid="start-button"
        aria-describedby={isAudio ? 'audio-hint' : undefined}
      >
        Start
      </button>
      {isAudio && (
        <span id="audio-hint" className="sr-only">
          Press Start. Once the timer is running, press Space at any time to hear the time left.
        </span>
      )}
    </div>
  )
}
