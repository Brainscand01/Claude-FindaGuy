import Link from 'next/link'
import { LogoIcon, LogoWordmark } from './Logo'

const links = [
  { label: 'About', href: '/about' },
  { label: 'For Business', href: '/auth/login?intent=list' },
  { label: 'Blog', href: '/blog' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
]

export function Footer() {
  return (
    <footer style={{ background: '#0A1628' }} className="mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap gap-4 items-center justify-between">
        {/* Logo + domain */}
        <div className="flex items-center gap-2">
          <LogoIcon size={22} />
          <LogoWordmark light />
          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            · findaguy.co.za
          </span>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-xs transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Copyright */}
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} FindaGuy · Durban, South Africa
        </p>
      </div>
    </footer>
  )
}
