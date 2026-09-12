import { randomUUID } from 'node:crypto'
import { hasDatabase, prisma } from './prisma'
import { appendTo, readCollection, writeCollection } from './store-file'
import type { PriceBreakdown } from './pricing'
import type { Address, OrderStatus, RateBoard } from '@/types/catalog'

export type OrderItemRecord = {
  productId: string
  slug: string
  name: string
  sku: string
  image: string
  size: string | null
  quantity: number
  purity: string
  grossWeightG: number
  netMetalWeightG: number
  huid: string | null
  /** Full breakdown snapshot — an invoice must be reproducible years later. */
  breakdown: PriceBreakdown
  lineTotal: number
}

export type OrderRecord = {
  id: string
  orderNumber: string
  createdAt: string
  updatedAt: string
  email: string
  phone: string
  status: OrderStatus
  paymentStatus: 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED'
  items: OrderItemRecord[]
  shippingAddress: Address
  subtotal: number
  gst: number
  discount: number
  shipping: number
  total: number
  couponCode: string | null
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  rateSnapshot: RateBoard
  nudgeStage: number
  trackingCarrier: string | null
  trackingNumber: string | null
  invoiceNumber: string | null
  notes: string | null
}

const COLLECTION = 'orders'

/** MLJ-YYYYMMDD-XXXX. Readable on a WhatsApp message and on a printed invoice. */
export function generateOrderNumber(now = new Date()): string {
  const stamp = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .replace(/-/g, '')
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `MLJ-${stamp}-${suffix}`
}

export function generateInvoiceNumber(orderNumber: string): string {
  return orderNumber.replace('MLJ-', 'INV-')
}

export async function createOrder(input: Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderRecord> {
  const now = new Date().toISOString()
  const record: OrderRecord = { ...input, id: randomUUID(), createdAt: now, updatedAt: now }

  if (hasDatabase && prisma) {
    await prisma.order.create({
      data: {
        orderNumber: record.orderNumber,
        email: record.email,
        phone: record.phone,
        status: record.status,
        paymentStatus: record.paymentStatus,
        shippingAddress: record.shippingAddress as unknown as object,
        subtotal: record.subtotal,
        gst: record.gst,
        discount: record.discount,
        shipping: record.shipping,
        total: record.total,
        razorpayOrderId: record.razorpayOrderId,
        rateSnapshot: record.rateSnapshot as unknown as object,
        items: {
          create: record.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            slug: item.slug,
            image: item.image,
            size: item.size,
            quantity: item.quantity,
            purity: item.purity,
            grossWeightG: item.grossWeightG,
            netMetalWeightG: item.netMetalWeightG,
            huid: item.huid,
            ratePerGram: item.breakdown.ratePerGram,
            metalValue: item.breakdown.metalValue,
            wastageValue: item.breakdown.wastageValue,
            makingCharge: item.breakdown.makingCharge,
            stoneValue: item.breakdown.stoneValue,
            subtotal: item.breakdown.subtotal,
            gst: item.breakdown.gst,
            lineTotal: item.lineTotal,
          })),
        },
      },
    })
    return record
  }

  return appendTo(COLLECTION, record)
}

export async function getOrder(idOrNumber: string): Promise<OrderRecord | null> {
  if (hasDatabase && prisma) {
    const row = await prisma.order.findFirst({
      where: { OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }, { razorpayOrderId: idOrNumber }] },
      include: { items: true },
    })
    if (row) return mapOrder(row)
  }
  const rows = await readCollection<OrderRecord>(COLLECTION)
  return (
    rows.find((o) => o.id === idOrNumber || o.orderNumber === idOrNumber || o.razorpayOrderId === idOrNumber) ?? null
  )
}

export async function listOrders(limit = 100): Promise<OrderRecord[]> {
  if (hasDatabase && prisma) {
    const rows = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: limit })
    if (rows.length) return rows.map(mapOrder)
  }
  return (await readCollection<OrderRecord>(COLLECTION)).slice(0, limit)
}

export async function listOrdersByPhone(phone: string, limit = 50): Promise<OrderRecord[]> {
  if (hasDatabase && prisma) {
    const rows = await prisma.order.findMany({
      where: { phone },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    if (rows.length) return rows.map(mapOrder)
  }
  return (await readCollection<OrderRecord>(COLLECTION)).filter((o) => o.phone === phone).slice(0, limit)
}

export async function updateOrder(idOrNumber: string, patch: Partial<OrderRecord>): Promise<OrderRecord | null> {
  if (hasDatabase && prisma) {
    const existing = await prisma.order.findFirst({
      where: { OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }, { razorpayOrderId: idOrNumber }] },
    })
    if (existing) {
      const row = await prisma.order.update({
        where: { id: existing.id },
        data: {
          status: patch.status,
          paymentStatus: patch.paymentStatus,
          razorpayPaymentId: patch.razorpayPaymentId ?? undefined,
          nudgeStage: patch.nudgeStage ?? undefined,
          nudgedAt: patch.nudgeStage ? new Date() : undefined,
          trackingCarrier: patch.trackingCarrier ?? undefined,
          trackingNumber: patch.trackingNumber ?? undefined,
          invoiceNumber: patch.invoiceNumber ?? undefined,
          notes: patch.notes ?? undefined,
        },
        include: { items: true },
      })
      return mapOrder(row)
    }
  }

  const rows = await readCollection<OrderRecord>(COLLECTION)
  const index = rows.findIndex(
    (o) => o.id === idOrNumber || o.orderNumber === idOrNumber || o.razorpayOrderId === idOrNumber,
  )
  if (index === -1) return null
  rows[index] = { ...rows[index], ...patch, updatedAt: new Date().toISOString() }
  await writeCollection(COLLECTION, rows)
  return rows[index]
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapOrder(row: any): OrderRecord {
  const n = (v: unknown) => Number(v ?? 0)
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    email: row.email,
    phone: row.phone,
    status: row.status,
    paymentStatus: row.paymentStatus,
    items: (row.items ?? []).map((i: any) => ({
      productId: i.productId,
      slug: i.slug,
      name: i.name,
      sku: i.sku,
      image: i.image,
      size: i.size,
      quantity: i.quantity,
      purity: i.purity,
      grossWeightG: n(i.grossWeightG),
      netMetalWeightG: n(i.netMetalWeightG),
      huid: i.huid,
      breakdown: {
        mode: n(i.ratePerGram) > 0 ? 'DYNAMIC_BY_WEIGHT' : 'FIXED',
        ratePerGram: n(i.ratePerGram),
        rateAsOf: row.createdAt.toISOString(),
        rateMissing: false,
        metalValue: n(i.metalValue),
        wastageValue: n(i.wastageValue),
        makingCharge: n(i.makingCharge),
        stoneValue: n(i.stoneValue),
        subtotal: n(i.subtotal),
        gstRate: 0.03,
        gst: n(i.gst),
        total: n(i.lineTotal) / Math.max(1, i.quantity),
        makingChargeLabel: '',
        lines: [],
      },
      lineTotal: n(i.lineTotal),
    })),
    shippingAddress: row.shippingAddress,
    subtotal: n(row.subtotal),
    gst: n(row.gst),
    discount: n(row.discount),
    shipping: n(row.shipping),
    total: n(row.total),
    couponCode: null,
    nudgeStage: row.nudgeStage ?? 0,
    razorpayOrderId: row.razorpayOrderId,
    razorpayPaymentId: row.razorpayPaymentId,
    rateSnapshot: row.rateSnapshot,
    trackingCarrier: row.trackingCarrier,
    trackingNumber: row.trackingNumber,
    invoiceNumber: row.invoiceNumber,
    notes: row.notes,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
