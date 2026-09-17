import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Footer from '../Footer'
import ReadyScreen from './ReadyScreen'
import Controls from './Controls'
import StepStrip from './StepStrip'
import FactCard from './FactCard'
import FinishScreen, { NextCard } from './FinishScreen'
import Digital from './displays/Digital'
import ShadedDisc from './displays/ShadedDisc'
import SimpleClock from './displays/SimpleClock'
import Journey from './displays/Journey'
import Sand from './displays/Sand'
import LightsOut from './displays/LightsOut'
import Bar from './displays/Bar'
import type { DisplayProps } from './displays/Digital'
import { Icon } from '../../lib/icons'
import { resolveDisplayPalette } from '../../lib/themes'
import { useTimer } from '../../lib/useTimer'
import { type TimerConfig } from '../../lib/config'

const bigSage =
  'inline-flex min-h-[56px] items-center justify-center rounded-full bg-sage px-10 font-heading text-lg font-bold text-charcoal transition-colors hover:bg-forest'

function InvalidConfig() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-heading text-2xl font-bold text-charcoal">This timer link could not be read</h1>
      <p className="max-w-md text-slate">Please set up a new timer.</p>
      <a href={import.meta.env.BASE_URL} className={bigSage} data-testid="back-to-setup">
        Set up a timer
      </a>
    </div>
  )
}

export default function TimerView({ config }: { config: TimerConfig | null }) {
  if (!config) return <InvalidConfig />
  return <RunningTimer config={config} />
}

function RunningTimer({ config }: { config: TimerConfig }) {
  const palette = useMemo(() => resolveDisplayPalette(config), [config])
  const { state, effectiveMotion, controls } = useTimer(config)
  const still = effectiveMotion === 'still'
  const playful = effectiveMotion === 'playful'

  const stageRef = useRef<HTMLDivElement>(null)
  const [isNativeFs, setIsNativeFs] = useState(false)
  const [isImmersive, setIsImmersive] = useState(false)
  const isFullscreen = isNativeFs || isImmersive
  const [controlsVisible, setControlsVisible] = useState(true)

  const totalDuration = useMemo(() => config.steps.reduce((a, s) => a + s.seconds, 0), [config])
  const isReady = state.phase === 'ready'
  const remSec = isReady ? totalDuration : Math.ceil(state.totalRemainingMs / 1000)
  const frac = isReady ? 1 : state.totalFraction

  const stepEndFractions = useMemo(() => {
    if (config.kind !== 'first-then') return []
    const marks: number[] = []
    let cum = 0
    for (let i = 0; i < config.steps.length - 1; i++) {
      cum += config.steps[i].seconds
      marks.push(1 - cum / totalDuration)
    }
    return marks
  }, [config, totalDuration])

  const renderDisplay = useCallback(
    (remainingSeconds: number, fraction: number): ReactNode => {
      const props: DisplayProps = {
        palette,
        remainingSeconds,
        fraction,
        still,
        size: config.display.size,
        config,
        stepEndFractions,
      }
      switch (config.display.style) {
        case 'digital':
          return <Digital {...props} />
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
    },
    [palette, still, config, stepEndFractions],
  )

  // --- fullscreen ------------------------------------------------------------
  const enterImmersive = useCallback(() => {
    document.body.classList.add('dg-stage-immersive')
    window.scrollTo(0, 0)
    setIsImmersive(true)
  }, [])
  const exitImmersive = useCallback(() => {
    document.body.classList.remove('dg-stage-immersive')
    setIsImmersive(false)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = stageRef.current
    if (!isFullscreen) {
      if (el && el.requestFullscreen) {
        el.requestFullscreen().catch(() => enterImmersive())
      } else {
        enterImmersive()
      }
    } else {
      if (document.fullscreenElement) {
        void document.exitFullscreen()
      } else {
        exitImmersive()
      }
    }
  }, [isFullscreen, enterImmersive, exitImmersive])

  useEffect(() => {
    const onFs = () => setIsNativeFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    return () => document.body.classList.remove('dg-stage-immersive')
  }, [])

  // Auto-hide controls in fullscreen after 4s of no input.
  useEffect(() => {
    if (!isFullscreen) {
      setControlsVisible(true)
      return
    }
    let t: number
    const show = () => {
      setControlsVisible(true)
      window.clearTimeout(t)
      t = window.setTimeout(() => setControlsVisible(false), 4000)
    }
    show()
    window.addEventListener('mousemove', show)
    window.addEventListener('touchstart', show)
    window.addEventListener('keydown', show)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('mousemove', show)
      window.removeEventListener('touchstart', show)
      window.removeEventListener('keydown', show)
    }
  }, [isFullscreen])

  // --- keyboard shortcuts (P R F M Esc), respecting the grown-up lock -------
  const locked = config.controls.grownUpLock
  const holdRef = useRef<Record<string, number>>({})
  useEffect(() => {
    const act: Record<string, () => void> = {
      p: () => (state.phase === 'running' ? controls.pause() : state.phase === 'paused' ? controls.resume() : undefined),
      r: () => controls.restart(),
      f: () => toggleFullscreen(),
      m: () => controls.toggleMute(),
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      const k = e.key.toLowerCase()
      if (k === 'escape') {
        if (isFullscreen) toggleFullscreen()
        return
      }
      if (!act[k]) return
      e.preventDefault()
      if (!locked) {
        if (!e.repeat) act[k]()
      } else if (!holdRef.current[k]) {
        holdRef.current[k] = window.setTimeout(() => {
          act[k]()
          delete holdRef.current[k]
        }, 2000)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (holdRef.current[k]) {
        window.clearTimeout(holdRef.current[k])
        delete holdRef.current[k]
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [state.phase, controls, toggleFullscreen, locked, isFullscreen])

  // --- facts cycling ---------------------------------------------------------
  const [fact, setFact] = useState<{ visible: boolean; index: number }>({ visible: false, index: 0 })
  const facts = config.theme.facts
  const showFacts = config.display.showFacts && facts.length > 0 && config.display.palette !== 'low-stimulation'
  useEffect(() => {
    if (!showFacts || state.phase !== 'running') {
      setFact((f) => ({ ...f, visible: false }))
      return
    }
    let idx = 0
    let hideT: number
    const show = () => {
      setFact({ visible: true, index: idx % facts.length })
      idx += 1
      hideT = window.setTimeout(() => setFact((f) => ({ ...f, visible: false })), 20000)
    }
    const interval = window.setInterval(show, 120000)
    const first = window.setTimeout(show, 120000)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(first)
      window.clearTimeout(hideT)
    }
  }, [showFacts, state.phase, facts.length])

  const topLabel =
    config.kind === 'first-then'
      ? config.steps[state.currentIndex]?.label || config.theme.themeName
      : config.steps[0]?.label || config.theme.themeName

  const onStageTap = () => {
    if (state.phase === 'running' || state.phase === 'paused') controls.speakTimeLeft()
  }

  return (
    <>
      <div
        ref={stageRef}
        className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 px-6 py-10"
        style={{ background: palette.background, color: palette.text }}
        data-testid="timer-stage"
      >
        <div className={`flex w-full max-w-5xl flex-col items-center gap-8 ${state.glow && !still ? 'dg-glow rounded-card' : ''}`}>
          {/* aria-live announcements */}
          <div className="sr-only" role="status" aria-live="polite" data-testid="aria-live">
            {state.ariaMessage}
          </div>

          {state.phase === 'ready' && (
            <ReadyScreen
              config={config}
              palette={palette}
              totalSeconds={totalDuration}
              onStart={controls.start}
              preview={renderDisplay(totalDuration, 1)}
            />
          )}

          {state.phase === 'finished' && (
            <FinishScreen config={config} palette={palette} playful={playful} onRestart={controls.restart} />
          )}

          {state.phase === 'awaiting-next' && config.autoAdvance && state.nextCardLabel && (
            <NextCard label={state.nextCardLabel} palette={palette} />
          )}

          {(state.phase === 'running' ||
            state.phase === 'paused' ||
            (state.phase === 'awaiting-next' && !config.autoAdvance)) && (
            <>
              <h2 className="font-heading font-bold" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2rem)' }} data-testid="stage-label">
                {topLabel}
              </h2>

              <div
                role="button"
                tabIndex={0}
                onClick={onStageTap}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    onStageTap()
                  }
                }}
                className="flex w-full cursor-pointer flex-col items-center justify-center outline-none"
                data-testid="timer-stage-tap"
                aria-label="Hear the time left"
              >
                {renderDisplay(remSec, frac)}
              </div>

              {config.kind === 'now-next' && config.next && (
                <div className="flex items-center gap-3" data-testid="now-next-strip">
                  <span className="text-lg">Next:</span>
                  {config.next.icon && <Icon name={config.next.icon} size={48} style={{ color: palette.timer }} aria-hidden />}
                  <span className="font-heading font-bold" style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)' }}>
                    {config.next.label}
                  </span>
                </div>
              )}

              {config.kind === 'first-then' && (
                <StepStrip config={config} currentIndex={state.currentIndex} palette={palette} />
              )}

              {showFacts && fact.visible && <FactCard fact={facts[fact.index]} palette={palette} />}

              {state.phase === 'awaiting-next' && !config.autoAdvance ? (
                <button type="button" className={bigSage} onClick={controls.startNextStep} data-testid="start-next-step">
                  Start next step
                </button>
              ) : (
                <Controls
                  phase={state.phase}
                  config={config}
                  canAddTime={state.canAddTime}
                  muted={state.muted}
                  isFullscreen={isFullscreen}
                  visible={controlsVisible}
                  still={still}
                  onPause={controls.pause}
                  onResume={controls.resume}
                  onRestart={controls.restart}
                  onAddMinute={controls.addMinute}
                  onToggleMute={controls.toggleMute}
                  onHearTime={controls.speakTimeLeft}
                  onToggleFullscreen={toggleFullscreen}
                />
              )}
            </>
          )}
        </div>
      </div>
      {!isFullscreen && <Footer />}
    </>
  )
}
