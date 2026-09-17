import { useEffect, useRef } from 'react'
import { Timer, ArrowRight, ListOrdered, Volume2 } from 'lucide-react'
import type { TimerConfig, TimerKind } from '../../lib/config'
import { PLAIN_THEME } from '../../lib/themes'

const OPTIONS: { key: TimerKind; icon: typeof Timer; title: string; desc: string }[] = [
  { key: 'simple', icon: Timer, title: 'Just a timer', desc: 'A countdown with no labels.' },
  { key: 'now-next', icon: ArrowRight, title: 'Now and next', desc: '5 minutes of Lego, then bath time.' },
  { key: 'first-then', icon: ListOrdered, title: 'First, then', desc: '2 to 6 steps, back to back.' },
  {
    key: 'audio',
    icon: Volume2,
    title: 'Audio timer',
    desc: 'Beeps and spoken updates for blind and low-vision users.',
  },
]

function applyKind(config: TimerConfig, kind: TimerKind): TimerConfig {
  const next: TimerConfig = { ...config, kind }
  if (kind === 'first-then') {
    if (config.steps.length < 2) {
      next.steps = [
        { label: '', icon: null, seconds: config.steps[0]?.seconds ?? 300 },
        { label: '', icon: null, seconds: 300 },
      ]
    }
  } else {
    next.steps = [config.steps[0] ?? { label: '', icon: null, seconds: 300 }]
  }
  if (kind === 'now-next' && !next.next) next.next = { label: '', icon: null }
  if (kind === 'audio') {
    next.sound = {
      ...config.sound,
      enabled: true,
      speech: true,
      finalBeeps: 'last-10',
      minuteBeeps: 'last-5-minutes',
      warnings: { halfway: true, fiveMin: true, oneMin: true },
    }
    next.display = {
      ...config.display,
      style: 'digital',
      showNumbers: true,
      palette: 'high-contrast-dark',
      size: 'fill',
    }
    next.motion = 'still'
    next.theme = PLAIN_THEME
  }
  return next
}

export default function StepType({
  config,
  setConfig,
}: {
  config: TimerConfig
  setConfig: (c: TimerConfig) => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const selectedIndex = OPTIONS.findIndex((o) => o.key === config.kind)

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return
    e.preventDefault()
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
    const nextIndex = (selectedIndex + dir + OPTIONS.length) % OPTIONS.length
    setConfig(applyKind(config, OPTIONS[nextIndex].key))
  }

  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="mb-2 font-heading text-2xl font-bold text-charcoal outline-none">
        What kind of timer?
      </h2>
      <p className="mb-6 text-slate">Choose how you would like the timer to work.</p>
      <div role="radiogroup" aria-label="Kind of timer" onKeyDown={onKeyNav} className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((o, i) => {
          const selected = config.kind === o.key
          const Ico = o.icon
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (selectedIndex === -1 && i === 0) ? 0 : -1}
              onClick={() => setConfig(applyKind(config, o.key))}
              className={`flex items-start gap-4 rounded-card border bg-white p-5 text-left transition-colors ${
                selected ? 'border-sage ring-2 ring-sage' : 'border-card-border hover:border-sage'
              }`}
              data-testid={`kind-${o.key}`}
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-peach/40 text-forest">
                <Ico size={26} strokeWidth={1.6} aria-hidden />
              </span>
              <span>
                <span className="block font-heading text-lg font-bold text-charcoal">{o.title}</span>
                <span className="block text-sm text-slate">{o.desc}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
