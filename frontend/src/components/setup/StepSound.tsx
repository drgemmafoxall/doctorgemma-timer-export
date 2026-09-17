import { useEffect, useRef, useState } from 'react'
import { Play, Copy, ExternalLink, Check } from 'lucide-react'
import type { TimerConfig, Motion, EndChime, FinalBeeps, MinuteBeeps } from '../../lib/config'
import { buildTimerUrl, sanitizeConfig, composeMessage } from '../../lib/config'
import { AudioEngine } from '../../lib/audio'
import { Speech } from '../../lib/speech'
import { SignInPanel, btnSage, btnSecondary } from '../AccessGate'
import type { Me } from '../../lib/api'

function Toggle({ checked, onChange, label, testid }: { checked: boolean; onChange: (v: boolean) => void; label: string; testid: string }) {
  return (
    <label className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-charcoal">{label}</span>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${checked ? 'bg-sage' : 'bg-card-border'}`} data-testid={testid}>
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </label>
  )
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return [m ? `${m} min` : '', s ? `${s} sec` : ''].filter(Boolean).join(' ') || '0 sec'
}

export default function StepSound({
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

  const audioRef = useRef(new AudioEngine())
  const speechRef = useRef(new Speech())
  useEffect(() => {
    speechRef.current.init()
  }, [])

  const [copied, setCopied] = useState(false)
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

  const s = config.sound
  const patchSound = (patch: Partial<TimerConfig['sound']>) => setConfig({ ...config, sound: { ...s, ...patch } })

  const totalSeconds = config.steps.reduce((a, st) => a + st.seconds, 0)
  const playChime = (kind: EndChime) => {
    audioRef.current.unlock()
    audioRef.current.setVolume(s.volume)
    audioRef.current.chime(kind)
  }
  const hearExample = () => {
    speechRef.current.rate = s.speechRate
    speechRef.current.speak(composeMessage(config.theme.messages.oneMinute, s.firstName, config.kind === 'now-next' ? config.next : null))
  }

  const spokenLines = [
    composeMessage(config.theme.messages.start, s.firstName),
    ...(totalSeconds / 2 >= 10 ? [composeMessage(config.theme.messages.halfway, s.firstName)] : []),
    ...(totalSeconds > 300 ? [composeMessage(config.theme.messages.fiveMinutes, s.firstName)] : []),
    ...(totalSeconds > 60 ? [composeMessage(config.theme.messages.oneMinute, s.firstName, config.kind === 'now-next' ? config.next : null)] : []),
    composeMessage(config.theme.messages.finish, s.firstName, config.kind === 'now-next' ? config.next : null),
  ]

  const motions: { key: Motion; title: string; desc: string }[] = [
    { key: 'still', title: 'Still', desc: 'Nothing moves.' },
    { key: 'gentle', title: 'Gentle', desc: 'Smooth, slow movement.' },
    { key: 'playful', title: 'Playful', desc: 'Gentle movement plus a calm finish animation.' },
  ]

  const timerUrl = buildTimerUrl(sanitizeConfig(config))
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(new URL(timerUrl, window.location.href).href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="mb-6 font-heading text-2xl font-bold text-charcoal outline-none">
        Sound and movement
      </h2>

      {/* Sound */}
      <section className="mb-6 rounded-card border border-card-border bg-white p-4">
        <Toggle checked={s.enabled} onChange={(v) => patchSound({ enabled: v })} label="Sound" testid="toggle-sound" />
        {s.enabled && (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-charcoal">Volume</span>
              <input type="range" min={0} max={1} step={0.05} value={s.volume} onChange={(e) => patchSound({ volume: Number(e.target.value) })} className="w-full accent-sage" data-testid="volume-slider" />
            </label>
            <div>
              <span className="mb-2 block text-sm font-semibold text-charcoal">End chime</span>
              <div className="flex flex-wrap gap-2">
                {([['soft-bell', 'Soft bell'], ['wind-chime', 'Wind chime'], ['marimba', 'Marimba'], ['none', 'None']] as [EndChime, string][]).map(([k, label]) => (
                  <div key={k} className="flex items-center gap-1">
                    <button type="button" role="radio" aria-checked={s.endChime === k} onClick={() => patchSound({ endChime: k })} className={`min-h-[40px] rounded-full px-4 text-sm font-semibold ${s.endChime === k ? 'bg-sage text-charcoal' : 'border border-card-border bg-white text-charcoal'}`} data-testid={`chime-${k}`}>
                      {label}
                    </button>
                    {k !== 'none' && (
                      <button type="button" aria-label={`Play ${label}`} onClick={() => playChime(k)} className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border" data-testid={`chime-play-${k}`}>
                        <Play size={16} aria-hidden />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-charcoal">Warning chimes</legend>
              {([['halfway', 'Halfway'], ['fiveMin', '5 minutes left'], ['oneMin', '1 minute left']] as ['halfway' | 'fiveMin' | 'oneMin', string][]).map(([k, label]) => (
                <label key={k} className="flex items-center gap-3 py-1">
                  <input type="checkbox" checked={s.warnings[k]} onChange={(e) => patchSound({ warnings: { ...s.warnings, [k]: e.target.checked } })} className="h-5 w-5 accent-sage" data-testid={`warning-${k}`} />
                  <span className="text-sm text-charcoal">{label}</span>
                </label>
              ))}
            </fieldset>
            <div>
              <span className="mb-2 block text-sm font-semibold text-charcoal">Countdown beeps</span>
              <div className="flex flex-wrap gap-2">
                {([['off', 'Off'], ['last-5', 'Last 5 seconds'], ['last-10', 'Last 10 seconds']] as [FinalBeeps, string][]).map(([k, label]) => (
                  <button key={k} type="button" role="radio" aria-checked={s.finalBeeps === k} onClick={() => patchSound({ finalBeeps: k })} className={`min-h-[40px] rounded-full px-4 text-sm font-semibold ${s.finalBeeps === k ? 'bg-sage text-charcoal' : 'border border-card-border bg-white text-charcoal'}`} data-testid={`final-beeps-${k}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-2 block text-sm font-semibold text-charcoal">Minute beeps</span>
              <div className="flex flex-wrap gap-2">
                {([['off', 'Off'], ['last-5-minutes', 'Last 5 minutes'], ['every-minute', 'Every minute']] as [MinuteBeeps, string][]).map(([k, label]) => (
                  <button key={k} type="button" role="radio" aria-checked={s.minuteBeeps === k} onClick={() => patchSound({ minuteBeeps: k })} className={`min-h-[40px] rounded-full px-4 text-sm font-semibold ${s.minuteBeeps === k ? 'bg-sage text-charcoal' : 'border border-card-border bg-white text-charcoal'}`} data-testid={`minute-beeps-${k}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {canVibrate && <Toggle checked={s.vibrate} onChange={(v) => patchSound({ vibrate: v })} label="Vibrate at reminders" testid="toggle-vibrate" />}
          </div>
        )}
      </section>

      {/* Speech */}
      <section className="mb-6 rounded-card border border-card-border bg-white p-4">
        <Toggle checked={s.speech} onChange={(v) => patchSound({ speech: v })} label="Spoken reminders" testid="toggle-speech" />
        {s.speech && (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-charcoal">Voice speed</span>
              <input type="range" min={0.7} max={1.1} step={0.05} value={s.speechRate} onChange={(e) => patchSound({ speechRate: Number(e.target.value) })} className="w-full accent-sage" data-testid="speech-rate" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-charcoal">First name (optional)</span>
              <input type="text" maxLength={20} value={s.firstName ?? ''} onChange={(e) => patchSound({ firstName: e.target.value })} className="w-full rounded-full border border-card-border bg-white px-4 py-2 text-charcoal focus:border-sage" data-testid="first-name" />
              <span className="mt-1 block text-xs text-slate">Used only on this device. Never saved or sent anywhere.</span>
            </label>
            <div>
              <span className="mb-2 block text-sm font-semibold text-charcoal">What will be said</span>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate" data-testid="speech-preview">
                {spokenLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
            <button type="button" className={btnSecondary} onClick={hearExample} data-testid="hear-example">
              <Play size={18} aria-hidden />
              Hear an example
            </button>
          </div>
        )}
      </section>

      {/* Movement */}
      <section className="mb-6">
        <h3 className="mb-3 font-heading font-bold text-charcoal">Movement</h3>
        {reduced && (
          <p className="mb-3 text-sm text-slate" data-testid="reduced-motion-note">
            Your device asks for less motion, so the timer will stay still.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Movement">
          {motions.map((m) => (
            <button key={m.key} type="button" role="radio" aria-checked={config.motion === m.key} onClick={() => setConfig({ ...config, motion: m.key })} className={`rounded-card border bg-white p-4 text-left ${config.motion === m.key ? 'border-sage ring-2 ring-sage' : 'border-card-border hover:border-sage'}`} data-testid={`motion-${m.key}`}>
              <span className="block font-heading font-bold text-charcoal">{m.title}</span>
              <span className="block text-sm text-slate">{m.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Controls */}
      <section className="mb-6 rounded-card border border-card-border bg-white p-4">
        <h3 className="mb-2 font-heading font-bold text-charcoal">Controls</h3>
        <Toggle checked={config.controls.allowAddTime} onChange={(v) => setConfig({ ...config, controls: { ...config.controls, allowAddTime: v } })} label="Show a +1 minute button" testid="toggle-add-time" />
        <Toggle checked={config.controls.grownUpLock} onChange={(v) => setConfig({ ...config, controls: { ...config.controls, grownUpLock: v } })} label="Grown-up lock: press and hold for 2 seconds to use the controls" testid="toggle-grownup-lock" />
      </section>

      {/* Summary + open */}
      <section className="rounded-card border border-card-border bg-muted p-5">
        <h3 className="mb-3 font-heading font-bold text-charcoal">Your timer</h3>
        <ul className="mb-5 space-y-1 text-sm text-slate" data-testid="summary-list">
          <li>Kind: {config.kind.replace('-', ' ')}</li>
          <li>Total time: {formatDuration(totalSeconds)}</li>
          <li>Theme: {config.theme.themeName}</li>
          <li>Display: {config.display.style.replace('-', ' ')}, {config.display.size.replace('-', ' ')}</li>
          <li>Sound: {s.enabled ? 'on' : 'off'} · Spoken reminders: {s.speech ? 'on' : 'off'}</li>
          <li>Movement: {config.motion}</li>
        </ul>

        {me?.signedIn ? (
          <div className="flex flex-col gap-3">
            <a href={timerUrl} target="_blank" rel="noopener" className={btnSage} data-testid="open-timer">
              <ExternalLink size={20} aria-hidden />
              Open timer
            </a>
            <p className="text-sm text-slate">
              Opens in a new tab. Press Full screen there. Nothing is saved, so close the tab when you're finished.
            </p>
            <button type="button" className={btnSecondary} onClick={copyLink} data-testid="copy-link">
              {copied ? <Check size={20} aria-hidden /> : <Copy size={20} aria-hidden />}
              {copied ? 'Link copied' : 'Copy timer link'}
            </button>
          </div>
        ) : (
          <SignInPanel message="Sign in or join free to use this tool" />
        )}
      </section>
    </div>
  )
}
