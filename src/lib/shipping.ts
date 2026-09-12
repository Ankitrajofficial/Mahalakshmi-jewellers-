import { TIMEZONE } from './constants'

/**
 * Delivery estimation. Zones follow India Post's first-digit circles, which is
 * accurate enough for a promise date; swap in the carrier's serviceability API
 * (Bluedart / Sequel) once the account is live — only `zoneFor` needs to change.
 */
export type Zone = {
  key: string
  label: string
  transitDays: [number, number]
}

const ZONES: Record<string, Zone> = {
  local: { key: 'local', label: 'Jaipur & Rajasthan', transitDays: [1, 2] },
  north: { key: 'north', label: 'North India', transitDays: [2, 3] },
  west: { key: 'west', label: 'West India', transitDays: [2, 4] },
  south: { key: 'south', label: 'South India', transitDays: [3, 5] },
  east: { key: 'east', label: 'East India', transitDays: [3, 5] },
  northeast: { key: 'northeast', label: 'North East & remote', transitDays: [5, 8] },
}

/** First digit of an Indian PIN maps to a postal circle group. */
export function zoneFor(pincode: string): Zone | null {
  if (!/^[1-9]\d{5}$/.test(pincode)) return null
  if (pincode.startsWith('30') || pincode.startsWith('31') || pincode.startsWith('32') || pincode.startsWith('33'))
    return ZONES.local
  const first = pincode[0]
  switch (first) {
    case '1':
    case '2':
      return ZONES.north
    case '3':
    case '4':
      return ZONES.west
    case '5':
    case '6':
      return ZONES.south
    case '7':
      return ZONES.east
    case '8':
      return ZONES.northeast
    default:
      return ZONES.north
  }
}

/** Dispatch is within 3 working days for in-stock pieces (Section 11). */
export const DISPATCH_DAYS_IN_STOCK = 3

export type DeliveryEstimate = {
  zone: Zone
  dispatchBy: Date
  earliest: Date
  latest: Date
  madeToOrder: boolean
}

function addWorkingDays(from: Date, days: number): Date {
  const d = new Date(from)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0) added++ // the workshop runs six days; Sunday is off
  }
  return d
}

export function estimateDelivery(
  pincode: string,
  opts: { madeToOrder?: boolean; leadTimeDays?: number | null; now?: Date } = {},
): DeliveryEstimate | null {
  const zone = zoneFor(pincode)
  if (!zone) return null
  const now = opts.now ?? new Date()
  const production = opts.madeToOrder ? (opts.leadTimeDays ?? 45) : DISPATCH_DAYS_IN_STOCK
  const dispatchBy = addWorkingDays(now, production)
  return {
    zone,
    dispatchBy,
    earliest: addWorkingDays(dispatchBy, zone.transitDays[0]),
    latest: addWorkingDays(dispatchBy, zone.transitDays[1]),
    madeToOrder: Boolean(opts.madeToOrder),
  }
}

export function formatEstimateRange(estimate: DeliveryEstimate): string {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('en-IN', { timeZone: TIMEZONE, day: 'numeric', month: 'short' }).format(d)
  return `${fmt(estimate.earliest)} – ${fmt(estimate.latest)}`
}

/** Insured shipping is free above this order value; below it, a flat charge applies. */
export const FREE_SHIPPING_ABOVE = 15000
export const FLAT_SHIPPING = 250

export function shippingFor(subtotalWithGst: number): number {
  return subtotalWithGst >= FREE_SHIPPING_ABOVE ? 0 : FLAT_SHIPPING
}
