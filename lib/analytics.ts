import type { AnalyticsEvent } from '@/types'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('_fag_sid')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('_fag_sid', sid)
  }
  return sid
}

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  return window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
}

export function trackEvent(
  event_type: string,
  event_data: Record<string, unknown> = {},
  business_id?: string
): void {
  const payload: AnalyticsEvent = {
    event_type,
    event_data,
    business_id,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    page: typeof window !== 'undefined' ? window.location.pathname : '',
  }

  // Fire-and-forget — never await
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}
