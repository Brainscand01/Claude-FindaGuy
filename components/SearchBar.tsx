'use client'

import { useEffect, useRef } from 'react'
import { Search, Mic } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'

interface SearchBarProps {
  initialQuery?: string
  autoFocus?: boolean
  onSearch?: (q: string) => void
}

export function SearchBar({ initialQuery = '', autoFocus = false, onSearch }: SearchBarProps) {
  const { query, setQuery, submit, startVoice, listening } = useSearch(initialQuery)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && window.innerWidth >= 768) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (onSearch) {
      onSearch(query)
    } else {
      submit(query)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-white rounded-xl px-4 py-1.5"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
      role="search"
      aria-label="Search for local businesses"
    >
      <Search size={16} className="flex-shrink-0 opacity-40 text-navy" aria-hidden="true" />

      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={'Try \u201cplumber in Berea\u201d or \u201cpizza delivery\u201d'}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 text-navy py-2 min-w-0"
        aria-label="Search query"
        autoComplete="off"
      />

      {/* Voice mic */}
      <button
        type="button"
        onClick={startVoice}
        aria-label={listening ? 'Listening…' : 'Search by voice'}
        className="p-2 rounded-lg flex-shrink-0 transition-colors"
        style={{ background: listening ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.12)' }}
      >
        <Mic
          size={14}
          style={{ color: listening ? '#D97706' : '#F59E0B' }}
          aria-hidden="true"
        />
      </button>

      {/* Search button */}
      <button
        type="submit"
        className="text-xs font-medium px-4 py-2 rounded-lg text-white flex-shrink-0 transition-opacity hover:opacity-90"
        style={{ background: '#0F2D5E' }}
      >
        Search
      </button>
    </form>
  )
}
