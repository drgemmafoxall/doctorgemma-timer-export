import { useRef, useState, type ReactNode } from 'react'

const HOLD_MS = 2000

// A control that acts instantly when unlocked, or needs a 2-second press when
// the grown-up lock is on. Works for pointer and keyboard.
export default function HoldButton({
  onActivate,
  locked,
  className = '',
  children,
  testid,
  ariaLabel,
  disabled,
}: {
  onActivate: () => void
  locked: boolean
  className?: string
  children: ReactNode
  testid?: string
  ariaLabel?: string
  disabled?: boolean
}) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const holdingRef = useRef(false)

  const begin = () => {
    if (disabled) return
    if (!locked) {
      onActivate()
      return
    }
    if (holdingRef.current) return
    holdingRef.current = true
    startRef.current = performance.now()
    const step = () => {
      const p = Math.min(1, (performance.now() - startRef.current) / HOLD_MS)
      setProgress(p)
      if (p >= 1) {
        holdingRef.current = false
        setProgress(0)
        onActivate()
        return
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const cancel = () => {
    if (!locked) return
    holdingRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setProgress(0)
  }

  return (
    <button
      type="button"
      disabled={disabled}
      data-testid={testid}
      aria-label={ariaLabel}
      className={`relative overflow-hidden ${className}`}
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        if (locked && (e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault()
          begin()
        }
      }}
      onKeyUp={(e) => {
        if (locked && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault()
          cancel()
        }
      }}
    >
      {children}
      {locked && progress > 0 && (
        <span
          className="pointer-events-none absolute bottom-0 left-0 h-1 bg-forest"
          style={{ width: `${progress * 100}%` }}
          aria-hidden
        />
      )}
    </button>
  )
}
