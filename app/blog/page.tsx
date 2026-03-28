import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Nav } from '@/components/Nav'

export const dynamic = 'force-dynamic'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import type { BlogPost } from '@/types'

export const metadata: Metadata = {
  title: 'FindaGuy Blog — Local Business Tips & Durban Guides',
  description:
    'Expert advice for finding trusted local services in Durban. Business tips, local guides, maker stories and industry news.',
  alternates: { canonical: '/blog' },
}

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Home Services', value: 'home-services' },
  { label: 'Business Tips', value: 'business-tips' },
  { label: 'Durban Local', value: 'durban-local' },
  { label: 'Maker Stories', value: 'maker-stories' },
  { label: 'Industry News', value: 'industry-news' },
]

async function getPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(24)
  return (data as BlogPost[]) ?? []
}

export default async function BlogIndexPage() {
  const posts = await getPosts()

  return (
    <>
      <Nav />
      <main className="flex-1 bg-page-bg">
        {/* Header */}
        <div style={{ background: '#0F2D5E' }} className="px-4 sm:px-6 py-10 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display font-black text-white text-3xl mb-2">FindaGuy Blog</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Local business guides, Durban tips, and stories from eThekwini&apos;s maker community
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Blog categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                role="tab"
                className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
                style={{ background: !cat.value ? '#0F2D5E' : '#fff', borderColor: !cat.value ? '#0F2D5E' : '#e2e8f0', color: !cat.value ? '#fff' : '#475569' }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Post grid */}
          {posts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">Posts coming soon. Check back shortly!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {post.hero_image && (
                    <div className="relative h-44">
                      <Image
                        src={post.hero_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: '#EFF6FF', color: '#1D4ED8' }}
                      >
                        {post.category?.replace(/-/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">{post.read_time_mins} min read</span>
                    </div>
                    <h2 className="font-display font-black text-navy text-sm leading-snug mb-1.5">
                      <Link href={`/blog/${post.slug}`} className="hover:text-sky transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{post.author}</span>
                      {post.published_at && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(post.published_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
