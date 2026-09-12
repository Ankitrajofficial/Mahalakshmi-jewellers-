'use client'

import { Img as Image } from '@/components/ui/Img'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Check, GripVertical, Plus, Trash } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { PriceBreakdown } from '@/components/product/PriceBreakdown'
import { calculatePrice } from '@/lib/pricing'
import { formatINR } from '@/lib/format'
import { COLLECTION_TAGS } from '@/data/categories'
import type { Category, Product, RateBoard, Stone } from '@/types/catalog'
import { cn } from '@/lib/utils'

type ImageDraft = { url: string; alt: string; kind: 'PRODUCT' | 'LIFESTYLE' | 'SCALE' | 'CERTIFICATE'; position: number }
type StoneDraft = Omit<Stone, 'id'>

const emptyProduct = (categoryId: string) => ({
  id: undefined as string | undefined,
  slug: '',
  name: '',
  shortDescription: '',
  description: '',
  craftsmanship: '',
  careNotes: '',
  categoryId,
  collectionTags: [] as string[],
  metal: 'GOLD' as Product['metal'],
  purity: '22K' as Product['purity'],
  metalColour: 'Yellow' as string | null,
  grossWeightG: 0,
  netMetalWeightG: 0,
  pricingMode: 'DYNAMIC_BY_WEIGHT' as Product['pricingMode'],
  makingChargeType: 'PER_GRAM' as Product['makingChargeType'],
  makingChargeValue: 600,
  wastagePercent: null as number | null,
  fixedPrice: null as number | null,
  bisHallmarked: true,
  huid: '' as string | null,
  certification: '' as string | null,
  sku: '',
  stockQty: 1,
  isMadeToOrder: false,
  leadTimeDays: null as number | null,
  sizeOptions: [] as string[],
  dimensions: '' as string | null,
  isActive: true,
  isFeatured: false,
  metaTitle: '' as string | null,
  metaDescription: '' as string | null,
})

type Draft = ReturnType<typeof emptyProduct>

export function ProductEditor({
  product,
  categories,
  board,
  readOnly,
}: {
  product: Product | null
  categories: Category[]
  board: RateBoard
  readOnly: boolean
}) {
  const router = useRouter()

  const [draft, setDraft] = useState<Draft>(() =>
    product
      ? {
          id: product.id,
          slug: product.slug,
          name: product.name,
          shortDescription: product.shortDescription,
          description: product.description,
          craftsmanship: product.craftsmanship,
          careNotes: product.careNotes,
          categoryId: product.categoryId,
          collectionTags: product.collectionTags,
          metal: product.metal,
          purity: product.purity,
          metalColour: product.metalColour,
          grossWeightG: product.grossWeightG,
          netMetalWeightG: product.netMetalWeightG,
          pricingMode: product.pricingMode,
          makingChargeType: product.makingChargeType,
          makingChargeValue: product.makingChargeValue,
          wastagePercent: product.wastagePercent,
          fixedPrice: product.fixedPrice,
          bisHallmarked: product.bisHallmarked,
          huid: product.huid,
          certification: product.certification,
          sku: product.sku,
          stockQty: product.stockQty,
          isMadeToOrder: product.isMadeToOrder,
          leadTimeDays: product.leadTimeDays,
          sizeOptions: product.sizeOptions,
          dimensions: product.dimensions,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
        }
      : emptyProduct(categories[0]?.id ?? ''),
  )

  const [stones, setStones] = useState<StoneDraft[]>(
    product ? product.stones.map(({ id: _id, ...rest }) => rest) : [],
  )
  const [images, setImages] = useState<ImageDraft[]>(
    product
      ? product.images.map((i, index) => ({
          url: i.url,
          alt: i.alt,
          kind: i.kind.toUpperCase() as ImageDraft['kind'],
          position: index,
        }))
      : [],
  )
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  /** Identical engine, identical inputs — this preview cannot drift from the storefront. */
  const breakdown = useMemo(
    () =>
      calculatePrice(
        {
          metal: draft.metal,
          purity: draft.purity,
          netMetalWeightG: draft.netMetalWeightG,
          pricingMode: draft.pricingMode,
          makingChargeType: draft.makingChargeType,
          makingChargeValue: draft.makingChargeValue,
          wastagePercent: draft.wastagePercent,
          fixedPrice: draft.fixedPrice,
          stones,
        },
        board,
      ),
    [draft, stones, board],
  )

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setImages(next.map((img, i) => ({ ...img, position: i })))
  }

  async function save() {
    setSaving(true)
    setError(null)
    const payload = {
      ...draft,
      huid: draft.huid || null,
      certification: draft.certification || null,
      dimensions: draft.dimensions || null,
      metaTitle: draft.metaTitle || null,
      metaDescription: draft.metaDescription || null,
      stones,
      images: images.map((img, i) => ({ ...img, position: i })),
    }
    const res = await fetch('/api/admin/products', {
      method: draft.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error ?? 'Could not save.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2400)
    router.refresh()
    if (!draft.id && data.slug) router.push(`/admin/products/${data.slug}`)
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-12">
      <div className="space-y-8">
        {readOnly ? (
          <p className="border-l-2 border-maroon bg-gold-pale/60 px-4 py-3 text-[13px] text-maroon">
            The catalogue is read-only without a database. You can explore the form and the live price preview, but
            saving is disabled until <code className="tnum">DATABASE_URL</code> is set.
          </p>
        ) : null}

        <Fieldset legend="Identity">
          <Text label="Name" value={draft.name} onChange={(v) => set('name', v)} className="sm:col-span-2" />
          <Text label="SKU" value={draft.sku} onChange={(v) => set('sku', v)} />
          <Text label="Slug (leave blank to derive from name)" value={draft.slug} onChange={(v) => set('slug', v)} />
          <Select
            label="Category"
            value={draft.categoryId}
            onChange={(v) => set('categoryId', v)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Text label="Dimensions" value={draft.dimensions ?? ''} onChange={(v) => set('dimensions', v)} />
          <TextArea
            label="Short description"
            rows={2}
            value={draft.shortDescription}
            onChange={(v) => set('shortDescription', v)}
            className="sm:col-span-2"
          />
          <TextArea label="Description" rows={5} value={draft.description} onChange={(v) => set('description', v)} className="sm:col-span-2" />
          <TextArea label="Craftsmanship" rows={3} value={draft.craftsmanship} onChange={(v) => set('craftsmanship', v)} className="sm:col-span-2" />
          <TextArea label="Care notes" rows={3} value={draft.careNotes} onChange={(v) => set('careNotes', v)} className="sm:col-span-2" />
        </Fieldset>

        <Fieldset legend="Material & weight">
          <Select
            label="Metal"
            value={draft.metal}
            onChange={(v) => set('metal', v as Draft['metal'])}
            options={[
              { value: 'GOLD', label: 'Gold' },
              { value: 'SILVER', label: 'Silver' },
              { value: 'PLATINUM', label: 'Platinum' },
            ]}
          />
          <Select
            label="Purity"
            value={draft.purity}
            onChange={(v) => set('purity', v as Draft['purity'])}
            options={['24K', '22K', '18K', '14K', '950 Platinum', '925 Sterling'].map((p) => ({ value: p, label: p }))}
          />
          <Select
            label="Metal colour"
            value={draft.metalColour ?? ''}
            onChange={(v) => set('metalColour', v || null)}
            options={[
              { value: '', label: '—' },
              { value: 'Yellow', label: 'Yellow' },
              { value: 'Rose', label: 'Rose' },
              { value: 'White', label: 'White' },
            ]}
          />
          <Number label="Gross weight (g)" value={draft.grossWeightG} onChange={(v) => set('grossWeightG', v)} step={0.001} />
          <Number
            label="Net metal weight (g)"
            value={draft.netMetalWeightG}
            onChange={(v) => set('netMetalWeightG', v)}
            step={0.001}
            hint="Gross minus stones. This is what the metal value is calculated on."
          />
        </Fieldset>

        <Fieldset legend="Pricing">
          <Select
            label="Pricing mode"
            value={draft.pricingMode}
            onChange={(v) => set('pricingMode', v as Draft['pricingMode'])}
            options={[
              { value: 'DYNAMIC_BY_WEIGHT', label: 'Dynamic — by weight and rate' },
              { value: 'FIXED', label: 'Fixed price' },
            ]}
          />
          {draft.pricingMode === 'FIXED' ? (
            <Number
              label="Fixed price (ex-GST)"
              value={draft.fixedPrice ?? 0}
              onChange={(v) => set('fixedPrice', v)}
              hint="GST at 3% is added on top."
            />
          ) : (
            <>
              <Select
                label="Making charge type"
                value={draft.makingChargeType}
                onChange={(v) => set('makingChargeType', v as Draft['makingChargeType'])}
                options={[
                  { value: 'PER_GRAM', label: 'Per gram' },
                  { value: 'PERCENT', label: 'Percentage of metal value' },
                  { value: 'FLAT', label: 'Flat charge' },
                ]}
              />
              <Number
                label={
                  draft.makingChargeType === 'PER_GRAM'
                    ? 'Making charge (₹ per gram)'
                    : draft.makingChargeType === 'PERCENT'
                      ? 'Making charge (%)'
                      : 'Making charge (₹ flat)'
                }
                value={draft.makingChargeValue}
                onChange={(v) => set('makingChargeValue', v)}
              />
              <Number
                label="Wastage (%)"
                value={draft.wastagePercent ?? 0}
                onChange={(v) => set('wastagePercent', v || null)}
                step={0.1}
              />
            </>
          )}
        </Fieldset>

        <fieldset>
          <legend className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">Stones</legend>
          {stones.length ? (
            <ul className="space-y-3">
              {stones.map((stone, i) => (
                <li key={i} className="grid gap-3 border hairline bg-white p-4 sm:grid-cols-4">
                  <Text label="Type" value={stone.type} onChange={(v) => setStones((s) => s.map((x, j) => (j === i ? { ...x, type: v } : x)))} />
                  <Text label="Shape" value={stone.shape ?? ''} onChange={(v) => setStones((s) => s.map((x, j) => (j === i ? { ...x, shape: v } : x)))} />
                  <Number label="Count" value={stone.count} onChange={(v) => setStones((s) => s.map((x, j) => (j === i ? { ...x, count: v } : x)))} />
                  <Number label="Carat" value={stone.carat} onChange={(v) => setStones((s) => s.map((x, j) => (j === i ? { ...x, carat: v } : x)))} step={0.001} />
                  <Text label="Colour" value={stone.colour ?? ''} onChange={(v) => setStones((s) => s.map((x, j) => (j === i ? { ...x, colour: v } : x)))} />
                  <Text label="Clarity" value={stone.clarity ?? ''} onChange={(v) => setStones((s) => s.map((x, j) => (j === i ? { ...x, clarity: v } : x)))} />
                  <Text label="Certification" value={stone.certification ?? ''} onChange={(v) => setStones((s) => s.map((x, j) => (j === i ? { ...x, certification: v } : x)))} />
                  <Number label="Rate per carat (₹)" value={stone.ratePerCarat} onChange={(v) => setStones((s) => s.map((x, j) => (j === i ? { ...x, ratePerCarat: v } : x)))} />
                  <button
                    type="button"
                    onClick={() => setStones((s) => s.filter((_, j) => j !== i))}
                    className="inline-flex items-center gap-1.5 justify-self-start text-[13px] text-maroon underline underline-offset-4 sm:col-span-4"
                  >
                    <Trash className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove stone
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted">No stones on this piece.</p>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() =>
              setStones((s) => [
                ...s,
                { type: 'Diamond', shape: 'Round Brilliant', count: 1, carat: 0, clarity: '', colour: '', certification: '', ratePerCarat: 0 },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add stone
          </Button>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
            Images — drag to reorder
          </legend>
          <ul className="space-y-2">
            {images.map((image, i) => (
              <li
                key={`${image.url}-${i}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) move(dragIndex, i)
                  setDragIndex(null)
                }}
                className={cn(
                  'flex items-center gap-3 border hairline bg-white p-3',
                  dragIndex === i && 'border-gold-primary opacity-70',
                )}
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted" aria-hidden="true" />
                <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-gold-pale">
                  {image.url ? <Image src={image.url} alt="" fill sizes="48px" className="object-cover" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <input
                    value={image.url}
                    onChange={(e) => setImages((prev) => prev.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                    aria-label={`Image ${i + 1} URL`}
                    className="h-9 w-full border hairline bg-cream px-2 text-[12px] text-ink outline-none focus:border-gold-primary"
                  />
                  <input
                    value={image.alt}
                    onChange={(e) => setImages((prev) => prev.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                    placeholder="Alt text"
                    aria-label={`Image ${i + 1} alt text`}
                    className="mt-1 h-9 w-full border hairline bg-cream px-2 text-[12px] text-ink outline-none focus:border-gold-primary"
                  />
                </span>
                <select
                  value={image.kind}
                  onChange={(e) =>
                    setImages((prev) => prev.map((x, j) => (j === i ? { ...x, kind: e.target.value as ImageDraft['kind'] } : x)))
                  }
                  aria-label={`Image ${i + 1} kind`}
                  className="h-9 shrink-0 border hairline bg-cream px-2 text-[12px] text-ink outline-none"
                >
                  {['PRODUCT', 'LIFESTYLE', 'SCALE', 'CERTIFICATE'].map((k) => (
                    <option key={k} value={k}>
                      {k.toLowerCase()}
                    </option>
                  ))}
                </select>
                <span className="flex shrink-0 flex-col">
                  <button type="button" onClick={() => move(i, i - 1)} aria-label={`Move image ${i + 1} up`} className="p-1 text-muted hover:text-ink">
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} aria-label={`Move image ${i + 1} down`} className="p-1 text-muted hover:text-ink">
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  aria-label={`Remove image ${i + 1}`}
                  className="shrink-0 p-1 text-muted hover:text-maroon"
                >
                  <Trash className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => setImages((prev) => [...prev, { url: '', alt: '', kind: 'PRODUCT', position: prev.length }])}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add image
          </Button>
        </fieldset>

        <Fieldset legend="Commerce & compliance">
          <Number label="Stock quantity" value={draft.stockQty} onChange={(v) => set('stockQty', Math.round(v))} />
          <Text label="HUID" value={draft.huid ?? ''} onChange={(v) => set('huid', v)} />
          <Text label="Certification (IGI / GIA / SGL)" value={draft.certification ?? ''} onChange={(v) => set('certification', v)} />
          <Text
            label="Size options (comma separated)"
            value={draft.sizeOptions.join(', ')}
            onChange={(v) => set('sizeOptions', v.split(',').map((s) => s.trim()).filter(Boolean))}
            className="sm:col-span-2"
          />
          <Number
            label="Lead time (days, made to order)"
            value={draft.leadTimeDays ?? 0}
            onChange={(v) => set('leadTimeDays', v || null)}
          />
          <div className="space-y-2 sm:col-span-2">
            <Toggle label="Active (visible on the storefront)" checked={draft.isActive} onChange={(v) => set('isActive', v)} />
            <Toggle label="Featured" checked={draft.isFeatured} onChange={(v) => set('isFeatured', v)} />
            <Toggle label="Made to order" checked={draft.isMadeToOrder} onChange={(v) => set('isMadeToOrder', v)} />
            <Toggle label="BIS hallmarked" checked={draft.bisHallmarked} onChange={(v) => set('bisHallmarked', v)} />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-[13px] text-muted">Collection tags</p>
            <div className="flex flex-wrap gap-2">
              {COLLECTION_TAGS.map((tag) => {
                const on = draft.collectionTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      set('collectionTags', on ? draft.collectionTags.filter((t) => t !== tag) : [...draft.collectionTags, tag])
                    }
                    className={cn(
                      'border px-3 py-1.5 text-[12px] transition-colors',
                      on ? 'border-gold-primary bg-gold-deep text-white' : 'hairline bg-white text-ink hover:border-gold-primary',
                    )}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        </Fieldset>

        <Fieldset legend="SEO">
          <Text label="Meta title" value={draft.metaTitle ?? ''} onChange={(v) => set('metaTitle', v)} className="sm:col-span-2" />
          <TextArea label="Meta description" rows={2} value={draft.metaDescription ?? ''} onChange={(v) => set('metaDescription', v)} className="sm:col-span-2" />
        </Fieldset>

        {error ? <p className="text-[13px] text-maroon">{error}</p> : null}

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="lg" onClick={save} disabled={saving || readOnly}>
            {saved ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Saved
              </>
            ) : saving ? (
              'Saving…'
            ) : draft.id ? (
              'Save changes'
            ) : (
              'Create product'
            )}
          </Button>
          {product ? (
            <a href={`/product/${product.slug}`} target="_blank" rel="noreferrer" className="text-[13px] text-gold-deep underline underline-offset-4">
              View on the storefront
            </a>
          ) : null}
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Live price preview</p>
        <p className="tnum mt-2 text-[28px] font-semibold text-ink">{formatINR(breakdown.total)}</p>
        <p className="mt-1 text-[12px] text-muted">
          Computed by the same <code className="tnum">calculatePrice</code> the storefront uses.
        </p>
        {breakdown.rateMissing ? (
          <p className="mt-2 text-[12px] text-maroon">
            No published rate for {draft.metal} {draft.purity}. Add one on the gold rate page.
          </p>
        ) : null}
        <div className="mt-4">
          <PriceBreakdown breakdown={breakdown} compact />
        </div>
      </aside>
    </div>
  )
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">{legend}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

let uid = 0
const nextId = (label: string) => `f-${label.replace(/\W+/g, '-').toLowerCase()}-${++uid}`

function Text({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  const id = useMemo(() => nextId(label), [label])
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[12px] text-muted">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full border hairline bg-white px-3 text-[14px] text-ink outline-none focus:border-gold-primary"
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  className?: string
}) {
  const id = useMemo(() => nextId(label), [label])
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[12px] text-muted">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border hairline bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-gold-primary"
      />
    </div>
  )
}

function Number({
  label,
  value,
  onChange,
  step = 1,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  hint?: string
}) {
  const id = useMemo(() => nextId(label), [label])
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] text-muted">
        {label}
      </label>
      <input
        id={id}
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(globalThis.Number(e.target.value) || 0)}
        className="tnum h-10 w-full border hairline bg-white px-3 text-[14px] text-ink outline-none focus:border-gold-primary"
      />
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const id = useMemo(() => nextId(label), [label])
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full border hairline bg-white px-3 text-[14px] text-ink outline-none focus:border-gold-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--gold-deep)]"
      />
      {label}
    </label>
  )
}
