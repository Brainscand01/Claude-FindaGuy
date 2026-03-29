import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, User, Clock, Image, Star, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { LogoIcon, LogoWordmark } from '@/components/Logo'

const TABS = [
  { label: 'Overview',   href: '/dashboard',          icon: LayoutDashboard },
  { label: 'My Profile', href: '/dashboard/profile',   icon: User },
  { label: 'Hours',      href: '/dashboard/hours',     icon: Clock },
  { label: 'Photos',     href: '/dashboard/photos',    icon: Image },
  { label: 'Reviews',    href: '/dashboard/reviews',   icon: Star },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Dev bypass — remove NEXT_PUBLIC_DASHBOARD_DEV_BYPASS before deploying
  const devBypass = process.env.NEXT_PUBLIC_DASHBOARD_DEV_BYPASS === 'true'

  let business = null

  if (devBypass) {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, tier, is_verified, is_claimed')
      .eq('is_active', true)
      .order('tier', { ascending: false })
      .limit(1)
      .single()
    business = data
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login?next=/dashboard')

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, business_id')
      .eq('id', user.id)
      .single()

    const { data: biz } = profile?.business_id
      ? await supabase.from('businesses').select('id, name, tier, is_verified, is_claimed').eq('id', profile.business_id).single()
      : { data: null }
    business = biz
  }

  const tierLabel = !business ? null
    : business.tier >= 3 ? 'Pro'
    : business.tier === 2 ? 'Growth'
    : business.tier === 1 ? 'Starter'
    : 'Free'

  const tierColor = business?.tier >= 3 ? '#F59E0B'
    : business?.tier === 2 ? '#3B82F6'
    : 'rgba(255,255,255,0.2)'

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0F2D5E] flex-shrink-0 flex flex-col" aria-label="Dashboard navigation">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <LogoIcon size={24} onDark />
            <LogoWordmark light />
          </Link>
          {business ? (
            <div>
              <p className="text-xs font-semibold text-white truncate">{business.name}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: tierColor }}>
                  {tierLabel}
                </span>
                {business.is_verified && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#166534' }}>
                    Verified
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>No listing linked</p>
          )}
        </div>

        <nav className="flex-1 p-3">
          <ul className="space-y-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/10"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                    {tab.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Upgrade CTA — only show for Free tier when payments are live */}
        <div className="p-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-[10px] px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            ← Back to FindaGuy
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-auto">
        {/* Verification banner */}
        {business && !business.is_verified && (
          <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-xs">
            <p className="text-amber-800">
              <strong>Listing pending verification.</strong> Our team will review and verify your business within 24 hours.
            </p>
            <ChevronRight size={14} className="text-amber-500 flex-shrink-0" />
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
