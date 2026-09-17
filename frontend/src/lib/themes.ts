import type { Theme, TimerConfig, Palette } from './config'

// --- Colour + contrast helpers ----------------------------------------------
export function isHexColor(s: unknown): s is string {
  return typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s)
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function channel(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

export function pickTextColor(background: string): string {
  return contrastRatio('#2D3748', background) >= contrastRatio('#FFFFFF', background)
    ? '#2D3748'
    : '#FFFFFF'
}

// A theme palette is valid when text/bg >= 4.5 and primary/bg >= 3.
export function paletteMeetsContrast(p: Palette): boolean {
  return contrastRatio(p.text, p.background) >= 4.5 && contrastRatio(p.primary, p.background) >= 3
}

// --- Preset themes -----------------------------------------------------------
export const PLAIN_THEME: Theme = {
  id: 'plain',
  themeName: 'Plain',
  interest: '',
  palette: {
    background: '#FDFBF7',
    surface: '#FFFFFF',
    primary: '#6A9B84',
    secondary: '#81B29A',
    accent: '#FFD6A5',
    text: '#2D3748',
  },
  traveller: 'star',
  destination: 'flag',
  pathStyle: 'trail',
  motifs: [],
  messages: {
    start: 'The timer has started.',
    halfway: 'Halfway there.',
    fiveMinutes: 'Five minutes left.',
    oneMinute: 'One minute left.',
    finish: 'All done.',
  },
  facts: [],
}

export const PRESETS: Theme[] = [
  PLAIN_THEME,
  {
    id: 'trains',
    themeName: 'Trains',
    interest: 'trains',
    palette: { background: '#F2F4F7', surface: '#FFFFFF', primary: '#3D5A80', secondary: '#98C1D9', accent: '#FFD6A5', text: '#2D3748' },
    traveller: 'steam-train',
    destination: 'flag',
    pathStyle: 'track',
    motifs: ['train-track', 'trees', 'cloud'],
    messages: {
      start: 'The timer train is leaving the station.',
      halfway: 'Halfway along the track.',
      fiveMinutes: 'Five minutes until we reach the station.',
      oneMinute: 'One minute left. Nearly at the station.',
      finish: 'We have arrived at the station.',
    },
    facts: [],
  },
  {
    id: 'dinosaurs',
    themeName: 'Dinosaurs',
    interest: 'dinosaurs',
    palette: { background: '#F3F5EE', surface: '#FFFFFF', primary: '#5F7148', secondary: '#A3B18A', accent: '#E9C46A', text: '#2D3748' },
    traveller: 'dinosaur',
    destination: 'volcano',
    pathStyle: 'trail',
    motifs: ['footprints', 'egg', 'leaf'],
    messages: {
      start: 'The dinosaur is starting its walk.',
      halfway: 'Halfway along the trail.',
      fiveMinutes: 'Five minutes until the volcano.',
      oneMinute: 'One minute left. Nearly at the volcano.',
      finish: 'The dinosaur has reached the volcano.',
    },
    facts: [],
  },
  {
    id: 'space',
    themeName: 'Space',
    interest: 'space',
    palette: { background: '#EEF0F7', surface: '#FFFFFF', primary: '#3A3D7A', secondary: '#8E94C4', accent: '#FFD6A5', text: '#2D3748' },
    traveller: 'rocket',
    destination: 'planet',
    pathStyle: 'orbit',
    motifs: ['star', 'moon', 'satellite'],
    messages: {
      start: 'The rocket has set off.',
      halfway: 'Halfway across space.',
      fiveMinutes: 'Five minutes until the planet.',
      oneMinute: 'One minute left. Nearly at the planet.',
      finish: 'The rocket has reached the planet.',
    },
    facts: [],
  },
  {
    id: 'ocean',
    themeName: 'Ocean',
    interest: 'the ocean',
    palette: { background: '#EEF6F6', surface: '#FFFFFF', primary: '#2A6F76', secondary: '#83C5BE', accent: '#FFD6A5', text: '#2D3748' },
    traveller: 'whale',
    destination: 'shell',
    pathStyle: 'river',
    motifs: ['fish', 'waves', 'octopus'],
    messages: {
      start: 'The whale is starting its swim.',
      halfway: 'Halfway through the water.',
      fiveMinutes: 'Five minutes until the shell.',
      oneMinute: 'One minute left. Nearly at the shell.',
      finish: 'The whale has reached the shell.',
    },
    facts: [],
  },
  {
    id: 'minibeasts',
    themeName: 'Minibeasts',
    interest: 'minibeasts',
    palette: { background: '#F4F3EC', surface: '#FFFFFF', primary: '#6A7F3F', secondary: '#B5C99A', accent: '#E9C46A', text: '#2D3748' },
    traveller: 'butterfly',
    destination: 'flower',
    pathStyle: 'trail',
    motifs: ['bug', 'snail', 'leaf'],
    messages: {
      start: 'The butterfly is starting its journey.',
      halfway: 'Halfway to the flower.',
      fiveMinutes: 'Five minutes until the flower.',
      oneMinute: 'One minute left. Nearly at the flower.',
      finish: 'The butterfly has landed on the flower.',
    },
    facts: [],
  },
  {
    id: 'diggers',
    themeName: 'Diggers and trucks',
    interest: 'diggers and trucks',
    palette: { background: '#F5F3EE', surface: '#FFFFFF', primary: '#8A5A1E', secondary: '#C9A66B', accent: '#D9822B', text: '#2D3748' },
    traveller: 'digger',
    destination: 'construction',
    pathStyle: 'road',
    motifs: ['truck', 'traffic-cone', 'mountain'],
    messages: {
      start: 'The digger is starting work.',
      halfway: 'Halfway along the road.',
      fiveMinutes: 'Five minutes until the building site.',
      oneMinute: 'One minute left. Nearly at the building site.',
      finish: 'The digger has reached the building site.',
    },
    facts: [],
  },
  {
    id: 'weather',
    themeName: 'Weather',
    interest: 'the weather',
    palette: { background: '#EEF3F7', surface: '#FFFFFF', primary: '#4A6FA5', secondary: '#9EC1E0', accent: '#FFD6A5', text: '#2D3748' },
    traveller: 'cloud',
    destination: 'rainbow',
    pathStyle: 'sky',
    motifs: ['sun', 'snowflake', 'wind'],
    messages: {
      start: 'The cloud is starting to drift.',
      halfway: 'Halfway across the sky.',
      fiveMinutes: 'Five minutes until the rainbow.',
      oneMinute: 'One minute left. Nearly at the rainbow.',
      finish: 'The cloud has reached the rainbow.',
    },
    facts: [],
  },
  {
    id: 'music',
    themeName: 'Music',
    interest: 'music',
    palette: { background: '#F4EFF5', surface: '#FFFFFF', primary: '#6D4C7D', secondary: '#B79CC4', accent: '#FFD6A5', text: '#2D3748' },
    traveller: 'music',
    destination: 'drum',
    pathStyle: 'trail',
    motifs: ['guitar', 'star', 'palette'],
    messages: {
      start: 'The music is starting.',
      halfway: 'Halfway through the tune.',
      fiveMinutes: 'Five minutes until the last note.',
      oneMinute: 'One minute left. Nearly at the last note.',
      finish: 'The tune has finished.',
    },
    facts: [],
  },
  {
    id: 'animals',
    themeName: 'Animals',
    interest: 'animals',
    palette: { background: '#F4F1EC', surface: '#FFFFFF', primary: '#7A5C3E', secondary: '#C2A98E', accent: '#A8DADC', text: '#2D3748' },
    traveller: 'dog',
    destination: 'house',
    pathStyle: 'trail',
    motifs: ['cat', 'rabbit', 'bird'],
    messages: {
      start: 'The dog is starting its walk.',
      halfway: 'Halfway home.',
      fiveMinutes: 'Five minutes until home.',
      oneMinute: 'One minute left. Nearly home.',
      finish: 'The dog is home.',
    },
    facts: [],
  },
]

export const PRESET_IDS = PRESETS.map((t) => t.id)

export function getPreset(id: string): Theme | undefined {
  return PRESETS.find((t) => t.id === id)
}

// --- Timer display palettes --------------------------------------------------
export type ResolvedPalette = {
  background: string
  surface: string
  primary: string
  secondary: string
  accent: string
  text: string
  timer: string
}

export const NAMED_DISPLAY_PALETTES: Record<string, Palette> = {
  soft: { background: '#FDFBF7', surface: '#FFFFFF', primary: '#A8DADC', secondary: '#B9FBC0', accent: '#FFD6A5', text: '#2D3748' },
  'low-stimulation': { background: '#FDFBF7', surface: '#F4F1DE', primary: '#81B29A', secondary: '#EDEDE8', accent: '#EDEDE8', text: '#4A5568' },
  'high-contrast-dark': { background: '#111111', surface: '#1E1E1E', primary: '#FFE66D', secondary: '#FFFFFF', accent: '#FFE66D', text: '#FFFFFF' },
  'high-contrast-light': { background: '#FFFFFF', surface: '#FFFFFF', primary: '#1B4332', secondary: '#2D3748', accent: '#1B4332', text: '#111111' },
}

export function resolveDisplayPalette(config: TimerConfig): ResolvedPalette {
  const d = config.display
  if (d.palette === 'custom' && d.customColours) {
    const bg = d.customColours.background
    const timer = d.customColours.timer
    const text = pickTextColor(bg)
    return { background: bg, surface: bg, primary: timer, secondary: timer, accent: timer, text, timer }
  }
  if (d.palette === 'theme') {
    let p = config.theme.palette
    if (!paletteMeetsContrast(p)) p = PLAIN_THEME.palette
    return { ...p, timer: p.primary }
  }
  const named = NAMED_DISPLAY_PALETTES[d.palette] ?? PLAIN_THEME.palette
  return { ...named, timer: named.primary }
}
