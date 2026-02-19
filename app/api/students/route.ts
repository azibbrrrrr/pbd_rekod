import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/students?class_id= — list students (optionally by class)
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')

  let query = supabase
    .from('pbd_students')
    .select('*')
    .order('name')

  if (classId) {
    query = query.eq('class_id', classId)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/students — create student(s)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Support both single and bulk insert
  const students = Array.isArray(body) ? body : [body]

  const records = students.map(s => ({
    teacher_id: user.id,
    class_id: s.class_id,
    name: s.name?.trim(),
    ic_number: s.ic_number?.trim() || null,
  }))

  // Validate
  for (const r of records) {
    if (!r.class_id || !r.name) {
      return NextResponse.json({ error: 'class_id and name are required for each student' }, { status: 400 })
    }
  }

  const { data, error } = await supabase
    .from('pbd_students')
    .insert(records)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH /api/students — update a student (pass id in body)
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('pbd_students')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/students — soft-delete a student
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  // Soft delete — set is_active to false
  const { data, error } = await supabase
    .from('pbd_students')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
