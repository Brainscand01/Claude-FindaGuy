import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { AnalyticsEvent } from '@/types'

export async function POST(request: Request) {
  try {
    const payload: AnalyticsEvent = await request.json()

    // Basic validation
    if (!payload.event_type || typeof payload.event_type !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    await supabase.from('analytics_events').insert({
      event_type: payload.event_type,
      event_data: payload.event_data ?? {},
      business_id: payload.business_id ?? null,
      session_id: payload.session_id,
      device_type: payload.device_type,
      page: payload.page,
      component: payload.component ?? null,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
