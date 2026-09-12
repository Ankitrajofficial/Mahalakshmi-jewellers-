/**
 * Icons lucide no longer ships (brand marks were dropped in v1). Drawn here so
 * nothing depends on an unpinned third-party brand asset.
 */
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.94L2 22.5l5.7-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.2 15.03l-.3-.18-3.38.89.9-3.29-.2-.32A8.1 8.1 0 0 1 12.04 3.8Zm4.63 10.06c-.25-.13-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.16.25-.63.8-.77.96-.14.16-.28.18-.53.06-.25-.13-1.05-.39-2-1.23a7.5 7.5 0 0 1-1.38-1.72c-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3c-.22.25-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.7 2.6 4.13 3.65.58.25 1.03.4 1.38.51.58.19 1.1.16 1.52.1.46-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  )
}
