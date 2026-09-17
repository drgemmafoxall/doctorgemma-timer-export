import { getMe as kitGetMe, runTool, ToolError, type Me, type Usage } from './dg-tool-kit'
import { sanitizeTheme, type Theme } from './config'
import {
  SAMPLE_THEME,
  meForMockState,
  usageForMockState,
  firstOfNextMonthISO,
  type MockState,
} from './mock'

const SLUG = 'special-interest-countdown-timer'

// --- MOCK detection ----------------------------------------------------------
function detectMock(): boolean {
  if (import.meta.env.VITE_MOCK === '1') return true
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mock') === '1') return true
    const host = window.location.hostname
    const isLocal = host === 'localhost' || host === '127.0.0.1'
    if (!host.endsWith('doctorgemma.com') && !isLocal) return true
  }
  return false
}

export const MOCK = detectMock()

// Preview-state selection (mock mode only).
let mockState: MockState = 'free'
export function getMockState(): MockState {
  return mockState
}
export function setMockState(s: MockState): void {
  mockState = s
}

export type AgeBand = 'young-child' | 'older-child' | 'teen' | 'adult'
export type ThemeInput = { interest: string; ageBand?: AgeBand }
export type CreateThemeResult = { output: Omit<Theme, 'id'>; usage: Usage }

// --- getMe -------------------------------------------------------------------
export async function getMe(): Promise<Me> {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 150))
    return meForMockState(mockState)
  }
  return kitGetMe()
}

// --- createTheme -------------------------------------------------------------
export async function createTheme(input: ThemeInput): Promise<CreateThemeResult> {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 800))
    switch (mockState) {
      case 'signed-out':
        throw new ToolError(401, 'sign_in_required', 'Sign in required')
      case 'allowance-used':
        throw new ToolError(429, 'allowance_used', 'Allowance used', {
          used: 3,
          limit: 3,
          resetsAt: firstOfNextMonthISO(),
        })
      case 'busy':
        throw new ToolError(503, 'busy', 'Busy')
      case 'error':
        throw new ToolError(500, 'provider_error', 'Provider error')
      default: {
        const isPremium = mockState === 'premium'
        const output: Omit<Theme, 'id'> = {
          ...SAMPLE_THEME,
          facts: isPremium ? SAMPLE_THEME.facts : [],
        }
        const prev = usageForMockState(mockState)
        const usage: Usage = {
          used: prev.used + 1,
          limit: prev.limit,
          resetsAt: prev.resetsAt,
        }
        return { output, usage }
      }
    }
  }

  const result = await runTool<ThemeInput, Omit<Theme, 'id'>>(SLUG, input)
  return { output: result.output, usage: result.usage }
}

// Run an AI theme through the same validation the URL hash uses.
export function themeFromResult(output: Omit<Theme, 'id'>): Theme {
  return sanitizeTheme({ ...output, id: 'custom' })
}

export { ToolError }
export type { Me, Usage }
