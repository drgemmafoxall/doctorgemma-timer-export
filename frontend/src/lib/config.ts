import { ICON_COMPONENTS } from './icons'
import { PLAIN_THEME, PRESET_IDS, isHexColor } from './themes'

// --- Types -------------------------------------------------------------------
export type IconKey = string

export type Palette = {
  background: string
  surface: string
  primary: string
  secondary: string
  accent: string
  text: string
}

export type PathStyle = 'track' | 'road' | 'orbit' | 'river' | 'trail' | 'sky'

export type Theme = {
  id: string
  themeName: string
  interest: string
  palette: Palette
  traveller: IconKey
  destination: IconKey
  pathStyle: PathStyle
  motifs: IconKey[]
  messages: { start: string; halfway: string; fiveMinutes: string; oneMinute: string; finish: string }
  facts: string[]
}

export type TimerKind = 'simple' | 'now-next' | 'first-then' | 'audio'
export type DisplayStyle =
  | 'digital'
  | 'shaded-disc'
  | 'simple-clock'
  | 'journey'
  | 'sand'
  | 'lights-out'
  | 'bar'
export type SizeOption = 'large' | 'extra-large' | 'fill'
export type PaletteOption =
  | 'theme'
  | 'soft'
  | 'low-stimulation'
  | 'high-contrast-dark'
  | 'high-contrast-light'
  | 'custom'
export type Motion = 'still' | 'gentle' | 'playful'
export type EndChime = 'soft-bell' | 'wind-chime' | 'marimba' | 'none'
export type FinalBeeps = 'off' | 'last-5' | 'last-10'
export type MinuteBeeps = 'off' | 'last-5-minutes' | 'every-minute'

export type Step = { label: string; icon: IconKey | null; seconds: number }

export type TimerConfig = {
  v: 1
  kind: TimerKind
  steps: Step[]
  next?: { label: string; icon: IconKey | null }
  autoAdvance: boolean
  theme: Theme
  display: {
    style: DisplayStyle
    discScale: 'whole-timer' | 'sixty-minutes'
    showNumbers: boolean
    showSeconds: boolean
    size: SizeOption
    palette: PaletteOption
    customColours?: { background: string; timer: string }
    showFacts: boolean
  }
  sound: {
    enabled: boolean
    volume: number
    endChime: EndChime
    warnings: { halfway: boolean; fiveMin: boolean; oneMin: boolean }
    finalBeeps: FinalBeeps
    minuteBeeps: MinuteBeeps
    speech: boolean
    speechRate: number
    firstName?: string
    vibrate: boolean
  }
  motion: Motion
  controls: { allowAddTime: boolean; grownUpLock: boolean }
}

export const MIN_STEP_SECONDS = 10
export const MAX_TOTAL_SECONDS = 3600

// --- Small validation helpers ------------------------------------------------
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
function str(v: unknown, max: number, fallback = ''): string {
  if (typeof v !== 'string') return fallback
  return v.trim().slice(0, max)
}
function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback
}
function num(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : fallback
  return Math.min(max, Math.max(min, n))
}
function intSec(v: unknown, fallback: number): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback
  return Math.min(MAX_TOTAL_SECONDS, Math.max(MIN_STEP_SECONDS, n))
}
function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback
}
function iconOrNull(v: unknown): IconKey | null {
  return typeof v === 'string' && ICON_COMPONENTS[v] ? v : null
}
function iconOr(v: unknown, fallback: IconKey): IconKey {
  return typeof v === 'string' && ICON_COMPONENTS[v] ? v : fallback
}
function color(v: unknown, fallback: string): string {
  return isHexColor(v) ? (v as string) : fallback
}

// Enforce the 60-minute rule across an array of steps.
export function capSteps(steps: Step[]): Step[] {
  const out: Step[] = []
  let total = 0
  for (const s of steps) {
    let sec = Math.min(MAX_TOTAL_SECONDS, Math.max(MIN_STEP_SECONDS, Math.round(s.seconds)))
    if (total + sec > MAX_TOTAL_SECONDS) sec = MAX_TOTAL_SECONDS - total
    if (sec < MIN_STEP_SECONDS) break
    out.push({ ...s, seconds: sec })
    total += sec
  }
  if (out.length === 0) out.push({ label: '', icon: null, seconds: 60 })
  return out
}

export function totalSeconds(config: TimerConfig): number {
  return config.steps.reduce((a, s) => a + s.seconds, 0)
}

// --- Theme validation --------------------------------------------------------
export function sanitizeTheme(input: unknown): Theme {
  const P = PLAIN_THEME
  if (!isObj(input)) return { ...P }
  const pal = isObj(input.palette) ? input.palette : {}
  const messages = isObj(input.messages) ? input.messages : {}
  let id: string = P.id
  if (input.id === 'custom') id = 'custom'
  else if (typeof input.id === 'string' && PRESET_IDS.includes(input.id)) id = input.id

  const factsRaw = Array.isArray(input.facts) ? input.facts : []
  const facts = factsRaw
    .filter((f: unknown) => typeof f === 'string')
    .slice(0, 5)
    .map((f: string) => f.trim().slice(0, 120))
    .filter((f: string) => f.length > 0)

  const motifsRaw = Array.isArray(input.motifs) ? input.motifs : []
  const motifs = motifsRaw
    .map((m: unknown) => iconOrNull(m))
    .filter((m): m is string => m !== null)
    .slice(0, 3)

  return {
    id,
    themeName: str(input.themeName, 40, P.themeName) || P.themeName,
    interest: str(input.interest, 40, P.interest),
    palette: {
      background: color((pal as any).background, P.palette.background),
      surface: color((pal as any).surface, P.palette.surface),
      primary: color((pal as any).primary, P.palette.primary),
      secondary: color((pal as any).secondary, P.palette.secondary),
      accent: color((pal as any).accent, P.palette.accent),
      text: color((pal as any).text, P.palette.text),
    },
    traveller: iconOr(input.traveller, P.traveller),
    destination: iconOr(input.destination, P.destination),
    pathStyle: oneOf(input.pathStyle, ['track', 'road', 'orbit', 'river', 'trail', 'sky'], P.pathStyle),
    motifs,
    messages: {
      start: str((messages as any).start, 90, P.messages.start) || P.messages.start,
      halfway: str((messages as any).halfway, 90, P.messages.halfway) || P.messages.halfway,
      fiveMinutes: str((messages as any).fiveMinutes, 90, P.messages.fiveMinutes) || P.messages.fiveMinutes,
      oneMinute: str((messages as any).oneMinute, 90, P.messages.oneMinute) || P.messages.oneMinute,
      finish: str((messages as any).finish, 90, P.messages.finish) || P.messages.finish,
    },
    facts,
  }
}

// --- Full config validation --------------------------------------------------
export function sanitizeConfig(input: unknown): TimerConfig {
  const o = isObj(input) ? input : {}
  const kind = oneOf(o.kind, ['simple', 'now-next', 'first-then', 'audio'], 'simple')

  const rawSteps = Array.isArray(o.steps) ? o.steps : []
  let steps: Step[] = rawSteps.map((s: unknown) => {
    const so = isObj(s) ? s : {}
    return {
      label: str(so.label, 30, ''),
      icon: iconOrNull(so.icon),
      seconds: intSec(so.seconds, 60),
    }
  })
  if (steps.length === 0) steps = [{ label: '', icon: null, seconds: 60 }]
  // enforce step counts per kind
  if (kind === 'first-then') steps = steps.slice(0, 6)
  else steps = steps.slice(0, 1)
  steps = capSteps(steps)

  const d = isObj(o.display) ? o.display : {}
  const s = isObj(o.sound) ? o.sound : {}
  const warn = isObj((s as any).warnings) ? (s as any).warnings : {}
  const c = isObj(o.controls) ? o.controls : {}

  const paletteOpt = oneOf(
    (d as any).palette,
    ['theme', 'soft', 'low-stimulation', 'high-contrast-dark', 'high-contrast-light', 'custom'],
    'theme',
  )

  let next: TimerConfig['next']
  if (kind === 'now-next' || kind === 'first-then') {
    if (isObj(o.next)) {
      const label = str((o.next as any).label, 30, '')
      if (label) next = { label, icon: iconOrNull((o.next as any).icon) }
    }
  }
  if (kind === 'now-next' && !next) next = { label: 'Next', icon: null }

  const config: TimerConfig = {
    v: 1,
    kind,
    steps,
    next,
    autoAdvance: bool(o.autoAdvance, true),
    theme: sanitizeTheme(o.theme),
    display: {
      style: oneOf(
        (d as any).style,
        ['digital', 'shaded-disc', 'simple-clock', 'journey', 'sand', 'lights-out', 'bar'],
        'digital',
      ),
      discScale: oneOf((d as any).discScale, ['whole-timer', 'sixty-minutes'], 'whole-timer'),
      showNumbers: bool((d as any).showNumbers, true),
      showSeconds: bool((d as any).showSeconds, true),
      size: oneOf((d as any).size, ['large', 'extra-large', 'fill'], 'large'),
      palette: paletteOpt,
      showFacts: bool((d as any).showFacts, false),
    },
    sound: {
      enabled: bool((s as any).enabled, false),
      volume: num((s as any).volume, 0, 1, 0.5),
      endChime: oneOf((s as any).endChime, ['soft-bell', 'wind-chime', 'marimba', 'none'], 'soft-bell'),
      warnings: {
        halfway: bool((warn as any).halfway, false),
        fiveMin: bool((warn as any).fiveMin, false),
        oneMin: bool((warn as any).oneMin, false),
      },
      finalBeeps: oneOf((s as any).finalBeeps, ['off', 'last-5', 'last-10'], 'off'),
      minuteBeeps: oneOf((s as any).minuteBeeps, ['off', 'last-5-minutes', 'every-minute'], 'off'),
      speech: bool((s as any).speech, false),
      speechRate: num((s as any).speechRate, 0.7, 1.1, 0.9),
      vibrate: bool((s as any).vibrate, false),
    },
    motion: oneOf(o.motion, ['still', 'gentle', 'playful'], 'still'),
    controls: {
      allowAddTime: bool((c as any).allowAddTime, true),
      grownUpLock: bool((c as any).grownUpLock, false),
    },
  }

  // Digital always keeps numbers on.
  if (config.display.style === 'digital') config.display.showNumbers = true

  if (paletteOpt === 'custom') {
    const cc = isObj((d as any).customColours) ? (d as any).customColours : {}
    config.display.customColours = {
      background: color((cc as any).background, '#FDFBF7'),
      timer: color((cc as any).timer, '#6A9B84'),
    }
  }

  const firstName = str((s as any).firstName, 20, '')
  if (firstName) config.sound.firstName = firstName

  // showFacts only meaningful when facts exist
  if (config.theme.facts.length === 0) config.display.showFacts = false

  return config
}

// --- Base64url of UTF-8 JSON -------------------------------------------------
function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromBase64Url(input: string): Uint8Array {
  let s = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4
  if (pad) s += '='.repeat(4 - pad)
  const bin = atob(s)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export function encodeConfig(config: TimerConfig): string {
  const json = JSON.stringify(config)
  return toBase64Url(new TextEncoder().encode(json))
}

export function decodeConfig(encoded: string): TimerConfig | null {
  try {
    const json = new TextDecoder().decode(fromBase64Url(encoded))
    const parsed = JSON.parse(json)
    return sanitizeConfig(parsed)
  } catch {
    return null
  }
}

export function buildTimerUrl(config: TimerConfig): string {
  return `${import.meta.env.BASE_URL}#/timer?c=${encodeConfig(config)}`
}

// --- Display formatting ------------------------------------------------------
export function formatMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// Digital with showSeconds off: "12 minutes", switching to seconds in the last minute.
export function formatClock(totalSeconds: number, showSeconds: boolean): string {
  const s = Math.max(0, Math.ceil(totalSeconds))
  if (showSeconds) return formatMMSS(s)
  if (s > 60) {
    const mins = Math.ceil(s / 60)
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`
  }
  return `${s} ${s === 1 ? 'second' : 'seconds'}`
}

// --- Message composition (front-end only; the AI never writes names) --------
export function composeMessage(
  message: string,
  firstName?: string,
  next?: { label: string } | null,
): string {
  return `${firstName ? firstName + ', ' : ''}${message}${next ? ' Next: ' + next.label + '.' : ''}`
}
