'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { FilterSidebar } from '@/components/FilterSidebar'
import { BusinessCardRow } from '@/components/BusinessCardRow'
import { createClient } from '@/lib/supabase/client'
import type { Business, SearchFilters } from '@/types'

const SORT_OPTIONS = [
  { label: 'Best match', value: 'best_match' },
  { label: 'Highest rated', value: 'highest_rated' },
  { label: 'Most reviews', value: 'most_reviews' },
  { label: 'Nearest', value: 'nearest' },
] as const

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState('')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filters, setFilters] = useState<SearchFilters>({})
  const [sort, setSort] = useState<SearchFilters['sort']>('best_match')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)

  useEffect(() => {
    params.then((p) => setSlug(p.slug))
  }, [params])

  useEffect(() => {
    if (!slug) return
    fetchBusinesses(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, filters, sort])

  async function fetchBusinesses(reset = false) {
    setLoading(true)
    const supabase = createClient()
    const offset = reset ? 0 : page * 20

    let query = supabase
      .from('businesses')
      .select('*', { count: 'exact' })
      .eq('category_slug', slug)
      .range(offset, offset + 19)

    if (filters.suburb) query = query.eq('suburb', filters.suburb)
    if (filters.verified_only) query = query.eq('is_verified', true)
    if (filters.min_rating) query = query.gte('rating_avg', filters.min_rating)
    if (sort === 'highest_rated') query = query.order('rating_avg', { ascending: false })
    else if (sort === 'most_reviews') query = query.order('rating_count', { ascending: false })
    else query = query.order('tier', { ascending: false }).order('rating_avg', { ascending: false })

    const { data, count } = await query
    setBusinesses(reset ? (data as Business[] ?? []) : (prev) => [...prev, ...(data as Business[] ?? [])])
    setTotal(count ?? 0)
    setPage(reset ? 1 : page + 1)
    setLoading(false)
  }

  function removeFilter(key: keyof SearchFilters) {
    setFilters((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  const activeFilterChips = Object.entries(filters).filter(([, v]) => v !== undefined)
  const categoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <>
      <Nav />
      <main className="flex-1 bg-page-bg">
        {/* Page header */}
        <div style={{ background: '#0F2D5E' }} className="px-4 sm:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <ol className="flex items-center gap-1.5">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li aria-hidden="true">›</li>
                <li style={{ color: '#fff' }}>{categoryName}</li>
              </ol>
            </nav>
            <h1 className="font-display font-black text-white text-2xl">
              {categoryName} in Durban
            </h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {total} verified businesses
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(0) }} />

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-sm text-slate-600">
                  Showing <strong>{businesses.length}</strong> of <strong>{total}</strong> {categoryName}
                </span>
                {activeFilterChips.map(([key]) => (
                  <button
                    key={key}
                    onClick={() => removeFilter(key as keyof SearchFilters)}
                    className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors hover:bg-red-50"
                    style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                  >
                    {key.replace(/_/g, ' ')} ✕
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SearchFilters['sort'])}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-navy"
                aria-label="Sort results"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Business list */}
            <div className="space-y-3">
              {loading && businesses.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 h-40 animate-pulse" />
                ))
              ) : businesses.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-4xl mb-3" aria-hidden="true">🔍</div>
                  <p className="text-sm">No businesses found. Try adjusting your filters.</p>
                </div>
              ) : (
                businesses.map((biz, i) => (
                  <BusinessCardRow
                    key={biz.id}
                    business={biz}
                    featured={i === 0 && biz.tier >= 3}
                    position={i + 1}
                  />
                ))
              )}
            </div>

            {/* Load more */}
            {businesses.length < total && !loading && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => fetchBusinesses(false)}
                  className="text-sm font-medium px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-navy hover:text-navy"
                >
                  Load more results ({total - businesses.length} remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
