'use client'

import { useState, useEffect } from 'react'
import { Star, Flag, MessageSquare, CheckCircle, Clock } from 'lucide-react'
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

export default function ReviewsPage() {
  const [reviews, setReviews]   = useState<Review[]>([])
  const [bizId, setBizId]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText]   = useState('')
  const [saving, setSaving]         = useState(false)
  const [tab, setTab] = useState<'all' | 'pending' | 'flagged'>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
      if (!profile?.business_id) { setLoading(false); return }
      setBizId(profile.business_id)

      const { data } = await supabase
        .from('reviews')
        .select('id, score, title, body, author_name, created_at, is_published, is_flagged, owner_reply, owner_replied_at')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false })
      setReviews((data as Review[]) ?? [])
      setLoading(false)
    }
    load()
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

  async function flagReview(reviewId: string) {
    const supabase = createClient()
    await supabase.from('reviews').update({ is_flagged: true }).eq('id', reviewId).eq('business_id', bizId)
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_flagged: true } : r))
  }

  const filtered = reviews.filter(r => {
    if (tab === 'pending') return !r.is_published
    if (tab === 'flagged') return r.is_flagged
    return true
  })

  const counts = {
    all: reviews.length,
    pending: reviews.filter(r => !r.is_published).length,
    flagged: reviews.filter(r => r.is_flagged).length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-black text-xl" style={{ color: '#0F2D5E' }}>Reviews</h1>
        <p className="text-xs text-slate-400">{reviews.length} total · {counts.pending} pending admin approval</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit mb-5">
        {(['all', 'pending', 'flagged'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors capitalize flex items-center gap-1.5"
            style={{
              background: tab === t ? '#0F2D5E' : 'transparent',
              color: tab === t ? '#fff' : '#64748b',
            }}
          >
            {t} {counts[t] > 0 && (
              <span className="text-[9px] font-bold px-1 py-0.5 rounded-full"
                style={{ background: tab === t ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: tab === t ? '#fff' : '#64748b' }}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

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
          <p className="text-xs text-slate-300 mt-1">Reviews submitted by customers appear here for your review.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(review => (
          <div key={review.id}
            className="bg-white rounded-xl border p-5"
            style={{ borderColor: review.is_flagged ? '#FCA5A5' : '#e2e8f0' }}>

            {/* Review header */}
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

              {/* Actions */}
              {!review.is_flagged && review.is_published && (
                <button
                  onClick={() => flagReview(review.id)}
                  className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Flag size={11} /> Flag
                </button>
              )}
            </div>

            {review.title && <p className="text-xs font-semibold text-slate-700 mb-1">{review.title}</p>}
            {review.body && <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>}

            {/* Owner reply */}
            {review.owner_reply && (
              <div className="mt-3 rounded-lg p-3" style={{ background: '#F8FAFF', border: '1px solid #BFDBFE' }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: '#1D4ED8' }}>Your reply</p>
                <p className="text-xs text-slate-600">{review.owner_reply}</p>
              </div>
            )}

            {/* Reply form */}
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
    </div>
  )
}
