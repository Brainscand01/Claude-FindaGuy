import type { Metadata } from 'next'
import Link from 'next/link'
import { Eye, Phone, MapPin, MessageCircle, Star, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Dashboard — FindaGuy' }

export default async function DashboardOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id, full_name')
    .eq('id', user.id)
    .single()

  const { data: business } = profile?.business_id
    ? await supabase.from('businesses').select('*').eq('id', profile.business_id).single()
    : { data: null }

  // Last 30 days stats
  const { data: statsRows } = business ? await supabase
    .from('business_stats')
    .select('profile_views, click_to_call, direction_requests, whatsapp_clicks')
    .eq('business_id', business.id)
    .gte('date', new Date(Date.now() - 30 * 864e5).toISOString().split('T')[0])
    : { data: [] }

  const stats = (statsRows ?? []).reduce(
    (acc, r) => ({
      views:     acc.views     + (r.profile_views ?? 0),
      calls:     acc.calls     + (r.click_to_call ?? 0),
      directions:acc.directions+ (r.direction_requests ?? 0),
      whatsapp:  acc.whatsapp  + (r.whatsapp_clicks ?? 0),
    }),
    { views: 0, calls: 0, directions: 0, whatsapp: 0 }
  )

  // Recent reviews
  const { data: reviews } = business ? await supabase
    .from('reviews')
    .select('id, score, body, author_name, created_at, is_published')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(3)
    : { data: [] }

  const STAT_CARDS = [
    { label: 'Profile views',  value: stats.views,      icon: Eye,            color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Call clicks',    value: stats.calls,      icon: Phone,          color: '#16A34A', bg: '#DCFCE7' },
    { label: 'WhatsApp clicks',value: stats.whatsapp,   icon: MessageCircle,  color: '#25D366', bg: '#F0FDF4' },
    { label: 'Directions',     value: stats.directions, icon: MapPin,         color: '#F59E0B', bg: '#FFFBEB' },
  ]

  const greeting = profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}!` : 'Welcome back!'

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl p-6" style={{ background: '#0F2D5E' }}>
        <h1 className="font-display font-black text-white text-xl mb-0.5">{greeting} 👋</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {business
            ? `Here's how ${business.name} is performing this month.`
            : 'Get started by linking your business listing.'}
        </p>
        {business && (
          <Link
            href={`/business/${business.slug}`}
            className="inline-flex items-center gap-1 mt-3 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ color: '#FCD34D' }}
          >
            View public listing <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {/* No business linked */}
      {!business && (
        <div className="bg-white rounded-xl border border-amber-200 p-6 text-center">
          <p className="text-sm text-slate-600 mb-4">No business listing is linked to your account yet.</p>
          <Link
            href="/pricing#get-started"
            className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: '#F59E0B' }}
          >
            Add or claim your listing →
          </Link>
        </div>
      )}

      {business && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STAT_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: card.bg }}>
                    <Icon size={16} strokeWidth={1.75} color={card.color} aria-hidden="true" />
                  </div>
                  <div className="font-display font-black text-2xl" style={{ color: '#0F2D5E' }}>
                    {card.value}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{card.label}</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">Last 30 days</div>
                </div>
              )
            })}
          </div>

          {/* Rating + verification */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Rating */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-display font-black text-sm mb-4" style={{ color: '#0F2D5E' }}>
                Rating overview
              </h2>
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <div className="font-display font-black text-4xl" style={{ color: '#0F2D5E' }}>
                    {business.rating_avg > 0 ? Number(business.rating_avg).toFixed(1) : '—'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">out of 5</div>
                  <div className="text-amber-400 text-lg mt-1" aria-hidden="true">★★★★★</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 mb-3">
                    Based on <strong className="text-slate-700">{business.rating_count ?? 0}</strong> reviews.
                  </p>
                  <Link href="/dashboard/reviews"
                    className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                    style={{ color: '#3B82F6' }}>
                    <Star size={12} /> Manage reviews
                  </Link>
                </div>
              </div>
            </div>

            {/* Verification status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-display font-black text-sm mb-4" style={{ color: '#0F2D5E' }}>
                Listing status
              </h2>
              <ul className="space-y-2.5">
                {[
                  { label: 'Listing created',   done: true },
                  { label: 'Business verified',  done: !!business.is_verified },
                  { label: 'Phone confirmed',    done: !!business.phone },
                  { label: 'Logo uploaded',      done: !!business.logo_url },
                  { label: 'Description added',  done: !!business.description && business.description.length > 30 },
                  { label: 'Hours set',          done: !!business.hours && Object.keys(business.hours).length > 0 },
                ].map(({ label, done }) => (
                  <li key={label} className="flex items-center gap-2 text-xs">
                    {done
                      ? <CheckCircle size={14} strokeWidth={2} color="#16A34A" />
                      : <Clock size={14} strokeWidth={1.75} color="#94a3b8" />}
                    <span style={{ color: done ? '#374151' : '#94a3b8' }}>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent reviews */}
          {(reviews ?? []).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-black text-sm" style={{ color: '#0F2D5E' }}>Recent reviews</h2>
                <Link href="/dashboard/reviews" className="text-xs font-medium" style={{ color: '#3B82F6' }}>
                  View all →
                </Link>
              </div>
              <ul className="divide-y divide-slate-100">
                {(reviews ?? []).map((r) => (
                  <li key={r.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-slate-700">{r.author_name ?? 'Anonymous'}</span>
                      <span className="text-xs text-amber-400">{'★'.repeat(r.score)}</span>
                      {!r.is_published && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Pending</span>
                      )}
                      <span className="text-[10px] text-slate-300 ml-auto">
                        {new Date(r.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {r.body && <p className="text-xs text-slate-500 line-clamp-2">{r.body}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
