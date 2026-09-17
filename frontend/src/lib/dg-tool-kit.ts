// dg-tool-kit.ts — shared Doctor Gemma tools client. DO NOT MODIFY.
// One login for every *.doctorgemma.com property: supabase-js with a cookie
// storage adapter scoped to .doctorgemma.com (identical to www and onlineapps).
import { createClient, type Session } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iiyynhxwkfhcfabprfzl.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qrtfmYwF27vH1ArntAO6mA_qgnolE-h' // public key; every table is RLS-protected
const COOKIE_DOMAIN = '.doctorgemma.com'

export const URLS = {
  signIn: 'https://www.doctorgemma.com/?auth=open',
  upgrade: 'https://shop.doctorgemma.com/membership',
  gallery: 'https://tools.doctorgemma.com/',
} as const

function cookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return window.location.hostname.endsWith('doctorgemma.com') ? COOKIE_DOMAIN : undefined
}
function getCookie(name: string): string | null {
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')
  const m = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : null
}
function setCookie(name: string, value: string, days: number): void {
  const d = cookieDomain()
  let c = `${name}=${encodeURIComponent(value)}; path=/; max-age=${days * 86400}; SameSite=Lax`
  if (d) c += `; domain=${d}`
  if (window.location.protocol === 'https:') c += '; Secure'
  document.cookie = c
}
function removeCookie(name: string): void {
  const d = cookieDomain()
  let c = `${name}=; path=/; max-age=0`
  if (d) c += `; domain=${d}`
  document.cookie = c
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (k: string) => getCookie(k),
      setItem: (k: string, v: string) => setCookie(k, v, 100),
      removeItem: (k: string) => removeCookie(k),
    },
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export type Tier = 'anonymous' | 'free' | 'premium'
export interface Usage { used: number; limit: number | null; resetsAt?: string }
export interface Me {
  signedIn: boolean
  tier: Tier
  email?: string
  isAdmin?: boolean
  usage: Record<string, Usage>
}
export interface RunResult<TOut> { ok: true; output: TOut; usage: Usage; model: string }

export class ToolError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public usage?: Usage,
  ) {
    super(message)
    this.name = 'ToolError'
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const s = await getSession()
  return s ? { Authorization: `Bearer ${s.access_token}` } : {}
}

export async function getMe(): Promise<Me> {
  const res = await fetch('/api/me', { headers: await authHeaders() })
  if (res.status === 401) return { signedIn: false, tier: 'anonymous', usage: {} }
  if (!res.ok) throw new ToolError(res.status, 'error', res.statusText)
  return res.json()
}

export async function runTool<TIn extends object, TOut = unknown>(
  slug: string,
  input: TIn,
): Promise<RunResult<TOut>> {
  const res = await fetch(`/api/run/$interest-timer`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ input }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ToolError(res.status, body.code ?? 'error', body.message ?? res.statusText, body.usage)
  return body as RunResult<TOut>
}
