import { LogIn, RefreshCw, Sparkles } from 'lucide-react'
import { URLS, ToolError, type Me } from '../lib/dg-tool-kit'

export const btnSage =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full font-heading font-semibold bg-sage text-charcoal hover:bg-forest transition-colors focus-visible:outline-forest'
export const btnMarigold =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full font-heading font-semibold bg-marigold text-charcoal hover:bg-marigold-hover transition-colors'
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full font-heading font-semibold bg-white text-charcoal border-2 border-sage hover:bg-muted transition-colors'

function formatResetDate(iso?: string): string {
  if (!iso) return 'the start of next month'
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
  } catch {
    return 'the start of next month'
  }
}

export function AllowanceLine({ me }: { me: Me | null }) {
  if (!me) return null
  if (!me.signedIn) {
    return (
      <p className="text-sm text-slate" data-testid="allowance-line">
        Sign in or join free to create a custom theme
      </p>
    )
  }
  if (me.isAdmin) {
    return (
      <p className="text-sm text-slate" data-testid="allowance-line">
        Admin
      </p>
    )
  }
  const usage = me.usage['special-interest-countdown-timer']
  const limit = usage?.limit ?? 0
  const used = usage?.used ?? 0
  const left = Math.max(0, (limit ?? 0) - used)
  if (me.tier === 'premium') {
    return (
      <p className="text-sm text-slate" data-testid="allowance-line">
        Premium member: {left} of {limit} custom themes left this month
      </p>
    )
  }
  return (
    <p className="text-sm text-slate" data-testid="allowance-line">
      {left} of {limit} custom themes left this month
    </p>
  )
}

export function SignInPanel({ message }: { message?: string }) {
  return (
    <div
      className="rounded-card border border-card-border bg-white p-6 text-center shadow-sm"
      data-testid="sign-in-panel"
    >
      <p className="mb-4 font-heading text-lg font-bold text-charcoal">
        {message ?? 'Sign in or join free to use this tool'}
      </p>
      <a href={URLS.signIn} className={btnSage} data-testid="sign-in-button">
        <LogIn size={20} strokeWidth={1.6} aria-hidden />
        Sign in or join free
      </a>
    </div>
  )
}

// Renders a calm panel for any ToolError raised by runTool.
export function AccessError({
  error,
  onRetry,
}: {
  error: ToolError
  onRetry?: () => void
}) {
  if (error.code === 'sign_in_required' || error.status === 401) {
    return <SignInPanel />
  }

  if (error.code === 'premium_required' || error.status === 403) {
    return (
      <div className="rounded-card border border-card-border bg-white p-6 shadow-sm" data-testid="access-error">
        <p className="mb-4 text-slate">
          Premium membership includes all online apps and AI tools.
        </p>
        <a href={URLS.upgrade} className={btnMarigold} data-testid="upgrade-button">
          <Sparkles size={20} strokeWidth={1.6} aria-hidden />
          Unlock with premium
        </a>
      </div>
    )
  }

  if (error.code === 'allowance_used') {
    return (
      <div className="rounded-card border border-card-border bg-white p-6 shadow-sm" data-testid="access-error">
        <p className="mb-4 text-slate">
          You've used your custom themes for this month. They reset on{' '}
          {formatResetDate(error.usage?.resetsAt)}. You can still use any ready-made theme.
        </p>
        <a href={URLS.upgrade} className={btnMarigold} data-testid="upgrade-button">
          Upgrade
        </a>
      </div>
    )
  }

  if (error.code === 'too_many_requests' || (error.status === 429 && error.code !== 'allowance_used')) {
    return (
      <div className="rounded-card border border-card-border bg-white p-6 shadow-sm" data-testid="access-error">
        <p className="text-slate">One moment, please try again in a few seconds.</p>
      </div>
    )
  }

  if (error.code === 'busy' || error.status === 503) {
    return (
      <div className="rounded-card border border-card-border bg-white p-6 shadow-sm" data-testid="access-error">
        <p className="text-slate">
          Lots of families are using the tools right now. Please try again a little later.
        </p>
      </div>
    )
  }

  // 500 / provider_error and anything else
  return (
    <div className="rounded-card border border-card-border bg-white p-6 shadow-sm" data-testid="access-error">
      <p className="mb-4 text-slate">
        Something went wrong on our side. Please try again. This didn't use one of your custom
        themes.
      </p>
      {onRetry && (
        <button type="button" className={btnSage} onClick={onRetry} data-testid="try-again-button">
          <RefreshCw size={20} strokeWidth={1.6} aria-hidden />
          Try again
        </button>
      )}
    </div>
  )
}
