import { NextResponse } from 'next/server'
import { z } from 'zod'
import { issueOtp } from '@/lib/auth'
import { normalisePhone } from '@/lib/format'

const schema = z.object({ phone: z.string() })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  const phone = parsed.success ? normalisePhone(parsed.data.phone) : null
  if (!phone) {
    return NextResponse.json({ error: 'Please enter a valid 10-digit Indian mobile number.' }, { status: 400 })
  }

  const { expiresAt, devCode } = await issueOtp(phone)
  return NextResponse.json({
    message: `We have sent a 6-digit code to +91 ${phone}.`,
    expiresAt,
    devCode,
  })
}
