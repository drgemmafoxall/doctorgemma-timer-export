import { useState } from 'react'
import {
  Pause,
  Play,
  RotateCcw,
  Plus,
  Volume2,
  VolumeX,
  Ear,
  Maximize,
  Minimize,
  Lock,
  Keyboard,
} from 'lucide-react'
import HoldButton from './HoldButton'
import type { Phase } from '../../lib/useTimer'
import type { TimerConfig } from '../../lib/config'

const ctrlBtn =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-full font-heading font-semibold bg-sage text-charcoal hover:bg-forest transition-colors'

export default function Controls({
  phase,
  config,
  canAddTime,
  muted,
  isFullscreen,
  visible,
  still,
  onPause,
  onResume,
  onRestart,
  onAddMinute,
  onToggleMute,
  onHearTime,
  onToggleFullscreen,
}: {
  phase: Phase
  config: TimerConfig
  canAddTime: boolean
  muted: boolean
  isFullscreen: boolean
  visible: boolean
  still: boolean
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onAddMinute: () => void
  onToggleMute: () => void
  onHearTime: () => void
  onToggleFullscreen: () => void
}) {
  const [showKeys, setShowKeys] = useState(false)
  const locked = config.controls.grownUpLock
  const running = phase === 'running'

  const opacityClass = visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
  const transition = still ? '' : 'transition-opacity duration-300'

  return (
    <div className={`flex flex-col items-center gap-3 ${transition} ${opacityClass}`} data-testid="timer-controls">
      {locked && (
        <div className="flex items-center gap-2 text-sm font-semibold text-charcoal" data-testid="lock-indicator">
          <Lock size={16} strokeWidth={1.6} aria-hidden />
          Hold to use
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {running ? (
          <HoldButton locked={locked} onActivate={onPause} className={ctrlBtn} testid="control-pause" ariaLabel="Pause">
            <Pause size={20} strokeWidth={1.6} aria-hidden />
            Pause
          </HoldButton>
        ) : (
          <HoldButton locked={locked} onActivate={onResume} className={ctrlBtn} testid="control-resume" ariaLabel="Resume">
            <Play size={20} strokeWidth={1.6} aria-hidden />
            Resume
          </HoldButton>
        )}

        <HoldButton locked={locked} onActivate={onRestart} className={ctrlBtn} testid="control-restart" ariaLabel="Restart">
          <RotateCcw size={20} strokeWidth={1.6} aria-hidden />
          Restart
        </HoldButton>

        {config.controls.allowAddTime && canAddTime && (
          <HoldButton locked={locked} onActivate={onAddMinute} className={ctrlBtn} testid="control-add-minute" ariaLabel="Add one minute">
            <Plus size={20} strokeWidth={1.6} aria-hidden />
            +1 minute
          </HoldButton>
        )}

        <HoldButton locked={locked} onActivate={onToggleMute} className={ctrlBtn} testid="control-mute" ariaLabel={muted ? 'Turn sound on' : 'Turn sound off'}>
          {muted ? <VolumeX size={20} strokeWidth={1.6} aria-hidden /> : <Volume2 size={20} strokeWidth={1.6} aria-hidden />}
          {muted ? 'Sound off' : 'Sound on'}
        </HoldButton>

        <HoldButton locked={locked} onActivate={onHearTime} className={ctrlBtn} testid="control-hear-time" ariaLabel="Hear time left">
          <Ear size={20} strokeWidth={1.6} aria-hidden />
          Hear time left
        </HoldButton>

        <HoldButton locked={locked} onActivate={onToggleFullscreen} className={ctrlBtn} testid="control-fullscreen" ariaLabel={isFullscreen ? 'Exit full screen' : 'Full screen'}>
          {isFullscreen ? <Minimize size={20} strokeWidth={1.6} aria-hidden /> : <Maximize size={20} strokeWidth={1.6} aria-hidden />}
          {isFullscreen ? 'Exit full screen' : 'Full screen'}
        </HoldButton>
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal underline underline-offset-2"
        onClick={() => setShowKeys((v) => !v)}
        aria-expanded={showKeys}
        data-testid="keyboard-shortcuts-toggle"
      >
        <Keyboard size={16} strokeWidth={1.6} aria-hidden />
        Keyboard shortcuts
      </button>
      {showKeys && (
        <ul className="rounded-2xl bg-white/90 p-4 text-sm text-charcoal shadow-sm" data-testid="keyboard-shortcuts-list">
          <li>Space or Enter: hear the time left</li>
          <li>P: pause or resume</li>
          <li>R: restart</li>
          <li>F: full screen</li>
          <li>M: sound on or off</li>
          <li>Esc: leave full screen</li>
        </ul>
      )}
    </div>
  )
}
