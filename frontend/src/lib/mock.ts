import type { Theme } from './config'
import type { Me, Usage } from './dg-tool-kit'

// First day of next month, as an ISO date string.
export function firstOfNextMonthISO(): string {
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  return d.toISOString()
}

// The sample custom theme returned in mock mode.
export const SAMPLE_THEME: Omit<Theme, 'id'> = {
  themeName: 'Flags Around the World',
  interest: 'flags of the world',
  palette: {
    background: '#EEF3F9',
    surface: '#FFFFFF',
    primary: '#2F5D8A',
    secondary: '#8FB3D6',
    accent: '#FFD6A5',
    text: '#2D3748',
  },
  traveller: 'plane',
  destination: 'flag',
  pathStyle: 'sky',
  motifs: ['globe', 'map', 'compass'],
  messages: {
    start: 'The aeroplane is setting off to see the flags.',
    halfway: 'Halfway across the sky.',
    fiveMinutes: 'Five minutes until we reach the flag.',
    oneMinute: 'One minute left. Nearly at the flag.',
    finish: 'We have reached the flag.',
  },
  facts: [
    "Nepal's flag is the only national flag that is not a rectangle.",
    'The study of flags is called vexillology.',
    "Denmark's flag is one of the oldest national flags still in use.",
    "Mexico's flag shows an eagle standing on a cactus.",
    'Astronauts placed flags on the Moon during the Apollo missions.',
  ],
}

export type MockState = 'signed-out' | 'free' | 'allowance-used' | 'premium' | 'busy' | 'error'

export const MOCK_STATE_LABELS: Record<MockState, string> = {
  'signed-out': 'Signed out',
  free: 'Free member',
  'allowance-used': 'Free, allowance used',
  premium: 'Premium',
  busy: 'Busy',
  error: 'Error',
}

export function meForMockState(state: MockState): Me {
  const resetsAt = firstOfNextMonthISO()
  const slug = 'special-interest-countdown-timer'
  switch (state) {
    case 'signed-out':
      return { signedIn: false, tier: 'anonymous', usage: {} }
    case 'premium':
      return {
        signedIn: true,
        tier: 'premium',
        email: 'premium@example.com',
        usage: { [slug]: { used: 2, limit: 100, resetsAt } },
      }
    case 'allowance-used':
      return {
        signedIn: true,
        tier: 'free',
        email: 'free@example.com',
        usage: { [slug]: { used: 3, limit: 3, resetsAt } },
      }
    default:
      // 'free', 'busy', 'error' all report a signed-in free member from getMe.
      return {
        signedIn: true,
        tier: 'free',
        email: 'free@example.com',
        usage: { [slug]: { used: 1, limit: 3, resetsAt } },
      }
  }
}

export function usageForMockState(state: MockState): Usage {
  const me = meForMockState(state)
  return me.usage['special-interest-countdown-timer'] ?? { used: 0, limit: 3, resetsAt: firstOfNextMonthISO() }
}
