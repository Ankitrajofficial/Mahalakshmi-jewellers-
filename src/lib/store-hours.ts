import { STORE_HOURS, TIMEZONE } from './constants'

export type StoreStatus = {
  isOpen: boolean
  label: string
  detail: string
  /** Local IST clock at evaluation time, e.g. "6:42 PM". */
  nowLabel: string
}

function minutesFromHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Wall-clock minutes since midnight in Asia/Kolkata, regardless of server timezone. */
export function istMinutesNow(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
  return hour * 60 + minute
}

export function istClockLabel(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now)
}

/**
 * Live open/closed against the locked store hours, computed in IST.
 * Store is open daily, so only the time of day matters.
 */
export function getStoreStatus(now: Date = new Date()): StoreStatus {
  const mins = istMinutesNow(now)
  const open = minutesFromHHMM(STORE_HOURS.opensAt)
  const close = minutesFromHHMM(STORE_HOURS.closesAt)
  const isOpen = mins >= open && mins < close
  const nowLabel = istClockLabel(now)

  if (isOpen) {
    const left = close - mins
    const detail =
      left <= 60
        ? `Closing in ${left} min — closes ${STORE_HOURS.closesAtLabel}`
        : `Closes ${STORE_HOURS.closesAtLabel} today`
    return { isOpen: true, label: 'Open now', detail, nowLabel }
  }

  const detail =
    mins < open
      ? `Opens ${STORE_HOURS.opensAtLabel} today`
      : `Opens ${STORE_HOURS.opensAtLabel} tomorrow`
  return { isOpen: false, label: 'Closed', detail, nowLabel }
}
