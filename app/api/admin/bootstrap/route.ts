// ONE-TIME bootstrap route — creates admin user + returns magic link
// Only works when zero users exist. DELETE this file after first use.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  // Hard gate: only works in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!key) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not set in .env.local' },
      { status: 500 }
    )
  }

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

  // Only bootstrap if no users exist yet
  const { data: existing } = await admin.auth.admin.listUsers()
  if (existing?.users?.length > 0) {
    return NextResponse.json({ error: 'Users already exist — bootstrap not needed.' }, { status: 403 })
  }

  // Create user
  const email = 'darylfirmani@gmail.com'
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }

  // Set admin role in profiles
  await admin.from('profiles').upsert({
    id: data.user.id,
    email,
    role: 'admin',
    full_name: 'Daryl',
  })

  // Generate magic link
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: 'http://localhost:3000/admin' },
  })

  if (linkErr || !link) {
    return NextResponse.json({ error: linkErr?.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Admin user created. Open the link below to sign in.',
    magic_link: link.properties?.action_link,
  })
}
