import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Check, Minus } from 'lucide-react'
import { ListingFlow } from '@/components/ListingFlow'

export const metadata: Metadata = {
  title: 'Pricing — FindaGuy for Business',
  description: 'Simple, transparent pricing for Durban businesses. Get listed free or upgrade for featured placement, analytics and more.',
  alternates: { canonical: '/pricing' },
}

const TIERS = [
  {
    name: 'Free',
    price: 'R0',
    sub: 'Forever free',
    description: 'Get your business on the map. No credit card, no catch.',
    cta: 'Get listed free',
    href: '/pricing#get-started',
    highlight: false,
    features: [
      'Listed in directory',
      'Basic profile (name, category, suburb, phone)',
      '1 photo',
      'FindaGuy trust badge',
      'Customers contact via phone',
    ],
  },
  {
    name: 'Starter',
    price: 'R299',
    sub: '/mo',
    description: 'A complete profile that builds trust and gets you noticed.',
    cta: 'Start free trial',
    href: '/pricing#get-started',
    highlight: false,
    features: [
      'Everything in Free',
      'Full profile (description, hours, website)',
      'Up to 5 photos',
      'Verified tick on listing',
      'Respond to reviews',
      'WhatsApp enquiry button',
      'Basic analytics (views & clicks)',
    ],
  },
  {
    name: 'Growth',
    price: 'R999',
    sub: '/mo',
    description: 'Stand out in search, generate leads and sell online.',
    cta: 'Get Growth',
    href: '/pricing#get-started',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Everything in Starter',
      'Featured placement in category browse',
      'Up to 20 photos + logo + cover image',
      'Priority in search results',
      'Local Makers storefront (sell directly)',
      'WhatsApp auto-reply',
      'Advanced analytics (leads, suburbs, conversion)',
      'Monthly performance report',
    ],
  },
  {
    name: 'Pro',
    price: 'R3,500',
    sub: '/mo',
    description: 'Maximum visibility and a dedicated team in your corner.',
    cta: 'Get Pro',
    href: '/pricing#get-started',
    highlight: false,
    features: [
      'Everything in Growth',
      'Homepage featured slot',
      'Unlimited photos',
      'Sponsored placement in search',
      'Verified Pro badge',
      'Dedicated account manager',
      'Review solicitation tools',
      'Social media kit (branded graphics)',
      'API access for your own website',
    ],
  },
]

const FEATURE_ROWS = [
  { label: 'Directory listing',       tiers: [true,  true,      true,       true] },
  { label: 'Basic profile',           tiers: [true,  true,      true,       true] },
  { label: 'Trust badge',             tiers: [true,  true,      true,       true] },
  { label: 'Full profile & hours',    tiers: [false, true,      true,       true] },
  { label: 'Photos',                  tiers: ['1',   '5',       '20',       'Unlimited'] },
  { label: 'Verified tick',           tiers: [false, true,      true,       true] },
  { label: 'WhatsApp button',         tiers: [false, true,      true,       true] },
  { label: 'Respond to reviews',      tiers: [false, true,      true,       true] },
  { label: 'Analytics',               tiers: [false, 'Basic',   'Advanced', 'Advanced'] },
  { label: 'Featured in category',    tiers: [false, false,     true,       true] },
  { label: 'Priority in search',      tiers: [false, false,     true,       true] },
  { label: 'Local Makers storefront', tiers: [false, false,     true,       true] },
  { label: 'Homepage featured slot',  tiers: [false, false,     false,      true] },
  { label: 'Account manager',         tiers: [false, false,     false,      true] },
  { label: 'Sponsored placement',     tiers: [false, false,     false,      true] },
  { label: 'Social media kit',        tiers: [false, false,     false,      true] },
]

function FeatureCell({ value, highlight }: { value: boolean | string | null; highlight: boolean }) {
  if (value === false || value === null) return (
    <div className="flex justify-center"><Minus size={14} strokeWidth={2} color="#cbd5e1" /></div>
  )
  if (value === true) return (
    <div className="flex justify-center"><Check size={14} strokeWidth={2.5} color="#16A34A" /></div>
  )
  return <div className="text-center text-xs font-semibold" style={{ color: highlight ? '#1D4ED8' : '#0F2D5E' }}>{value}</div>
}

export default function PricingPage() {
  return (
    <>
      <Nav dark />
      <main className="flex-1 relative overflow-hidden" style={{ background: '#EFF6FF' }}>

        {/* ── Decorative orbs ──────────────────────── */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Top-right amber orb */}
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)' }} />
          {/* Bottom-left navy orb */}
          <div className="absolute -bottom-24 -left-24 w-[440px] h-[440px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(15,45,94,0.18) 0%, transparent 70%)' }} />
          {/* Mid-right navy orb */}
          <div className="absolute top-1/2 -right-40 w-[380px] h-[380px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(15,45,94,0.13) 0%, transparent 70%)' }} />
          {/* Mid-left amber orb */}
          <div className="absolute top-1/3 -left-32 w-[320px] h-[320px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.16) 0%, transparent 70%)' }} />
          {/* Centre-bottom amber accent orb */}
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(15,45,94,0.10) 0%, transparent 70%)' }} />
        </div>

        {/* ── Hero ─────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 pt-14 pb-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div
              className="inline-flex items-center px-3 py-1 rounded-full mb-5 text-xs font-medium tracking-wide"
              style={{ background: 'rgba(15,45,94,0.08)', border: '0.5px solid rgba(15,45,94,0.15)', color: '#0F2D5E' }}
            >
              For business owners
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl mb-3 leading-tight" style={{ color: '#0F2D5E' }}>
              Simple, transparent pricing
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
              Start free and upgrade when you&apos;re ready. No lock-in, no hidden fees.
            </p>
          </div>
        </section>

        {/* ── Get started ──────────────────────────── */}
        <section id="get-started" className="relative px-4 sm:px-6 pb-16">
          <div className="max-w-2xl mx-auto text-center mb-6">
            <h2 className="font-display font-black text-2xl mb-2" style={{ color: '#0F2D5E' }}>Ready to get found?</h2>
            <p className="text-sm text-slate-500">
              Add your business or claim an existing listing — free to start, live in minutes.
            </p>
          </div>
          <ListingFlow />
        </section>

        {/* ── Pricing cards ─────────────────────────── */}
        <section className="relative px-4 sm:px-6 pb-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className="relative rounded-2xl p-6 flex flex-col"
                style={{
                  background: tier.highlight ? '#fff' : '#fff',
                  border: `1.5px solid ${tier.highlight ? '#3B82F6' : '#BFDBFE'}`,
                  boxShadow: tier.highlight
                    ? '0 8px 32px rgba(59,130,246,0.15)'
                    : '0 2px 12px rgba(15,45,94,0.06)',
                }}
              >
                {tier.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full text-white whitespace-nowrap"
                    style={{ background: '#3B82F6' }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div className="mb-5">
                  <div className="text-xs font-bold mb-3 uppercase tracking-wide"
                    style={{ color: tier.highlight ? '#3B82F6' : '#94a3b8' }}>
                    {tier.name}
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="font-display font-black text-3xl" style={{ color: '#0F2D5E' }}>{tier.price}</span>
                    <span className="text-sm pb-0.5 text-slate-400">{tier.sub}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">{tier.description}</p>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check size={13} strokeWidth={2.5} color={tier.highlight ? '#3B82F6' : '#F59E0B'} className="mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className="block text-center text-xs font-semibold py-2.5 rounded-lg transition-opacity hover:opacity-90"
                  style={{
                    background: tier.highlight ? '#3B82F6' : '#F59E0B',
                    color: '#fff',
                  }}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Comparison table ──────────────────────── */}
        <section className="relative px-4 sm:px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-black text-xl text-center mb-8" style={{ color: '#0F2D5E' }}>
              Full feature comparison
            </h2>

            <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1.5px solid #BFDBFE', boxShadow: '0 2px 16px rgba(15,45,94,0.07)' }}>
              {/* Header */}
              <div className="grid grid-cols-5 text-center py-3 px-4" style={{ background: '#EFF6FF', borderBottom: '1px solid #BFDBFE' }}>
                <div />
                {TIERS.map(t => (
                  <div key={t.name} className="text-xs font-bold"
                    style={{ color: t.highlight ? '#3B82F6' : '#0F2D5E' }}>
                    {t.name}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {FEATURE_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className="grid grid-cols-5 items-center py-3 px-4"
                  style={{
                    background: i % 2 === 0 ? '#fff' : '#F8FAFF',
                    borderBottom: i < FEATURE_ROWS.length - 1 ? '1px solid #e2e8f0' : 'none',
                  }}
                >
                  <div className="text-xs font-medium" style={{ color: '#475569' }}>{row.label}</div>
                  {row.tiers.map((val, ti) => (
                    <FeatureCell key={ti} value={val} highlight={ti === 2} />
                  ))}
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
