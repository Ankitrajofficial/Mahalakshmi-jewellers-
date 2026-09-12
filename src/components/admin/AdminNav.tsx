'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BadgePercent,
  ChartLine,
  Coins,
  FileText,
  Inbox,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/admin', label: 'Dashboard', Icon: ChartLine },
  { href: '/admin/orders', label: 'Orders', Icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', Icon: Package },
  { href: '/admin/gold-rate', label: 'Gold rate', Icon: Coins },
  { href: '/admin/enquiries', label: 'Enquiries', Icon: Inbox },
  { href: '/admin/customers', label: 'Customers', Icon: Users },
  { href: '/admin/coupons', label: 'Coupons', Icon: BadgePercent },
  { href: '/admin/content', label: 'Content', Icon: FileText },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Admin" className="lg:sticky lg:top-6 lg:self-start">
      <ul className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col lg:gap-0.5 lg:overflow-visible">
        {LINKS.map(({ href, label, Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 whitespace-nowrap border px-3 py-2.5 text-[14px] transition-colors lg:border-0 lg:border-l-2',
                  active
                    ? 'border-gold-primary bg-white text-gold-deep lg:bg-transparent'
                    : 'border-transparent text-muted hover:text-ink',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
