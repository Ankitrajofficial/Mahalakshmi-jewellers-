'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { formatINR } from '@/lib/format'
import type { Metal, Purity } from '@/types/catalog'

export type RateRow = { metal: Metal; purity: Purity; label: string; ratePerGram: number }

/**
 * Publishing here re-prices every DYNAMIC_BY_WEIGHT product on the site — the
 * preview column shows exactly what a representative piece moves to before the
 * change is committed.
 */
export function RateManager({
  initial,
  sample,
}: {
  initial: RateRow[]
  sample: { name: string; purity: Purity; metal: Metal; netMetalWeightG: number; currentPrice: number }
}) {
  const [rates, setRates] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sampleRate = rates.find((r) => r.metal === sample.metal && r.purity === sample.purity)?.ratePerGram ?? 0
  const originalRate = initial.find((r) => r.metal === sample.metal && r.purity === sample.purity)?.ratePerGram ?? 0
  const projected = originalRate > 0 ? Math.round((sample.currentPrice * sampleRate) / originalRate) : sample.currentPrice
  const dirty = rates.some((r, i) => r.ratePerGram !== initial[i].ratePerGram)

  async function publish() {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rates: rates.map((r) => ({ metal: r.metal, purity: r.purity, ratePerGram: r.ratePerGram })),
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error ?? 'Could not publish the board.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2600)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-12">
      <div>
        <table className="w-full border-collapse text-[14px]">
          <caption className="sr-only">Today&rsquo;s metal rates, editable</caption>
          <thead>
            <tr className="border-y hairline text-left text-muted">
              <th scope="col" className="py-2.5 pr-4 text-[12px] font-medium uppercase tracking-[0.12em]">Metal</th>
              <th scope="col" className="py-2.5 pr-4 text-[12px] font-medium uppercase tracking-[0.12em]">Purity</th>
              <th scope="col" className="py-2.5 pr-4 text-right text-[12px] font-medium uppercase tracking-[0.12em]">Rate per gram</th>
              <th scope="col" className="py-2.5 text-right text-[12px] font-medium uppercase tracking-[0.12em]">Change</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((row, i) => {
              const delta = row.ratePerGram - initial[i].ratePerGram
              return (
                <tr key={`${row.metal}-${row.purity}`} className="border-b hairline">
                  <td className="py-3 pr-4 text-ink">{row.label}</td>
                  <td className="tnum py-3 pr-4 text-muted">{row.purity}</td>
                  <td className="py-3 pr-4 text-right">
                    <label htmlFor={`rate-${i}`} className="sr-only">
                      {row.label} rate per gram
                    </label>
                    <input
                      id={`rate-${i}`}
                      inputMode="decimal"
                      value={row.ratePerGram}
                      onChange={(e) => {
                        const value = Number(e.target.value.replace(/[^\d.]/g, ''))
                        setRates((prev) =>
                          prev.map((r, j) => (j === i ? { ...r, ratePerGram: Number.isFinite(value) ? value : 0 } : r)),
                        )
                      }}
                      className="tnum h-10 w-32 border hairline bg-white px-3 text-right text-[14px] text-ink outline-none focus:border-gold-primary"
                    />
                  </td>
                  <td
                    className={`tnum py-3 text-right text-[13px] ${
                      delta === 0 ? 'text-muted' : delta > 0 ? 'text-gold-deep' : 'text-maroon'
                    }`}
                  >
                    {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(2)}`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {error ? <p className="mt-4 text-[13px] text-maroon">{error}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button variant="primary" size="lg" onClick={publish} disabled={saving || !dirty}>
            {saved ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Published
              </>
            ) : saving ? (
              'Publishing…'
            ) : (
              "Publish today's board"
            )}
          </Button>
          {dirty ? (
            <button
              type="button"
              onClick={() => setRates(initial)}
              className="text-[13px] text-gold-deep underline underline-offset-4"
            >
              Reset
            </button>
          ) : null}
        </div>

        <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-muted">
          Publishing writes today&rsquo;s rate board and immediately re-prices every dynamically priced piece across the
          storefront, the cart re-price endpoint and the admin preview — all of them read the same board through the
          same pricing function. Carts already holding a rate keep it until their 30-minute lock lapses.
        </p>
      </div>

      <aside className="border hairline bg-white p-5 lg:sticky lg:top-6 lg:self-start">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Live preview</p>
        <p className="mt-3 text-[14px] text-ink">{sample.name}</p>
        <p className="tnum mt-1 text-[12px] text-muted">
          {sample.netMetalWeightG} g net · {sample.purity}
        </p>

        <div className="mt-5 space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-muted">Now</span>
            <span className="tnum text-ink">{formatINR(sample.currentPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">After publishing</span>
            <span className={`tnum ${projected === sample.currentPrice ? 'text-ink' : 'text-gold-deep'}`}>
              {formatINR(projected)}
            </span>
          </div>
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-muted">
          Approximate: the preview scales the metal component. The exact figure is recomputed from net weight, wastage,
          making charge and stone value when the board is saved.
        </p>
      </aside>
    </div>
  )
}
