import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

export const dynamic = 'force-dynamic'
import { Footer } from '@/components/Footer'
import { SearchBar } from '@/components/SearchBar'
import { CategoryGrid } from '@/components/CategoryGrid'
import { TrustStrip } from '@/components/TrustStrip'
import { BusinessCard } from '@/components/BusinessCard'
import { LocalMakersCard } from '@/components/LocalMakersCard'
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
          {/* Decorative orbs */}
          <div className="absolute -top-16 -right-16 w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="absolute -bottom-20 -left-20 w-[360px] h-[360px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="absolute top-1/2 -left-24 w-[280px] h-[280px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="absolute -top-8 left-1/3 w-[240px] h-[240px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="absolute bottom-4 right-1/4 w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)' }} aria-hidden="true" />

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

        {/* ── Trust strip ──────────────────────────── */}
        <TrustStrip />

        {/* ── Categories ───────────────────────────── */}
        <CategoryGrid />

        {/* ── Local Makers spotlight ───────────────── */}
        <LocalMakersCard />

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
              Get your business found<br />on FindaGuy
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Thousands of Durban residents search here every day.<br />Add your listing in minutes — free to start.
            </p>

            <div className="flex justify-center mb-8">
              <Link
                href="/pricing"
                className="text-sm font-semibold px-8 py-3 rounded-lg text-white transition-opacity hover:opacity-90"
                style={{ background: '#F59E0B' }}
              >
                Add or claim your listing →
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span>✓ Free forever on basic</span>
              <span>✓ No credit card needed</span>
              <span>✓ Live in under 5 minutes</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
