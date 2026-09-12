import { RateManager, type RateRow } from '@/components/admin/RateManager'
import { getRateBoard, loadCatalog, priceProducts } from '@/lib/repo'
import { BASE_RATES } from '@/data/rates'
import { ratePerGram } from '@/lib/pricing'
import { formatDateIST } from '@/lib/format'

export const metadata = { title: 'Gold rate' }

export default async function AdminRatePage() {
  const [board, catalog] = await Promise.all([getRateBoard(), loadCatalog()])
  const priced = await priceProducts(catalog)

  const rows: RateRow[] = BASE_RATES.map((r) => ({
    metal: r.metal,
    purity: r.purity,
    label: r.label,
    ratePerGram: ratePerGram(board, r.metal, r.purity),
  }))

  // A 22K dynamic piece makes the clearest preview: most of the catalogue is 22K.
  const sampleProduct =
    priced.find((p) => p.purity === '22K' && p.pricingMode === 'DYNAMIC_BY_WEIGHT' && p.stones.length === 0) ??
    priced.find((p) => p.pricingMode === 'DYNAMIC_BY_WEIGHT') ??
    priced[0]

  return (
    <div>
      <h1 className="font-display text-[30px] text-ink">Gold rate</h1>
      <p className="tnum mt-1 text-[13px] text-muted">
        Current board published {formatDateIST(board.effectiveAt, 'withTime')}
      </p>

      <div className="mt-7">
        <RateManager
          initial={rows}
          sample={{
            name: sampleProduct.name,
            purity: sampleProduct.purity,
            metal: sampleProduct.metal,
            netMetalWeightG: sampleProduct.netMetalWeightG,
            currentPrice: sampleProduct.price,
          }}
        />
      </div>
    </div>
  )
}
