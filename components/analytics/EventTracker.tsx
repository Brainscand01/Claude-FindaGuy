'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

export function EventTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string>('')
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const scrollMarks = useRef(new Set<number>())

  // Page view on route change
  useEffect(() => {
    if (pathname === lastPath.current) return
    lastPath.current = pathname
    trackEvent('page_view', { page: pathname })
    scrollMarks.current.clear()
  }, [pathname])

  // Scroll depth tracker
  useEffect(() => {
    function onScroll() {
      const scrollPct = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
      )
      for (const mark of [25, 50, 75, 100]) {
        if (scrollPct >= mark && !scrollMarks.current.has(mark)) {
          scrollMarks.current.add(mark)
          trackEvent('scroll_depth', { depth: mark, page: pathname })
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  // Idle / hang detection (10s no interaction)
  useEffect(() => {
    function resetIdle() {
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        trackEvent('hang', { page: pathname })
      }, 10_000)
    }
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }))
    resetIdle()
    return () => {
      clearTimeout(idleTimer.current)
      events.forEach((e) => window.removeEventListener(e, resetIdle))
    }
  }, [pathname])

  // Drop-off / unload before conversion
  useEffect(() => {
    function onUnload() {
      trackEvent('drop_off', { page: pathname })
    }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [pathname])

  // Rage click detector
  useEffect(() => {
    const clicks: { el: EventTarget | null; time: number }[] = []

    function onClick(e: MouseEvent) {
      const now = Date.now()
      clicks.push({ el: e.target, time: now })
      // Keep last 3 clicks within 600ms on same element
      const recent = clicks.filter((c) => now - c.time < 600 && c.el === e.target)
      if (recent.length >= 3) {
        trackEvent('rage_click', {
          page: pathname,
          element: (e.target as HTMLElement)?.tagName,
        })
        clicks.length = 0
      }
      // Prune old clicks
      while (clicks.length && now - clicks[0].time > 2000) clicks.shift()
    }

    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [pathname])

  return null
}
