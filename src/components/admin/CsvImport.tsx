'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/primitives'

const TEMPLATE = [
  'sku,name,categorySlug,shortDescription,description,metal,purity,metalColour,grossWeightG,netMetalWeightG,pricingMode,makingChargeType,makingChargeValue,wastagePercent,fixedPrice,huid,certification,stockQty,isMadeToOrder,leadTimeDays,sizeOptions,collectionTags,dimensions,imageUrl',
  'MLJ-RNG-2001,Example Gold Band,rings,A plain 22K comfort-fit band.,Longer description here.,GOLD,22K,Yellow,6.4,6.4,DYNAMIC_BY_WEIGHT,PER_GRAM,420,4,,JPR999,,10,false,,12|13|14,Daily Wear|Gifting,Width 4 mm,/catalog/bandhej-everyday-gold-band-1.svg',
].join('\n')

export function CsvImport({ disabled }: { disabled: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function upload() {
    if (!file) return
    setBusy(true)
    setError(null)
    const form = new FormData()
    form.set('file', file)
    const res = await fetch('/api/admin/products/import', { method: 'POST', body: form })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) {
      setError(data.error ?? 'Import failed.')
      return
    }
    setResult({ created: data.created, updated: data.updated, errors: data.errors })
  }

  const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`

  return (
    <div className="border hairline bg-white p-5">
      <h2 className="font-display text-[20px] text-ink">Bulk import</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Upload a CSV to create or update products in bulk. Rows are matched on SKU — an existing SKU is updated, a new
        one is created. Pipe-separate size options and tags, like <code className="tnum">12|13|14</code>.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label
          htmlFor="csv"
          className="inline-flex cursor-pointer items-center gap-2 border hairline bg-cream px-4 py-2.5 text-[13px] text-ink transition-colors hover:border-gold-primary"
        >
          <Upload className="h-4 w-4 text-gold-deep" aria-hidden="true" />
          {file ? file.name : 'Choose CSV'}
        </label>
        <input
          id="csv"
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button variant="primary" size="md" onClick={upload} disabled={!file || busy || disabled}>
          {busy ? 'Importing…' : 'Import'}
        </Button>
        <a href={templateHref} download="mahalaxmi-products-template.csv" className="text-[13px] text-gold-deep underline underline-offset-4">
          Download template
        </a>
      </div>

      {disabled ? (
        <p className="mt-3 text-[12px] text-maroon">Importing needs a database connection.</p>
      ) : null}
      {error ? <p className="mt-3 text-[13px] text-maroon">{error}</p> : null}
      {result ? (
        <div className="mt-4 border-t hairline pt-3 text-[13px]">
          <p className="tnum text-ink">
            {result.created} created · {result.updated} updated
          </p>
          {result.errors.length ? (
            <ul className="mt-2 space-y-1 text-[12px] text-maroon">
              {result.errors.slice(0, 10).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
