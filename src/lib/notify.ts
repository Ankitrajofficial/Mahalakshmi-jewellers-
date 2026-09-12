import { Resend } from 'resend'
import { BUSINESS, PHONES, SITE_URL } from './constants'
import { formatINR } from './format'
import type { OrderRecord } from './orders'

/**
 * Transactional messaging. Email goes out via Resend; order updates also go to
 * WhatsApp through the Business API when it is configured, and fall back to a
 * click-to-chat link the customer can tap from the confirmation page otherwise.
 * Every function here is best-effort: a messaging failure must never fail a paid order.
 */

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.EMAIL_FROM ?? `${BUSINESS.shortName} <orders@mahalaxmijewellersjaipur.com>`

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.info(`[email] ${to} — ${subject} (RESEND_API_KEY not set)`)
    return
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (error) {
    console.error('[email] send failed', error)
  }
}

export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneNumberId) {
    console.info(`[whatsapp] +91${phone} — ${message.slice(0, 80)}… (Business API not configured)`)
    return
  }
  try {
    await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: `91${phone}`,
        type: 'text',
        text: { body: message },
      }),
    })
  } catch (error) {
    console.error('[whatsapp] send failed', error)
  }
}

function orderRows(order: OrderRecord): string {
  return order.items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F5E6C8">
          <strong style="color:#1A1512">${item.name}</strong><br>
          <span style="color:#6E645C;font-size:13px">${item.sku}${item.size ? ` · size ${item.size}` : ''} · ${item.purity} · ${item.grossWeightG} g${item.huid ? ` · HUID ${item.huid}` : ''}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #F5E6C8;text-align:right;color:#1A1512">
          ${item.quantity} × ${formatINR(item.lineTotal / item.quantity)}
        </td>
      </tr>`,
    )
    .join('')
}

export function orderConfirmationHtml(order: OrderRecord): string {
  return `<!doctype html><html><body style="margin:0;background:#FDFAF4;font-family:Inter,Arial,sans-serif;color:#1A1512">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <p style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#B8860B;margin:0 0 6px">${BUSINESS.name}</p>
    <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 8px">Thank you — your order is confirmed</h1>
    <p style="color:#6E645C;font-size:14px;line-height:1.6;margin:0 0 24px">
      Order <strong style="color:#1A1512">${order.orderNumber}</strong>. We will send you the dispatch details and
      tracking number as soon as it leaves our Jaipur workshop.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${orderRows(order)}</table>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px">
      <tr><td style="padding:4px 0;color:#6E645C">Subtotal</td><td style="text-align:right">${formatINR(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#6E645C">GST @ 3%</td><td style="text-align:right">${formatINR(order.gst)}</td></tr>
      ${order.discount ? `<tr><td style="padding:4px 0;color:#6E645C">Discount</td><td style="text-align:right">−${formatINR(order.discount)}</td></tr>` : ''}
      <tr><td style="padding:4px 0;color:#6E645C">Insured shipping</td><td style="text-align:right">${order.shipping ? formatINR(order.shipping) : 'Free'}</td></tr>
      <tr><td style="padding:10px 0;font-weight:600;border-top:1px solid #F5E6C8">Total paid</td><td style="text-align:right;font-weight:600;border-top:1px solid #F5E6C8">${formatINR(order.total)}</td></tr>
    </table>
    <p style="margin:28px 0 8px"><a href="${SITE_URL}/order/${order.orderNumber}" style="background:#B8860B;color:#fff;padding:12px 22px;text-decoration:none;display:inline-block;font-size:14px">Track this order</a></p>
    <p style="color:#6E645C;font-size:13px;line-height:1.6;margin-top:24px">
      Shipping to: ${order.shippingAddress.fullName}, ${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}.
    </p>
    <p style="color:#6E645C;font-size:13px;line-height:1.6">
      Questions? WhatsApp us on ${PHONES.primary.display} or ${PHONES.secondary.display}.
    </p>
  </div></body></html>`
}

export async function notifyOrderPaid(order: OrderRecord): Promise<void> {
  await Promise.allSettled([
    sendEmail(order.email, `Order ${order.orderNumber} confirmed — ${BUSINESS.shortName}`, orderConfirmationHtml(order)),
    sendWhatsApp(
      order.phone,
      `Namaste ${order.shippingAddress.fullName.split(' ')[0]}, your ${BUSINESS.shortName} order ${order.orderNumber} for ${formatINR(order.total)} is confirmed.\n\nTrack it here: ${SITE_URL}/order/${order.orderNumber}\n\nWe will message you again the moment it is dispatched.`,
    ),
  ])
}

export async function notifyOrderDispatched(order: OrderRecord): Promise<void> {
  const tracking = order.trackingNumber
    ? `${order.trackingCarrier ?? 'Carrier'} ${order.trackingNumber}`
    : 'Tracking details to follow'
  await Promise.allSettled([
    sendEmail(
      order.email,
      `Order ${order.orderNumber} dispatched`,
      `<p>Your order ${order.orderNumber} has been dispatched. ${tracking}.</p><p><a href="${SITE_URL}/order/${order.orderNumber}">Track it here</a>.</p>`,
    ),
    sendWhatsApp(
      order.phone,
      `Your ${BUSINESS.shortName} order ${order.orderNumber} has been dispatched. ${tracking}. Track: ${SITE_URL}/order/${order.orderNumber}`,
    ),
  ])
}

/** Abandoned-cart nudges at 1 hour and 24 hours (Section 10). */
export async function notifyAbandonedCart(phone: string, firstName: string, stage: '1h' | '24h'): Promise<void> {
  const message =
    stage === '1h'
      ? `Namaste ${firstName}, you left a piece in your ${BUSINESS.shortName} cart. The metal rate on it is held for a short while — reply here and we will hold it for you: ${SITE_URL}/cart`
      : `Namaste ${firstName}, your ${BUSINESS.shortName} cart is still saved. If you would like to see the piece in the showroom first, we are on MI Road, open daily until 8 PM: ${SITE_URL}/contact`
  await sendWhatsApp(phone, message)
}
