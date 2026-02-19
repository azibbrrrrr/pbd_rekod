import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/sessions — list sessions with filters
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')

  let query = supabase
    .from('pbd_sessions')
    .select(`
      *,
      pbd_classes ( id, name ),
      pbd_curriculum_items ( id, tema, tajuk, set_id,
        pbd_curriculum_sets ( id, name )
      )
    `)
    .order('date', { ascending: false })

  if (classId) {
    query = query.eq('class_id', classId)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/sessions — create a new session
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { class_id, curriculum_item_id, date, notes } = body

  if (!class_id || !curriculum_item_id) {
    return NextResponse.json({ error: 'class_id and curriculum_item_id are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pbd_sessions')
    .insert({
      teacher_id: user.id,
      class_id,
      curriculum_item_id,
      date: date || new Date().toISOString().split('T')[0],
      notes: notes || null,
    })
    .select(`
      *,
      pbd_classes ( id, name ),
      pbd_curriculum_items ( id, tema, tajuk, set_id,
        pbd_curriculum_sets ( id, name )
      )
    `)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH /api/sessions — update a session
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('pbd_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/sessions — delete a session
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase
    .from('pbd_sessions')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
