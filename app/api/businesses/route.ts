import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const suburb = searchParams.get('suburb')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const supabase = await createClient()
  let query = supabase
    .from('businesses')
    .select('*', { count: 'exact' })
    .eq('is_verified', true)
    .range(offset, offset + limit - 1)
    .order('tier', { ascending: false })
    .order('rating_avg', { ascending: false })

  if (category) query = query.eq('category_slug', category)
  if (suburb) query = query.eq('suburb', suburb)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count })
}
