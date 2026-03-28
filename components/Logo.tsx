import Image from 'next/image'

interface LogoProps {
  variant?: 'full' | 'white' | 'icon'
  size?: number
}

export function Logo({ variant = 'full', size = 28 }: LogoProps) {
  const src =
    variant === 'white'
      ? '/logo-white.png'
      : variant === 'icon'
      ? '/logo-icon.png'
      : '/logo.png'

  return (
    <div className="flex items-center gap-2">
      <Image
        src={src}
        alt="FindaGuy logo"
        width={size}
        height={size}
        className="object-contain"
        onError={() => {}} // graceful — falls back to text wordmark via CSS
        priority
      />
      {/* Text wordmark fallback — shown when PNG not available */}
      <span
        className="font-display font-black text-base leading-none select-none"
        aria-hidden="true"
        style={{ display: 'none' }}
      >
        <span style={{ color: variant === 'white' ? '#fff' : '#0F2D5E' }}>finda</span>
        <span style={{ color: '#F59E0B' }}>guy</span>
      </span>
    </div>
  )
}

/** Inline SVG logo icon (no network request) */
export function LogoIcon({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-md flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: '#F59E0B' }}
    >
      <svg width={size * 0.57} height={size * 0.57} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1.5" transform="rotate(45 6 3)" fill="white" opacity="0.9" />
        <rect x="5" y="1" width="6" height="6" rx="1.5" transform="rotate(45 10 3)" fill="#0F2D5E" />
      </svg>
    </div>
  )
}

/** Text wordmark "finda[guy]" */
export function LogoWordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="font-display font-black text-base leading-none select-none">
      <span style={{ color: light ? '#fff' : '#0F2D5E' }}>finda</span>
      <span style={{ color: '#F59E0B' }}>guy</span>
    </span>
  )
}
