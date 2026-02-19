import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/students/import — bulk import students from CSV data
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { class_id, students } = body

  if (!class_id) {
    return NextResponse.json({ error: 'class_id is required' }, { status: 400 })
  }

  if (!Array.isArray(students) || students.length === 0) {
    return NextResponse.json({ error: 'students array is required' }, { status: 400 })
  }

  const records = students.map(s => ({
    teacher_id: user.id,
    class_id,
    name: s.name?.trim(),
    ic_number: s.ic_number?.trim() || null,
  }))

  // Validate
  for (const r of records) {
    if (!r.name) {
      return NextResponse.json({ error: 'Each student needs a name' }, { status: 400 })
    }
  }

  const { data, error } = await supabase
    .from('pbd_students')
    .insert(records)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imported: data.length, students: data }, { status: 201 })
}
