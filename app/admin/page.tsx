'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Flag, Building2, Star, Clock, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// No nav link — accessed directly at /admin
// Protected by admin role check against profiles table

interface PendingReview {
  id: string
  business_id: string
  author_name: string | null
  score: number
  title: string | null
  body: string | null
  source: string
  created_at: string
  businesses?: { name: string; suburb: string } | null
}

interface PendingBusiness {
  id: string
  name: string
  category: string
  suburb: string
  phone: string | null
  is_verified: boolean
  is_claimed: boolean
  created_at: string
}

interface FlaggedReview extends PendingReview {
  is_flagged: boolean
}

export default function AdminPage() {
  const [tab, setTab] = useState<'reviews' | 'businesses' | 'flagged'>('reviews')
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const [pendingBusinesses, setPendingBusinesses] = useState<PendingBusiness[]>([])
  const [flaggedReviews, setFlaggedReviews] = useState<FlaggedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (isAdmin) loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, tab])

  async function checkAdmin() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsAdmin(false); return }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    setIsAdmin(profile?.role === 'admin')
  }

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    if (tab === 'reviews') {
      const { data } = await supabase
        .from('reviews')
        .select('*, businesses(name, suburb)')
        .eq('is_published', false)
        .eq('is_flagged', false)
        .order('created_at', { ascending: false })
        .limit(50)
      setPendingReviews((data as PendingReview[]) ?? [])
    }

    if (tab === 'businesses') {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, category, suburb, phone, is_verified, is_claimed, created_at')
        .eq('is_verified', false)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50)
      setPendingBusinesses((data as PendingBusiness[]) ?? [])
    }

    if (tab === 'flagged') {
      const { data } = await supabase
        .from('reviews')
        .select('*, businesses(name, suburb)')
        .eq('is_flagged', true)
        .order('created_at', { ascending: false })
        .limit(50)
      setFlaggedReviews((data as FlaggedReview[]) ?? [])
    }

    setLoading(false)
  }

  async function approveReview(id: string) {
    setActing(id)
    const supabase = createClient()
    await supabase.from('reviews').update({ is_published: true }).eq('id', id)
    setPendingReviews(prev => prev.filter(r => r.id !== id))
    setActing(null)
  }

  async function rejectReview(id: string) {
    setActing(id)
    const supabase = createClient()
    await supabase.from('reviews').update({ is_published: false, is_flagged: true }).eq('id', id)
    setPendingReviews(prev => prev.filter(r => r.id !== id))
    setActing(null)
  }

  async function dismissFlag(id: string) {
    setActing(id)
    const supabase = createClient()
    await supabase.from('reviews').update({ is_flagged: false, is_published: true }).eq('id', id)
    setFlaggedReviews(prev => prev.filter(r => r.id !== id))
    setActing(null)
  }

  async function removeReview(id: string) {
    setActing(id)
    const supabase = createClient()
    await supabase.from('reviews').update({ is_published: false, is_flagged: true }).eq('id', id)
    setFlaggedReviews(prev => prev.filter(r => r.id !== id))
    setActing(null)
  }

  async function verifyBusiness(id: string) {
    setActing(id)
    const supabase = createClient()
    await supabase.from('businesses').update({ is_verified: true }).eq('id', id)
    setPendingBusinesses(prev => prev.filter(b => b.id !== id))
    setActing(null)
  }

  async function rejectBusiness(id: string) {
    setActing(id)
    const supabase = createClient()
    await supabase.from('businesses').update({ is_active: false }).eq('id', id)
    setPendingBusinesses(prev => prev.filter(b => b.id !== id))
    setActing(null)
  }

  // Auth gate
  if (isAdmin === null) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-400">Checking access…</div>
  }
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-1">Access denied.</p>
          <p className="text-xs text-slate-400">This page is restricted to FindaGuy admins.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div style={{ background: '#0F2D5E' }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-black text-white text-lg">FindaGuy Admin</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Content moderation</p>
          </div>
          <button onClick={loadData} className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1 w-fit">
          {([
            { key: 'reviews',    label: 'Pending reviews',   icon: Star },
            { key: 'businesses', label: 'Pending listings',  icon: Building2 },
            { key: 'flagged',    label: 'Flagged reviews',   icon: Flag },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              style={{
                background: tab === key ? '#0F2D5E' : 'transparent',
                color: tab === key ? '#fff' : '#64748b',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 h-24 animate-pulse" />
            ))}
          </div>
        )}

        {/* Pending Reviews */}
        {!loading && tab === 'reviews' && (
          pendingReviews.length === 0
            ? <Empty label="No pending reviews — all clear!" />
            : <div className="space-y-3">
                {pendingReviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    acting={acting}
                    onApprove={() => approveReview(review.id)}
                    onReject={() => rejectReview(review.id)}
                  />
                ))}
              </div>
        )}

        {/* Pending Businesses */}
        {!loading && tab === 'businesses' && (
          pendingBusinesses.length === 0
            ? <Empty label="No listings pending verification." />
            : <div className="space-y-3">
                {pendingBusinesses.map(biz => (
                  <div key={biz.id} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-800">{biz.name}</span>
                          {biz.is_claimed && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700">Claimed</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{biz.category} · {biz.suburb}</p>
                        {biz.phone && <p className="text-xs text-slate-400 mt-0.5">{biz.phone}</p>}
                        <p className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                          <Clock size={10} /> {new Date(biz.created_at).toLocaleDateString('en-ZA')}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <ActionBtn
                          label="Verify" color="#16A34A" bg="#DCFCE7"
                          icon={<CheckCircle size={13} />}
                          loading={acting === biz.id}
                          onClick={() => verifyBusiness(biz.id)}
                        />
                        <ActionBtn
                          label="Reject" color="#DC2626" bg="#FEF2F2"
                          icon={<XCircle size={13} />}
                          loading={acting === biz.id}
                          onClick={() => rejectBusiness(biz.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {/* Flagged Reviews */}
        {!loading && tab === 'flagged' && (
          flaggedReviews.length === 0
            ? <Empty label="No flagged reviews." />
            : <div className="space-y-3">
                {flaggedReviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    acting={acting}
                    flagged
                    onApprove={() => dismissFlag(review.id)}
                    onReject={() => removeReview(review.id)}
                    approveLabel="Keep (dismiss flag)"
                    rejectLabel="Remove"
                  />
                ))}
              </div>
        )}
      </div>
    </div>
  )
}

function ReviewCard({
  review, acting, flagged = false,
  onApprove, onReject,
  approveLabel = 'Publish', rejectLabel = 'Reject',
}: {
  review: PendingReview
  acting: string | null
  flagged?: boolean
  onApprove: () => void
  onReject: () => void
  approveLabel?: string
  rejectLabel?: string
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${flagged ? 'border-red-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-slate-700">{review.author_name ?? 'Anonymous'}</span>
            <span className="text-xs" style={{ color: '#D97706' }}>{'★'.repeat(review.score)}</span>
            {review.businesses && (
              <span className="text-xs text-slate-400">on <strong className="text-slate-600">{review.businesses.name}</strong></span>
            )}
            <span className="text-[10px] text-slate-300 ml-auto flex items-center gap-1">
              <Clock size={10} /> {new Date(review.created_at).toLocaleDateString('en-ZA')}
            </span>
          </div>
          {review.title && <p className="text-xs font-medium text-slate-700 mb-0.5">{review.title}</p>}
          {review.body && <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{review.body}</p>}
          <p className="text-[10px] text-slate-300 mt-1">Source: {review.source}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <ActionBtn
            label={approveLabel} color="#16A34A" bg="#DCFCE7"
            icon={<CheckCircle size={13} />}
            loading={acting === review.id}
            onClick={onApprove}
          />
          <ActionBtn
            label={rejectLabel} color="#DC2626" bg="#FEF2F2"
            icon={<XCircle size={13} />}
            loading={acting === review.id}
            onClick={onReject}
          />
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ label, color, bg, icon, loading, onClick }: {
  label: string; color: string; bg: string
  icon: React.ReactNode; loading: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-40"
      style={{ background: bg, color }}
    >
      {icon} {label}
    </button>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="text-center py-16 text-slate-400 text-sm">{label}</div>
  )
}
