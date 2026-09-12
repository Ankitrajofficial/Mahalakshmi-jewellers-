'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AccordionItem = {
  id: string
  title: string
  content: React.ReactNode
}

export function Accordion({
  items,
  defaultOpen,
  className,
}: {
  items: AccordionItem[]
  defaultOpen?: string
  className?: string
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null)

  return (
    <div className={cn('border-t hairline', className)}>
      {items.map((item) => {
        const isOpen = open === item.id
        return (
          <div key={item.id} className="border-b hairline">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-medium text-ink transition-colors hover:text-gold-deep"
              >
                {item.title}
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 text-muted transition-transform duration-250', isOpen && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={`panel-${item.id}`}
              hidden={!isOpen}
              className="pb-5 text-[14px] leading-relaxed text-muted [&_a]:text-gold-deep [&_a]:underline [&_a]:underline-offset-4"
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
