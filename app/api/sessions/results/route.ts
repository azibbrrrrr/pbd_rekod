import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/sessions/results?session_id= — get all results for a session
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pbd_session_results')
    .select('*')
    .eq('session_id', sessionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Transform to a map: { student_id: tp_value } for easy frontend use
  const resultMap: Record<string, number> = {}
  data.forEach(r => {
    resultMap[r.student_id] = r.tp_value
  })

  return NextResponse.json({ results: data, resultMap })
}

// PUT /api/sessions/results — upsert result(s) for a session
export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { session_id, results } = body

  if (!session_id) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  }

  if (!Array.isArray(results) || results.length === 0) {
    return NextResponse.json({ error: 'results array is required' }, { status: 400 })
  }

  const records = results.map(r => ({
    session_id,
    student_id: r.student_id,
    tp_value: r.tp_value,
  }))

  // Upsert — insert or update on (session_id, student_id) conflict
  const { data, error } = await supabase
    .from('pbd_session_results')
    .upsert(records, { onConflict: 'session_id,student_id' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
