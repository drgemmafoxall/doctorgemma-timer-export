import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { TimerConfig } from '../../lib/config'
import { resolveDisplayPalette } from '../../lib/themes'
import { AudioEngine } from '../../lib/audio'
import Digital, { type DisplayProps } from '../timer/displays/Digital'
import ShadedDisc from '../timer/displays/ShadedDisc'
import SimpleClock from '../timer/displays/SimpleClock'
import Journey from '../timer/displays/Journey'
import Sand from '../timer/displays/Sand'
import LightsOut from '../timer/displays/LightsOut'
import Bar from '../timer/displays/Bar'

function renderDisplay(props: DisplayProps) {
  switch (props.config.display.style) {
    case 'shaded-disc':
      return <ShadedDisc {...props} />
    case 'simple-clock':
      return <SimpleClock {...props} />
    case 'journey':
      return <Journey {...props} />
    case 'sand':
      return <Sand {...props} />
    case 'lights-out':
      return <LightsOut {...props} />
    case 'bar':
      return <Bar {...props} />
    default:
      return <Digital {...props} />
  }
}

export default function Preview({ config }: { config: TimerConfig }) {
  const palette = resolveDisplayPalette(config)
  const totalSeconds = config.steps.reduce((a, s) => a + s.seconds, 0)
  const [fraction, setFraction] = useState(1)
  const [playing, setPlaying] = useState(false)
  const rafRef = useRef<number | null>(null)
  const audioRef = useRef(new AudioEngine())
  const still = config.motion === 'still' || config.display.palette === 'low-stimulation'

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const play = () => {
    if (playing) return
    setPlaying(true)
    if (config.sound.enabled) {
      audioRef.current.unlock()
      audioRef.current.setVolume(config.sound.volume)
    }
    const start = performance.now()
    const DUR = 10000
    const step = () => {
      const elapsed = performance.now() - start
      const f = Math.max(0, 1 - elapsed / DUR)
      setFraction(f)
      if (f <= 0) {
        if (config.sound.enabled) audioRef.current.chime(config.sound.endChime)
        setPlaying(false)
        window.setTimeout(() => setFraction(1), 1200)
        return
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const remSec = Math.ceil(fraction * totalSeconds)

  return (
    <div className="rounded-card border border-card-border bg-white p-4" data-testid="preview-panel">
      <div
        className="mb-3 flex items-center justify-center overflow-hidden rounded-2xl"
        style={{ background: palette.background, height: 260 }}
      >
        <div className="scale-[0.72]">
          {renderDisplay({ palette, remainingSeconds: remSec, fraction, still, size: 'large', config })}
        </div>
      </div>
      <button
        type="button"
        onClick={play}
        disabled={playing}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-sage px-5 font-heading font-semibold text-charcoal disabled:opacity-60"
        data-testid="play-preview"
      >
        <Play size={18} aria-hidden />
        {playing ? 'Playing…' : 'Play preview'}
      </button>
    </div>
  )
}
