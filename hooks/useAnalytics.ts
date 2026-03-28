'use client'

import { trackEvent } from '@/lib/analytics'

export function useAnalytics() {
  function track(
    event_type: string,
    event_data: Record<string, unknown> = {},
    business_id?: string
  ) {
    trackEvent(event_type, event_data, business_id)
  }

  return { track }
}
