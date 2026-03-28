'use client'

import type { Metadata } from 'next'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/types'

// Note: metadata must be in server components; this page is client for form interactivity.
// The title is set via the layout's document.title or a separate server wrapper.

export default function ProfileEditPage() {
  const [biz, setBiz] = useState<Partial<Business>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user.id)
        .single()
      if (!profile?.business_id) return
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', profile.business_id)
        .single()
      if (data) setBiz(data as Business)
    }
    load()
  }, [])

  function set<K extends keyof Business>(key: K, value: Business[K]) {
    setBiz((prev) => ({ ...prev, [key]: value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('businesses').update({
      name: biz.name,
      phone: biz.phone,
      whatsapp: biz.whatsapp,
      email: biz.email,
      website: biz.website,
      address: biz.address,
      description: biz.description,
    }).eq('id', biz.id!)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const fields: Array<{ label: string; key: keyof Business; type?: string; multiline?: boolean }> = [
    { label: 'Business name', key: 'name' },
    { label: 'Phone', key: 'phone', type: 'tel' },
    { label: 'WhatsApp', key: 'whatsapp', type: 'tel' },
    { label: 'Email', key: 'email', type: 'email' },
    { label: 'Website', key: 'website', type: 'url' },
    { label: 'Address', key: 'address' },
    { label: 'Description', key: 'description', multiline: true },
  ]

  return (
    <div>
      <h1 className="font-display font-black text-navy text-xl mb-6">My Profile</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor={field.key}>
                {field.label}
              </label>
              {field.multiline ? (
                <textarea
                  id={field.key}
                  value={(biz[field.key] as string) ?? ''}
                  onChange={(e) => set(field.key, e.target.value as Business[typeof field.key])}
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-navy transition-colors resize-none"
                />
              ) : (
                <input
                  id={field.key}
                  type={field.type ?? 'text'}
                  value={(biz[field.key] as string) ?? ''}
                  onChange={(e) => set(field.key, e.target.value as Business[typeof field.key])}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-navy transition-colors"
                />
              )}
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#0F2D5E' }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && <span className="text-xs font-medium" style={{ color: '#22C55E' }}>✓ Saved!</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
