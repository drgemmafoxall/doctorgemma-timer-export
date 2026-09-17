import { Icon } from '../../../lib/icons'
import { TimeNumber, type DisplayProps } from './Digital'

const ICON_SIZE: Record<DisplayProps['size'], number> = {
  large: 32,
  'extra-large': 44,
  fill: 60,
}

export default function Bar({ palette, remainingSeconds, fraction, config, size, still }: DisplayProps) {
  const f = Math.min(1, Math.max(0, fraction))
  const barH = size === 'fill' ? '22vh' : size === 'extra-large' ? '16vh' : '11vh'
  const iconSize = ICON_SIZE[size]
  return (
    <div className="flex w-full flex-col items-center gap-5" data-testid="display-bar">
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-full"
        style={{ height: barH, background: palette.surface, border: `2px solid ${palette.secondary}` }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${f * 100}%`, background: palette.timer, transition: still ? undefined : 'width 0.3s linear' }}
          aria-hidden
        />
        <div
          className={`absolute top-1/2 ${still ? '' : 'dg-bob'}`}
          style={{
            left: `calc(${f * 100}% )`,
            transform: 'translate(-50%, -50%)',
            color: palette.text,
            transition: still ? undefined : 'left 0.3s linear',
          }}
        >
          <Icon name={config.theme.traveller} size={iconSize} aria-hidden />
        </div>
      </div>
      {config.display.showNumbers && (
        <TimeNumber palette={palette} remainingSeconds={remainingSeconds} showSeconds={config.display.showSeconds} />
      )}
    </div>
  )
}
