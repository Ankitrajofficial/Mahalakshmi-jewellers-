import { describe, expect, it } from 'vitest'
import {
  calculateCartTotals,
  calculatePrice,
  lineTotal,
  ratePerGram,
  round2,
  stoneValueOf,
  type PricingInput,
} from '../pricing'
import type { MetalRate, RateBoard } from '@/types/catalog'

const rate = (metal: MetalRate['metal'], purity: MetalRate['purity'], ratePerGram: number): MetalRate => ({
  id: `${metal}-${purity}`,
  date: '2026-09-08',
  metal,
  purity,
  ratePerGram,
  updatedAt: '2026-09-08T04:30:00.000Z',
})

const board: RateBoard = {
  effectiveAt: '2026-09-08T04:30:00.000Z',
  rates: [
    rate('GOLD', '24K', 7800),
    rate('GOLD', '22K', 7150),
    rate('GOLD', '18K', 5850),
    rate('GOLD', '14K', 4550),
    rate('SILVER', '925 Sterling', 92),
    rate('PLATINUM', '950 Platinum', 3200),
  ],
}

const base: PricingInput = {
  metal: 'GOLD',
  purity: '22K',
  netMetalWeightG: 10,
  pricingMode: 'DYNAMIC_BY_WEIGHT',
  makingChargeType: 'PER_GRAM',
  makingChargeValue: 600,
  wastagePercent: null,
  fixedPrice: null,
  stones: [],
}

describe('ratePerGram', () => {
  it('resolves the published rate for a metal + purity pair', () => {
    expect(ratePerGram(board, 'GOLD', '22K')).toBe(7150)
    expect(ratePerGram(board, 'SILVER', '925 Sterling')).toBe(92)
  })

  it('returns 0 when the board has no entry for the pair', () => {
    expect(ratePerGram(board, 'PLATINUM', '22K')).toBe(0)
  })
})

describe('calculatePrice — making charge types', () => {
  it('PER_GRAM multiplies net metal weight by the per-gram charge', () => {
    const b = calculatePrice(base, board)
    expect(b.metalValue).toBe(71500) // 10 x 7150
    expect(b.makingCharge).toBe(6000) // 10 x 600
    expect(b.wastageValue).toBe(0)
    expect(b.stoneValue).toBe(0)
    expect(b.subtotal).toBe(77500)
    expect(b.gst).toBe(2325) // 3%
    expect(b.total).toBe(79825)
    expect(b.makingChargeLabel).toBe('₹600/g')
  })

  it('PERCENT takes a percentage of metal value only', () => {
    const b = calculatePrice({ ...base, makingChargeType: 'PERCENT', makingChargeValue: 12 }, board)
    expect(b.makingCharge).toBe(8580) // 71500 x 12%
    expect(b.subtotal).toBe(80080)
    expect(b.gst).toBe(2402.4)
    expect(b.total).toBe(82482)
    expect(b.makingChargeLabel).toBe('12% of metal value')
  })

  it('FLAT applies the charge verbatim regardless of weight', () => {
    const b = calculatePrice({ ...base, makingChargeType: 'FLAT', makingChargeValue: 4500 }, board)
    expect(b.makingCharge).toBe(4500)
    const heavier = calculatePrice(
      { ...base, netMetalWeightG: 40, makingChargeType: 'FLAT', makingChargeValue: 4500 },
      board,
    )
    expect(heavier.makingCharge).toBe(4500)
    expect(b.makingChargeLabel).toBe('Flat charge')
  })
})

describe('calculatePrice — wastage', () => {
  it('applies wastage as a percentage of metal value, before making charges', () => {
    const b = calculatePrice({ ...base, wastagePercent: 8 }, board)
    expect(b.wastageValue).toBe(5720) // 71500 x 8%
    expect(b.subtotal).toBe(71500 + 5720 + 6000)
  })

  it('treats null and zero wastage identically and hides the line', () => {
    const withNull = calculatePrice({ ...base, wastagePercent: null }, board)
    const withZero = calculatePrice({ ...base, wastagePercent: 0 }, board)
    expect(withNull.total).toBe(withZero.total)
    expect(withNull.lines.some((l) => l.key === 'wastage')).toBe(false)
  })

  it('compounds correctly with PERCENT making charges', () => {
    const b = calculatePrice(
      { ...base, wastagePercent: 6, makingChargeType: 'PERCENT', makingChargeValue: 14 },
      board,
    )
    expect(b.metalValue).toBe(71500)
    expect(b.wastageValue).toBe(4290)
    expect(b.makingCharge).toBe(10010) // percent of METAL value, not of metal + wastage
    expect(b.subtotal).toBe(85800)
  })
})

describe('calculatePrice — stones', () => {
  const stones = [
    { carat: 0.85, ratePerCarat: 145000 },
    { carat: 2.4, ratePerCarat: 18000 },
  ]

  it('sums rate per carat times carat across every stone', () => {
    expect(stoneValueOf(stones)).toBe(166450) // 123250 + 43200
  })

  it('adds stone value into the subtotal and taxes it at 3%', () => {
    const b = calculatePrice({ ...base, stones }, board)
    expect(b.stoneValue).toBe(166450)
    expect(b.subtotal).toBe(71500 + 6000 + 166450)
    expect(b.gst).toBe(round2(b.subtotal * 0.03))
  })
})

describe('calculatePrice — FIXED mode', () => {
  it('uses fixedPrice as the pre-tax subtotal and ignores weight and rates', () => {
    const b = calculatePrice(
      { ...base, pricingMode: 'FIXED', fixedPrice: 12500, netMetalWeightG: 999 },
      board,
    )
    expect(b.subtotal).toBe(12500)
    expect(b.gst).toBe(375)
    expect(b.total).toBe(12875)
    expect(b.metalValue).toBe(0)
    expect(b.ratePerGram).toBe(0)
    expect(b.rateMissing).toBe(false)
  })
})

describe('calculatePrice — rate board behaviour', () => {
  it('flags a missing rate instead of silently pricing at zero metal value', () => {
    const b = calculatePrice({ ...base, metal: 'PLATINUM', purity: '22K' }, board)
    expect(b.rateMissing).toBe(true)
    expect(b.metalValue).toBe(0)
  })

  it('re-prices every dynamic piece when the board moves', () => {
    const before = calculatePrice(base, board)
    const after = calculatePrice(base, {
      ...board,
      rates: board.rates.map((r) => (r.purity === '22K' ? { ...r, ratePerGram: 7400 } : r)),
    })
    expect(after.metalValue).toBe(74000)
    expect(after.total).toBeGreaterThan(before.total)
  })

  it('carries the rate freshness stamp through to the breakdown', () => {
    expect(calculatePrice(base, board).rateAsOf).toBe('2026-09-08T04:30:00.000Z')
  })
})

describe('breakdown integrity', () => {
  it('the rendered lines always sum to the grand total shown', () => {
    const b = calculatePrice(
      {
        ...base,
        netMetalWeightG: 8.42,
        wastagePercent: 7.5,
        makingChargeType: 'PERCENT',
        makingChargeValue: 13.5,
        stones: [{ carat: 1.15, ratePerCarat: 96000 }],
      },
      board,
    )
    const components = b.lines
      .filter((l) => l.key !== 'total')
      .reduce((s, l) => s + l.value, 0)
    expect(Math.round(components)).toBe(b.total)
  })

  it('never returns NaN for malformed input', () => {
    const b = calculatePrice(
      { ...base, netMetalWeightG: Number.NaN, makingChargeValue: Number.NaN },
      board,
    )
    expect(Number.isFinite(b.total)).toBe(true)
    expect(b.total).toBe(0)
  })
})

describe('cart totals', () => {
  it('multiplies per-piece totals by quantity', () => {
    const b = calculatePrice(base, board)
    expect(lineTotal(b, 3)).toBe(b.total * 3)
  })

  it('aggregates subtotal, GST, discount and shipping', () => {
    const a = calculatePrice(base, board)
    const c = calculatePrice({ ...base, pricingMode: 'FIXED', fixedPrice: 2000 }, board)
    const totals = calculateCartTotals(
      [
        { breakdown: a, quantity: 2 },
        { breakdown: c, quantity: 1 },
      ],
      { discount: 1000, shipping: 0 },
    )
    expect(totals.itemCount).toBe(3)
    expect(totals.subtotal).toBe(77500 * 2 + 2000)
    expect(totals.gst).toBe(round2(2325 * 2 + 60))
    expect(totals.total).toBe(Math.round(totals.subtotal + totals.gst - 1000))
  })

  it('never discounts below zero', () => {
    const a = calculatePrice({ ...base, pricingMode: 'FIXED', fixedPrice: 1000 }, board)
    const totals = calculateCartTotals([{ breakdown: a, quantity: 1 }], { discount: 99999 })
    expect(totals.discount).toBe(1000)
    expect(totals.total).toBe(30) // GST survives the discount cap
  })
})
