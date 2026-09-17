import { useEffect, useRef } from 'react'
import type { TimerConfig, DisplayStyle, SizeOption, PaletteOption } from '../../lib/config'
import { contrastRatio } from '../../lib/themes'
import { URLS } from '../../lib/dg-tool-kit'
import type { Me } from '../../lib/api'

function Toggle({
  checked,
  onChange,
  label,
  disabled,
  testid,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  disabled?: boolean
  testid: string
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-charcoal">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${checked ? 'bg-sage' : 'bg-card-border'} ${disabled ? 'opacity-50' : ''}`}
        data-testid={testid}
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </label>
  )
}

const STYLES: { key: DisplayStyle; label: string }[] = [
  { key: 'digital', label: 'Digital numbers' },
  { key: 'shaded-disc', label: 'Shaded disc' },
  { key: 'simple-clock', label: 'Simple clock' },
  { key: 'journey', label: 'Journey' },
  { key: 'sand', label: 'Sand timer' },
  { key: 'lights-out', label: 'Lights out' },
  { key: 'bar', label: 'Filling bar' },
]

function MiniThumb({ style }: { style: DisplayStyle }) {
  const s = '#6A9B84'
  const b = '#EDEDE8'
  return (
    <svg viewBox="0 0 48 30" className="h-10 w-16" aria-hidden>
      {style === 'digital' && <text x="24" y="21" textAnchor="middle" fontSize="12" fontWeight="800" fill={s}>12:00</text>}
      {style === 'shaded-disc' && (
        <>
          <circle cx="24" cy="15" r="11" fill="none" stroke={b} strokeWidth="2" />
          <path d="M24,15 L24,4 A11,11 0 0 1 33,20 Z" fill={s} />
        </>
      )}
      {style === 'simple-clock' && (
        <>
          <circle cx="24" cy="15" r="11" fill="none" stroke={b} strokeWidth="2" />
          <line x1="24" y1="15" x2="24" y2="7" stroke={s} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {style === 'journey' && (
        <>
          <line x1="6" y1="20" x2="42" y2="20" stroke={b} strokeWidth="2" strokeDasharray="2 3" />
          <circle cx="16" cy="20" r="3" fill={s} />
        </>
      )}
      {style === 'sand' && <path d="M16,5 H32 L24,15 L32,25 H16 L24,15 Z" fill="none" stroke={s} strokeWidth="2" strokeLinejoin="round" />}
      {style === 'lights-out' && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={7 + i * 9} y="11" width="7" height="8" rx="2" fill={i < 2 ? s : b} />
          ))}
        </>
      )}
      {style === 'bar' && (
        <>
          <rect x="6" y="12" width="36" height="6" rx="3" fill={b} />
          <rect x="6" y="12" width="20" height="6" rx="3" fill={s} />
        </>
      )}
    </svg>
  )
}

export default function StepLook({
  config,
  setConfig,
  me,
}: {
  config: TimerConfig
  setConfig: (c: TimerConfig) => void
  me: Me | null
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const d = config.display
  const patchDisplay = (patch: Partial<TimerConfig['display']>) => setConfig({ ...config, display: { ...d, ...patch } })

  const setStyle = (style: DisplayStyle) =>
    patchDisplay({ style, showNumbers: style === 'digital' ? true : d.showNumbers })

  const cc = d.customColours ?? { background: '#FDFBF7', timer: '#6A9B84' }
  const ratio = contrastRatio(cc.timer, cc.background)

  const paletteOptions: { key: PaletteOption; label: string }[] = [
    { key: 'theme', label: 'Theme colours' },
    { key: 'soft', label: 'Soft pastels' },
    { key: 'low-stimulation', label: 'Low stimulation' },
    { key: 'high-contrast-dark', label: 'High contrast (dark)' },
    { key: 'high-contrast-light', label: 'High contrast (light)' },
    { key: 'custom', label: 'Pick my own' },
  ]
  const sizes: { key: SizeOption; label: string }[] = [
    { key: 'large', label: 'Large' },
    { key: 'extra-large', label: 'Extra large' },
    { key: 'fill', label: 'Fill the screen' },
  ]

  const hasFacts = config.theme.facts.length > 0
  const isPremium = me?.tier === 'premium'

  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="mb-6 font-heading text-2xl font-bold text-charcoal outline-none">
        How should it look?
      </h2>

      <section className="mb-6">
        <h3 className="mb-3 font-heading font-bold text-charcoal">Display style</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STYLES.map((st) => {
            const selected = d.style === st.key
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setStyle(st.key)}
                className={`flex flex-col items-center gap-2 rounded-2xl border bg-white p-3 transition-colors ${selected ? 'border-sage ring-2 ring-sage' : 'border-card-border hover:border-sage'}`}
                data-testid={`style-${st.key}`}
                aria-pressed={selected}
              >
                <MiniThumb style={st.key} />
                <span className="text-xs font-semibold text-charcoal">{st.label}</span>
              </button>
            )
          })}
        </div>
        {d.style === 'shaded-disc' && (
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Disc scale">
            {(['whole-timer', 'sixty-minutes'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={d.discScale === v}
                onClick={() => patchDisplay({ discScale: v })}
                className={`min-h-[40px] rounded-full px-4 text-sm font-semibold ${d.discScale === v ? 'bg-sage text-charcoal' : 'border border-card-border bg-white text-charcoal'}`}
                data-testid={`disc-scale-${v}`}
              >
                {v === 'whole-timer' ? 'Disc shows the whole timer' : '60-minute clock face'}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6 rounded-card border border-card-border bg-white p-4">
        <Toggle checked={d.showNumbers} disabled={d.style === 'digital'} onChange={(v) => patchDisplay({ showNumbers: v })} label="Show numbers too" testid="toggle-show-numbers" />
        <Toggle checked={d.showSeconds} onChange={(v) => patchDisplay({ showSeconds: v })} label="Show seconds" testid="toggle-show-seconds" />
      </section>

      <section className="mb-6">
        <h3 className="mb-3 font-heading font-bold text-charcoal">Size</h3>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
          {sizes.map((s) => (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={d.size === s.key}
              onClick={() => patchDisplay({ size: s.key })}
              className={`min-h-[44px] rounded-full px-5 text-sm font-semibold ${d.size === s.key ? 'bg-sage text-charcoal' : 'border border-card-border bg-white text-charcoal'}`}
              data-testid={`size-${s.key}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 font-heading font-bold text-charcoal">Colours</h3>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colours">
          {paletteOptions.map((p) => (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={d.palette === p.key}
              onClick={() =>
                patchDisplay({ palette: p.key, customColours: p.key === 'custom' ? cc : d.customColours })
              }
              className={`min-h-[44px] rounded-full px-5 text-sm font-semibold ${d.palette === p.key ? 'bg-sage text-charcoal' : 'border border-card-border bg-white text-charcoal'}`}
              data-testid={`palette-${p.key}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {d.palette === 'custom' && (
          <div className="mt-4 flex flex-wrap items-end gap-6 rounded-card border border-card-border bg-white p-4">
            <label className="flex flex-col text-sm font-semibold text-charcoal">
              Background
              <input type="color" value={cc.background} onChange={(e) => patchDisplay({ customColours: { ...cc, background: e.target.value } })} className="mt-1 h-10 w-16 cursor-pointer rounded-lg border border-card-border" data-testid="custom-background" />
            </label>
            <label className="flex flex-col text-sm font-semibold text-charcoal">
              Timer
              <input type="color" value={cc.timer} onChange={(e) => patchDisplay({ customColours: { ...cc, timer: e.target.value } })} className="mt-1 h-10 w-16 cursor-pointer rounded-lg border border-card-border" data-testid="custom-timer" />
            </label>
            {ratio < 3 && (
              <p className="text-sm text-coral" data-testid="contrast-warning">
                These colours may be hard to see.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-card border border-card-border bg-white p-4">
        <h3 className="mb-2 font-heading font-bold text-charcoal">Interest facts</h3>
        {hasFacts ? (
          <Toggle checked={d.showFacts} onChange={(v) => patchDisplay({ showFacts: v })} label="Show interest facts" testid="toggle-show-facts" />
        ) : (
          !isPremium && (
            <p className="text-sm text-slate">
              Premium custom themes also include gentle facts about the interest.{' '}
              <a href={URLS.upgrade} className="font-semibold text-forest underline underline-offset-2" data-testid="about-premium-link">
                About premium
              </a>
            </p>
          )
        )}
      </section>
    </div>
  )
}
