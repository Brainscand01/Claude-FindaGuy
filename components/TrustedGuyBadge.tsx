import Image from 'next/image'

interface TrustedGuyBadgeProps {
  size?: number
}

export function TrustedGuyBadge({ size = 32 }: TrustedGuyBadgeProps) {
  return (
    <div title="Trusted Guy — verified and top-rated">
      <Image
        src="/trusted-guy.png"
        alt="Trusted Guy badge"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  )
}
