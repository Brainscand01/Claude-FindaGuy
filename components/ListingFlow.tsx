'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, CheckCircle, ChevronRight, Building2 } from 'lucide-react'

const CATEGORIES = [
  'Home Services', 'Food & Drink', 'Beauty & Wellness', 'Automotive',
  'Health & Medical', 'Electrical', 'Plumbing', 'Professional Services',
  'Construction & Building', 'Couriers & Delivery', 'Local Makers', 'Other',
]

type Flow = 'choose' | 'claim' | 'new'

interface NewListingForm {
  name: string; category: string; suburb: string
  phone: string; whatsapp: string; description: string; website: string
}

const EMPTY_FORM: NewListingForm = {
  name: '', category: '', suburb: '', phone: '', whatsapp: '', description: '', website: '',
}

export function ListingFlow() {
  const [flow, setFlow] = useState<Flow>('choose')
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Claim flow
  const [claimSearch, setClaimSearch] = useState('')
  const [claimResults, setClaimResults] = useState<{ id: string; name: string; suburb: string; category: string }[]>([])
  const [claimSearching, setClaimSearching] = useState(false)
  const [claimSelected, setClaimSelected] = useState<string | null>(null)

  // New listing flow
  const [form, setForm] = useState<NewListingForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function searchBusinesses() {
    if (!claimSearch.trim()) return
    setClaimSearching(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('businesses')
      .select('id, name, suburb, category')
      .ilike('name', `%${claimSearch}%`)
      .eq('is_claimed', false)
      .limit(8)
    setClaimResults(data ?? [])
    setClaimSearching(false)
  }

  async function submitListing() {
    setSubmitting(true)
    const supabase = createClient()
    await supabase.from('businesses').insert({
      name: form.name,
      category: form.category,
      category_slug: form.category.toLowerCase().replace(/\s+&?\s*/g, '-'),
      suburb: form.suburb,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      description: form.description,
      website: form.website || null,
      slug: `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${form.suburb.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      is_verified: false,
      is_claimed: true,
      tier: 0,
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#DCFCE7' }}>
          <CheckCircle size={28} strokeWidth={1.75} color="#16A34A" />
        </div>
        <h3 className="font-display font-black text-xl mb-2" style={{ color: '#0F2D5E' }}>You&apos;re on the list!</h3>
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#64748b' }}>
          <strong>{form.name}</strong> has been submitted for review.<br />
          We&apos;ll verify and publish within 24 hours.
        </p>
        <Link href="/" className="text-sm font-semibold" style={{ color: '#F59E0B' }}>Back to FindaGuy →</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Choose */}
      {flow === 'choose' && (
        <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          <button
            onClick={() => { setFlow('new'); setStep(1) }}
            className="text-left p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#FFFBEB' }}>
              <Building2 size={18} strokeWidth={1.75} color="#F59E0B" />
            </div>
            <h3 className="font-display font-black text-sm mb-1" style={{ color: '#0F2D5E' }}>Add my business</h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#64748b' }}>
              Not on FindaGuy yet? Create a new listing.
            </p>
            <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#F59E0B' }}>
              Get started <ChevronRight size={13} />
            </span>
          </button>

          <button
            onClick={() => { setFlow('claim'); setStep(1) }}
            className="text-left p-4 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#EFF6FF' }}>
              <Search size={18} strokeWidth={1.75} color="#3B82F6" />
            </div>
            <h3 className="font-display font-black text-sm mb-1" style={{ color: '#0F2D5E' }}>Claim existing listing</h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#64748b' }}>
              Already listed? Claim and manage it.
            </p>
            <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#3B82F6' }}>
              Search now <ChevronRight size={13} />
            </span>
          </button>
        </div>
      )}

      {/* Claim */}
      {flow === 'claim' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <button onClick={() => setFlow('choose')} className="text-xs text-slate-400 hover:text-slate-600 mb-6 block">← Back</button>
          <h3 className="font-display font-black text-lg mb-1" style={{ color: '#0F2D5E' }}>Search for your business</h3>
          <p className="text-xs mb-5" style={{ color: '#64748b' }}>We&apos;ll only show unclaimed listings.</p>

          <div className="flex gap-2 mb-5">
            <input
              type="text" value={claimSearch}
              onChange={e => setClaimSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchBusinesses()}
              placeholder="Business name…"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <button
              onClick={searchBusinesses} disabled={claimSearching}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: '#3B82F6' }}
            >
              {claimSearching ? 'Searching…' : 'Search'}
            </button>
          </div>

          {claimResults.length === 0 && claimSearch && !claimSearching && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400 mb-3">No unclaimed listings found for &ldquo;{claimSearch}&rdquo;</p>
              <button
                onClick={() => { setFlow('new'); setForm({ ...EMPTY_FORM, name: claimSearch }) }}
                className="text-sm font-semibold text-amber-600 hover:underline"
              >
                Create a new listing instead →
              </button>
            </div>
          )}

          {claimResults.length > 0 && (
            <ul className="space-y-2">
              {claimResults.map(biz => (
                <li key={biz.id}>
                  <button
                    onClick={() => setClaimSelected(biz.id)}
                    className="w-full text-left px-4 py-3 rounded-xl border transition-all"
                    style={{ borderColor: claimSelected === biz.id ? '#3B82F6' : '#e2e8f0', background: claimSelected === biz.id ? '#EFF6FF' : '#fff' }}
                  >
                    <div className="text-sm font-semibold" style={{ color: '#0F2D5E' }}>{biz.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{biz.category} · {biz.suburb}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {claimSelected && (
            <Link
              href={`/claim/${claimSelected}`}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#3B82F6' }}
            >
              Claim this listing <ChevronRight size={16} />
            </Link>
          )}
        </div>
      )}

      {/* New listing */}
      {flow === 'new' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setFlow('choose')} className="text-xs text-slate-400 hover:text-slate-600">← Back</button>
            <span className="text-xs text-slate-400">Step {step} of 3</span>
          </div>

          <div className="flex gap-1.5 mb-7">
            {[1, 2, 3].map(s => (
              <div key={s} className="h-1 flex-1 rounded-full transition-all" style={{ background: s <= step ? '#F59E0B' : '#e2e8f0' }} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-display font-black text-lg mb-3" style={{ color: '#0F2D5E' }}>Business details</h3>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Business name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Durban Plumbing Pros"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                  <option value="">Select a category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Suburb *</label>
                <input type="text" value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))}
                  placeholder="e.g. Berea, Umhlanga, Pinetown"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <button onClick={() => setStep(2)} disabled={!form.name || !form.category || !form.suburb}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: '#F59E0B' }}>Next →</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-display font-black text-lg mb-3" style={{ color: '#0F2D5E' }}>Contact details</h3>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Phone number *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+27 31 000 1234"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">WhatsApp <span className="font-normal text-slate-400">(leave blank if same as phone)</span></label>
                <input type="tel" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="+27 82 000 1234"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Website <span className="font-normal text-slate-400">(optional)</span></label>
                <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://yoursite.co.za"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600">← Back</button>
                <button onClick={() => setStep(3)} disabled={!form.phone}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                  style={{ background: '#F59E0B' }}>Next →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-display font-black text-lg mb-3" style={{ color: '#0F2D5E' }}>About your business</h3>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Short description * <span className="font-normal text-slate-400">({form.description.length}/200)</span>
                </label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value.slice(0, 200) }))}
                  rows={4} placeholder="What do you do, who do you serve, what makes you different?"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
              </div>
              <div className="rounded-xl p-4 text-xs space-y-1" style={{ background: '#F8FAFC', border: '1px solid #e2e8f0' }}>
                <div className="font-semibold text-slate-700 mb-1">Review your listing</div>
                <div className="text-slate-500"><span className="text-slate-700 font-medium">{form.name}</span> · {form.category}</div>
                <div className="text-slate-500">{form.suburb} · {form.phone}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600">← Back</button>
                <button onClick={submitListing} disabled={!form.description || submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                  style={{ background: '#F59E0B' }}>
                  {submitting ? 'Submitting…' : 'Submit listing →'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
