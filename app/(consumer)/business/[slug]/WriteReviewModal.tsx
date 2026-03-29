'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  businessId: string
  businessName: string
}

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

export function WriteReviewModal({ businessId, businessName }: Props) {
  const [open, setOpen]           = useState(false)
  const [score, setScore]         = useState(0)
  const [hovered, setHovered]     = useState(0)
  const [name, setName]           = useState('')
  const [body, setBody]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  function openModal() {
    setOpen(true)
    setScore(0)
    setHovered(0)
    setName('')
    setBody('')
    setDone(false)
    setError('')
  }

  function closeModal() {
    if (submitting) return
    setOpen(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!score || !body.trim()) return
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.from('reviews').insert({
      business_id: businessId,
      score,
      body: body.trim(),
      author_name: name.trim() || null,
      is_published: false,
    })

    if (err) {
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
      return
    }

    setDone(true)
    setSubmitting(false)
  }

  return (
    <>
      <button
        onClick={openModal}
        className="text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
        style={{ background: '#0F2D5E' }}
      >
        Write a review
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-display font-black text-navy text-base">Write a review</h2>
                <p className="text-xs text-slate-500 mt-0.5">{businessName}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4">
              {done ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-4">🙏</div>
                  <h3 className="font-display font-black text-lg mb-2" style={{ color: '#0F2D5E' }}>
                    Thank you!
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    Your review has been submitted and will be published once approved.
                  </p>
                  <button
                    onClick={closeModal}
                    className="text-sm font-semibold px-6 py-2 rounded-xl text-white"
                    style={{ background: '#0F2D5E' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  {/* Star rating */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      Your rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
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
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Your name <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John D."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Your review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={4}
                      placeholder="Tell others about your experience…"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                    />
                  </div>

                  {error && <p className="text-xs text-red-500">{error}</p>}

                  <button
                    type="submit"
                    disabled={!score || !body.trim() || submitting}
                    className="w-full text-sm font-semibold py-3 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: '#0F2D5E' }}
                  >
                    {submitting ? 'Submitting…' : 'Submit review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
