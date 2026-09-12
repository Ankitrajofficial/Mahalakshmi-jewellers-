'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { formatINRCompact } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FacetCounts } from '@/lib/repo'

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'weight-asc', label: 'Weight: light to heavy' },
  { value: 'weight-desc', label: 'Weight: heavy to light' },
] as const

/** Multi-value params are stored comma-separated so URLs stay readable and shareable. */
function toggleValue(current: string | null, value: string): string | null {
  const list = current ? current.split(',').filter(Boolean) : []
  const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
  return next.length ? next.join(',') : null
}

export function Filters({ facets, total, className }: { facets: FacetCounts; total: number; className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)

  const set = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value === null) next.delete(key)
      else next.set(key, value)
      next.delete('page')
      router.push(`${pathname}?${next.toString()}`, { scroll: false })
    },
    [params, pathname, router],
  )

  const applyRange = (minKey: string, maxKey: string) => (min: string, max: string) => {
    const next = new URLSearchParams(params.toString())
    if (min) next.set(minKey, min)
    else next.delete(minKey)
    if (max) next.set(maxKey, max)
    else next.delete(maxKey)
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  const selected = (key: string) => (params.get(key) ?? '').split(',').filter(Boolean)
  const activeCount =
    ['metal', 'purity', 'tag', 'stone', 'colour'].reduce((n, k) => n + selected(k).length, 0) +
    (params.get('minPrice') || params.get('maxPrice') ? 1 : 0) +
    (params.get('minWeight') || params.get('maxWeight') ? 1 : 0)

  const groups = [
    { key: 'metal', label: 'Metal', options: facets.metals.map((m) => ({ value: m.value, label: m.label, count: m.count })) },
    { key: 'purity', label: 'Purity', options: facets.purities.map((p) => ({ value: p.value, label: p.value, count: p.count })) },
    { key: 'colour', label: 'Metal colour', options: facets.colours.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
    { key: 'stone', label: 'Stone', options: facets.stones.map((s) => ({ value: s.value, label: s.value, count: s.count })) },
    { key: 'tag', label: 'Occasion', options: facets.tags.map((t) => ({ value: t.value, label: t.value, count: t.count })) },
  ].filter((g) => g.options.length > 1)

  const body = (
    <div className="space-y-7">
      {activeCount > 0 ? (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="text-[13px] text-gold-deep underline underline-offset-4"
        >
          Clear all filters ({activeCount})
        </button>
      ) : null}

      {groups.map((group) => (
        <fieldset key={group.key}>
          <legend className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">{group.label}</legend>
          <ul className="space-y-1.5">
            {group.options.map((option) => {
              const checked = selected(group.key).includes(option.value)
              return (
                <li key={option.value}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-muted transition-colors hover:text-ink">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => set(group.key, toggleValue(params.get(group.key), option.value))}
                      className="h-4 w-4 shrink-0 accent-[var(--gold-deep)]"
                    />
                    <span className={cn('flex-1', checked && 'text-ink')}>{option.label}</span>
                    <span className="tnum text-[12px] text-muted/70">{option.count}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>
      ))}

      <RangeField
        label="Price"
        minPlaceholder={formatINRCompact(facets.priceBounds.min)}
        maxPlaceholder={formatINRCompact(facets.priceBounds.max)}
        minValue={params.get('minPrice') ?? ''}
        maxValue={params.get('maxPrice') ?? ''}
        onApply={applyRange('minPrice', 'maxPrice')}
      />

      <RangeField
        label="Gross weight (g)"
        minPlaceholder={facets.weightBounds.min.toFixed(1)}
        maxPlaceholder={facets.weightBounds.max.toFixed(1)}
        minValue={params.get('minWeight') ?? ''}
        maxValue={params.get('maxWeight') ?? ''}
        onApply={applyRange('minWeight', 'maxWeight')}
      />
    </div>
  )

  return (
    <>
      <div className="flex items-center gap-3 lg:hidden">
        <Button variant="secondary" size="md" onClick={() => setOpen(true)} className="min-w-0 flex-1">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters{activeCount ? ` (${activeCount})` : ''}
        </Button>
        <SortSelect />
      </div>

      <aside className={cn('hidden lg:block', className)} aria-label="Filters">
        <p className="tnum mb-6 text-[13px] text-muted">{total} pieces</p>
        {body}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-cream">
            <div className="flex items-center justify-between border-b hairline px-5 py-4">
              <p className="font-display text-[19px] text-ink">Filters</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="p-2 text-ink">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{body}</div>
            <div className="border-t hairline p-4">
              <Button variant="primary" size="lg" className="w-full" onClick={() => setOpen(false)}>
                Show {total} pieces
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function RangeField({
  label,
  minPlaceholder,
  maxPlaceholder,
  minValue,
  maxValue,
  onApply,
}: {
  label: string
  minPlaceholder: string
  maxPlaceholder: string
  minValue: string
  maxValue: string
  onApply: (min: string, max: string) => void
}) {
  const [min, setMin] = useState(minValue)
  const [max, setMax] = useState(maxValue)
  const id = label.replace(/\W+/g, '-').toLowerCase()

  return (
    <fieldset>
      <legend className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">{label}</legend>
      <div className="flex items-center gap-2">
        <label htmlFor={`${id}-min`} className="sr-only">
          Minimum {label}
        </label>
        <input
          id={`${id}-min`}
          inputMode="decimal"
          value={min}
          onChange={(e) => setMin(e.target.value.replace(/[^\d.]/g, ''))}
          placeholder={minPlaceholder}
          className="tnum h-10 w-full min-w-0 border hairline bg-white px-2.5 text-[13px] text-ink outline-none focus:border-gold-primary"
        />
        <span className="text-muted" aria-hidden="true">–</span>
        <label htmlFor={`${id}-max`} className="sr-only">
          Maximum {label}
        </label>
        <input
          id={`${id}-max`}
          inputMode="decimal"
          value={max}
          onChange={(e) => setMax(e.target.value.replace(/[^\d.]/g, ''))}
          placeholder={maxPlaceholder}
          className="tnum h-10 w-full min-w-0 border hairline bg-white px-2.5 text-[13px] text-ink outline-none focus:border-gold-primary"
        />
      </div>
      <button type="button" onClick={() => onApply(min, max)} className="mt-2 text-[13px] text-gold-deep underline underline-offset-4">
        Apply
      </button>
    </fieldset>
  )
}

export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const value = params.get('sort') ?? 'newest'

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex-none">
      <label htmlFor="sort" className="hidden text-[13px] text-muted sm:block">
        Sort
      </label>
      <select
        id="sort"
        aria-label="Sort products"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString())
          next.set('sort', e.target.value)
          next.delete('page')
          router.push(`${pathname}?${next.toString()}`, { scroll: false })
        }}
        className="h-11 w-full min-w-0 border hairline bg-white px-2 text-[13px] text-ink outline-none focus:border-gold-primary lg:w-auto lg:px-3"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
