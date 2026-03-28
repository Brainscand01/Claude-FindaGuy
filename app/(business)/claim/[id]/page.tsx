'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoIcon, LogoWordmark } from '@/components/Logo'
import { trackEvent } from '@/lib/analytics'

const STEPS = ['What you get', 'Your details', 'Verify', 'Done!'] as const

export default function ClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [bizId, setBizId] = useState('')
  const [bizName, setBizName] = useState('')
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '' })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then((p) => {
      setBizId(p.id)
      const supabase = createClient()
      supabase.from('businesses').select('name').eq('id', p.id).single().then(({ data }) => {
        if (data) setBizName(data.name)
      })
    })
  }, [params])

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submitDetails(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Send OTP first
      const { error } = await supabase.auth.signInWithOtp({ email: form.email })
      if (error) { setError(error.message); setLoading(false); return }
    }
    trackEvent('claim_started', { business_id: bizId })
    setLoading(false)
    setStep(2)
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ email: form.email, token: otp, type: 'email' })
    if (error) { setError(error.message); setLoading(false); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Auth failed. Please try again.'); setLoading(false); return }

    await supabase.from('claim_requests').insert({
      business_id: bizId,
      user_id: user.id,
      contact_name: form.name,
      contact_email: form.email,
      contact_phone: form.phone,
      role_at_business: form.role,
      status: 'pending',
    })

    setLoading(false)
    setStep(3)
    setTimeout(() => router.push('/dashboard'), 3000)
  }

  return (
    <main className="min-h-screen bg-page-bg flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <LogoIcon size={28} />
          <LogoWordmark />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: i <= step ? '#0F2D5E' : '#e2e8f0',
                  color: i <= step ? '#fff' : '#94a3b8',
                }}
                aria-current={i === step ? 'step' : undefined}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1" style={{ background: i < step ? '#0F2D5E' : '#e2e8f0' }} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {/* Step 0 — Intro */}
          {step === 0 && (
            <div>
              <h1 className="font-display font-black text-navy text-xl mb-1">
                Claim {bizName || 'your business'}
              </h1>
              <p className="text-xs text-slate-400 mb-5">Here&apos;s what you get for free:</p>
              <ul className="space-y-3 mb-6">
                {[
                  'Edit your business name, contact details & hours',
                  'Respond to customer reviews',
                  'Upload up to 4 photos',
                  'See your profile views & contact stats',
                  'Get a Verified badge',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <span style={{ color: '#22C55E' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#F59E0B' }}
              >
                Claim this listing →
              </button>
            </div>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <form onSubmit={submitDetails} className="space-y-4">
              <h1 className="font-display font-black text-navy text-xl mb-4">Your details</h1>
              {[
                { label: 'Full name', key: 'name' as const, type: 'text', required: true },
                { label: 'Email address', key: 'email' as const, type: 'email', required: true },
                { label: 'Phone number', key: 'phone' as const, type: 'tel', required: true },
                { label: 'Your role', key: 'role' as const, type: 'text', required: true, placeholder: 'e.g. Owner, Manager' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor={f.key}>{f.label}</label>
                  <input
                    id={f.key}
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) => setField(f.key, e.target.value)}
                    required={f.required}
                    placeholder={f.placeholder}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-navy transition-colors"
                  />
                </div>
              ))}
              {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#0F2D5E' }}
              >
                {loading ? 'Sending verification…' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <form onSubmit={verifyOtp} className="space-y-4">
              <h1 className="font-display font-black text-navy text-xl mb-1">Verify your email</h1>
              <p className="text-xs text-slate-500 mb-4">
                We sent a 6-digit code to <strong>{form.email}</strong>
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                required
                autoFocus
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xl font-bold text-center tracking-widest outline-none focus:border-navy transition-colors"
                aria-label="Verification code"
              />
              {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#0F2D5E' }}
              >
                {loading ? 'Verifying…' : 'Verify & claim'}
              </button>
            </form>
          )}

          {/* Step 3 — Success */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4" aria-hidden="true">🎉</div>
              <h1 className="font-display font-black text-navy text-xl mb-2">Claim submitted!</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                We&apos;ll review your claim within 24 hours. Redirecting you to your dashboard now…
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
