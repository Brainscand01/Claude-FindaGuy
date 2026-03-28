import type { MetadataRoute } from 'next'
import { createStaticClient } from '@/lib/supabase/static'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://findaguy.co.za'

const CATEGORY_SLUGS = [
  'home-services', 'food-restaurants', 'beauty-wellness', 'automotive',
  'health-medical', 'electrical', 'plumbing', 'professional-services',
  'construction-building', 'couriers-delivery', 'local-makers',
]

const STATIC_PAGES = [
  { url: '/', priority: 1.0, changeFrequency: 'daily' as const },
  { url: '/blog', priority: 0.7, changeFrequency: 'daily' as const },
  { url: '/auth/login', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/pricing', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/about', priority: 0.4, changeFrequency: 'monthly' as const },
]

export const revalidate = 86400 // 24h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return STATIC_PAGES.map((p) => ({ url: `${SITE_URL}${p.url}`, priority: p.priority, changeFrequency: p.changeFrequency, lastModified: new Date() }))
  }
  const supabase = createStaticClient()

  // Business slugs
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, updated_at')
    .eq('is_verified', true)
    .limit(5000)

  // Blog post slugs
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true)

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.url}`,
    priority: p.priority,
    changeFrequency: p.changeFrequency,
    lastModified: new Date(),
  }))

  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    priority: 0.9,
    changeFrequency: 'daily' as const,
    lastModified: new Date(),
  }))

  const businessEntries: MetadataRoute.Sitemap = (businesses ?? []).map((b) => ({
    url: `${SITE_URL}/business/${b.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
  }))

  const blogEntries: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }))

  return [...staticEntries, ...categoryEntries, ...businessEntries, ...blogEntries]
}
