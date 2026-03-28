import Link from 'next/link'
import { StarRating } from './StarRating'
import type { Business } from '@/types'

interface BusinessCardProps {
  business: Business
  featured?: boolean
}

export function BusinessCard({ business, featured }: BusinessCardProps) {
  return (
    <article
      className="bg-white rounded-xl p-4 border transition-shadow hover:shadow-md"
      style={{ borderColor: featured ? '#F59E0B' : '#e2e8f0' }}
      aria-label={`${business.name} — ${business.category} in ${business.suburb}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2.5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: '#EFF6FF' }}
          aria-hidden="true"
        >
          {business.emoji ?? '🏪'}
        </div>
        <div className="flex flex-col gap-1 items-end">
          {business.is_verified && (
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: '#DCFCE7', color: '#166534' }}
            >
              Verified
            </span>
          )}
          {business.tier >= 3 && (
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: '#FFFBEB', color: '#92400E' }}
            >
              Pro
            </span>
          )}
        </div>
      </div>

      {/* Name + category */}
      <Link href={`/business/${business.slug}`} className="block">
        <h3 className="text-sm font-semibold text-slate-800 mb-0.5 hover:text-sky transition-colors">
          {business.name}
        </h3>
      </Link>
      <p className="text-xs text-slate-400 mb-2">
        {business.category} · {business.suburb}
      </p>

      {/* Stars */}
      <div className="mb-2">
        <StarRating rating={business.rating_avg} count={business.rating_count} />
      </div>

      {/* Tags */}
      {business.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {business.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: '#EFF6FF', color: '#1D4ED8' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Response time */}
      {business.response_time_mins !== null && (
        <div
          className="rounded-md px-2.5 py-1.5 text-[10px] font-semibold"
          style={{ background: '#F0FDF4', color: '#166534' }}
        >
          Responds in ~{business.response_time_mins} min
        </div>
      )}
    </article>
  )
}
