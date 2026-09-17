import type { ResolvedPalette } from '../../lib/themes'

export default function FactCard({ fact, palette }: { fact: string; palette: ResolvedPalette }) {
  return (
    <div
      className="mx-auto max-w-md rounded-2xl bg-white px-5 py-3 text-center text-sm shadow-sm"
      style={{ color: '#2D3748' }}
      data-testid="fact-card"
    >
      {fact}
    </div>
  )
}
