import { NextResponse } from 'next/server'
import { estimateDelivery } from '@/lib/shipping'
import { isValidPincode } from '@/lib/format'

/**
 * Pincode → city/state, for the address form.
 * India Post's public API is the source; a small local table covers Jaipur so
 * the showroom's own city always resolves even if that service is down.
 */
const LOCAL: Record<string, { city: string; state: string }> = {
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '302019': { city: 'Jaipur', state: 'Rajasthan' },
  '302015': { city: 'Jaipur', state: 'Rajasthan' },
  '302020': { city: 'Jaipur', state: 'Rajasthan' },
  '302033': { city: 'Jaipur', state: 'Rajasthan' },
}

export async function GET(request: Request) {
  const pincode = new URL(request.url).searchParams.get('pincode')?.trim() ?? ''
  if (!isValidPincode(pincode)) {
    return NextResponse.json({ error: 'Enter a valid 6-digit PIN code.' }, { status: 400 })
  }

  if (LOCAL[pincode]) {
    const estimate = estimateDelivery(pincode)
    return NextResponse.json({ ...LOCAL[pincode], zone: estimate?.zone.label ?? null })
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      next: { revalidate: 60 * 60 * 24 * 30 },
    })
    const data = (await res.json()) as {
      Status: string
      PostOffice?: { District: string; State: string }[] | null
    }[]
    const office = data?.[0]?.PostOffice?.[0]
    if (data?.[0]?.Status !== 'Success' || !office) {
      return NextResponse.json({ error: 'We could not find that PIN code.' }, { status: 404 })
    }
    const estimate = estimateDelivery(pincode)
    return NextResponse.json({ city: office.District, state: office.State, zone: estimate?.zone.label ?? null })
  } catch {
    return NextResponse.json({ error: 'Could not look that up. Please type your city and state.' }, { status: 502 })
  }
}
