import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'zziifqfzhgxnlnacctrb.supabase.co' },
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'graph.facebook.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.findaguy.co.za' }],
        destination: 'https://findaguy.co.za/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
