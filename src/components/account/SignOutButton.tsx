'use client'

import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.refresh()
      }}
      className="text-[13px] text-gold-deep underline underline-offset-4"
    >
      Sign out
    </button>
  )
}
