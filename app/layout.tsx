import type { Metadata } from 'next'
import { Nunito, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { EventTracker } from '@/components/analytics/EventTracker'
import { websiteSchema, organizationSchema } from '@/lib/seo'

const nunito = Nunito({
  weight: ['800', '900'],
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://findaguy.co.za'),
  title: {
    default: 'FindaGuy — Find Trusted Local Businesses in Durban',
    template: '%s | FindaGuy',
  },
  description:
    "eThekwini's most complete directory of verified local businesses. Find plumbers, electricians, beauty salons, restaurants and more across Durban.",
  keywords: [
    'durban business directory',
    'find plumber durban',
    'local businesses ethekwini',
    'verified tradesman durban',
    'findaguy',
  ],
  authors: [{ name: 'FindaGuy' }],
  creator: 'FindaGuy',
  publisher: 'FindaGuy',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://findaguy.co.za',
    siteName: 'FindaGuy',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@findaguySA',
  },
  other: {
    'geo.region': 'ZA-KZN',
    'geo.placename': 'Durban',
    'geo.position': '-29.8587;31.0218',
    'ICBM': '-29.8587, 31.0218',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-ZA"
      className={`${nunito.variable} ${jakarta.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <EventTracker />
        {children}
      </body>
    </html>
  )
}
