import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { hasDatabase, prisma } from './prisma'
import { readCollection, writeCollection } from './store-file'
import type { Role } from '@/generated/prisma'

/**
 * Passwordless sign-in by mobile OTP, plus the staff check for /admin.
 *
 * There are no passwords anywhere. A six-digit code is issued against a phone
 * number, stored only as a SHA-256 hash, and exchanged for a signed httpOnly
 * session cookie. Staff are recognised by their number appearing in
 * ADMIN_PHONES — the same sign-in, a different door.
 *
 * With no DATABASE_URL the OTP and user records fall back to the .data JSON
 * store so the whole flow works on a fresh clone.
 */

const SESSION_COOKIE = 'mj_session'
const SESSION_DAYS = 30
const OTP_TTL_MINUTES = 10
const OTP_MAX_ATTEMPTS = 5

export type Session = {
  userId: string
  phone: string
  name: string | null
  email: string | null
  role: Role
}

type OtpRow = {
  id: string
  phone: string
  codeHash: string
  attempts: number
  expiresAt: string
  consumed: boolean
}

type UserRow = {
  id: string
  phone: string
  name: string | null
  email: string | null
  role: Role
}

function secret(): Uint8Array {
  const value =
    process.env.AUTH_SECRET?.trim() ||
    (process.env.NODE_ENV === 'production' ? '' : 'dev-only-session-secret-not-for-production')
  if (!value) throw new Error('AUTH_SECRET is not configured')
  return new TextEncoder().encode(value)
}

/** Numbers allowed into /admin, from ADMIN_PHONES (comma separated). */
function adminPhones(): string[] {
  return (process.env.ADMIN_PHONES ?? '')
    .split(',')
    .map((p) => p.replace(/\D/g, '').slice(-10))
    .filter((p) => p.length === 10)
}

function isStaffPhone(phone: string): boolean {
  return adminPhones().includes(phone)
}

function hashCode(phone: string, code: string): string {
  return createHash('sha256').update(`${phone}:${code}`).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

// ----------------------------------------------------------------- OTP

/**
 * Issues a code for this number. `devCode` is returned ONLY outside production,
 * so local sign-in works without an SMS gateway; in production it is null and
 * the code is delivered by SMS.
 */
export async function issueOtp(phone: string): Promise<{ expiresAt: string; devCode: string | null }> {
  const code = String(randomInt(100000, 1000000))
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString()
  const row: OtpRow = {
    id: `${phone}-${Date.now()}`,
    phone,
    codeHash: hashCode(phone, code),
    attempts: 0,
    expiresAt,
    consumed: false,
  }

  if (hasDatabase && prisma) {
    await prisma.otpToken.create({
      data: {
        phone: row.phone,
        codeHash: row.codeHash,
        expiresAt: new Date(expiresAt),
      },
    })
  } else {
    const rows = await readCollection<OtpRow>('otp')
    // Supersede any live code for this number.
    for (const existing of rows) if (existing.phone === phone) existing.consumed = true
    rows.unshift(row)
    await writeCollection('otp', rows.slice(0, 50))
  }

  if (process.env.NODE_ENV === 'production') {
    // TODO: hand `code` to the SMS provider here.
    console.info(`[auth] OTP issued for +91 ${phone}`)
    return { expiresAt, devCode: null }
  }

  console.info(`[auth] OTP for +91 ${phone} is ${code} (development only)`)
  return { expiresAt, devCode: code }
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const expected = hashCode(phone, code)
  const now = Date.now()

  if (hasDatabase && prisma) {
    const token = await prisma.otpToken.findFirst({
      where: { phone, consumed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    if (!token) return { ok: false, error: 'That code has expired. Please ask for a new one.' }
    if (token.attempts >= OTP_MAX_ATTEMPTS) {
      return { ok: false, error: 'Too many attempts. Please ask for a new code.' }
    }
    if (!safeEqual(token.codeHash, expected)) {
      await prisma.otpToken.update({ where: { id: token.id }, data: { attempts: { increment: 1 } } })
      return { ok: false, error: 'That code is not right. Please check and try again.' }
    }
    await prisma.otpToken.update({ where: { id: token.id }, data: { consumed: true } })
    return { ok: true }
  }

  const rows = await readCollection<OtpRow>('otp')
  const token = rows.find((r) => r.phone === phone && !r.consumed && Date.parse(r.expiresAt) > now)
  if (!token) return { ok: false, error: 'That code has expired. Please ask for a new one.' }
  if (token.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, error: 'Too many attempts. Please ask for a new code.' }
  }
  if (!safeEqual(token.codeHash, expected)) {
    token.attempts += 1
    await writeCollection('otp', rows)
    return { ok: false, error: 'That code is not right. Please check and try again.' }
  }
  token.consumed = true
  await writeCollection('otp', rows)
  return { ok: true }
}

// --------------------------------------------------------------- users

export async function upsertUserByPhone(
  phone: string,
  name?: string,
  email?: string,
): Promise<Session> {
  const role: Role = isStaffPhone(phone) ? 'ADMIN' : 'CUSTOMER'

  if (hasDatabase && prisma) {
    const user = await prisma.user.upsert({
      where: { phone },
      create: { phone, name: name ?? null, email: email ?? null, role, phoneVerified: new Date() },
      update: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        role,
        phoneVerified: new Date(),
      },
    })
    return { userId: user.id, phone, name: user.name, email: user.email, role: user.role }
  }

  const rows = await readCollection<UserRow>('users')
  const existing = rows.find((u) => u.phone === phone)
  if (existing) {
    if (name) existing.name = name
    if (email) existing.email = email
    existing.role = role
    await writeCollection('users', rows)
    return { userId: existing.id, phone, name: existing.name, email: existing.email, role }
  }

  const created: UserRow = {
    id: `guest-${phone}`,
    phone,
    name: name ?? null,
    email: email ?? null,
    role,
  }
  rows.unshift(created)
  await writeCollection('users', rows)
  return { userId: created.id, phone, name: created.name, email: created.email, role }
}

// ------------------------------------------------------------ sessions

export async function createSession(session: Session): Promise<void> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('mahalaxmi')
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret())

  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: 'mahalaxmi' })
    if (typeof payload.userId !== 'string' || typeof payload.phone !== 'string') return null
    return {
      userId: payload.userId,
      phone: payload.phone,
      name: typeof payload.name === 'string' ? payload.name : null,
      email: typeof payload.email === 'string' ? payload.email : null,
      role: (payload.role as Role) ?? 'CUSTOMER',
    }
  } catch {
    return null
  }
}

/**
 * Staff gate for /admin. Returns null rather than throwing so the admin layout
 * can render the sign-in form in place. Every admin route handler calls this
 * again server-side — the layout is not authorisation.
 */
export async function requireAdmin(): Promise<Session | null> {
  const session = await getSession()
  if (!session) return null
  if (session.role !== 'ADMIN' && session.role !== 'STAFF') return null
  if (!isStaffPhone(session.phone)) return null
  return session
}
