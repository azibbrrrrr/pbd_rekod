import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/curriculum-items/import — bulk import curriculum items from CSV
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { set_id, items } = body

  if (!set_id) {
    return NextResponse.json({ error: 'set_id is required' }, { status: 400 })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items array is required' }, { status: 400 })
  }

  const records = items.map((item, idx) => ({
    set_id,
    tema: item.tema?.trim() || '',
    tajuk: item.tajuk?.trim() || '',
    sort_order: item.sort_order ?? idx,
  }))

  const { data, error } = await supabase
    .from('pbd_curriculum_items')
    .insert(records)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imported: data.length, items: data }, { status: 201 })
}
