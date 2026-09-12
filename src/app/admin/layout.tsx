import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { AdminNav } from '@/components/admin/AdminNav'
import { SignIn } from '@/components/account/SignIn'
import { requireAdmin } from '@/lib/auth'
import { hasDatabase } from '@/lib/prisma'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  if (!session) {
    return (
      <div>
        <div className="border-b hairline bg-gold-pale">
          <Container className="py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-maroon">Staff area</p>
            <p className="mt-1 text-[14px] text-muted">
              Sign in with a number listed in <code className="tnum">ADMIN_PHONES</code>.
            </p>
          </Container>
        </div>
        <SignIn />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b hairline bg-ink text-cream">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <Link href="/admin" className="font-display text-[20px] text-cream">
              Mahalaxmi — admin
            </Link>
            <p className="tnum mt-0.5 text-[12px] text-gold-pale/70">
              {session.name ?? 'Staff'} · +91 {session.phone} · {session.role}
            </p>
          </div>
          <Link href="/" className="text-[13px] text-gold-light underline underline-offset-4">
            View the storefront
          </Link>
        </Container>
      </div>

      {!hasDatabase ? (
        <div className="border-b border-maroon/30 bg-gold-pale">
          <Container className="flex items-start gap-3 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-maroon" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-maroon">
              <strong>No database connected.</strong> Orders, rates, enquiries and coupons are being read from the
              local file store, and the catalogue is read-only. Set <code className="tnum">DATABASE_URL</code> and run{' '}
              <code className="tnum">npm run db:migrate &amp;&amp; npm run db:seed</code> for full editing.
            </p>
          </Container>
        </div>
      ) : null}

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[200px_1fr] lg:gap-12">
          <AdminNav />
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </div>
  )
}
