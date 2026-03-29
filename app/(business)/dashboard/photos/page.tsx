'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const FREE_PHOTO_SLOTS = 4

type MediaType = 'photo' | 'logo' | 'cover'

export default function PhotosPage() {
  const [photos, setPhotos]   = useState<string[]>([])
  const [logo, setLogo]       = useState<string | null>(null)
  const [cover, setCover]     = useState<string | null>(null)
  const [bizId, setBizId]     = useState('')
  const [uploading, setUploading] = useState<MediaType | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const devBypass = process.env.NEXT_PUBLIC_DASHBOARD_DEV_BYPASS === 'true'

      let businessId: string | null = null

      if (devBypass) {
        const { data } = await supabase
          .from('businesses')
          .select('id')
          .eq('is_active', true)
          .order('tier', { ascending: false })
          .limit(1)
          .single()
        businessId = data?.id ?? null
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
        businessId = profile?.business_id ?? null
      }

      if (!businessId) return
      setBizId(businessId)

      const [{ data: biz }, { data: media }] = await Promise.all([
        supabase.from('businesses').select('logo_url, cover_url').eq('id', businessId).single(),
        supabase.from('business_media').select('url, type').eq('business_id', businessId),
      ])

      if (biz?.logo_url)  setLogo(biz.logo_url)
      if (biz?.cover_url) setCover(biz.cover_url)
      if (media) setPhotos(media.filter((m: { type: string }) => m.type === 'photo').map((m: { url: string }) => m.url))
    }
    load()
  }, [])

  async function upload(file: File, type: MediaType) {
    if (!bizId) return
    setUploading(type)
    const supabase = createClient()
    const ext  = file.name.split('.').pop()
    const path = `businesses/${bizId}/${type}-${Date.now()}.${ext}`

    const { data, error } = await supabase.storage.from('business-media').upload(path, file, { upsert: true })
    if (error || !data) { setUploading(null); alert('Upload failed: ' + error?.message); return }

    const { data: urlData } = supabase.storage.from('business-media').getPublicUrl(path)
    const url = urlData.publicUrl

    await supabase.from('business_media').insert({ business_id: bizId, url, type })

    if (type === 'logo') {
      setLogo(url)
      await supabase.from('businesses').update({ logo_url: url }).eq('id', bizId)
    } else if (type === 'cover') {
      setCover(url)
      await supabase.from('businesses').update({ cover_url: url }).eq('id', bizId)
    } else {
      setPhotos(prev => [...prev, url])
    }
    setUploading(null)
  }

  async function deletePhoto(url: string) {
    const supabase = createClient()
    await supabase.from('business_media').delete().eq('url', url).eq('business_id', bizId)
    setPhotos(prev => prev.filter(p => p !== url))
  }

  function pickFile(type: MediaType) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) upload(file, type)
    }
    input.click()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display font-black text-xl" style={{ color: '#0F2D5E' }}>Photos & Logo</h1>

      {/* Logo */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-display font-black text-sm mb-1" style={{ color: '#0F2D5E' }}>Business logo</h2>
        <p className="text-xs text-slate-400 mb-4">Shown on your listing card and search results. Square image, min 200×200px.</p>
        <div className="flex items-center gap-4">
          {logo ? (
            <Image src={logo} alt="Business logo" width={72} height={72}
              className="rounded-xl object-cover border border-slate-200 flex-shrink-0" />
          ) : (
            <div className="w-18 h-18 w-[72px] h-[72px] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center flex-shrink-0">
              <ImageIcon size={24} className="text-slate-200" />
            </div>
          )}
          <button
            onClick={() => pickFile('logo')}
            disabled={!!uploading}
            className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-700 transition-colors hover:border-blue-400 disabled:opacity-50"
          >
            {uploading === 'logo' ? 'Uploading…' : logo ? 'Change logo' : 'Upload logo'}
          </button>
        </div>
      </section>

      {/* Cover image */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-display font-black text-sm mb-1" style={{ color: '#0F2D5E' }}>Cover image</h2>
        <p className="text-xs text-slate-400 mb-4">Shown as the hero banner on your business profile page. Landscape, min 1200×400px.</p>

        {cover ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 mb-3" style={{ aspectRatio: '3/1' }}>
            <Image src={cover} alt="Cover image" fill className="object-cover" />
            <button
              onClick={() => pickFile('cover')}
              disabled={!!uploading}
              className="absolute bottom-3 right-3 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow transition-colors hover:border-blue-400 disabled:opacity-50"
            >
              {uploading === 'cover' ? 'Uploading…' : 'Change cover'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => pickFile('cover')}
            disabled={!!uploading}
            className="w-full rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 py-10 text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-colors disabled:opacity-50"
          >
            <Upload size={24} />
            <span className="text-xs font-medium">{uploading === 'cover' ? 'Uploading…' : 'Upload cover image'}</span>
          </button>
        )}
      </section>

      {/* Gallery photos */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-black text-sm" style={{ color: '#0F2D5E' }}>Gallery photos</h2>
          <span className="text-xs text-slate-400">{photos.length} / {FREE_PHOTO_SLOTS} free slots</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">Show your work, products, or premises. Upgrade for more photo slots.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photos.map((url) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
              <Image src={url} alt="Business photo" fill className="object-cover" />
              <button
                onClick={() => deletePhoto(url)}
                className="absolute top-1.5 right-1.5 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label="Remove photo"
              >
                <X size={11} className="text-red-500" />
              </button>
            </div>
          ))}

          {photos.length < FREE_PHOTO_SLOTS && (
            <button
              onClick={() => photoRef.current?.click()}
              disabled={!!uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-300 hover:border-navy hover:text-navy transition-colors disabled:opacity-50"
            >
              <Upload size={18} />
              <span className="text-[10px] font-medium">{uploading === 'photo' ? 'Uploading…' : 'Add photo'}</span>
            </button>
          )}
        </div>

        {photos.length >= FREE_PHOTO_SLOTS && (
          <p className="text-xs text-slate-400 mt-3">
            Free plan includes {FREE_PHOTO_SLOTS} photos.{' '}
            <a href="/pricing" className="font-medium" style={{ color: '#F59E0B' }}>Upgrade for more →</a>
          </p>
        )}

        <input
          ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" aria-label="Upload photo"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, 'photo') }}
        />
      </section>
    </div>
  )
}
