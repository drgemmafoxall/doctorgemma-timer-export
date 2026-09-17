import { useEffect, useRef } from 'react'
import { Minus, Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import type { TimerConfig, Step } from '../../lib/config'
import { MAX_TOTAL_SECONDS, MIN_STEP_SECONDS } from '../../lib/config'
import IconPicker from './IconPicker'

const CHIP_MINUTES = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60]

function Duration({
  seconds,
  onChange,
  maxSeconds,
  testid,
}: {
  seconds: number
  onChange: (s: number) => void
  maxSeconds: number
  testid: string
}) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const clamp = (s: number) => Math.min(maxSeconds, Math.max(MIN_STEP_SECONDS, s))
  return (
    <div data-testid={testid}>
      <div className="flex flex-wrap gap-2">
        {CHIP_MINUTES.map((m) => {
          const active = seconds === m * 60
          const disabled = m * 60 > maxSeconds
          return (
            <button
              key={m}
              type="button"
              disabled={disabled}
              onClick={() => onChange(clamp(m * 60))}
              className={`min-h-[40px] rounded-full px-4 text-sm font-semibold transition-colors ${
                active ? 'bg-sage text-charcoal' : 'bg-white text-charcoal border border-card-border hover:border-sage'
              } ${disabled ? 'opacity-40' : ''}`}
              data-testid={`${testid}-chip-${m}`}
            >
              {m} min
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-4">
        <label className="flex flex-col text-sm text-slate">
          Minutes
          <div className="mt-1 flex items-center gap-1">
            <button type="button" aria-label="One minute fewer" className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border" onClick={() => onChange(clamp((mins - 1) * 60 + secs))}>
              <Minus size={16} aria-hidden />
            </button>
            <input
              type="number"
              min={0}
              max={60}
              value={mins}
              onChange={(e) => onChange(clamp((Number(e.target.value) || 0) * 60 + secs))}
              className="w-16 rounded-lg border border-card-border px-2 py-1 text-center text-charcoal"
              data-testid={`${testid}-minutes`}
            />
            <button type="button" aria-label="One minute more" className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border" onClick={() => onChange(clamp((mins + 1) * 60 + secs))}>
              <Plus size={16} aria-hidden />
            </button>
          </div>
        </label>
        <label className="flex flex-col text-sm text-slate">
          Seconds
          <div className="mt-1 flex items-center gap-1">
            <button type="button" aria-label="One second fewer" className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border" onClick={() => onChange(clamp(mins * 60 + (secs - 1)))}>
              <Minus size={16} aria-hidden />
            </button>
            <input
              type="number"
              min={0}
              max={59}
              value={secs}
              onChange={(e) => onChange(clamp(mins * 60 + Math.min(59, Number(e.target.value) || 0)))}
              className="w-16 rounded-lg border border-card-border px-2 py-1 text-center text-charcoal"
              data-testid={`${testid}-seconds`}
            />
            <button type="button" aria-label="One second more" className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border" onClick={() => onChange(clamp(mins * 60 + (secs + 1)))}>
              <Plus size={16} aria-hidden />
            </button>
          </div>
        </label>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-full border border-card-border bg-white px-4 py-2 text-charcoal focus:border-sage'

export default function StepTime({
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

  const total = config.steps.reduce((a, s) => a + s.seconds, 0)
  const totalMins = Math.round(total / 60)
  const isFirstThen = config.kind === 'first-then'

  const setStep = (i: number, patch: Partial<Step>) => {
    const steps = config.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    setConfig({ ...config, steps })
  }

  // available room for a given step index (excluding that step's current seconds)
  const roomFor = (i: number) => {
    const others = config.steps.reduce((a, s, idx) => (idx === i ? a : a + s.seconds), 0)
    return MAX_TOTAL_SECONDS - others
  }

  const addStep = () => {
    if (config.steps.length >= 6) return
    const room = MAX_TOTAL_SECONDS - total
    if (room < MIN_STEP_SECONDS) return
    setConfig({ ...config, steps: [...config.steps, { label: '', icon: null, seconds: Math.min(300, room) }] })
  }
  const removeStep = (i: number) => {
    if (config.steps.length <= 2) return
    setConfig({ ...config, steps: config.steps.filter((_, idx) => idx !== i) })
  }
  const moveStep = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= config.steps.length) return
    const steps = [...config.steps]
    ;[steps[i], steps[j]] = [steps[j], steps[i]]
    setConfig({ ...config, steps })
  }

  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="mb-6 font-heading text-2xl font-bold text-charcoal outline-none">
        How long?
      </h2>

      {!isFirstThen && (
        <div className="space-y-6">
          {config.kind === 'now-next' && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-charcoal">What's happening now? (optional)</span>
              <input
                type="text"
                maxLength={30}
                value={config.steps[0].label}
                onChange={(e) => setStep(0, { label: e.target.value })}
                className={inputClass}
                data-testid="now-label"
              />
            </label>
          )}
          {config.kind === 'now-next' && (
            <IconPicker label="Icon for now" value={config.steps[0].icon} onChange={(k) => setStep(0, { icon: k })} testid="now-icon" />
          )}

          <Duration seconds={config.steps[0].seconds} maxSeconds={MAX_TOTAL_SECONDS} onChange={(s) => setStep(0, { seconds: s })} testid="duration" />

          {config.kind === 'now-next' && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-charcoal">What's next?</span>
                <input
                  type="text"
                  maxLength={30}
                  value={config.next?.label ?? ''}
                  onChange={(e) => setConfig({ ...config, next: { label: e.target.value, icon: config.next?.icon ?? null } })}
                  className={inputClass}
                  data-testid="next-label"
                  aria-describedby="next-help"
                />
              </label>
              {!config.next?.label && (
                <p id="next-help" className="text-sm text-coral">
                  Please add what comes next.
                </p>
              )}
              <IconPicker
                label="Icon for next"
                value={config.next?.icon ?? null}
                onChange={(k) => setConfig({ ...config, next: { label: config.next?.label ?? '', icon: k } })}
                testid="next-icon"
              />
            </>
          )}
        </div>
      )}

      {isFirstThen && (
        <div className="space-y-5">
          {config.steps.map((step, i) => (
            <div key={i} className="rounded-card border border-card-border bg-white p-4" data-testid={`ft-step-${i}`}>
              <div className="mb-3 flex items-center justify-between">
                <span className="font-heading font-bold text-charcoal">Step {i + 1}</span>
                <div className="flex gap-1">
                  <button type="button" aria-label={`Move step ${i + 1} up`} disabled={i === 0} onClick={() => moveStep(i, -1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border disabled:opacity-40" data-testid={`ft-up-${i}`}>
                    <ArrowUp size={16} aria-hidden />
                  </button>
                  <button type="button" aria-label={`Move step ${i + 1} down`} disabled={i === config.steps.length - 1} onClick={() => moveStep(i, 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border disabled:opacity-40" data-testid={`ft-down-${i}`}>
                    <ArrowDown size={16} aria-hidden />
                  </button>
                  <button type="button" aria-label={`Remove step ${i + 1}`} disabled={config.steps.length <= 2} onClick={() => removeStep(i)} className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border disabled:opacity-40" data-testid={`ft-remove-${i}`}>
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>
              </div>
              <label className="mb-3 block">
                <span className="mb-1 block text-sm font-semibold text-charcoal">Label</span>
                <input type="text" maxLength={30} value={step.label} onChange={(e) => setStep(i, { label: e.target.value })} className={inputClass} data-testid={`ft-label-${i}`} />
              </label>
              {!step.label && <p className="mb-3 text-sm text-coral">Please give this step a label.</p>}
              <div className="mb-3">
                <IconPicker label="Icon" value={step.icon} onChange={(k) => setStep(i, { icon: k })} testid={`ft-icon-${i}`} />
              </div>
              <Duration seconds={step.seconds} maxSeconds={roomFor(i)} onChange={(s) => setStep(i, { seconds: s })} testid={`ft-duration-${i}`} />
            </div>
          ))}

          <button type="button" onClick={addStep} disabled={config.steps.length >= 6 || MAX_TOTAL_SECONDS - total < MIN_STEP_SECONDS} className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-sage px-5 font-heading font-semibold text-charcoal disabled:opacity-40" data-testid="ft-add-step">
            <Plus size={18} aria-hidden />
            Add step
          </button>

          <div className="rounded-card border border-dashed border-card-border bg-muted p-4">
            <p className="mb-2 text-sm font-semibold text-charcoal">Then (no timer) — optional final activity</p>
            <input
              type="text"
              maxLength={30}
              placeholder="e.g. lunch"
              value={config.next?.label ?? ''}
              onChange={(e) => setConfig({ ...config, next: e.target.value ? { label: e.target.value, icon: config.next?.icon ?? null } : undefined })}
              className={inputClass}
              data-testid="ft-then-label"
            />
            {config.next?.label && (
              <div className="mt-3">
                <IconPicker label="Icon for the final activity" value={config.next?.icon ?? null} onChange={(k) => setConfig({ ...config, next: { label: config.next?.label ?? '', icon: k } })} testid="ft-then-icon" />
              </div>
            )}
          </div>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={config.autoAdvance} onChange={(e) => setConfig({ ...config, autoAdvance: e.target.checked })} className="h-5 w-5 accent-sage" data-testid="ft-auto-advance" />
            <span className="text-sm text-charcoal">Move to the next step automatically</span>
          </label>
        </div>
      )}

      <p className="mt-6 font-heading font-bold text-charcoal" data-testid="time-total">
        Total {totalMins} of 60 minutes
      </p>
      {total >= MAX_TOTAL_SECONDS && (
        <p className="mt-1 text-sm text-slate">Timers can be up to 60 minutes in total.</p>
      )}
    </div>
  )
}
