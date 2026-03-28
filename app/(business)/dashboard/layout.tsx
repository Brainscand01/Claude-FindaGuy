import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoIcon, LogoWordmark } from '@/components/Logo'

const TABS = [
  { label: 'Overview', href: '/dashboard', icon: '📊' },
  { label: 'My Profile', href: '/dashboard/profile', icon: '✏️' },
  { label: 'Hours', href: '/dashboard/hours', icon: '🕐' },
  { label: 'Photos', href: '/dashboard/photos', icon: '🖼️' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, businesses(*)')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'consumer') redirect('/claim')

  const business = profile?.businesses

  return (
    <div className="min-h-screen bg-page-bg flex">
      {/* Sidebar */}
      <aside className="w-56 bg-navy flex-shrink-0 flex flex-col" aria-label="Dashboard navigation">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <LogoIcon size={24} />
            <LogoWordmark light />
          </Link>
          {business && (
            <div>
              <p className="text-xs font-semibold text-white truncate">{business.name}</p>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block"
                style={{
                  background: business.tier >= 3 ? '#F59E0B' : business.tier === 2 ? '#3B82F6' : 'rgba(255,255,255,0.15)',
                  color: '#fff',
                }}
              >
                {business.tier >= 3 ? 'Pro' : business.tier === 2 ? 'Growth' : 'Free'}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3">
          <ul className="space-y-0.5">
            {TABS.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Upgrade CTA */}
        {business?.tier < 3 && (
          <div className="p-4 m-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.12)', border: '0.5px solid rgba(245,158,11,0.25)' }}>
            <p className="text-xs font-semibold" style={{ color: '#FCD34D' }}>Upgrade to Pro</p>
            <p className="text-[10px] mt-0.5 mb-2.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Get more leads & analytics
            </p>
            <Link
              href="/pricing"
              className="block text-center text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ background: '#F59E0B' }}
            >
              Upgrade →
            </Link>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
