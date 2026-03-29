'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { BusinessCard } from '@/components/BusinessCard'
import { SearchBar } from '@/components/SearchBar'
import { createClient } from '@/lib/supabase/client'
import type { Business, SearchFilters } from '@/types'

const SORT_OPTIONS = [
  { label: 'Best match',     value: 'best_match'    },
  { label: 'Highest rated',  value: 'highest_rated' },
  { label: 'Most reviews',   value: 'most_reviews'  },
] as const

const MIN_RATINGS = [
  { label: 'Any rating', value: 0 },
  { label: '4★ & up',    value: 4 },
  { label: '4.5★ & up',  value: 4.5 },
]

const CATEGORIES = [
  'Home Services', 'Food & Drink', 'Beauty & Wellness', 'Automotive',
  'Health & Medical', 'Electrical', 'Plumbing', 'Professional Services',
  'Construction & Building', 'Couriers & Delivery', 'Local Makers',
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') ?? ''

  const [results, setResults]     = useState<Business[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [sort, setSort]           = useState<SearchFilters['sort']>('best_match')
  const [suburb, setSuburb]       = useState('')
  const [category, setCategory]   = useState('')
  const [minRating, setMinRating] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const fetchResults = useCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); setTotal(0); return }
    setLoading(true)

    const supabase = createClient()
    let req = supabase
      .from('businesses')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,suburb.ilike.%${query}%`)
      .limit(24)

    if (verifiedOnly)    req = req.eq('is_verified', true)
    if (minRating > 0)   req = req.gte('rating_avg', minRating)
    if (suburb.trim())   req = req.ilike('suburb', `%${suburb}%`)
    if (category)        req = req.eq('category', category)

    if (sort === 'highest_rated') req = req.order('rating_avg', { ascending: false })
    else if (sort === 'most_reviews') req = req.order('rating_count', { ascending: false })
    else req = req.order('tier', { ascending: false }).order('rating_avg', { ascending: false })

    const { data, count } = await req
    setResults((data as Business[]) ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [sort, suburb, category, minRating, verifiedOnly])

  useEffect(() => { fetchResults(q) }, [q, fetchResults])

  function clearFilters() {
    setSuburb(''); setCategory(''); setMinRating(0); setVerifiedOnly(false)
  }

  const hasFilters = suburb || category || minRating > 0 || verifiedOnly

  return (
    <>
      <Nav />
      <main className="flex-1 bg-slate-50 min-h-screen">

        {/* Search header */}
        <div style={{ background: '#0F2D5E' }} className="px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto">
            <SearchBar initialQuery={q} />
            {q && (
              <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {loading ? 'Searching…' : `${total} result${total !== 1 ? 's' : ''} for `}
                {!loading && <strong className="text-white">&ldquo;{q}&rdquo;</strong>}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: showFilters ? '#3B82F6' : '#e2e8f0',
                background: showFilters ? '#EFF6FF' : '#fff',
                color: showFilters ? '#1D4ED8' : '#475569',
              }}
            >
              <SlidersHorizontal size={13} />
              Filters {hasFilters && `(${[suburb,category,minRating>0,verifiedOnly].filter(Boolean).length})`}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-400 hidden sm:block">Sort:</span>
              <div className="flex gap-1">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    style={{
                      background: sort === opt.value ? '#0F2D5E' : '#fff',
                      color: sort === opt.value ? '#fff' : '#64748b',
                      border: `1px solid ${sort === opt.value ? '#0F2D5E' : '#e2e8f0'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 grid sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Suburb</label>
                <input
                  type="text"
                  value={suburb}
                  onChange={e => setSuburb(e.target.value)}
                  placeholder="e.g. Berea"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Min rating</label>
                <select
                  value={minRating}
                  onChange={e => setMinRating(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                >
                  {MIN_RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={e => setVerifiedOnly(e.target.checked)}
                    className="rounded"
                  />
                  Verified only
                </label>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {!q && (
            <div className="text-center py-20">
              <Search size={40} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 text-sm">Type something above to search Durban&apos;s directory</p>
            </div>
          )}

          {q && loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 h-40 animate-pulse" />
              ))}
            </div>
          )}

          {q && !loading && results.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-sm mb-2">No results for <strong>&ldquo;{q}&rdquo;</strong></p>
              <p className="text-xs text-slate-400">Try a different search or remove filters</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((biz) => (
                <BusinessCard key={biz.id} business={biz} featured={biz.tier >= 3} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
