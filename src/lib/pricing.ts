import { GST_RATE } from './constants'
import type { MakingType, Metal, MetalRate, PricingMode, Purity, RateBoard, Stone } from '@/types/catalog'

/**
 * THE PRICING ENGINE — Section 7.
 *
 * One pure function, used identically by the server renderer, the client cart and the
 * admin preview. Never duplicate this logic anywhere else in the codebase.
 *
 * metalValue   = netMetalWeightG x ratePerGram(metal, purity)
 * wastageValue = metalValue x (wastagePercent / 100)
 * makingCharge = PER_GRAM -> netMetalWeightG x makingChargeValue
 *                PERCENT  -> metalValue x (makingChargeValue / 100)
 *                FLAT     -> makingChargeValue
 * stoneValue   = SUM(stone.ratePerCarat x stone.carat)
 * subtotal     = metalValue + wastageValue + makingCharge + stoneValue
 * gst          = subtotal x 0.03
 * total        = round(subtotal + gst)
 *
 * Every component is rounded to two decimals BEFORE the subtotal is summed, so the
 * breakdown table rendered on the product page always adds up to the rupee shown.
 * Indian jewellery buyers compare on making charges; a table that does not tie out
 * destroys trust faster than a high price does.
 */

/** The minimum shape the engine needs. Product satisfies it structurally. */
export type PricingInput = {
  metal: Metal
  purity: Purity
  netMetalWeightG: number
  pricingMode: PricingMode
  makingChargeType: MakingType
  makingChargeValue: number
  wastagePercent: number | null
  fixedPrice: number | null
  stones: Pick<Stone, 'carat' | 'ratePerCarat'>[]
}

export type PriceLine = {
  key: 'metal' | 'wastage' | 'making' | 'stones' | 'product' | 'gst' | 'total'
  label: string
  /** Sub-label explaining how the number was derived, e.g. "8.420 g x ₹7,150/g". */
  note?: string
  value: number
  emphasis?: boolean
}

export type PriceBreakdown = {
  mode: PricingMode
  /** Rate applied for this product's metal + purity. 0 when the board has no entry. */
  ratePerGram: number
  rateAsOf: string | null
  rateMissing: boolean

  metalValue: number
  wastageValue: number
  makingCharge: number
  stoneValue: number
  subtotal: number
  gstRate: number
  gst: number
  total: number

  /** How the making charge was expressed, for the breakdown note. */
  makingChargeLabel: string
  lines: PriceLine[]
}

export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function roundRupee(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value + Number.EPSILON)
}

/** Rate lookup against a day's board. Returns 0 when no rate has been published. */
export function ratePerGram(board: RateBoard | MetalRate[], metal: Metal, purity: Purity): number {
  const rates = Array.isArray(board) ? board : board.rates
  const hit = rates.find((r) => r.metal === metal && r.purity === purity)
  return hit ? Number(hit.ratePerGram) : 0
}

function makingChargeFor(input: PricingInput, metalValue: number): { value: number; label: string } {
  const v = Number(input.makingChargeValue) || 0
  switch (input.makingChargeType) {
    case 'PER_GRAM':
      return { value: round2(Number(input.netMetalWeightG) * v), label: `₹${v.toLocaleString('en-IN')}/g` }
    case 'PERCENT':
      return { value: round2(metalValue * (v / 100)), label: `${v}% of metal value` }
    case 'FLAT':
    default:
      return { value: round2(v), label: 'Flat charge' }
  }
}

export function stoneValueOf(stones: Pick<Stone, 'carat' | 'ratePerCarat'>[]): number {
  return round2(
    (stones ?? []).reduce((sum, s) => sum + (Number(s.ratePerCarat) || 0) * (Number(s.carat) || 0), 0),
  )
}

/**
 * The single source of truth for what a piece costs.
 * `asOf` is the timestamp of the rate board and is surfaced as the freshness line.
 */
export function calculatePrice(
  product: PricingInput,
  board: RateBoard | MetalRate[],
  asOf?: string | null,
): PriceBreakdown {
  const rates = Array.isArray(board) ? board : board.rates
  const effectiveAt = asOf ?? (Array.isArray(board) ? null : board.effectiveAt)

  // FIXED pieces (silver articles, imported findings, promotional sets) carry a typed
  // pre-tax price. GST still applies, and the table still ties out.
  if (product.pricingMode === 'FIXED') {
    const subtotal = round2(Number(product.fixedPrice) || 0)
    const gst = round2(subtotal * GST_RATE)
    const total = roundRupee(subtotal + gst)
    return {
      mode: 'FIXED',
      ratePerGram: 0,
      rateAsOf: effectiveAt,
      rateMissing: false,
      metalValue: 0,
      wastageValue: 0,
      makingCharge: 0,
      stoneValue: 0,
      subtotal,
      gstRate: GST_RATE,
      gst,
      total,
      makingChargeLabel: 'Included in piece price',
      lines: [
        { key: 'product', label: 'Piece price', note: 'Fixed price, inclusive of making', value: subtotal },
        { key: 'gst', label: 'GST @ 3%', value: gst },
        { key: 'total', label: 'Grand total', value: total, emphasis: true },
      ],
    }
  }

  const rate = ratePerGram(rates, product.metal, product.purity)
  const net = Number(product.netMetalWeightG) || 0

  const metalValue = round2(net * rate)
  const wastagePercent = Number(product.wastagePercent) || 0
  const wastageValue = round2(metalValue * (wastagePercent / 100))
  const making = makingChargeFor(product, metalValue)
  const stoneValue = stoneValueOf(product.stones)

  const subtotal = round2(metalValue + wastageValue + making.value + stoneValue)
  const gst = round2(subtotal * GST_RATE)
  const total = roundRupee(subtotal + gst)

  const lines: PriceLine[] = [
    {
      key: 'metal',
      label: `${product.purity} ${titleCase(product.metal)} value`,
      note: `${net.toFixed(3)} g × ₹${rate.toLocaleString('en-IN')}/g`,
      value: metalValue,
    },
  ]
  if (wastagePercent > 0) {
    lines.push({
      key: 'wastage',
      label: 'Wastage',
      note: `${wastagePercent}% of metal value`,
      value: wastageValue,
    })
  }
  lines.push({ key: 'making', label: 'Making charges', note: making.label, value: making.value })
  if (stoneValue > 0) {
    lines.push({ key: 'stones', label: 'Stone value', note: 'Certified stones, at cost', value: stoneValue })
  }
  lines.push({ key: 'gst', label: 'GST @ 3%', note: 'On jewellery value', value: gst })
  lines.push({ key: 'total', label: 'Grand total', value: total, emphasis: true })

  return {
    mode: 'DYNAMIC_BY_WEIGHT',
    ratePerGram: rate,
    rateAsOf: effectiveAt,
    rateMissing: rate === 0,
    metalValue,
    wastageValue,
    makingCharge: making.value,
    stoneValue,
    subtotal,
    gstRate: GST_RATE,
    gst,
    total,
    makingChargeLabel: making.label,
    lines,
  }
}

/** Cart maths. Quantity multiplies the rounded per-piece total, never the components. */
export function lineTotal(breakdown: PriceBreakdown, quantity: number): number {
  return roundRupee(breakdown.total * Math.max(1, Math.floor(quantity)))
}

export type CartTotals = {
  itemCount: number
  subtotal: number
  gst: number
  discount: number
  shipping: number
  total: number
}

export function calculateCartTotals(
  items: { breakdown: PriceBreakdown; quantity: number }[],
  opts: { discount?: number; shipping?: number } = {},
): CartTotals {
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)
  const subtotal = round2(items.reduce((s, i) => s + i.breakdown.subtotal * i.quantity, 0))
  const gst = round2(items.reduce((s, i) => s + i.breakdown.gst * i.quantity, 0))
  const discount = round2(Math.min(opts.discount ?? 0, subtotal))
  const shipping = round2(opts.shipping ?? 0)
  const total = roundRupee(subtotal + gst - discount + shipping)
  return { itemCount, subtotal, gst, discount, shipping, total }
}

function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase()
}
