import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { TimerConfig, Theme } from '../../lib/config'
import { PRESETS } from '../../lib/themes'
import { Icon } from '../../lib/icons'
import { createTheme, themeFromResult, ToolError, type AgeBand, type Me } from '../../lib/api'
import { URLS } from '../../lib/dg-tool-kit'
import { AllowanceLine, AccessError, SignInPanel, btnSage } from '../AccessGate'

function Swatches({ theme }: { theme: Theme }) {
  const colours = [theme.palette.primary, theme.palette.secondary, theme.palette.accent, theme.palette.background]
  return (
    <div className="flex gap-1">
      {colours.map((c, i) => (
        <span key={i} className="h-4 w-4 rounded-full border border-card-border" style={{ background: c }} aria-hidden />
      ))}
    </div>
  )
}

export default function StepTheme({
  config,
  setConfig,
  me,
  setMe,
}: {
  config: TimerConfig
  setConfig: (c: TimerConfig) => void
  me: Me | null
  setMe: (m: Me) => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const [interest, setInterest] = useState('')
  const [ageBand, setAgeBand] = useState<AgeBand | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ToolError | null>(null)

  const isCustom = config.theme.id === 'custom'
  const selectPreset = (t: Theme) => {
    setError(null)
    setConfig({ ...config, theme: t })
  }

  const handleCreate = async () => {
    setError(null)
    if (interest.trim().length < 2) {
      setError(new ToolError(400, 'invalid_input', 'Please describe the interest in a few words.'))
      return
    }
    setLoading(true)
    try {
      const { output, usage } = await createTheme({
        interest: interest.trim(),
        ageBand: ageBand || undefined,
      })
      const theme = themeFromResult(output)
      setConfig({
        ...config,
        theme,
        display: { ...config.display, showFacts: theme.facts.length > 0 ? config.display.showFacts : false },
      })
      if (me) setMe({ ...me, usage: { ...me.usage, 'special-interest-countdown-timer': usage } })
    } catch (e) {
      if (e instanceof ToolError) setError(e)
      else setError(new ToolError(500, 'provider_error', 'Something went wrong.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="mb-6 font-heading text-2xl font-bold text-charcoal outline-none">
        Choose a theme
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRESETS.map((t) => {
          const selected = !isCustom && config.theme.id === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectPreset(t)}
              className={`flex flex-col gap-3 rounded-card border bg-white p-4 text-left transition-colors ${
                selected ? 'border-sage ring-2 ring-sage' : 'border-card-border hover:border-sage'
              }`}
              data-testid={`theme-${t.id}`}
            >
              <div className="flex items-center gap-2 text-forest">
                <Icon name={t.traveller} size={26} aria-hidden />
                <ArrowRight size={16} strokeWidth={1.6} className="text-slate" aria-hidden />
                <Icon name={t.destination} size={26} aria-hidden />
              </div>
              <Swatches theme={t} />
              <span className="font-heading font-bold text-charcoal">{t.themeName}</span>
            </button>
          )
        })}
      </div>

      {/* Any interest */}
      <div className="mt-6 rounded-card border border-card-border bg-white p-5" data-testid="any-interest-card">
        <h3 className="mb-3 font-heading text-lg font-bold text-charcoal">Any interest</h3>

        {isCustom ? (
          <div className="space-y-4" data-testid="custom-theme-selected">
            <div className="flex items-center gap-3 rounded-2xl border border-sage bg-muted p-4">
              <div className="flex items-center gap-2 text-forest">
                <Icon name={config.theme.traveller} size={28} aria-hidden />
                <ArrowRight size={16} className="text-slate" aria-hidden />
                <Icon name={config.theme.destination} size={28} aria-hidden />
              </div>
              <div>
                <p className="font-heading font-bold text-charcoal">Custom: {config.theme.themeName}</p>
                <Swatches theme={config.theme} />
              </div>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-forest underline underline-offset-2"
              onClick={() => {
                setConfig({ ...config, theme: PRESETS[0] })
              }}
              data-testid="create-different-theme"
            >
              Create a different theme
            </button>
            <p className="text-xs text-slate">This uses another custom theme.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-charcoal">Special interest</span>
              <input
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                minLength={2}
                maxLength={60}
                placeholder="e.g. washing machines, flags, sharks"
                className="w-full rounded-full border border-card-border bg-white px-4 py-2 text-charcoal focus:border-sage"
                data-testid="interest-input"
                aria-describedby={error?.code === 'invalid_input' ? 'interest-error' : undefined}
              />
            </label>
            {error?.code === 'invalid_input' && (
              <p id="interest-error" className="text-sm text-coral" data-testid="interest-error">
                Please describe the interest in a few words.
              </p>
            )}
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-charcoal">Who is this for? (optional)</span>
              <select
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value as AgeBand | '')}
                className="w-full rounded-full border border-card-border bg-white px-4 py-2 text-charcoal focus:border-sage"
                data-testid="age-band-select"
              >
                <option value="">No preference</option>
                <option value="young-child">Young child</option>
                <option value="older-child">Older child</option>
                <option value="teen">Teenager</option>
                <option value="adult">Adult</option>
              </select>
            </label>

            {loading ? (
              <div data-testid="theme-loading">
                <p className="mb-2 text-slate">Creating your theme…</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/2 rounded-full bg-sage" style={config.motion === 'still' ? undefined : { animation: 'dg-drift 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ) : (
              <button type="button" className={btnSage} onClick={handleCreate} data-testid="create-theme-button">
                Create my theme
              </button>
            )}

            <p className="text-sm text-slate">
              Uses 1 of your custom themes this month. Only the interest is sent, never a name.
            </p>
            <AllowanceLine me={me} />

            {error && error.code !== 'invalid_input' && (
              <div className="mt-2">
                {!me?.signedIn ? <SignInPanel /> : <AccessError error={error} onRetry={handleCreate} />}
              </div>
            )}
            {!me?.signedIn && (
              <p className="text-sm text-slate">
                Ready-made themes need a{' '}
                <a href={URLS.signIn} className="font-semibold text-forest underline underline-offset-2">
                  free account
                </a>{' '}
                but never use a run.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
