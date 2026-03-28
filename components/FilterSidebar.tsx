'use client'

import type { SearchFilters } from '@/types'

const SUBURBS = ['Berea', 'Umhlanga', 'Pinetown', 'Westville', 'CBD', 'Durban North', 'Morningside', 'Ballito']

interface FilterSidebarProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  function set<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  function clearAll() {
    onChange({})
  }

  return (
    <aside className="w-full md:w-56 flex-shrink-0" aria-label="Search filters">
      <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800">Filters</h2>
          <button
            onClick={clearAll}
            className="text-xs text-sky hover:underline"
          >
            Clear all
          </button>
        </div>

        {/* Location */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Location</h3>
          <div className="flex flex-wrap gap-1.5">
            {SUBURBS.map((suburb) => (
              <button
                key={suburb}
                onClick={() => set('suburb', filters.suburb === suburb ? undefined : suburb)}
                className="text-[10px] px-2 py-1 rounded-full border transition-all"
                style={{
                  background: filters.suburb === suburb ? '#0F2D5E' : '#fff',
                  borderColor: filters.suburb === suburb ? '#0F2D5E' : '#e2e8f0',
                  color: filters.suburb === suburb ? '#fff' : '#475569',
                }}
                aria-pressed={filters.suburb === suburb}
              >
                {suburb}
              </button>
            ))}
          </div>
        </div>

        {/* Min rating */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Min rating</h3>
          <div className="space-y-1.5">
            {[{ label: '4.5+ ⭐', value: 4.5 }, { label: '4.0+', value: 4.0 }, { label: 'Any rating', value: undefined }].map((opt) => (
              <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="min_rating"
                  checked={filters.min_rating === opt.value}
                  onChange={() => set('min_rating', opt.value)}
                  className="accent-navy"
                />
                <span className="text-xs text-slate-600">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Availability</h3>
          <div className="space-y-1.5">
            {[
              { label: 'Open now', key: 'open_now' as const },
              { label: '24/7 emergency', key: 'is_247' as const },
              { label: 'Weekend availability', key: 'weekend_available' as const },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters[opt.key]}
                  onChange={(e) => set(opt.key, e.target.checked || undefined)}
                  className="accent-navy"
                />
                <span className="text-xs text-slate-600">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Trust */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Trust</h3>
          <div className="space-y-1.5">
            {[
              { label: 'Verified only', key: 'verified_only' as const },
              { label: 'Trusted Guy badge', key: 'trusted_guy' as const },
              { label: 'Licensed & insured', key: 'licensed' as const },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters[opt.key]}
                  onChange={(e) => set(opt.key, e.target.checked || undefined)}
                  className="accent-navy"
                />
                <span className="text-xs text-slate-600">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
