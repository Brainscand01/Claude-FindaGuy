import Link from 'next/link'
import {
  ShoppingCart, Palette, Shirt, ChefHat,
  Paintbrush2, Users, Package, GraduationCap,
} from 'lucide-react'

const SUBCATEGORIES = [
  { name: 'Online shops & e-commerce', slug: 'online-shops',      icon: ShoppingCart, color: '#6366F1' },
  { name: 'Handmade & crafts',         slug: 'handmade-crafts',   icon: Palette,      color: '#EC4899' },
  { name: 'Fashion & clothing',        slug: 'fashion',           icon: Shirt,        color: '#3B82F6' },
  { name: 'Home bakers & food makers', slug: 'home-food',         icon: ChefHat,      color: '#F97316' },
  { name: 'Digital services & design', slug: 'digital-design',    icon: Paintbrush2,  color: '#8B5CF6' },
  { name: 'Social media & influencers',slug: 'influencers',       icon: Users,        color: '#0EA5E9' },
  { name: 'Dropshipping & resellers',  slug: 'resellers',         icon: Package,      color: '#D97706' },
  { name: 'Coaching & online courses', slug: 'coaching',          icon: GraduationCap,color: '#16A34A' },
]

export function LocalMakersCard() {
  return (
    <section className="py-8 px-4 sm:px-6 bg-page-bg" aria-label="Local Makers & Digital Marketplace">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{ border: '1.5px solid #FDE68A', background: '#FFFDF5' }}
        >
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#94a3b8' }}>
                Online Businesses &amp; Digital Marketplace
              </p>
              <h2 className="font-display font-black text-xl" style={{ color: '#0F2D5E' }}>
                Local Makers
              </h2>
            </div>
          </div>

          {/* Subcategory grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {SUBCATEGORIES.map(({ name, slug, icon: Icon, color }) => (
              <Link
                key={slug}
                href={`/category/${slug}`}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}14` }}
                >
                  <Icon size={16} strokeWidth={1.75} color={color} />
                </div>
                <span className="text-xs font-medium leading-snug" style={{ color: '#334155' }}>
                  {name}
                </span>
              </Link>
            ))}
          </div>

          {/* Divider + description */}
          <div className="pt-5" style={{ borderTop: '1px solid #FDE68A' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
              This vertical gives every digital-first SA entrepreneur a verified, searchable home — local, trusted, and community-backed.{' '}
              <span style={{ color: '#0F2D5E' }} className="font-medium">
                Businesses on Growth tier+ can sell directly through their FindaGuy storefront.
              </span>
            </p>
            <Link
              href="/category/local-makers"
              className="inline-flex items-center gap-1 mt-3 text-xs font-semibold"
              style={{ color: '#D97706' }}
            >
              Explore Local Makers →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
