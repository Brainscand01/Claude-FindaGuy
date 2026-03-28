import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) return NextResponse.json({ data: [], count: 0 })

  const supabase = await createClient()

  // Text search against name, description, category, suburb, tags
  const { data, count, error } = await supabase
    .from('businesses')
    .select('*', { count: 'exact' })
    .or(
      `name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,suburb.ilike.%${q}%`
    )
    .eq('is_verified', true)
    .order('tier', { ascending: false })
    .order('rating_avg', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count })
}
