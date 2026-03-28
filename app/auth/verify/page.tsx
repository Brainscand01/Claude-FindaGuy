import Link from 'next/link'
import { LogoIcon, LogoWordmark } from '@/components/Logo'

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-page-bg px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <LogoIcon size={32} />
          <LogoWordmark />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="text-4xl mb-4" aria-hidden="true">📬</div>
          <h1 className="font-display font-black text-navy text-xl mb-2">Check your email</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            We sent a magic link to your inbox. Click it to sign in — no password needed.
          </p>
          <Link
            href="/auth/login"
            className="text-sm font-medium transition-colors hover:underline"
            style={{ color: '#3B82F6' }}
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
