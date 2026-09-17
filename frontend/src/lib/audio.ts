import type { EndChime } from './config'

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

// Web Audio API only. Sine / triangle waves, soft attack + smooth release.
export class AudioEngine {
  private ctx: AudioContext | null = null
  volume = 0.5

  unlock(): void {
    if (!this.ctx) {
      const C: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext
      if (!C) return
      this.ctx = new C()
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  setVolume(v: number): void {
    this.volume = clamp01(v)
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType = 'sine',
    peakScale = 1,
    delay = 0,
  ): void {
    if (!this.ctx) return
    const t0 = this.ctx.currentTime + delay
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type // sine or triangle only
    osc.frequency.setValueAtTime(freq, t0)
    const peak = Math.max(0.0002, this.volume * 0.6 * peakScale)
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012) // >= 10ms soft attack
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur) // smooth release
    osc.connect(g).connect(this.ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.05)
  }

  chime(kind: EndChime): void {
    if (!this.ctx || kind === 'none') return
    if (kind === 'soft-bell') {
      this.tone(660, 2.0, 'sine', 1)
    } else if (kind === 'wind-chime') {
      const pent = [523.25, 587.33, 659.25, 783.99, 880]
      for (let i = 0; i < 4; i++) {
        const f = pent[Math.floor(Math.random() * pent.length)]
        this.tone(f, 1.6, 'sine', 0.8, i * 0.18)
      }
    } else if (kind === 'marimba') {
      const notes = [659.25, 523.25, 392]
      notes.forEach((f, i) => this.tone(f, 0.5, 'triangle', 0.9, i * 0.16))
    }
  }

  warning(): void {
    this.tone(523.25, 0.6, 'sine', 0.5)
  }

  countdownBeep(secondsLeft: number): void {
    // pitch rises slightly for the final 3 seconds
    const freq = secondsLeft <= 3 ? 660 : 440
    this.tone(freq, 0.12, 'sine', 0.6)
  }

  minuteBeeps(n: number, low = false): void {
    if (low) {
      this.tone(300, 0.16, 'sine', 0.5)
      return
    }
    for (let i = 0; i < n; i++) this.tone(500, 0.12, 'sine', 0.55, i * 0.22)
  }

  vibrate(pattern: number | number[]): void {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  }
}
