import { useCallback, useEffect, useState } from 'react'
import SetupView from './components/setup/SetupView'
import TimerView from './components/timer/TimerView'
import { decodeConfig, type TimerConfig } from './lib/config'
import { getMe, MOCK, setMockState, getMockState, type Me } from './lib/api'
import { MOCK_STATE_LABELS, type MockState } from './lib/mock'

type Route = { view: 'setup' } | { view: 'timer'; config: TimerConfig | null; key: string }

function parseHash(): Route {
  const hash = window.location.hash
  if (hash.startsWith('#/timer?c=')) {
    const query = hash.slice(hash.indexOf('?') + 1)
    const c = new URLSearchParams(query).get('c')
    return { view: 'timer', config: c ? decodeConfig(c) : null, key: c ?? 'none' }
  }
  return { view: 'setup' }
}

function MockStateMenu({ onChange }: { onChange: (s: MockState) => void }) {
  const [value, setValue] = useState<MockState>(getMockState())
  const states: MockState[] = ['signed-out', 'free', 'allowance-used', 'premium', 'busy', 'error']
  return (
    <div
      className="fixed bottom-4 right-4 z-50 rounded-2xl border border-card-border bg-white/95 p-3 shadow-lg backdrop-blur"
      data-testid="mock-state-menu"
    >
      <label className="block text-xs font-semibold text-slate" htmlFor="mock-state-select">
        Preview state (mock)
      </label>
      <select
        id="mock-state-select"
        data-testid="mock-state-select"
        className="mt-1 rounded-lg border border-card-border bg-white px-2 py-1 text-sm text-charcoal"
        value={value}
        onChange={(e) => {
          const s = e.target.value as MockState
          setValue(s)
          onChange(s)
        }}
      >
        {states.map((s) => (
          <option key={s} value={s}>
            {MOCK_STATE_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash())
  const [me, setMe] = useState<Me | null>(null)

  const refreshMe = useCallback(() => {
    getMe()
      .then(setMe)
      .catch(() => setMe({ signedIn: false, tier: 'anonymous', usage: {} }))
  }, [])

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  const onMockChange = useCallback(
    (s: MockState) => {
      setMockState(s)
      refreshMe()
    },
    [refreshMe],
  )

  return (
    <>
      {route.view === 'timer' ? (
        <TimerView key={route.key} config={route.config} />
      ) : (
        <SetupView me={me} refreshMe={refreshMe} setMe={setMe} />
      )}
      {MOCK && <MockStateMenu onChange={onMockChange} />}
    </>
  )
}
