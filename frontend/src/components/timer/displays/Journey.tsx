import { Icon } from '../../../lib/icons'
import { Check } from 'lucide-react'
import type { DisplayProps } from './Digital'
import { TimeNumber } from './Digital'

const ICON_SIZE: Record<DisplayProps['size'], number> = {
  large: 40,
  'extra-large': 56,
  fill: 72,
}

function PathSvg({ style, color }: { style: string; color: string }) {
  const common = { stroke: color, fill: 'none', strokeLinecap: 'round' as const, vectorEffect: 'non-scaling-stroke' as const }
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {style === 'track' && (
        <>
          <line x1="4" y1="54" x2="96" y2="54" {...common} strokeWidth="2" />
          <line x1="4" y1="66" x2="96" y2="66" {...common} strokeWidth="2" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={6 + i * 8} y1="52" x2={6 + i * 8} y2="68" {...common} strokeWidth="1.5" strokeOpacity="0.6" />
          ))}
        </>
      )}
      {style === 'road' && (
        <>
          <line x1="4" y1="48" x2="96" y2="48" {...common} strokeWidth="2" strokeOpacity="0.4" />
          <line x1="4" y1="72" x2="96" y2="72" {...common} strokeWidth="2" strokeOpacity="0.4" />
          <line x1="4" y1="60" x2="96" y2="60" {...common} strokeWidth="2" strokeDasharray="6 5" />
        </>
      )}
      {style === 'orbit' && <path d="M4,78 Q50,10 96,78" {...common} strokeWidth="2" strokeDasharray="2 5" />}
      {style === 'river' && <path d="M4,60 Q18,44 32,60 T60,60 T88,60 T116,60" {...common} strokeWidth="4" strokeOpacity="0.55" />}
      {style === 'trail' && <line x1="4" y1="62" x2="96" y2="62" {...common} strokeWidth="2" strokeDasharray="2 8" />}
      {style === 'sky' && <path d="M4,58 Q26,50 48,58 T92,58" {...common} strokeWidth="3" strokeOpacity="0.45" strokeDasharray="1 6" />}
    </svg>
  )
}

export default function Journey({ palette, remainingSeconds, fraction, config, size, still, stepEndFractions }: DisplayProps) {
  const progress = Math.min(1, Math.max(0, 1 - fraction))
  const iconSize = ICON_SIZE[size]
  const height = size === 'fill' ? '46vh' : size === 'extra-large' ? '32vh' : '24vh'
  const motifs = config.theme.motifs.slice(0, 3)
  const motifSpots = [
    { left: '22%', top: '18%' },
    { left: '52%', top: '14%' },
    { left: '78%', top: '20%' },
  ]
  return (
    <div className="flex w-full flex-col items-center gap-4" data-testid="display-journey">
      <div className="relative w-full max-w-4xl" style={{ height }}>
        <PathSvg style={config.theme.pathStyle} color={palette.secondary} />
        {motifs.map((m, i) => (
          <div key={i} className={`absolute ${still ? '' : 'dg-drift'}`} style={{ ...motifSpots[i], color: palette.secondary, opacity: 0.6 }}>
            <Icon name={m} size={iconSize * 0.5} aria-hidden />
          </div>
        ))}
        {(stepEndFractions ?? []).map((f, i) => (
          <div key={`s${i}`} className="absolute bottom-2 h-4 w-[2px]" style={{ left: `${8 + (1 - f) * 84}%`, background: palette.text, opacity: 0.4 }} aria-hidden />
        ))}
        <div className="absolute" style={{ right: '2%', top: '50%', transform: 'translateY(-50%)', color: palette.timer }}>
          <Icon name={config.theme.destination} size={iconSize} aria-hidden />
        </div>
        <div
          className={`absolute ${still ? '' : 'dg-bob'}`}
          style={{
            left: `calc(${8 + progress * 82}% )`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            color: palette.timer,
            transition: still ? undefined : 'left 0.3s linear',
          }}
        >
          <Icon name={config.theme.traveller} size={iconSize} aria-hidden />
        </div>
      </div>
      {(config.display.showNumbers || config.kind === 'first-then') && (
        <div className="flex items-center gap-3">
          {config.display.showNumbers && (
            <TimeNumber palette={palette} remainingSeconds={remainingSeconds} showSeconds={config.display.showSeconds} />
          )}
          {fraction <= 0 && <Check size={28} strokeWidth={1.6} style={{ color: palette.timer }} aria-hidden />}
        </div>
      )}
    </div>
  )
}
