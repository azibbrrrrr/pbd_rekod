import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/curriculum-sets — list teacher's curriculum sets
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('pbd_curriculum_sets')
    .select(`
      *,
      pbd_curriculum_items (*)
    `)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/curriculum-sets — create a new curriculum set
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, items } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  // Create the set first
  const { data: set, error: setError } = await supabase
    .from('pbd_curriculum_sets')
    .insert({ teacher_id: user.id, name: name.trim() })
    .select()
    .single()

  if (setError) return NextResponse.json({ error: setError.message }, { status: 500 })

  // If items are provided, insert them
  if (Array.isArray(items) && items.length > 0) {
    const itemRecords = items.map((item, idx) => ({
      set_id: set.id,
      tema: item.tema?.trim() || '',
      tajuk: item.tajuk?.trim() || '',
      sort_order: idx,
    }))

    const { error: itemsError } = await supabase
      .from('pbd_curriculum_items')
      .insert(itemRecords)

    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  // Return set with items
  const { data: fullSet, error: fetchError } = await supabase
    .from('pbd_curriculum_sets')
    .select(`*, pbd_curriculum_items (*)`)
    .eq('id', set.id)
    .single()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  return NextResponse.json(fullSet, { status: 201 })
}

// PATCH /api/curriculum-sets — update a curriculum set
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('pbd_curriculum_sets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/curriculum-sets — delete a curriculum set
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase
    .from('pbd_curriculum_sets')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
