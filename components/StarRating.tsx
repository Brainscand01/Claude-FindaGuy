interface StarRatingProps {
  rating: number
  count?: number
  size?: 'sm' | 'md'
}

export function StarRating({ rating, count, size = 'sm' }: StarRatingProps) {
  const stars = Math.round(rating * 2) / 2
  const fullStars = Math.floor(stars)
  const hasHalf = stars % 1 !== 0
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center gap-1">
      <span className={textSize} style={{ color: '#D97706' }} aria-label={`${rating} out of 5 stars`}>
        {'★'.repeat(fullStars)}
        {hasHalf ? '½' : ''}
        {'☆'.repeat(emptyStars)}
      </span>
      <span className={`${textSize} font-semibold`} style={{ color: '#0F2D5E' }}>
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className={`${textSize}`} style={{ color: '#94a3b8' }}>
          · {count.toLocaleString()} {count === 1 ? 'review' : 'reviews'}
        </span>
      )}
    </div>
  )
}
