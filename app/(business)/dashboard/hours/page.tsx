'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BusinessHours, DayHours } from '@/types'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

const DEFAULT_HOURS: DayHours = { open: '08:00', close: '17:00', closed: false }

export default function HoursPage() {
  const [hours, setHours] = useState<BusinessHours>({
    monday: { ...DEFAULT_HOURS },
    tuesday: { ...DEFAULT_HOURS },
    wednesday: { ...DEFAULT_HOURS },
    thursday: { ...DEFAULT_HOURS },
    friday: { ...DEFAULT_HOURS },
    saturday: { open: '09:00', close: '13:00', closed: false },
    sunday: { ...DEFAULT_HOURS, closed: true },
  })
  const [bizId, setBizId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
      if (!profile?.business_id) return
      setBizId(profile.business_id)
      const { data } = await supabase.from('businesses').select('hours').eq('id', profile.business_id).single()
      if (data?.hours) setHours(data.hours as BusinessHours)
    }
    load()
  }, [])

  function setDay(day: typeof DAYS[number], key: keyof DayHours, value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...(prev[day] ?? DEFAULT_HOURS), [key]: value },
    }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!bizId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('businesses').update({ hours }).eq('id', bizId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <h1 className="font-display font-black text-navy text-xl mb-6">Business Hours</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg">
        <form onSubmit={save} className="space-y-3">
          {DAYS.map((day) => {
            const h = hours[day] ?? DEFAULT_HOURS
            return (
              <div key={day} className="flex items-center gap-3">
                <div className="w-24">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!h.closed}
                      onChange={(e) => setDay(day, 'closed', !e.target.checked)}
                      className="accent-navy"
                      aria-label={`${day} open`}
                    />
                    <span className="text-xs font-medium capitalize text-slate-700">{day}</span>
                  </label>
                </div>
                {!h.closed ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) => setDay(day, 'open', e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-navy flex-1"
                      aria-label={`${day} open time`}
                    />
                    <span className="text-xs text-slate-400">to</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) => setDay(day, 'close', e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-navy flex-1"
                      aria-label={`${day} close time`}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Closed</span>
                )}
              </div>
            )
          })}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#0F2D5E' }}
            >
              {saving ? 'Saving…' : 'Save hours'}
            </button>
            {saved && <span className="text-xs font-medium" style={{ color: '#22C55E' }}>✓ Saved!</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
