import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Razorpay over plain fetch and node:crypto — no SDK.
 *
 * RAZORPAY_KEY_SECRET is read only in this module and never leaves the server.
 * Only RAZORPAY_KEY_ID is handed to the browser, by the checkout route.
 *
 * When the keys are absent the site runs in simulated payment mode so the whole
 * order flow is walkable locally; `razorpayConfigured` is how every call site
 * decides which path it is on.
 */

const API_BASE = 'https://api.razorpay.com/v1'

const keyId = process.env.RAZORPAY_KEY_ID?.trim() ?? ''
const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? ''
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ?? ''

/** True when real keys are present. False means the simulated local flow. */
export const razorpayConfigured = Boolean(keyId && keySecret)

export type RazorpayOrder = {
  id: string
  amount: number
  currency: string
  receipt?: string
  status?: string
}

/**
 * Creates the Razorpay order. `amount` is in RUPEES, as everything in this
 * codebase is; Razorpay wants paise, so it is multiplied here and nowhere else.
 */
export async function createRazorpayOrder(input: {
  amount: number
  receipt: string
  notes?: Record<string, string>
}): Promise<RazorpayOrder> {
  if (!razorpayConfigured) throw new Error('Razorpay is not configured')

  const paise = Math.round(input.amount * 100)
  if (!Number.isSafeInteger(paise) || paise < 100) {
    throw new Error(`Refusing to create a Razorpay order for ₹${input.amount}`)
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: paise,
      currency: 'INR',
      receipt: input.receipt,
      notes: input.notes ?? {},
      payment_capture: 1,
    }),
  })

  if (!response.ok) {
    // Logged server-side only; the caller shows the customer something generic.
    const detail = await response.text().catch(() => '')
    console.error('[razorpay] order creation failed', response.status, detail)
    throw new Error('Razorpay order creation failed')
  }

  const order = (await response.json()) as RazorpayOrder
  if (order.amount !== paise) {
    throw new Error('Razorpay returned a different amount than was requested')
  }
  return order
}

/** Constant-time comparison that does not leak length through timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

/**
 * Checkout handler signature: HMAC-SHA256 of "<order_id>|<payment_id>".
 * Proves the browser saw a genuine Razorpay response. The webhook remains the
 * authoritative fulfilment path.
 */
export function verifyCheckoutSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  if (!keySecret) return false
  const expected = createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')
  return safeEqual(expected, signature)
}

/**
 * Webhook signature: HMAC-SHA256 of the RAW request body.
 *
 * The caller must pass the exact bytes from `await request.text()`, before any
 * JSON parsing. Parsing and re-stringifying reorders keys and changes
 * whitespace, which breaks the signature — the classic way to get this wrong.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!webhookSecret || !signature) return false
  const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
  return safeEqual(expected, signature)
}
