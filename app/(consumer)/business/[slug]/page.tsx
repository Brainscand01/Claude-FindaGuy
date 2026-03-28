import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Phone, MessageCircle, Globe, MapPin, Share2, Flag } from 'lucide-react'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { StarRating } from '@/components/StarRating'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import type { Business, Review } from '@/types'
import { buildBusinessSchema, buildBreadcrumbSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

async function getBusiness(slug: string): Promise<Business | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()
  return data as Business | null
}

async function getReviews(businessId: string): Promise<Review[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(10)
  return (data as Review[]) ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const biz = await getBusiness(slug)
  if (!biz) return {}

  const title = `${biz.name} — ${biz.category} in ${biz.suburb}`
  const description =
    biz.meta_description ??
    `${biz.name} is a verified ${biz.category} in ${biz.suburb}, Durban. ${biz.rating_avg}★ rating from ${biz.rating_count} reviews.${biz.phone ? ` Call ${biz.phone} or WhatsApp now.` : ''}`

  return {
    title,
    description,
    alternates: { canonical: `/business/${slug}` },
    openGraph: {
      title: biz.name,
      description,
      images: [{ url: biz.cover_url ?? '/og-default.png' }],
    },
  }
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('businesses')
    .select('slug')
    .gte('tier', 2)
    .limit(200)
  return (data ?? []).map((b: { slug: string }) => ({ slug: b.slug }))
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export default async function BusinessProfilePage({ params }: Props) {
  const { slug } = await params
  const biz = await getBusiness(slug)
  if (!biz) notFound()

  const reviews = await getReviews(biz.id)
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  const businessSchema = buildBusinessSchema(biz)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: biz.category, url: `/category/${biz.category_slug}` },
    { name: biz.name, url: `/business/${biz.slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Nav />
      <main className="flex-1 bg-page-bg">
        {/* Hero */}
        <div
          className="px-4 sm:px-6 py-10"
          style={{
            background: biz.cover_url
              ? `linear-gradient(to bottom, rgba(15,45,94,0.7), rgba(15,45,94,0.9)), url(${biz.cover_url}) center/cover`
              : 'linear-gradient(160deg, #0F2D5E, #1a3d7a)',
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <ol className="flex items-center gap-1.5">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li aria-hidden="true">›</li>
                <li><Link href={`/category/${biz.category_slug}`} className="hover:text-white">{biz.category}</Link></li>
                <li aria-hidden="true">›</li>
                <li style={{ color: '#fff' }}>{biz.name}</li>
              </ol>
            </nav>

            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                aria-hidden="true"
              >
                {biz.emoji ?? '🏪'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-display font-black text-white text-2xl">{biz.name}</h1>
                  {biz.is_verified && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#166534' }}>
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {biz.category} · {biz.suburb}
                </p>
                <StarRating rating={biz.rating_avg} count={biz.rating_count} size="md" />
              </div>
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap gap-2 mt-5">
              {biz.phone && (
                <a
                  href={`tel:${biz.phone}`}
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
                  style={{ background: '#0F2D5E', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <Phone size={14} aria-hidden="true" /> Call
                </a>
              )}
              {biz.whatsapp && (
                <a
                  href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <MessageCircle size={14} aria-hidden="true" /> WhatsApp
                </a>
              )}
              {biz.website && (
                <a
                  href={biz.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-white text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Globe size={14} aria-hidden="true" /> Website
                </a>
              )}
              {biz.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(biz.address + ', Durban')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-white text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <MapPin size={14} aria-hidden="true" /> Directions
                </a>
              )}
              <button
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-white text-slate-700 transition-colors hover:bg-slate-50"
                aria-label="Share this business"
              >
                <Share2 size={14} aria-hidden="true" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* About */}
            {biz.description && (
              <section className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-display font-black text-navy text-base mb-3">About</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{biz.description}</p>
              </section>
            )}

            {/* Services */}
            {biz.tags.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-display font-black text-navy text-base mb-3">Services</h2>
                <div className="flex flex-wrap gap-2">
                  {biz.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-3 py-1 rounded-full"
                      style={{ background: '#EFF6FF', color: '#1D4ED8' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-black text-navy text-base">
                  Reviews ({biz.rating_count})
                </h2>
                <button
                  className="text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ background: '#0F2D5E' }}
                >
                  Write a review
                </button>
              </div>

              {reviews.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No reviews yet — be the first!</p>
              ) : (
                <ul className="divide-y divide-slate-100 space-y-4" aria-label="Customer reviews">
                  {reviews.map((review) => (
                    <li key={review.id} className="pt-4 first:pt-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700">{review.author_name}</span>
                        <span className="text-xs" style={{ color: '#D97706' }}>{'★'.repeat(review.rating)}</span>
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {new Date(review.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {review.body && <p className="text-xs text-slate-600 leading-relaxed">{review.body}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">
            {/* Contact card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-display font-black text-navy text-sm mb-3">Contact</h2>
              <dl className="space-y-2 text-xs">
                {biz.phone && (
                  <div className="flex gap-2">
                    <dt className="text-slate-400 w-16 flex-shrink-0">Phone</dt>
                    <dd><a href={`tel:${biz.phone}`} className="text-sky hover:underline">{biz.phone}</a></dd>
                  </div>
                )}
                {biz.whatsapp && (
                  <div className="flex gap-2">
                    <dt className="text-slate-400 w-16 flex-shrink-0">WhatsApp</dt>
                    <dd><a href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sky hover:underline">{biz.whatsapp}</a></dd>
                  </div>
                )}
                {biz.email && (
                  <div className="flex gap-2">
                    <dt className="text-slate-400 w-16 flex-shrink-0">Email</dt>
                    <dd><a href={`mailto:${biz.email}`} className="text-sky hover:underline truncate block max-w-[160px]">{biz.email}</a></dd>
                  </div>
                )}
                {biz.website && (
                  <div className="flex gap-2">
                    <dt className="text-slate-400 w-16 flex-shrink-0">Website</dt>
                    <dd><a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-sky hover:underline truncate block max-w-[160px]">{biz.website.replace(/^https?:\/\//, '')}</a></dd>
                  </div>
                )}
                {biz.address && (
                  <div className="flex gap-2">
                    <dt className="text-slate-400 w-16 flex-shrink-0">Address</dt>
                    <dd className="text-slate-700">{biz.address}, {biz.suburb}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Hours */}
            {biz.hours && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-display font-black text-navy text-sm mb-3">Business hours</h2>
                <ul className="space-y-1.5">
                  {DAYS.map((day) => {
                    const h = biz.hours![day]
                    const isToday = day === today
                    return (
                      <li
                        key={day}
                        className="flex justify-between text-xs"
                        style={{
                          fontWeight: isToday ? 600 : 400,
                          color: isToday ? '#0F2D5E' : '#64748b',
                        }}
                      >
                        <span className="capitalize">{day}</span>
                        <span>{h?.closed ? 'Closed' : h ? `${h.open} – ${h.close}` : '—'}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Unclaimed CTA */}
            {!biz.is_claimed && (
              <div
                className="rounded-xl p-5"
                style={{ border: '1.5px solid #F59E0B', background: '#FFFBEB' }}
              >
                <h3 className="font-display font-black text-navy text-sm mb-1">Is this your business?</h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Claim it for free and take control of how customers find you.
                </p>
                <Link
                  href={`/claim/${biz.id}`}
                  className="block text-center text-xs font-semibold px-3 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ background: '#F59E0B' }}
                >
                  Claim this listing →
                </Link>
              </div>
            )}

            {/* Report */}
            <button
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors w-full justify-center"
            >
              <Flag size={12} aria-hidden="true" /> Report this listing
            </button>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
