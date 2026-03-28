import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Dashboard' }

const STAT_CARDS = [
  { label: 'Profile views', icon: '👁', key: 'views' },
  { label: 'Calls', icon: '📞', key: 'calls' },
  { label: 'Directions', icon: '📍', key: 'directions' },
  { label: 'WhatsApp', icon: '💬', key: 'whatsapp' },
]

export default async function DashboardOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, businesses(*)')
    .eq('id', user.id)
    .single()

  const business = profile?.businesses
  const stats = { views: 0, calls: 0, directions: 0, whatsapp: 0 }

  return (
    <div>
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#0F2D5E' }}>
        <h1 className="font-display font-black text-white text-xl mb-0.5">
          Welcome back{business ? `, ${business.name}` : ''}! 👋
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Here&apos;s how your listing is performing this week.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl mb-2" aria-hidden="true">{card.icon}</div>
            <div className="font-display font-black text-navy text-2xl">
              {stats[card.key as keyof typeof stats]}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Rating breakdown */}
      {business && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-display font-black text-navy text-base mb-4">Rating overview</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-display font-black text-navy text-4xl">{business.rating_avg?.toFixed(1) ?? '—'}</div>
              <div className="text-xs text-slate-400 mt-0.5">out of 5.0</div>
              <div className="text-amber text-xl mt-1" aria-hidden="true">★★★★★</div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">
                Based on <strong>{business.rating_count ?? 0}</strong> reviews.
                Keep responding to customers to improve your rating.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Locked premium analytics */}
      {business?.tier < 2 && (
        <div className="mt-4 relative bg-white rounded-xl border border-slate-200 p-5 overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center flex-col gap-3"
               style={{ background: 'rgba(255,255,255,0.7)' }}>
            <div className="text-2xl" aria-hidden="true">🔒</div>
            <p className="text-sm font-semibold text-slate-700">Upgrade for detailed analytics</p>
            <a
              href="/pricing"
              className="text-xs font-medium px-4 py-2 rounded-lg text-white"
              style={{ background: '#F59E0B' }}
            >
              View plans →
            </a>
          </div>
          <h2 className="font-display font-black text-navy text-base mb-4">Advanced analytics</h2>
          <div className="h-32 bg-slate-100 rounded-lg" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
