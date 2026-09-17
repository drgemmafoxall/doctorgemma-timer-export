import * as Lucide from 'lucide-react'
import type { SVGProps, CSSProperties } from 'react'

export type IconProps = {
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
  style?: CSSProperties
  'aria-hidden'?: boolean | 'true' | 'false'
}
export type IconComponent = (props: IconProps) => JSX.Element

// --- Lucide-backed keys: key -> Lucide component name -----------------------
const LUCIDE_MAP: Record<string, string> = {
  'train-front': 'TrainFront',
  'train-track': 'TrainTrack',
  'tram-front': 'TramFront',
  bus: 'Bus',
  car: 'Car',
  truck: 'Truck',
  tractor: 'Tractor',
  plane: 'Plane',
  ship: 'Ship',
  sailboat: 'Sailboat',
  bike: 'Bike',
  rocket: 'Rocket',
  orbit: 'Orbit',
  satellite: 'Satellite',
  telescope: 'Telescope',
  sun: 'Sun',
  moon: 'Moon',
  star: 'Star',
  cloud: 'Cloud',
  'cloud-rain': 'CloudRain',
  rainbow: 'Rainbow',
  snowflake: 'Snowflake',
  wind: 'Wind',
  zap: 'Zap',
  umbrella: 'Umbrella',
  waves: 'Waves',
  anchor: 'Anchor',
  fish: 'Fish',
  shell: 'Shell',
  turtle: 'Turtle',
  snail: 'Snail',
  bug: 'Bug',
  bird: 'Bird',
  cat: 'Cat',
  dog: 'Dog',
  rabbit: 'Rabbit',
  squirrel: 'Squirrel',
  worm: 'Worm',
  egg: 'Egg',
  bone: 'Bone',
  footprints: 'Footprints',
  flower: 'Flower',
  'flower-2': 'Flower2',
  leaf: 'Leaf',
  sprout: 'Sprout',
  trees: 'Trees',
  'tree-pine': 'TreePine',
  mountain: 'Mountain',
  tent: 'Tent',
  castle: 'Castle',
  crown: 'Crown',
  gem: 'Gem',
  trophy: 'Trophy',
  flag: 'Flag',
  map: 'Map',
  compass: 'Compass',
  globe: 'Globe',
  music: 'Music',
  guitar: 'Guitar',
  drum: 'Drum',
  palette: 'Palette',
  brush: 'Brush',
  puzzle: 'Puzzle',
  blocks: 'Blocks',
  shapes: 'Shapes',
  'book-open': 'BookOpen',
  'gamepad-2': 'Gamepad2',
  dices: 'Dices',
  construction: 'Construction',
  'traffic-cone': 'TrafficCone',
  house: 'House',
  school: 'School',
  bath: 'Bath',
  bed: 'Bed',
  utensils: 'Utensils',
  apple: 'Apple',
  carrot: 'Carrot',
  pizza: 'Pizza',
  cake: 'Cake',
  cookie: 'Cookie',
  'ice-cream-cone': 'IceCreamCone',
}

const LucideAny = Lucide as unknown as Record<string, IconComponent>
const Fallback = LucideAny.Circle

function lucide(name: string): IconComponent {
  return LucideAny[name] ?? Fallback
}

// --- Custom, original line illustrations (lucide house style) ---------------
function svg(children: JSX.Element, p: IconProps) {
  const { size = 24, strokeWidth = 1.6, className, color = 'currentColor', style } = p
  const common: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    style,
    'aria-hidden': (p['aria-hidden'] ?? true) as boolean,
  }
  return <svg {...common}>{children}</svg>
}

const Dinosaur: IconComponent = (p) =>
  svg(
    <>
      <path d="M4 20c1-4 3-6 6-6" />
      <path d="M10 14c0-5 3-9 8-9 0 3-1 5-3 6" />
      <path d="M15 5c1.5 0 3 .8 3 2.5S16 11 14 11" />
      <path d="M10 14v4M13 13v5M16 11v7" />
      <circle cx="17" cy="6.4" r=".5" fill="currentColor" stroke="none" />
    </>,
    p,
  )

const Volcano: IconComponent = (p) =>
  svg(
    <>
      <path d="M9 9l-6 11h18L15 9z" />
      <path d="M9 9h6" />
      <path d="M12 9c0-2 .6-3 .6-4S12 3 12 3M14.5 8c.4-1 0-2 .4-3" />
    </>,
    p,
  )

const Digger: IconComponent = (p) =>
  svg(
    <>
      <circle cx="7" cy="18" r="2" />
      <circle cx="15" cy="18" r="2" />
      <path d="M5 18h-2v-4h9v4M9 18h4" />
      <path d="M12 12l3-5 4 2" />
      <path d="M19 9l1 4h-4" />
    </>,
    p,
  )

const Whale: IconComponent = (p) =>
  svg(
    <>
      <path d="M3 14c0-4 4-6 8-6s8 2 9 6c-2 1-5 2-9 2s-6-1-8-2z" />
      <path d="M20 14c1-1 1.5-3 1-4M6 12c-1-1-2-1-3-3" />
      <circle cx="7.5" cy="12.5" r=".5" fill="currentColor" stroke="none" />
    </>,
    p,
  )

const Octopus: IconComponent = (p) =>
  svg(
    <>
      <path d="M8 9a4 4 0 0 1 8 0v3H8z" />
      <path d="M8 12c-1 3-2 4-4 4M10 12c-.5 3-1 5-2 6M14 12c.5 3 1 5 2 6M16 12c1 3 2 4 4 4" />
      <circle cx="10.5" cy="8.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="8.5" r=".5" fill="currentColor" stroke="none" />
    </>,
    p,
  )

const Butterfly: IconComponent = (p) =>
  svg(
    <>
      <path d="M12 6v12" />
      <path d="M12 8C10 4 4 4 4 8s4 5 8 4" />
      <path d="M12 8c2-4 8-4 8 0s-4 5-8 4" />
      <path d="M12 12c-2 4-7 4-7 0M12 12c2 4 7 4 7 0" />
      <path d="M12 6c-.6-1-1.2-1.5-2-2M12 6c.6-1 1.2-1.5 2-2" />
    </>,
    p,
  )

const Planet: IconComponent = (p) =>
  svg(
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M4.5 15c-2 1.2-3 2.4-2.6 3.2.7 1.4 5.4.4 10.4-2.2s8.6-6 7.9-7.4c-.4-.8-1.9-.8-4-.2" />
    </>,
    p,
  )

const SteamTrain: IconComponent = (p) =>
  svg(
    <>
      <path d="M4 17h14v-5h-6l-1-3H4z" />
      <path d="M11 9V6h3v3" />
      <path d="M9 6c0-1 .5-2 1.5-2" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="15" cy="19" r="1.6" />
      <path d="M18 14h2v3h-2" />
    </>,
    p,
  )

const CUSTOM_MAP: Record<string, IconComponent> = {
  dinosaur: Dinosaur,
  volcano: Volcano,
  digger: Digger,
  whale: Whale,
  octopus: Octopus,
  butterfly: Butterfly,
  planet: Planet,
  'steam-train': SteamTrain,
}

// --- Plain-English names -----------------------------------------------------
export const ICON_NAMES: Record<string, string> = {
  'train-front': 'Train',
  'train-track': 'Train track',
  'tram-front': 'Tram',
  bus: 'Bus',
  car: 'Car',
  truck: 'Truck',
  tractor: 'Tractor',
  plane: 'Aeroplane',
  ship: 'Ship',
  sailboat: 'Sailing boat',
  bike: 'Bicycle',
  rocket: 'Rocket',
  orbit: 'Orbit',
  satellite: 'Satellite',
  telescope: 'Telescope',
  sun: 'Sun',
  moon: 'Moon',
  star: 'Star',
  cloud: 'Cloud',
  'cloud-rain': 'Rain cloud',
  rainbow: 'Rainbow',
  snowflake: 'Snowflake',
  wind: 'Wind',
  zap: 'Lightning',
  umbrella: 'Umbrella',
  waves: 'Waves',
  anchor: 'Anchor',
  fish: 'Fish',
  shell: 'Shell',
  turtle: 'Turtle',
  snail: 'Snail',
  bug: 'Ladybird',
  bird: 'Bird',
  cat: 'Cat',
  dog: 'Dog',
  rabbit: 'Rabbit',
  squirrel: 'Squirrel',
  worm: 'Worm',
  egg: 'Egg',
  bone: 'Bone',
  footprints: 'Footprints',
  flower: 'Flower',
  'flower-2': 'Blossom',
  leaf: 'Leaf',
  sprout: 'Sprout',
  trees: 'Trees',
  'tree-pine': 'Pine tree',
  mountain: 'Mountain',
  tent: 'Tent',
  castle: 'Castle',
  crown: 'Crown',
  gem: 'Gem',
  trophy: 'Trophy',
  flag: 'Flag',
  map: 'Map',
  compass: 'Compass',
  globe: 'Globe',
  music: 'Music note',
  guitar: 'Guitar',
  drum: 'Drum',
  palette: 'Paint palette',
  brush: 'Paintbrush',
  puzzle: 'Puzzle piece',
  blocks: 'Building blocks',
  shapes: 'Shapes',
  'book-open': 'Open book',
  'gamepad-2': 'Game controller',
  dices: 'Dice',
  construction: 'Building site',
  'traffic-cone': 'Traffic cone',
  house: 'House',
  school: 'School',
  bath: 'Bath',
  bed: 'Bed',
  utensils: 'Knife and fork',
  apple: 'Apple',
  carrot: 'Carrot',
  pizza: 'Pizza',
  cake: 'Cake',
  cookie: 'Biscuit',
  'ice-cream-cone': 'Ice cream',
  dinosaur: 'Dinosaur',
  volcano: 'Volcano',
  digger: 'Digger',
  whale: 'Whale',
  octopus: 'Octopus',
  butterfly: 'Butterfly',
  planet: 'Planet',
  'steam-train': 'Steam train',
}

// --- Public exports ----------------------------------------------------------
export const ICON_KEYS: string[] = Object.keys(ICON_NAMES)

const RESOLVED: Record<string, IconComponent> = {}
for (const key of ICON_KEYS) {
  RESOLVED[key] = CUSTOM_MAP[key] ?? lucide(LUCIDE_MAP[key] ?? '')
}

export const ICON_COMPONENTS: Record<string, IconComponent> = RESOLVED

export function isIconKey(k: unknown): k is string {
  return typeof k === 'string' && Object.prototype.hasOwnProperty.call(RESOLVED, k)
}

export function Icon({
  name,
  ...props
}: IconProps & { name: string | null | undefined }): JSX.Element | null {
  if (!name) return null
  const Comp = RESOLVED[name] ?? Fallback
  return <Comp strokeWidth={1.6} {...props} />
}
