import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LogoIcon, LogoWordmark } from '@/components/Logo'
import ReviewForm from './ReviewForm'

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: request } = await supabase
    .from('review_requests')
    .select('id, first_name, last_name, business_id, service_description, service_date, status')
    .eq('token', token)
    .single()

  if (!request) notFound()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, category, logo_url, slug')
    .eq('id', request.business_id)
    .single()

  if (!business) notFound()

  const alreadySubmitted = ['submitted', 'referral_received'].includes(request.status)

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="font-display font-black text-xl mb-2" style={{ color: '#0F2D5E' }}>
            Already submitted
          </h1>
          <p className="text-sm text-slate-500">
            Thank you, {request.first_name}! Your review for {business.name} has already been received.
          </p>
        </div>
      </div>
    )
  }

  const serviceDate = new Date(request.service_date + 'T00:00:00').toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <LogoIcon size={28} />
        <LogoWordmark />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full">
        {/* Business header */}
        <div className="text-center mb-6">
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              className="w-16 h-16 rounded-xl object-cover mx-auto mb-3 border border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3 text-3xl"
              style={{ background: '#EFF6FF' }}>
              🏢
            </div>
          )}
          <h1 className="font-display font-black text-xl" style={{ color: '#0F2D5E' }}>{business.name}</h1>
          {business.category && (
            <p className="text-xs text-slate-400 mt-0.5">{business.category}</p>
          )}
        </div>

        <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed">
          Hi <strong>{request.first_name}</strong>! We&apos;d love to hear about your experience with{' '}
          <strong>{business.name}</strong> for <em>{request.service_description}</em> on {serviceDate}.
        </p>

        <ReviewForm
          token={token}
          authorName={`${request.first_name} ${request.last_name}`.trim()}
          requestId={request.id}
        />
      </div>

      <p className="text-[10px] text-slate-300 mt-6">Powered by FindaGuy · findaguy.co.za</p>
    </div>
  )
}
