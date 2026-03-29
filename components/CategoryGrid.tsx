'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import {
  Home, UtensilsCrossed, Scissors, Car, HeartPulse, Zap,
  Droplets, Briefcase, HardHat, Package, ShoppingBag, LayoutGrid,
  type LucideIcon,
} from 'lucide-react'

const CATEGORIES = [
  {
    slug: 'home-services',
    name: 'Home services',
    icon: Home,
    iconBg: '#EFF6FF',
    iconColor: '#3B82F6',
    count: 342,
    subcategories: [
      { name: 'Plumbing', slug: 'plumbing' },
      { name: 'Electrical', slug: 'electrical' },
      { name: 'Cleaning', slug: 'cleaning-services' },
      { name: 'Painting & waterproofing', slug: 'painting' },
      { name: 'Air conditioning & HVAC', slug: 'hvac' },
      { name: 'Glass & aluminium', slug: 'glass-aluminium' },
      { name: 'Landscaping & garden', slug: 'landscaping-garden' },
    ],
  },
  {
    slug: 'food-restaurants',
    name: 'Food & drink',
    icon: UtensilsCrossed,
    iconBg: '#FFF7ED',
    iconColor: '#F97316',
    count: 496,
    subcategories: [
      { name: 'Restaurants', slug: 'restaurants' },
      { name: 'Takeaways', slug: 'takeaways' },
      { name: 'Home bakers', slug: 'home-bakers' },
      { name: 'Catering & events', slug: 'catering-events' },
      { name: 'Cafés', slug: 'cafes' },
      { name: 'Bars & pubs', slug: 'bars-pubs' },
    ],
  },
  {
    slug: 'beauty-wellness',
    name: 'Beauty',
    icon: Scissors,
    iconBg: '#FDF2F8',
    iconColor: '#EC4899',
    count: 218,
    subcategories: [
      { name: 'Hair salons', slug: 'hair-salons' },
      { name: 'Nails & lashes', slug: 'nails-lashes' },
      { name: 'Massage & spa', slug: 'massage-spa' },
      { name: 'Barbers', slug: 'barbers' },
      { name: 'Skincare', slug: 'skincare' },
      { name: 'Fitness & personal training', slug: 'fitness' },
    ],
  },
  {
    slug: 'automotive',
    name: 'Automotive',
    icon: Car,
    iconBg: '#F1F5F9',
    iconColor: '#475569',
    count: 187,
    subcategories: [
      { name: 'Mechanics', slug: 'mechanics' },
      { name: 'Panel beaters', slug: 'panel-beaters' },
      { name: 'Tyres & exhausts', slug: 'tyres' },
      { name: 'Car wash & valet', slug: 'car-wash' },
      { name: 'Couriers & delivery', slug: 'couriers' },
      { name: 'Logistics & freight', slug: 'logistics' },
    ],
  },
  {
    slug: 'health-medical',
    name: 'Health',
    icon: HeartPulse,
    iconBg: '#FFF1F2',
    iconColor: '#F43F5E',
    count: 156,
    subcategories: [
      { name: 'Doctors & GPs', slug: 'doctors' },
      { name: 'Dentists', slug: 'dentists' },
      { name: 'Optometrists', slug: 'optometrists' },
      { name: 'Pharmacies', slug: 'pharmacies' },
      { name: 'Alternative health', slug: 'alternative-health' },
      { name: 'Specialists & therapy', slug: 'specialists' },
    ],
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    icon: Zap,
    iconBg: '#FFFBEB',
    iconColor: '#F59E0B',
    count: 124,
    subcategories: [
      { name: 'Residential', slug: 'residential-electrical' },
      { name: 'Commercial', slug: 'commercial-electrical' },
      { name: 'Solar & inverters', slug: 'solar' },
      { name: 'COC certificates', slug: 'coc' },
      { name: 'Appliance repairs', slug: 'appliance-repairs' },
    ],
  },
  {
    slug: 'plumbing',
    name: 'Plumbing',
    icon: Droplets,
    iconBg: '#EFF6FF',
    iconColor: '#0EA5E9',
    count: 76,
    subcategories: [
      { name: 'Emergency plumbing', slug: 'emergency-plumbing' },
      { name: 'Geyser repairs', slug: 'geyser' },
      { name: 'Drain blockages', slug: 'drains' },
      { name: 'New installations', slug: 'plumbing-installations' },
      { name: 'Pipe repairs', slug: 'pipe-repairs' },
    ],
  },
  {
    slug: 'professional-services',
    name: 'Professional',
    icon: Briefcase,
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    count: 289,
    subcategories: [
      { name: 'Accounting & tax', slug: 'accounting' },
      { name: 'Legal services', slug: 'legal' },
      { name: 'Financial services', slug: 'financial' },
      { name: 'Technology & IT', slug: 'technology-it' },
      { name: 'Marketing & advertising', slug: 'marketing' },
      { name: 'Education & tutoring', slug: 'education-tutoring' },
    ],
  },
  {
    slug: 'construction-building',
    name: 'Construction',
    icon: HardHat,
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    count: 203,
    subcategories: [
      { name: 'Residential builds', slug: 'residential-builds' },
      { name: 'Renovations', slug: 'renovations' },
      { name: 'Commercial construction', slug: 'commercial-construction' },
      { name: 'Roofing', slug: 'roofing' },
      { name: 'Engineering & fabrication', slug: 'engineering' },
    ],
  },
  {
    slug: 'couriers-delivery',
    name: 'Couriers',
    icon: Package,
    iconBg: '#FAF5FF',
    iconColor: '#9333EA',
    count: 67,
    subcategories: [
      { name: 'Same-day delivery', slug: 'same-day' },
      { name: 'Freight & logistics', slug: 'freight' },
      { name: 'Motorcycle couriers', slug: 'moto-couriers' },
      { name: 'Parcel drops', slug: 'parcel' },
    ],
  },
  {
    slug: 'local-makers',
    name: 'Local Makers',
    icon: ShoppingBag,
    iconBg: '#FFFBEB',
    iconColor: '#D97706',
    count: 134,
    isSpecial: true,
    badge: 'NEW',
    subcategories: [
      { name: 'Online shops & e-commerce', slug: 'online-shops' },
      { name: 'Handmade & crafts', slug: 'handmade-crafts' },
      { name: 'Fashion & clothing', slug: 'fashion' },
      { name: 'Home bakers & food makers', slug: 'home-food' },
      { name: 'Digital services & design', slug: 'digital-design' },
      { name: 'Coaching & online courses', slug: 'coaching' },
      { name: 'Dropshipping & resellers', slug: 'resellers' },
      { name: 'Social media & influencers', slug: 'influencers' },
    ],
  },
]

type Category = {
  slug: string
  name: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  count: number
  isSpecial?: boolean
  badge?: string
  subcategories: { name: string; slug: string }[]
}

interface TileProps {
  cat: Category
  index: number
  total: number
}

function CategoryTile({ cat, index, total }: TileProps) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Popover horizontal alignment
  const col = index % 6
  let popoverAlign = 'left-0'
  if (col >= 2 && col <= 4) popoverAlign = 'left-1/2 -translate-x-1/2'
  if (col === 5 || index === total - 1 || index === total - 2) popoverAlign = 'right-0'

  const isSpecial = cat.isSpecial

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearTimeout(timerRef.current)
        setOpen(true)
        trackEvent('category_hover', { slug: cat.slug })
      }}
      onMouseLeave={() => {
        timerRef.current = setTimeout(() => setOpen(false), 120)
      }}
    >
      <Link
        href={`/category/${cat.slug}`}
        onClick={() => trackEvent('category_click', { slug: cat.slug })}
        className="block rounded-xl p-4 text-center cursor-pointer transition-all border"
        style={{
          background: isSpecial ? '#FFFBEB' : '#fff',
          borderColor: isSpecial ? '#FDE68A' : '#e2e8f0',
        }}
        aria-label={`${cat.name} — ${cat.count} listings`}
      >
        {cat.badge && (
          <span
            className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white z-10"
            style={{ background: '#F59E0B' }}
          >
            {cat.badge}
          </span>
        )}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-2"
          style={{ background: cat.iconBg }}
          aria-hidden="true"
        >
          <cat.icon size={20} strokeWidth={1.75} color={cat.iconColor} />
        </div>
        <div className="text-xs font-semibold leading-tight" style={{ color: '#0F2D5E' }}>
          {cat.name}
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>
          {cat.count} listings
        </div>
      </Link>

      {/* Hover popover — desktop only */}
      {open && (
        <div
          className={`absolute top-[calc(100%+6px)] z-50 bg-white rounded-xl border border-slate-200 shadow-lg p-2.5 min-w-[185px] hidden-touch ${popoverAlign}`}
          style={{ display: 'block' }}
          onMouseEnter={() => clearTimeout(timerRef.current)}
          onMouseLeave={() => {
            timerRef.current = setTimeout(() => setOpen(false), 120)
          }}
        >
          {/* Arrow notch */}
          <div
            className="absolute -top-1.5 left-4 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45"
            style={col >= 2 && col <= 4 ? { left: '50%', transform: 'translateX(-50%) rotate(45deg)' } : col === 5 ? { left: 'auto', right: '12px' } : {}}
          />
          <ul className="space-y-0.5" role="list">
            {cat.subcategories.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={`/category/${sub.slug}`}
                  onClick={() => {
                    trackEvent('category_click', { slug: sub.slug, parent: cat.slug, source: 'popover' })
                    setOpen(false)
                  }}
                  className="block px-2 py-1 text-xs rounded-md transition-colors hover:bg-slate-50"
                  style={{ color: '#334155' }}
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`/category/${cat.slug}`}
            className="block mt-1.5 pt-1.5 border-t border-slate-100 px-2 text-xs font-medium"
            style={{ color: '#3B82F6' }}
          >
            View all {cat.count} →
          </Link>
        </div>
      )}
    </div>
  )
}

export function CategoryGrid() {
  return (
    <section className="bg-page-bg py-8 px-4 sm:px-6" aria-label="Browse by category">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display font-black text-lg text-navy mb-1">Browse by category</h2>
        <p className="text-sm mb-5" style={{ color: '#64748b' }}>
          Hover a category to explore — click to browse all listings
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {CATEGORIES.map((cat, i) => (
            <CategoryTile key={cat.slug} cat={cat} index={i} total={CATEGORIES.length + 1} />
          ))}

          {/* View All tile */}
          <Link
            href="/category/all"
            className="rounded-xl p-4 text-center cursor-pointer transition-all border block"
            style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}
            aria-label="View all categories"
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: '#EFF6FF' }} aria-hidden="true">
              <LayoutGrid size={20} strokeWidth={1.75} color="#3B82F6" />
            </div>
            <div className="text-xs font-semibold" style={{ color: '#3B82F6' }}>View All</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>All categories</div>
          </Link>
        </div>
      </div>
    </section>
  )
}
