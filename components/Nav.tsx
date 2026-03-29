'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogoIcon, LogoWordmark } from './Logo'
import { useAuth } from '@/hooks/useAuth'

export function Nav({ dark = false }: { dark?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Dark mode: always stay dark (business section pages)
  const isLight = !dark && scrolled

  return (
    <header
      className="sticky top-0 z-50 h-16 transition-all duration-200"
      style={{
        background: isLight ? '#fff' : dark && scrolled ? '#0A1628' : '#0F2D5E',
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.12)' : 'none',
        borderBottom: dark && scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="FindaGuy home">
          <LogoIcon size={28} onDark={!isLight} />
          <LogoWordmark light={!isLight} />
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-xs font-medium transition-colors"
                style={{ color: isLight ? '#0F2D5E' : 'rgba(255,255,255,0.7)' }}
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-xs transition-colors"
                style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs transition-colors"
              style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
            >
              Sign in
            </Link>
          )}
          <Link
            href="/pricing"
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            style={{ background: '#F59E0B', color: '#fff' }}
          >
            List my business
          </Link>
        </div>
      </nav>
    </header>
  )
}
