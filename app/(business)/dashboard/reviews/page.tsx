'use client'

import { useState, useEffect } from 'react'
import { Star, Flag, MessageSquare, CheckCircle, Clock, Link2, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  score: number
  title: string | null
  body: string | null
  author_name: string | null
  created_at: string
  is_published: boolean
  is_flagged: boolean
  owner_reply: string | null
  owner_replied_at: string | null
}

interface ReviewRequest {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  email: string
  service_date: string
  service_description: string
  token: string
  status: 'pending' | 'sent' | 'submitted' | 'referral_received' | 'closed_without'
  sent_at: string | null
  submitted_at: string | null
  created_at: string
}

const STATUS_META: Record<ReviewRequest['status'], { label: string; bg: string; color: string }> = {
  pending:           { label: 'Pending',        bg: '#F1F5F9', color: '#64748B' },
  sent:              { label: 'Sent',            bg: '#EFF6FF', color: '#3B82F6' },
  submitted:         { label: 'Submitted',       bg: '#FEF3C7', color: '#D97706' },
  referral_received: { label: 'Review received', bg: '#DCFCE7', color: '#16A34A' },
  closed_without:    { label: 'Closed',          bg: '#FEE2E2', color: '#DC2626' },
}

const BLANK = { first_name: '', last_name: '', phone: '', email: '', service_date: '', service_description: '' }

export default function ReviewsPage() {
  const [reviews, setReviews]     = useState<Review[]>([])
  const [requests, setRequests]   = useState<ReviewRequest[]>([])
  const [bizId, setBizId]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText]   = useState('')
  const [saving, setSaving]         = useState(false)
  const [tab, setTab]             = useState<'all' | 'pending' | 'flagged' | 'requests'>('all')
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(BLANK)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied]       = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channelRef: ReturnType<typeof supabase.channel> | null = null

    async function load() {
      const devBypass = process.env.NEXT_PUBLIC_DASHBOARD_DEV_BYPASS === 'true'

      let businessId: string | null = null

      if (devBypass) {
        const { data } = await supabase
          .from('businesses').select('id').eq('is_active', true)
          .order('tier', { ascending: false }).limit(1).single()
        businessId = data?.id ?? null
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
        businessId = profile?.business_id ?? null
      }

      if (!businessId) { setLoading(false); return }
      setBizId(businessId)

      const [{ data: reviewData }, { data: requestData }] = await Promise.all([
        supabase
          .from('reviews')
          .select('id, score, title, body, author_name, created_at, is_published, is_flagged, owner_reply, owner_replied_at')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false }),
        supabase
          .from('review_requests')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false }),
      ])

      setReviews((reviewData as Review[]) ?? [])
      setRequests((requestData as ReviewRequest[]) ?? [])
      setLoading(false)

      // Realtime — live status updates when customer submits
      channelRef = supabase
        .channel('review_requests_live')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'review_requests', filter: `business_id=eq.${businessId}` },
          async (payload) => {
            setRequests(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } as ReviewRequest : r))
            // New review was just submitted — re-fetch reviews list
            if (payload.new.status === 'submitted') {
              const { data } = await supabase
                .from('reviews')
                .select('id, score, title, body, author_name, created_at, is_published, is_flagged, owner_reply, owner_replied_at')
                .eq('business_id', payload.new.business_id)
                .order('created_at', { ascending: false })
              if (data) setReviews(data as Review[])
            }
          }
        )
        .subscribe()
    }

    load()

    return () => { if (channelRef) supabase.removeChannel(channelRef) }
  }, [])

  async function submitReply(reviewId: string) {
    if (!replyText.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('reviews').update({
      owner_reply: replyText.trim(),
      owner_replied_at: new Date().toISOString(),
    }).eq('id', reviewId).eq('business_id', bizId)
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, owner_reply: replyText.trim(), owner_replied_at: new Date().toISOString() } : r
    ))
    setReplyingTo(null)
    setReplyText('')
    setSaving(false)
  }

  async function approveReview(reviewId: string) {
    const supabase = createClient()
    await supabase.from('reviews').update({ is_published: true }).eq('id', reviewId)
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_published: true } : r))
    // Trigger also updates linked review_request — reflect that locally
    setRequests(prev => prev.map(req => {
      const linkedReview = reviews.find(r => r.id === reviewId)
      if (!linkedReview) return req
      return req
    }))
  }

  async function flagReview(reviewId: string) {
    const supabase = createClient()
    await supabase.from('reviews').update({ is_flagged: true }).eq('id', reviewId).eq('business_id', bizId)
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_flagged: true } : r))
  }

  async function addRequest() {
    if (!bizId || !form.first_name || !form.email || !form.service_date || !form.service_description) return
    setSubmitting(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('review_requests')
      .insert({ business_id: bizId, ...form })
      .select()
      .single()
    if (data) setRequests(prev => [data as ReviewRequest, ...prev])
    setForm(BLANK)
    setShowForm(false)
    setSubmitting(false)
  }

  async function copyLink(id: string, token: string) {
    const url = `${window.location.origin}/review/${token}`
    await navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function markSent(id: string) {
    const supabase = createClient()
    const now = new Date().toISOString()
    await supabase.from('review_requests').update({ status: 'sent', sent_at: now }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'sent' as const, sent_at: now } : r))
  }

  async function closeWithout(id: string) {
    const supabase = createClient()
    await supabase.from('review_requests').update({ status: 'closed_without' }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'closed_without' as const } : r))
  }

  const filtered = reviews.filter(r => {
    if (tab === 'pending') return !r.is_published
    if (tab === 'flagged') return r.is_flagged
    return true
  })

  const counts = {
    all:      reviews.length,
    pending:  reviews.filter(r => !r.is_published).length,
    flagged:  reviews.filter(r => r.is_flagged).length,
    requests: requests.length,
  }

  const TABS = [
    { key: 'all' as const,      label: 'All' },
    { key: 'pending' as const,  label: 'Pending' },
    { key: 'flagged' as const,  label: 'Flagged' },
    { key: 'requests' as const, label: 'Request reviews' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-black text-xl" style={{ color: '#0F2D5E' }}>Reviews</h1>
        <p className="text-xs text-slate-400">{reviews.length} total · {counts.pending} pending admin approval</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit mb-5 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            style={{
              background: tab === t.key ? '#0F2D5E' : 'transparent',
              color: tab === t.key ? '#fff' : '#64748b',
            }}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span className="text-[9px] font-bold px-1 py-0.5 rounded-full"
                style={{ background: tab === t.key ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: tab === t.key ? '#fff' : '#64748b' }}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Request Reviews tab ── */}
      {tab === 'requests' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white"
              style={{ background: '#0F2D5E' }}
            >
              <UserPlus size={13} />
              {showForm ? 'Cancel' : 'Add customer'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-display font-black text-sm mb-4" style={{ color: '#0F2D5E' }}>Customer details</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'First name *', key: 'first_name' as const, type: 'text' },
                  { label: 'Last name',    key: 'last_name'  as const, type: 'text' },
                  { label: 'Phone',        key: 'phone'      as const, type: 'tel'  },
                  { label: 'Email *',      key: 'email'      as const, type: 'email'},
                  { label: 'Service date *', key: 'service_date' as const, type: 'date'},
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">What was done *</label>
                  <input
                    value={form.service_description}
                    onChange={e => setForm(p => ({ ...p, service_description: e.target.value }))}
                    placeholder="e.g. Annual tax return and VAT submission"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>
              <button
                onClick={addRequest}
                disabled={submitting || !form.first_name || !form.email || !form.service_date || !form.service_description}
                className="text-xs font-semibold px-5 py-2 rounded-lg text-white disabled:opacity-40"
                style={{ background: '#0F2D5E' }}
              >
                {submitting ? 'Adding…' : 'Add to queue'}
              </button>
            </div>
          )}

          {requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
              <UserPlus size={28} className="mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400">No review requests yet.</p>
              <p className="text-xs text-slate-300 mt-1">Add customers above to send them a personalised review link.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map(req => {
                const meta = STATUS_META[req.status]
                return (
                  <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-700">{req.first_name} {req.last_name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {req.email}{req.phone ? ` · ${req.phone}` : ''}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          <span className="font-medium">{req.service_description}</span>
                          {' · '}
                          {new Date(req.service_date + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                        {req.status !== 'closed_without' && req.status !== 'referral_received' && (
                          <button
                            onClick={() => copyLink(req.id, req.token)}
                            className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors"
                            style={{
                              borderColor: copied === req.id ? '#86EFAC' : '#E2E8F0',
                              color: copied === req.id ? '#16A34A' : '#64748B',
                            }}
                          >
                            <Link2 size={10} />
                            {copied === req.id ? 'Copied!' : 'Copy link'}
                          </button>
                        )}
                        {req.status === 'pending' && (
                          <button
                            onClick={() => markSent(req.id)}
                            className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Mark sent
                          </button>
                        )}
                        {(req.status === 'pending' || req.status === 'sent') && (
                          <button
                            onClick={() => closeWithout(req.id)}
                            className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-400 hover:border-red-200 transition-colors"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Reviews tabs ── */}
      {tab !== 'requests' && (
        <>
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 h-24 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
              <Star size={28} className="mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400">
                {tab === 'all' ? 'No reviews yet.' : `No ${tab} reviews.`}
              </p>
              <p className="text-xs text-slate-300 mt-1">Reviews submitted by customers appear here.</p>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map(review => (
              <div key={review.id}
                className="bg-white rounded-xl border p-5"
                style={{ borderColor: review.is_flagged ? '#FCA5A5' : '#e2e8f0' }}>

                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-700">{review.author_name ?? 'Anonymous'}</span>
                      <span className="text-sm text-amber-400">{'★'.repeat(review.score)}{'☆'.repeat(5 - review.score)}</span>
                      {!review.is_published && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          <Clock size={9} /> Pending approval
                        </span>
                      )}
                      {review.is_published && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                          <CheckCircle size={9} /> Published
                        </span>
                      )}
                      {review.is_flagged && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Flagged</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {new Date(review.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!review.is_published && !review.is_flagged && (
                    <button
                      onClick={() => approveReview(review.id)}
                      className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <CheckCircle size={10} /> Approve
                    </button>
                  )}
                  {!review.is_flagged && review.is_published && (
                    <button
                      onClick={() => flagReview(review.id)}
                      className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Flag size={11} /> Flag
                    </button>
                  )}
                  </div>
                </div>

                {review.title && <p className="text-xs font-semibold text-slate-700 mb-1">{review.title}</p>}
                {review.body && <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>}

                {review.owner_reply && (
                  <div className="mt-3 rounded-lg p-3" style={{ background: '#F8FAFF', border: '1px solid #BFDBFE' }}>
                    <p className="text-[10px] font-semibold mb-1" style={{ color: '#1D4ED8' }}>Your reply</p>
                    <p className="text-xs text-slate-600">{review.owner_reply}</p>
                  </div>
                )}

                {review.is_published && !review.owner_reply && replyingTo !== review.id && (
                  <button
                    onClick={() => { setReplyingTo(review.id); setReplyText('') }}
                    className="mt-3 flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{ color: '#3B82F6' }}
                  >
                    <MessageSquare size={13} /> Reply to this review
                  </button>
                )}

                {replyingTo === review.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="Write a professional, helpful response…"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitReply(review.id)}
                        disabled={!replyText.trim() || saving}
                        className="text-xs font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-40"
                        style={{ background: '#0F2D5E' }}
                      >
                        {saving ? 'Saving…' : 'Post reply'}
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText('') }}
                        className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
