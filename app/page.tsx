import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

export const dynamic = 'force-dynamic'
import { Footer } from '@/components/Footer'
import { SearchBar } from '@/components/SearchBar'
import { CategoryGrid } from '@/components/CategoryGrid'
import { TrustStrip } from '@/components/TrustStrip'
import { BusinessCard } from '@/components/BusinessCard'
import { createClient } from '@/lib/supabase/server'
import type { Business } from '@/types'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'FindaGuy — Find Trusted Local Businesses in Durban',
  description:
    "eThekwini's most complete directory of verified local businesses. Find plumbers, electricians, beauty salons, restaurants and more across Durban.",
  keywords: [
    'durban business directory',
    'find a plumber durban',
    'local businesses ethekwini',
    'verified tradesmen durban',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    title: 'FindaGuy — Find a Trusted Guy for Anything',
    description: '2,400+ verified Durban businesses. Find trusted local services across eThekwini.',
    url: 'https://findaguy.co.za',
    siteName: 'FindaGuy',
    images: [{ url: '/og-homepage.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://findaguy.co.za' },
})

const QUICK_FILTERS = ['Near me', 'Open now', 'Top rated', 'Verified only', '24/7']

const STATS = [
  { value: '2,400+', label: 'Businesses' },
  { value: '18k+',   label: 'Reviews' },
  { value: '94%',    label: 'Verified' },
  { value: 'Durban', label: '& growing' },
]

const TIERS = [
  { label: 'Free',    price: 'R0',      sub: '',    highlight: false },
  { label: 'Starter', price: 'R299',    sub: '/mo', highlight: false },
  { label: 'Growth',  price: 'R999',    sub: '/mo', highlight: false },
  { label: 'Pro',     price: 'R3,500',  sub: '/mo', highlight: true  },
]

const MOCK_BUSINESSES: Business[] = [
  {
    id: '1', slug: 'durban-plumbing-pros', name: 'Durban Plumbing Pros',
    description: 'Reliable 24/7 plumbing across eThekwini.', meta_description: null,
    category: 'Plumbing', category_slug: 'plumbing', suburb: 'Berea',
    address: null, phone: '+27310001234', whatsapp: '+27310001234', email: null,
    website: null, logo_url: null, cover_url: null, emoji: '🚿',
    tags: ['24/7', 'Licensed'], rating_avg: 4.8, rating_count: 124,
    is_verified: true, is_claimed: true, tier: 3, response_time_mins: 15,
    open_now: true, hours: null, lat: null, lng: null, created_at: '', updated_at: '',
  },
  {
    id: '2', slug: 'glow-beauty-studio', name: 'Glow Beauty Studio',
    description: 'Premium beauty treatments in Umhlanga.', meta_description: null,
    category: 'Beauty', category_slug: 'beauty-wellness', suburb: 'Umhlanga',
    address: null, phone: '+27310002345', whatsapp: '+27310002345', email: null,
    website: null, logo_url: null, cover_url: null, emoji: '💇',
    tags: ['Walk-ins', 'Female-owned'], rating_avg: 4.9, rating_count: 87,
    is_verified: true, is_claimed: true, tier: 2, response_time_mins: 30,
    open_now: true, hours: null, lat: null, lng: null, created_at: '', updated_at: '',
  },
  {
    id: '3', slug: 'sparks-electrical', name: 'Sparks Electrical',
    description: 'COC certified electricians for homes and businesses.', meta_description: null,
    category: 'Electrical', category_slug: 'electrical', suburb: 'Pinetown',
    address: null, phone: '+27310003456', whatsapp: '+27310003456', email: null,
    website: null, logo_url: null, cover_url: null, emoji: '⚡',
    tags: ['COC certified', 'Commercial'], rating_avg: 4.7, rating_count: 203,
    is_verified: true, is_claimed: true, tier: 3, response_time_mins: 20,
    open_now: true, hours: null, lat: null, lng: null, created_at: '', updated_at: '',
  },
]

async function getFeaturedBusinesses(): Promise<Business[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_verified', true)
      .gte('tier', 2)
      .order('tier', { ascending: false })
      .order('rating_avg', { ascending: false })
      .limit(6)
    return (data as Business[]) ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featured = await getFeaturedBusinesses()
  const businesses = featured.length > 0 ? featured : MOCK_BUSINESSES

  return (
    <>
      <Nav />

      <main>
        {/* ── Hero ─────────────────────────────────── */}
        <section
          style={{ background: '#0F2D5E' }}
          className="pt-16 pb-12 px-4 sm:px-6 text-center relative overflow-hidden"
          aria-label="Search for local businesses in Durban"
        >
          <div className="absolute top-5 right-20 w-32 h-32 rounded-full opacity-[0.06]" style={{ background: '#F59E0B' }} aria-hidden="true" />
          <div className="absolute bottom-0 left-10 w-20 h-20 rounded-full opacity-[0.08]" style={{ background: '#3B82F6' }} aria-hidden="true" />

          <div className="max-w-3xl mx-auto relative">
            <div
              className="inline-flex items-center px-3 py-1 rounded-full mb-4 text-xs font-medium tracking-wide"
              style={{ background: 'rgba(245,158,11,0.15)', border: '0.5px solid rgba(245,158,11,0.3)', color: '#FCD34D' }}
            >
              Durban&apos;s trusted business directory
            </div>

            <h1 className="font-display font-black text-white mb-2 leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
              Find a trusted <span style={{ color: '#F59E0B' }}>guy</span> for anything
            </h1>

            <p className="text-base mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              eThekwini&apos;s most complete directory of verified local businesses
            </p>

            <div className="max-w-xl mx-auto mb-4">
              <SearchBar autoFocus />
            </div>

            <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Quick search filters">
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f}
                  className="text-xs px-3 py-1 rounded-full transition-colors hover:bg-white/20"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '0.5px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                  aria-label={`Filter: ${f}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div
              className="flex justify-center gap-8 mt-8 pt-6"
              style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)' }}
              aria-label="FindaGuy stats"
            >
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display font-black text-xl" style={{ color: '#F59E0B' }}>{s.value}</div>
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Categories ───────────────────────────── */}
        <CategoryGrid />

        {/* ── Trust strip ──────────────────────────── */}
        <TrustStrip />

        {/* ── Featured businesses ──────────────────── */}
        <section className="bg-page-bg py-8 px-4 sm:px-6" aria-label="Top businesses nearby">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="font-display font-black text-lg" style={{ color: '#0F2D5E' }}>Top businesses nearby</h2>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Verified, reviewed and ready to help</p>
              </div>
              <Link href="/search" className="text-xs font-medium" style={{ color: '#3B82F6' }}>
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {businesses.slice(0, 6).map((biz, i) => (
                <BusinessCard key={biz.id} business={biz} featured={i === 0 && biz.tier >= 3} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Business owner CTA ───────────────────── */}
        <section style={{ background: '#0F2D5E' }} className="py-12 px-4 sm:px-6 text-center" aria-label="List your business on FindaGuy">
          <div className="max-w-2xl mx-auto">
            <div
              className="inline-flex items-center px-3 py-1 rounded-full mb-4 text-xs font-medium"
              style={{ background: 'rgba(245,158,11,0.15)', border: '0.5px solid rgba(245,158,11,0.25)', color: '#FCD34D' }}
            >
              For business owners
            </div>

            <h2 className="font-display font-black text-white text-2xl mb-2.5 leading-snug">
              Your next customer is already<br />searching for you
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Join 2,400+ Durban businesses on FindaGuy.<br />Get found. Get reviews. Get growing.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Link
                href="/auth/login?intent=list"
                className="text-sm font-semibold px-7 py-3 rounded-lg text-white transition-opacity hover:opacity-90"
                style={{ background: '#F59E0B' }}
              >
                Get listed free →
              </Link>
              <Link
                href="/pricing"
                className="text-sm px-7 py-3 rounded-lg text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.2)' }}
              >
                View pricing
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {TIERS.map((tier) => (
                <div
                  key={tier.label}
                  className="rounded-lg px-5 py-2.5 text-center min-w-[80px]"
                  style={{
                    background: tier.highlight ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)',
                    border: `0.5px solid ${tier.highlight ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <div className="text-[11px] mb-0.5" style={{ color: tier.highlight ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.35)' }}>
                    {tier.label}
                  </div>
                  <div className="font-display font-black text-base" style={{ color: tier.highlight ? '#F59E0B' : '#fff' }}>
                    {tier.price}
                    {tier.sub && (
                      <span className="text-[10px] font-normal" style={{ color: tier.highlight ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.3)' }}>
                        {tier.sub}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
