'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/primitives'

/** Print-to-PDF is the browser's own; it yields a smaller, selectable file. */
export function PrintButton() {
  return (
    <Button variant="primary" size="md" onClick={() => window.print()}>
      <Download className="h-4 w-4" aria-hidden="true" />
      Print / save as PDF
    </Button>
  )
}
