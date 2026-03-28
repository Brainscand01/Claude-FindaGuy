import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import type { BlogPost, Business } from '@/types'
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data as BlogPost | null
}

async function getRelatedBusinesses(categorySlug: string, suburb?: string): Promise<Business[]> {
  const supabase = await createClient()
  let q = supabase.from('businesses').select('*').eq('category_slug', categorySlug).eq('is_verified', true).limit(3)
  if (suburb) q = q.eq('suburb', suburb)
  const { data } = await q
  return (data as Business[]) ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.hero_image ? [{ url: post.hero_image }] : [],
      type: 'article',
    },
  }
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const supabase = createStaticClient()
  const { data } = await supabase.from('blog_posts').select('slug').eq('is_published', true)
  return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }))
}

export const revalidate = 3600

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const related = post.related_category_slug
    ? await getRelatedBusinesses(post.related_category_slug, post.related_suburb ?? undefined)
    : []

  const articleSchema = buildArticleSchema(post)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Nav />
      <main className="flex-1 bg-page-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs mb-6 text-slate-400">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-navy">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href="/blog" className="hover:text-navy">Blog</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-slate-600 truncate max-w-xs">{post.title}</li>
            </ol>
          </nav>

          {/* Hero image */}
          {post.hero_image && (
            <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-8">
              <Image src={post.hero_image} alt={post.title} fill className="object-cover" priority />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.category && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                style={{ background: '#EFF6FF', color: '#1D4ED8' }}
              >
                {post.category.replace(/-/g, ' ')}
              </span>
            )}
            <span className="text-xs text-slate-400">{post.read_time_mins} min read</span>
            <span className="text-xs text-slate-400">By {post.author}</span>
            {post.published_at && (
              <time dateTime={post.published_at} className="text-xs text-slate-400">
                {new Date(post.published_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display font-black text-navy text-3xl leading-tight mb-6">{post.title}</h1>

          {/* Content */}
          {post.content && (
            <div
              className="prose prose-sm max-w-none text-slate-700 leading-relaxed mb-10"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {/* Related businesses */}
          {related.length > 0 && (
            <section className="border-t border-slate-200 pt-8 mb-8">
              <h2 className="font-display font-black text-navy text-lg mb-4">
                Find a {post.related_category_slug?.replace(/-/g, ' ')} near you
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {related.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.slug}`}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow block"
                  >
                    <div className="text-2xl mb-1.5" aria-hidden="true">{biz.emoji ?? '🏪'}</div>
                    <h3 className="text-xs font-semibold text-navy mb-0.5">{biz.name}</h3>
                    <p className="text-[10px] text-slate-400">{biz.suburb} · {biz.rating_avg}★</p>
                  </Link>
                ))}
              </div>
              {post.related_category_slug && (
                <Link
                  href={`/category/${post.related_category_slug}`}
                  className="inline-block mt-4 text-xs font-medium"
                  style={{ color: '#3B82F6' }}
                >
                  View all → {post.related_category_slug.replace(/-/g, ' ')} businesses in Durban
                </Link>
              )}
            </section>
          )}

          {/* Back to blog */}
          <Link href="/blog" className="text-xs font-medium" style={{ color: '#3B82F6' }}>
            ← Back to blog
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
