import Link from 'next/link'
import { Phone, MessageCircle, Globe, MapPin } from 'lucide-react'
import { StarRating } from './StarRating'
import type { Business } from '@/types'
import { trackEvent } from '@/lib/analytics'

interface BusinessCardRowProps {
  business: Business
  featured?: boolean
  position?: number
}

export function BusinessCardRow({ business, featured, position }: BusinessCardRowProps) {
  return (
    <article
      className="bg-white rounded-xl p-4 border relative transition-shadow hover:shadow-md"
      style={{ borderColor: featured ? '#F59E0B' : '#e2e8f0' }}
      aria-label={`${business.name} — ${business.category} in ${business.suburb}`}
    >
      {featured && (
        <span
          className="absolute -top-px left-4 text-[9px] font-bold px-2 py-0.5 rounded-b-md text-white"
          style={{ background: '#F59E0B' }}
        >
          Featured
        </span>
      )}

      <div className="flex gap-4 items-start">
        {/* Logo/emoji */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: '#EFF6FF' }}
          aria-hidden="true"
        >
          {business.emoji ?? '🏪'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <Link href={`/business/${business.slug}`}>
              <h3 className="text-sm font-semibold text-slate-800 hover:text-sky transition-colors">
                {business.name}
              </h3>
            </Link>
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

          {/* Address + status */}
          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
            <MapPin size={10} aria-hidden="true" />
            {business.suburb}
            {business.open_now !== null && (
              <span
                className="ml-1 font-semibold"
                style={{ color: business.open_now ? '#22C55E' : '#ef4444' }}
              >
                · {business.open_now ? 'Open now' : 'Closed'}
              </span>
            )}
          </p>

          {/* Stars + response */}
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={business.rating_avg} count={business.rating_count} />
            {business.response_time_mins !== null && (
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: '#F0FDF4', color: '#166534' }}
              >
                ~{business.response_time_mins} min
              </span>
            )}
          </div>

          {/* Description */}
          {business.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{business.description}</p>
          )}

          {/* Tags */}
          {business.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {business.tags.slice(0, 4).map((tag) => (
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

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/business/${business.slug}`}
              onClick={() => trackEvent('business_card_click', { id: business.id, position, source: 'category' })}
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ background: '#0F2D5E' }}
            >
              View profile
            </Link>
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                onClick={() => trackEvent('call_click', {}, business.id)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 transition-colors hover:border-slate-300 flex items-center gap-1"
              >
                <Phone size={11} aria-hidden="true" /> Call
              </a>
            )}
            {business.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                onClick={() => trackEvent('whatsapp_click', {}, business.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-white flex items-center gap-1 transition-opacity hover:opacity-90"
                style={{ background: '#25D366' }}
              >
                <MessageCircle size={11} aria-hidden="true" /> WhatsApp
              </a>
            )}
            {business.website && (
              <a
                href={business.website}
                onClick={() => trackEvent('website_click', {}, business.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 transition-colors hover:border-slate-300 flex items-center gap-1"
              >
                <Globe size={11} aria-hidden="true" /> Website
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
