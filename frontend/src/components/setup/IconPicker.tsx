import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { ICON_KEYS, ICON_NAMES, Icon } from '../../lib/icons'

export default function IconPicker({
  value,
  onChange,
  allowNone = true,
  label,
  testid,
}: {
  value: string | null
  onChange: (key: string | null) => void
  allowNone?: boolean
  label: string
  testid: string
}) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ICON_KEYS
    return ICON_KEYS.filter(
      (k) => ICON_NAMES[k].toLowerCase().includes(q) || k.includes(q),
    )
  }, [query])

  return (
    <fieldset className="w-full" data-testid={testid}>
      <legend className="mb-2 text-sm font-semibold text-charcoal">{label}</legend>
      <div className="relative mb-2">
        <Search size={16} strokeWidth={1.6} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons"
          aria-label={`Search icons for ${label}`}
          className="w-full rounded-full border border-card-border bg-white py-2 pl-9 pr-3 text-sm text-charcoal focus:border-sage"
          data-testid={`${testid}-search`}
        />
      </div>
      <div className="grid max-h-56 grid-cols-5 gap-2 overflow-y-auto rounded-2xl border border-card-border bg-muted p-2 sm:grid-cols-8">
        {allowNone && (
          <button
            type="button"
            onClick={() => onChange(null)}
            title="No icon"
            aria-label="No icon"
            aria-pressed={value === null}
            className={`flex aspect-square items-center justify-center rounded-xl bg-white ${
              value === null ? 'ring-4 ring-forest' : 'border border-card-border'
            }`}
            data-testid={`${testid}-none`}
          >
            <X size={20} strokeWidth={1.6} className="text-slate" aria-hidden />
          </button>
        )}
        {results.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            title={ICON_NAMES[k]}
            aria-label={ICON_NAMES[k]}
            aria-pressed={value === k}
            className={`flex aspect-square items-center justify-center rounded-xl bg-white text-forest ${
              value === k ? 'ring-4 ring-forest' : 'border border-card-border'
            }`}
            data-testid={`${testid}-icon-${k}`}
          >
            <Icon name={k} size={22} aria-hidden />
          </button>
        ))}
      </div>
      {value && (
        <p className="mt-2 text-xs text-slate">Selected: {ICON_NAMES[value]}</p>
      )}
    </fieldset>
  )
}
