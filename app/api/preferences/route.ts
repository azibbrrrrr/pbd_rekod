import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/preferences — get teacher preferences
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('pbd_teachers')
    .select('preferences, display_name, email')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/preferences — update teacher preferences
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { preferences, display_name } = body

  const updates: Record<string, unknown> = {}
  if (preferences !== undefined) updates.preferences = preferences
  if (display_name !== undefined) updates.display_name = display_name

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pbd_teachers')
    .update(updates)
    .eq('id', user.id)
    .select('preferences, display_name, email')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
