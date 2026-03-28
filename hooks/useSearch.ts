'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [listening, setListening] = useState(false)
  const router = useRouter()

  const submit = useCallback(
    (q: string) => {
      const trimmed = q.trim()
      if (!trimmed) return
      trackEvent('search', { query: trimmed })
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    },
    [router]
  )

  const startVoice = useCallback(() => {
    if (typeof window === 'undefined') return
    const w = window as unknown as Record<string, unknown>
    const SR = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => {
      lang: string
      interimResults: boolean
      start(): void
      onresult: ((e: { results: { [0]: { [0]: { transcript: string } } } }) => void) | null
      onerror: (() => void) | null
      onend: (() => void) | null
    }) | undefined
    if (!SR) return

    const recognition = new SR()
    recognition.lang = 'en-ZA'
    recognition.interimResults = false

    setListening(true)
    recognition.start()

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setQuery(transcript)
      setListening(false)
      submit(transcript)
    }

    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
  }, [submit])

  return { query, setQuery, submit, startVoice, listening }
}
