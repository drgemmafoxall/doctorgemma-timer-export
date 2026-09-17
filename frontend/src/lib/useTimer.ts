import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AudioEngine } from './audio'
import { Speech, formatTimeLeft } from './speech'
import { composeMessage, MAX_TOTAL_SECONDS, type TimerConfig } from './config'

export type Phase = 'ready' | 'running' | 'paused' | 'awaiting-next' | 'finished'

export type TimerState = {
  phase: Phase
  currentIndex: number
  stepRemainingMs: number
  stepDurationMs: number
  totalRemainingMs: number
  totalDurationMs: number
  stepFraction: number // remaining fraction of current step (1 -> 0)
  totalFraction: number // remaining fraction of whole timer (1 -> 0)
  nextCardLabel: string | null // shown during a 3s auto-advance card
  glow: boolean
  ariaMessage: string
  canAddTime: boolean
  muted: boolean
  finishedNaturally: boolean
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function useTimer(config: TimerConfig) {
  const audio = useRef(new AudioEngine()).current
  const speech = useRef(new Speech()).current

  const baseTotalSeconds = useMemo(
    () => config.steps.reduce((a, s) => a + s.seconds, 0),
    [config],
  )

  const reduced = prefersReducedMotion()
  const effectiveMotion =
    reduced || config.display.palette === 'low-stimulation' ? 'still' : config.motion

  // Mutable engine refs
  const endRef = useRef(0) // performance.now() end of current step
  const pausedRemainingRef = useRef(0)
  const currentIndexRef = useRef(0)
  const stepDurMsRef = useRef(config.steps[0].seconds * 1000)
  const addedSecondsRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const prevSecRef = useRef<number>(Math.ceil(baseTotalSeconds))
  const firedRef = useRef<Set<string>>(new Set())
  const wakeRef = useRef<any>(null)
  const startedRef = useRef(false)
  const mutedRef = useRef(false)

  const [state, setState] = useState<TimerState>(() => ({
    phase: 'ready',
    currentIndex: 0,
    stepRemainingMs: config.steps[0].seconds * 1000,
    stepDurationMs: config.steps[0].seconds * 1000,
    totalRemainingMs: baseTotalSeconds * 1000,
    totalDurationMs: baseTotalSeconds * 1000,
    stepFraction: 1,
    totalFraction: 1,
    nextCardLabel: null,
    glow: false,
    ariaMessage: '',
    canAddTime: config.controls.allowAddTime && baseTotalSeconds < MAX_TOTAL_SECONDS,
    muted: false,
    finishedNaturally: false,
  }))

  // configure engines
  useEffect(() => {
    audio.setVolume(config.sound.volume)
    speech.rate = config.sound.speechRate
    speech.init()
  }, [audio, speech, config.sound.volume, config.sound.speechRate])

  const soundOn = useCallback(
    () => config.sound.enabled && !mutedRef.current,
    [config.sound.enabled],
  )

  const laterStepsSeconds = useCallback(
    (afterIndex: number) => {
      let s = 0
      for (let i = afterIndex + 1; i < config.steps.length; i++) s += config.steps[i].seconds
      return s
    },
    [config.steps],
  )

  // --- wake lock -------------------------------------------------------------
  const requestWake = useCallback(async () => {
    try {
      const nav = navigator as any
      if (nav.wakeLock && !wakeRef.current) {
        wakeRef.current = await nav.wakeLock.request('screen')
      }
    } catch {
      /* ignore */
    }
  }, [])
  const releaseWake = useCallback(() => {
    try {
      wakeRef.current?.release?.()
    } catch {
      /* ignore */
    }
    wakeRef.current = null
  }, [])

  const announce = useCallback((msg: string) => {
    setState((s) => ({ ...s, ariaMessage: msg }))
  }, [])

  const glowPulse = useCallback(() => {
    if (effectiveMotion === 'still') return
    setState((s) => ({ ...s, glow: true }))
    window.setTimeout(() => setState((s) => ({ ...s, glow: false })), 2000)
  }, [effectiveMotion])

  const nextActivityLabel = useCallback((): string | null => {
    if (config.kind === 'now-next' && config.next) return config.next.label
    return null
  }, [config])

  // Speak a themed message 400ms after a chime, so they never overlap.
  const themedSpeech = useCallback(
    (message: string, chimeFirst: boolean) => {
      if (!config.sound.speech) return
      const composed = composeMessage(
        message,
        config.sound.firstName,
        config.kind === 'now-next' && config.next ? config.next : null,
      )
      const delay = chimeFirst ? 400 : 0
      window.setTimeout(() => speech.speak(composed), delay)
    },
    [config, speech],
  )

  // --- event evaluation on second changes ------------------------------------
  const evaluate = useCallback(
    (totalRemMs: number) => {
      const totalRemSec = Math.ceil(totalRemMs / 1000)
      const totalDurSec = baseTotalSeconds + addedSecondsRef.current
      const prev = prevSecRef.current
      if (totalRemSec === prev) return
      prevSecRef.current = totalRemSec

      const s = config.sound

      // per-second countdown beeps (final 5 / 10 seconds)
      if (soundOn() && s.finalBeeps !== 'off' && totalRemSec >= 1) {
        const window5 = s.finalBeeps === 'last-5' ? 5 : 10
        if (totalRemSec <= window5) audio.countdownBeep(totalRemSec)
      }

      // minute beeps on whole-minute boundaries
      if (soundOn() && s.minuteBeeps !== 'off' && totalRemSec > 0 && totalRemSec % 60 === 0) {
        const minsLeft = totalRemSec / 60
        if (minsLeft <= 5) audio.minuteBeeps(minsLeft)
        else if (s.minuteBeeps === 'every-minute') audio.minuteBeeps(1, true)
      }

      // audio-timer spoken updates
      if (config.kind === 'audio' && s.speech) {
        if (totalRemSec > 0 && totalRemSec % 300 === 0) {
          speech.speak(`${totalRemSec / 60} minutes left`)
        } else if (totalRemSec === 30) {
          speech.speak('30 seconds left')
        }
      }

      // themed warnings (crossings)
      const cross = (threshold: number) => prev > threshold && totalRemSec <= threshold

      const halfway = Math.floor(totalDurSec / 2)
      if (halfway > 0 && cross(halfway) && !firedRef.current.has('halfway')) {
        firedRef.current.add('halfway')
        if (soundOn() && s.warnings.halfway) {
          audio.warning()
          if (s.vibrate) audio.vibrate(200)
        }
        themedSpeech(config.theme.messages.halfway, soundOn() && s.warnings.halfway)
        announce(composeMessage(config.theme.messages.halfway, config.sound.firstName))
        glowPulse()
      }
      if (totalDurSec > 300 && cross(300) && !firedRef.current.has('five')) {
        firedRef.current.add('five')
        if (soundOn() && s.warnings.fiveMin) {
          audio.warning()
          if (s.vibrate) audio.vibrate(200)
        }
        themedSpeech(config.theme.messages.fiveMinutes, soundOn() && s.warnings.fiveMin)
        announce(composeMessage(config.theme.messages.fiveMinutes, config.sound.firstName))
        glowPulse()
      }
      if (totalDurSec > 60 && cross(60) && !firedRef.current.has('one')) {
        firedRef.current.add('one')
        if (soundOn() && s.warnings.oneMin) {
          audio.warning()
          if (s.vibrate) audio.vibrate(200)
        }
        themedSpeech(
          config.theme.messages.oneMinute,
          soundOn() && s.warnings.oneMin,
        )
        announce(
          composeMessage(
            config.theme.messages.oneMinute,
            config.sound.firstName,
            nextActivityLabel() ? { label: nextActivityLabel()! } : null,
          ),
        )
        glowPulse()
      }
    },
    [audio, speech, baseTotalSeconds, config, soundOn, themedSpeech, announce, glowPulse, nextActivityLabel],
  )

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    rafRef.current = null
    intervalRef.current = null
  }, [])

  const finishAll = useCallback(() => {
    stopLoop()
    releaseWake()
    const s = config.sound
    if (soundOn()) {
      audio.chime(s.endChime)
      if (s.vibrate) audio.vibrate([300, 150, 300, 150, 300])
    }
    themedSpeech(config.theme.messages.finish, soundOn() && s.endChime !== 'none')
    announce(
      composeMessage(
        config.theme.messages.finish,
        config.sound.firstName,
        nextActivityLabel() ? { label: nextActivityLabel()! } : null,
      ),
    )
    setState((st) => ({
      ...st,
      phase: 'finished',
      stepRemainingMs: 0,
      totalRemainingMs: 0,
      stepFraction: 0,
      totalFraction: 0,
      finishedNaturally: true,
      glow: false,
    }))
  }, [audio, config, soundOn, stopLoop, releaseWake, themedSpeech, announce, nextActivityLabel])

  const beginStep = useCallback(
    (index: number) => {
      currentIndexRef.current = index
      const durMs = config.steps[index].seconds * 1000
      stepDurMsRef.current = durMs
      endRef.current = performance.now() + durMs
      setState((st) => ({
        ...st,
        phase: 'running',
        currentIndex: index,
        stepRemainingMs: durMs,
        stepDurationMs: durMs,
      }))
      void requestWake()
      startLoop()
    },
    // startLoop defined below; safe via ref pattern
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.steps, requestWake],
  )

  const handleStepEnd = useCallback(() => {
    stopLoop()
    const idx = currentIndexRef.current
    const isLast = idx >= config.steps.length - 1
    if (isLast) {
      finishAll()
      return
    }
    // segment boundary
    if (soundOn()) audio.chime(config.sound.endChime)
    const nextStep = config.steps[idx + 1]
    if (config.autoAdvance) {
      setState((st) => ({ ...st, phase: 'awaiting-next', nextCardLabel: nextStep.label }))
      window.setTimeout(() => {
        setState((st) => ({ ...st, nextCardLabel: null }))
        beginStep(idx + 1)
      }, 3000)
    } else {
      releaseWake()
      setState((st) => ({ ...st, phase: 'awaiting-next', nextCardLabel: nextStep.label }))
    }
  }, [audio, config, soundOn, stopLoop, finishAll, beginStep, releaseWake])

  const tick = useCallback(() => {
    const now = performance.now()
    let stepRemMs = endRef.current - now
    if (stepRemMs < 0) stepRemMs = 0
    const totalRemMs = stepRemMs + laterStepsSeconds(currentIndexRef.current) * 1000
    evaluate(totalRemMs)
    const durMs = stepDurMsRef.current
    setState((st) => ({
      ...st,
      stepRemainingMs: stepRemMs,
      totalRemainingMs: totalRemMs,
      stepDurationMs: durMs,
      stepFraction: durMs > 0 ? stepRemMs / durMs : 0,
      totalFraction:
        (baseTotalSeconds + addedSecondsRef.current) > 0
          ? totalRemMs / ((baseTotalSeconds + addedSecondsRef.current) * 1000)
          : 0,
    }))
    if (stepRemMs <= 0) {
      handleStepEnd()
    }
  }, [evaluate, laterStepsSeconds, baseTotalSeconds, handleStepEnd])

  const tickRef = useRef(tick)
  tickRef.current = tick

  function startLoop() {
    stopLoopStatic()
    if (effectiveMotion === 'still') {
      intervalRef.current = window.setInterval(() => tickRef.current(), 250)
    } else {
      const frame = () => {
        tickRef.current()
        // tick() may stop the loop (finish / pause / boundary); only reschedule
        // if it is still meant to be running.
        if (rafRef.current !== null) rafRef.current = requestAnimationFrame(frame)
      }
      rafRef.current = requestAnimationFrame(frame)
    }
  }
  function stopLoopStatic() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    rafRef.current = null
    intervalRef.current = null
  }

  // --- public controls -------------------------------------------------------
  const start = useCallback(() => {
    audio.unlock()
    speech.unlock()
    startedRef.current = true
    firedRef.current = new Set()
    addedSecondsRef.current = 0
    prevSecRef.current = Math.ceil(baseTotalSeconds)
    // start message
    if (config.sound.speech) {
      speech.speak(composeMessage(config.theme.messages.start, config.sound.firstName))
    }
    announce(composeMessage(config.theme.messages.start, config.sound.firstName))
    beginStep(0)
  }, [audio, speech, baseTotalSeconds, config, announce, beginStep])

  const pause = useCallback(() => {
    if (state.phase !== 'running') return
    stopLoop()
    releaseWake()
    pausedRemainingRef.current = Math.max(0, endRef.current - performance.now())
    speech.cancel()
    setState((st) => ({ ...st, phase: 'paused' }))
    announce('Paused')
  }, [state.phase, stopLoop, releaseWake, speech, announce])

  const resume = useCallback(() => {
    if (state.phase !== 'paused') return
    endRef.current = performance.now() + pausedRemainingRef.current
    void requestWake()
    setState((st) => ({ ...st, phase: 'running' }))
    announce('Resumed')
    startLoop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, requestWake, announce])

  const restart = useCallback(() => {
    stopLoop()
    speech.cancel()
    firedRef.current = new Set()
    addedSecondsRef.current = 0
    prevSecRef.current = Math.ceil(baseTotalSeconds)
    currentIndexRef.current = 0
    if (config.sound.speech) {
      speech.speak(composeMessage(config.theme.messages.start, config.sound.firstName))
    }
    announce(composeMessage(config.theme.messages.start, config.sound.firstName))
    setState((st) => ({ ...st, finishedNaturally: false, nextCardLabel: null }))
    beginStep(0)
  }, [stopLoop, speech, baseTotalSeconds, config, announce, beginStep])

  const startNextStep = useCallback(() => {
    const idx = currentIndexRef.current
    setState((st) => ({ ...st, nextCardLabel: null }))
    beginStep(idx + 1)
  }, [beginStep])

  const addMinute = useCallback(() => {
    if (!config.controls.allowAddTime) return
    const room = MAX_TOTAL_SECONDS - (baseTotalSeconds + addedSecondsRef.current)
    if (room <= 0) return
    const add = Math.min(60, room)
    addedSecondsRef.current += add
    stepDurMsRef.current += add * 1000
    if (state.phase === 'paused') {
      pausedRemainingRef.current += add * 1000
    } else {
      endRef.current += add * 1000
    }
    // allow warnings to re-fire relative to the new total if they now make sense
    firedRef.current = new Set()
    prevSecRef.current += add
    setState((st) => ({
      ...st,
      canAddTime: baseTotalSeconds + addedSecondsRef.current < MAX_TOTAL_SECONDS,
    }))
    announce('Added one minute')
  }, [config.controls.allowAddTime, baseTotalSeconds, state.phase, announce])

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current
    if (mutedRef.current) speech.cancel()
    setState((st) => ({ ...st, muted: mutedRef.current }))
    announce(mutedRef.current ? 'Sound off' : 'Sound on')
  }, [speech, announce])

  const speakTimeLeft = useCallback(() => {
    audio.unlock()
    speech.unlock()
    let remMs: number
    if (state.phase === 'paused') {
      remMs = pausedRemainingRef.current + laterStepsSeconds(currentIndexRef.current) * 1000
    } else if (state.phase === 'running') {
      remMs =
        Math.max(0, endRef.current - performance.now()) +
        laterStepsSeconds(currentIndexRef.current) * 1000
    } else {
      remMs = state.totalRemainingMs
    }
    const text = formatTimeLeft(remMs / 1000)
    speech.speak(text)
    announce(text)
  }, [audio, speech, state.phase, state.totalRemainingMs, laterStepsSeconds, announce])

  // --- visibility catch-up ---------------------------------------------------
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return
      if (state.phase === 'running') {
        void requestWake()
        const now = performance.now()
        const stepRemMs = endRef.current - now
        if (stepRemMs <= 0) {
          // Finished (or a boundary passed) while hidden.
          firedRef.current.add('halfway')
          firedRef.current.add('five')
          firedRef.current.add('one')
          prevSecRef.current = 0
          handleStepEnd()
        }
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [state.phase, requestWake, handleStepEnd])

  useEffect(() => {
    return () => {
      stopLoopStatic()
      releaseWake()
      speech.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    state,
    effectiveMotion,
    controls: {
      start,
      pause,
      resume,
      restart,
      startNextStep,
      addMinute,
      toggleMute,
      speakTimeLeft,
    },
  }
}
