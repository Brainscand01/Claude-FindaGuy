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

/** Logo icon — white background capsule ensures visibility on both dark and light navbars */
export function LogoIcon({ size = 28, onDark = false }: { size?: number; onDark?: boolean }) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 rounded-lg overflow-hidden"
      style={{
        width: size,
        height: size,
        background: onDark ? '#ffffff' : 'transparent',
        padding: onDark ? 2 : 0,
      }}
    >
      <Image
        src="/logo-icon.png"
        alt="FindaGuy"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
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
