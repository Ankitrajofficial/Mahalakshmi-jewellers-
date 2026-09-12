import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasDatabase, prisma } from '@/lib/prisma'
import { listOrdersByPhone } from '@/lib/orders'
import type { Address } from '@/types/catalog'

/**
 * Addresses this customer has actually shipped to, for the checkout picker.
 * Derived from their orders (and the Address book when a database is present),
 * de-duplicated on street line plus PIN code.
 */
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ addresses: [] })

  const addresses: Address[] = []

  if (hasDatabase && prisma) {
    const saved = await prisma.address.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' } })
    addresses.push(
      ...saved.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        phone: a.phone,
        line1: a.line1,
        line2: a.line2 ?? undefined,
        landmark: a.landmark ?? undefined,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        country: a.country,
        isDefault: a.isDefault,
      })),
    )
  }

  const orders = await listOrdersByPhone(session.phone, 20)
  addresses.push(...orders.map((o) => o.shippingAddress))

  const unique = new Map<string, Address>()
  for (const address of addresses) {
    unique.set(`${address.line1.toLowerCase().trim()}|${address.pincode}`, address)
  }

  return NextResponse.json({ addresses: [...unique.values()].slice(0, 6) })
}
