'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  token: string
  authorName: string
  requestId: string
}

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

export default function ReviewForm({ token, authorName, requestId }: Props) {
  const [score, setScore]       = useState(0)
  const [hovered, setHovered]   = useState(0)
  const [title, setTitle]       = useState('')
  const [body, setBody]         = useState('')
  const [name, setName]         = useState(authorName)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')

  async function submit() {
    if (!score || !body.trim()) return
    setSubmitting(true)
    setError('')
    const supabase = createClient()

    const { data: request } = await supabase
      .from('review_requests')
      .select('business_id')
      .eq('token', token)
      .single()

    if (!request) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    const [{ error: reviewErr }] = await Promise.all([
      supabase.from('reviews').insert({
        business_id: request.business_id,
        score,
        title: title.trim() || null,
        body: body.trim(),
        author_name: name.trim() || null,
        is_published: false,
        review_request_id: requestId,
      }),
      supabase.from('review_requests').update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      }).eq('token', token),
    ])

    if (reviewErr) {
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
      return
    }

    setDone(true)
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">🙏</div>
        <h2 className="font-display font-black text-lg mb-2" style={{ color: '#0F2D5E' }}>
          Thank you!
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Your review has been submitted and will be published once approved. We really appreciate you taking the time!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Star rating */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Your rating *</label>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-4xl transition-transform hover:scale-110 leading-none"
            >
              <span style={{ color: star <= (hovered || score) ? '#F59E0B' : '#E2E8F0' }}>★</span>
            </button>
          ))}
        </div>
        {score > 0 && (
          <p className="text-xs font-medium mt-1.5" style={{ color: '#F59E0B' }}>{LABELS[score]}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Your name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Review title <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Summarise your experience in a few words"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Your review *</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          placeholder="Tell others about your experience…"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={submit}
        disabled={!score || !body.trim() || submitting}
        className="w-full text-sm font-semibold py-3 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: '#0F2D5E' }}
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </div>
  )
}
