// Browser speechSynthesis wrapper. Prefers en-AU, then en-GB, then any English.
export class Speech {
  rate = 0.9
  private voice: SpeechSynthesisVoice | null = null

  get supported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  init(): void {
    if (!this.supported) return
    this.pickVoice()
    window.speechSynthesis.onvoiceschanged = () => this.pickVoice()
  }

  private pickVoice(): void {
    if (!this.supported) return
    const vs = window.speechSynthesis.getVoices() || []
    this.voice =
      vs.find((v) => v.lang === 'en-AU') ||
      vs.find((v) => v.lang === 'en-GB') ||
      vs.find((v) => v.lang && v.lang.toLowerCase().startsWith('en')) ||
      null
  }

  // Unlock speech on the first user gesture (Start tap).
  unlock(): void {
    if (!this.supported) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
  }

  speak(text: string): void {
    if (!this.supported || !text) return
    window.speechSynthesis.cancel() // never overlap
    const u = new SpeechSynthesisUtterance(text)
    u.rate = this.rate
    u.pitch = 1
    if (this.voice) {
      u.voice = this.voice
      u.lang = this.voice.lang
    } else {
      u.lang = 'en-GB'
    }
    window.speechSynthesis.speak(u)
  }

  cancel(): void {
    if (this.supported) window.speechSynthesis.cancel()
  }
}

// "4 minutes and 20 seconds left", calm and plain.
export function formatTimeLeft(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  const parts: string[] = []
  if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`)
  if (sec > 0 || m === 0) parts.push(`${sec} ${sec === 1 ? 'second' : 'seconds'}`)
  return `${parts.join(' and ')} left`
}
