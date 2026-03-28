/**
 * Cookie-free Supabase client for use at build time
 * (generateStaticParams, generateMetadata at static generation).
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
