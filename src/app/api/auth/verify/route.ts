import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSession, upsertUserByPhone, verifyOtp } from '@/lib/auth'
import { normalisePhone } from '@/lib/format'

const schema = z.object({
  phone: z.string(),
  code: z.string().length(6),
  name: z.string().max(120).optional(),
  email: z.email().optional(),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter the 6-digit code we sent you.' }, { status: 400 })

  const phone = normalisePhone(parsed.data.phone)
  if (!phone) return NextResponse.json({ error: 'That mobile number is not valid.' }, { status: 400 })

  const result = await verifyOtp(phone, parsed.data.code)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  const session = await upsertUserByPhone(phone, parsed.data.name, parsed.data.email)
  await createSession(session)
  return NextResponse.json({ ok: true, phone, name: session.name ?? null })
}
