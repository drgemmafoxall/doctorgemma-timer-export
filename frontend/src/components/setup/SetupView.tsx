import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, ChevronDown } from 'lucide-react'
import Footer from '../Footer'
import Preview from './Preview'
import StepType from './StepType'
import StepTime from './StepTime'
import StepTheme from './StepTheme'
import StepLook from './StepLook'
import StepSound from './StepSound'
import type { TimerConfig } from '../../lib/config'
import { PLAIN_THEME } from '../../lib/themes'
import type { Me } from '../../lib/api'

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function makeDefault(): TimerConfig {
  return {
    v: 1,
    kind: 'simple',
    steps: [{ label: '', icon: null, seconds: 300 }],
    autoAdvance: true,
    theme: PLAIN_THEME,
    display: {
      style: 'digital',
      discScale: 'whole-timer',
      showNumbers: true,
      showSeconds: true,
      size: 'large',
      palette: 'theme',
      showFacts: false,
    },
    sound: {
      enabled: false,
      volume: 0.5,
      endChime: 'soft-bell',
      warnings: { halfway: false, fiveMin: false, oneMin: false },
      finalBeeps: 'off',
      minuteBeeps: 'off',
      speech: false,
      speechRate: 0.9,
      vibrate: false,
    },
    motion: prefersReducedMotion() ? 'still' : 'gentle',
    controls: { allowAddTime: true, grownUpLock: false },
  }
}

const STEP_COUNT = 5

export default function SetupView({
  me,
  refreshMe,
  setMe,
}: {
  me: Me | null
  refreshMe: () => void
  setMe: (m: Me) => void
}) {
  const [config, setConfig] = useState<TimerConfig>(makeDefault)
  const [step, setStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  const stepEl = useMemo(() => {
    switch (step) {
      case 0:
        return <StepType config={config} setConfig={setConfig} />
      case 1:
        return <StepTime config={config} setConfig={setConfig} />
      case 2:
        return <StepTheme config={config} setConfig={setConfig} me={me} setMe={setMe} />
      case 3:
        return <StepLook config={config} setConfig={setConfig} me={me} />
      case 4:
        return <StepSound config={config} setConfig={setConfig} me={me} />
      default:
        return null
    }
  }, [step, config, me, setMe])

  const startAgain = () => {
    setConfig(makeDefault())
    setStep(0)
    refreshMe()
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-8 text-center">
          <h1 className="font-heading text-4xl font-extrabold text-charcoal sm:text-5xl">
            Special Interest Countdown Timer
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate">
            Set up a calm, predictable countdown themed around a special interest, then open it in
            its own tab. Nothing is saved.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Wizard */}
          <div className="overflow-hidden rounded-card border border-card-border bg-white shadow-sm">
            <div className="h-2 w-full bg-accent-peach" aria-hidden />
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate" data-testid="wizard-progress">
                  Step {step + 1} of {STEP_COUNT}
                </span>
                <button
                  type="button"
                  onClick={startAgain}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-forest underline underline-offset-2"
                  data-testid="start-again"
                >
                  <RefreshCw size={14} aria-hidden />
                  Start again
                </button>
              </div>

              {/* progress bar */}
              <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }} />
              </div>

              {stepEl}

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-sage bg-white px-6 font-heading font-semibold text-charcoal transition-colors hover:bg-muted disabled:opacity-40"
                  data-testid="wizard-back"
                >
                  <ChevronLeft size={20} aria-hidden />
                  Back
                </button>
                {step < STEP_COUNT - 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.min(STEP_COUNT - 1, s + 1))}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-sage px-6 font-heading font-semibold text-charcoal transition-colors hover:bg-forest"
                    data-testid="wizard-next"
                  >
                    Next
                    <ChevronRight size={20} aria-hidden />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview: side panel on desktop, collapsible on mobile */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="hidden lg:block">
              <h2 className="mb-3 font-heading text-lg font-bold text-charcoal">Live preview</h2>
              <Preview config={config} />
            </div>
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                aria-expanded={showPreview}
                className="flex w-full items-center justify-between rounded-card border border-card-border bg-white px-5 py-3 font-heading font-bold text-charcoal"
                data-testid="preview-toggle"
              >
                Preview
                <ChevronDown size={20} className={`transition-transform ${showPreview ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {showPreview && (
                <div className="mt-3">
                  <Preview config={config} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
