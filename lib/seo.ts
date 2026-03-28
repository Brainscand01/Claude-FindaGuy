import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://findaguy.co.za'
const SITE_NAME = 'FindaGuy'

export function buildMetadata(overrides: Partial<Metadata> = {}): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — Find Trusted Local Businesses in Durban`,
      template: `%s | ${SITE_NAME}`,
    },
    description:
      "eThekwini's most complete directory of verified local businesses. Find plumbers, electricians, beauty salons, restaurants and more across Durban.",
    keywords: [
      'durban business directory',
      'find plumber durban',
      'local businesses ethekwini',
      'verified tradesman durban',
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      type: 'website',
      locale: 'en_ZA',
      url: SITE_URL,
      siteName: SITE_NAME,
      images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@findaguySA',
    },
    alternates: {
      canonical: SITE_URL,
    },
    other: {
      'geo.region': 'ZA-KZN',
      'geo.placename': 'Durban',
    },
    ...overrides,
  }
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term}`,
    'query-input': 'required name=search_term',
  },
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: ['https://twitter.com/findaguySA'],
  areaServed: {
    '@type': 'City',
    name: 'Durban',
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: 'KwaZulu-Natal',
    },
  },
}

export function buildBusinessSchema(biz: {
  name: string
  description?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  suburb?: string
  website?: string | null
  rating_avg?: number
  rating_count?: number
  logo_url?: string | null
  category?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    description: biz.description ?? undefined,
    telephone: biz.phone ?? undefined,
    email: biz.email ?? undefined,
    url: biz.website ?? undefined,
    image: biz.logo_url ?? undefined,
    address: biz.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: biz.address,
          addressLocality: biz.suburb ?? 'Durban',
          addressRegion: 'KwaZulu-Natal',
          addressCountry: 'ZA',
        }
      : undefined,
    aggregateRating:
      biz.rating_avg && biz.rating_count
        ? {
            '@type': 'AggregateRating',
            ratingValue: biz.rating_avg,
            reviewCount: biz.rating_count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  }
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

export function buildArticleSchema(post: {
  title: string
  excerpt?: string | null
  hero_image?: string | null
  author: string
  published_at?: string | null
  updated_at: string
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.hero_image ?? undefined,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  }
}
