'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const FREE_PHOTO_SLOTS = 4

export default function PhotosPage() {
  const [photos, setPhotos] = useState<string[]>([])
  const [logo, setLogo] = useState<string | null>(null)
  const [bizId, setBizId] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
      if (!profile?.business_id) return
      setBizId(profile.business_id)
      const { data } = await supabase
        .from('business_media')
        .select('url, type')
        .eq('business_id', profile.business_id)
      if (data) {
        setPhotos(data.filter((m: { type: string }) => m.type === 'photo').map((m: { url: string }) => m.url))
        const logoMedia = data.find((m: { type: string }) => m.type === 'logo')
        if (logoMedia) setLogo(logoMedia.url)
      }
    }
    load()
  }, [])

  async function upload(file: File, type: 'photo' | 'logo') {
    if (!bizId) return
    setUploading(true)
    const supabase = createClient()
    const path = `businesses/${bizId}/${type}-${Date.now()}-${file.name}`
    const { data } = await supabase.storage.from('business-media').upload(path, file, { upsert: true })
    if (data) {
      const { data: urlData } = supabase.storage.from('business-media').getPublicUrl(path)
      const url = urlData.publicUrl
      await supabase.from('business_media').insert({ business_id: bizId, url, type })
      if (type === 'logo') {
        setLogo(url)
        await supabase.from('businesses').update({ logo_url: url }).eq('id', bizId)
      } else {
        setPhotos((prev) => [...prev, url])
      }
    }
    setUploading(false)
  }

  async function deletePhoto(url: string) {
    const supabase = createClient()
    await supabase.from('business_media').delete().eq('url', url).eq('business_id', bizId)
    setPhotos((prev) => prev.filter((p) => p !== url))
  }

  const canAddPhoto = photos.length < FREE_PHOTO_SLOTS

  return (
    <div>
      <h1 className="font-display font-black text-navy text-xl mb-6">Photos & Logo</h1>

      {/* Logo */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 mb-5 max-w-lg">
        <h2 className="font-display font-black text-navy text-sm mb-4">Business logo</h2>
        <div className="flex items-center gap-4">
          {logo ? (
            <Image src={logo} alt="Business logo" width={64} height={64} className="rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
              <Upload size={20} aria-hidden="true" />
            </div>
          )}
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) upload(file, 'logo')
              }
              input.click()
            }}
            disabled={uploading}
            className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-700 transition-colors hover:border-navy disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : logo ? 'Change logo' : 'Upload logo'}
          </button>
        </div>
      </section>

      {/* Photos */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-black text-navy text-sm">
            Photos ({photos.length}/{FREE_PHOTO_SLOTS} free slots)
          </h2>
          {!canAddPhoto && (
            <a href="/pricing" className="text-xs font-medium" style={{ color: '#F59E0B' }}>
              Upgrade for more →
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photos.map((url) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
              <Image src={url} alt="Business photo" fill className="object-cover" />
              <button
                onClick={() => deletePhoto(url)}
                className="absolute top-1 right-1 bg-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                aria-label="Delete photo"
              >
                <X size={12} className="text-red-500" />
              </button>
            </div>
          ))}

          {canAddPhoto && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-300 hover:border-navy hover:text-navy transition-colors disabled:opacity-50"
              aria-label="Add photo"
            >
              <Upload size={20} aria-hidden="true" />
              <span className="text-[10px]">{uploading ? 'Uploading…' : 'Add photo'}</span>
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Upload photo"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload(file, 'photo')
          }}
        />
      </section>
    </div>
  )
}
