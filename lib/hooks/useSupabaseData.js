'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthContext'

/**
 * Custom hook that fetches all PBD data from Supabase and transforms it
 * into the flat shapes the existing screen components expect.
 */
export function useSupabaseData() {
  const { user, supabase } = useAuth()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [curriculum, setCurriculum] = useState([])
  const [sessions, setSessions] = useState([])
  const [hasData, setHasData] = useState(false)

  // ── Fetch all data ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)

    try {
      // Fetch classes
      const { data: classData } = await supabase
        .from('pbd_classes')
        .select('*')
        .order('name')

      // Fetch students with class name
      const { data: studentData } = await supabase
        .from('pbd_students')
        .select('*, pbd_classes(name)')
        .eq('is_active', true)
        .order('name')

      // Fetch curriculum sets + items
      const { data: setData } = await supabase
        .from('pbd_curriculum_sets')
        .select('*, pbd_curriculum_items(*)')
        .order('name')

      // Fetch sessions with relations
      const { data: sessionData } = await supabase
        .from('pbd_sessions')
        .select(`
          *,
          pbd_classes(name),
          pbd_curriculum_items(
            tema, tajuk, set_id,
            pbd_curriculum_sets(name)
          )
        `)
        .order('date', { ascending: false })

      // Fetch results for all sessions
      const sessionIds = (sessionData || []).map(s => s.id)
      let resultData = []
      if (sessionIds.length > 0) {
        const { data: rd } = await supabase
          .from('pbd_session_results')
          .select('*')
          .in('session_id', sessionIds)
        resultData = rd || []
      }

      // ── Transform data to flat shapes ─────────────────────────────────

      // Classes stay as-is
      setClasses(classData || [])

      // Students: { id, class_id, class_name, full_name }
      const flatStudents = (studentData || []).map(s => ({
        id: s.id,
        class_id: s.class_id,
        class_name: s.pbd_classes?.name || '',
        full_name: s.name,
        ic_number: s.ic_number,
      }))
      setStudents(flatStudents)

      // Curriculum: { id, set_id, set_name, tema, tajuk_code, tajuk_title }
      const flatCurriculum = []
      for (const set of (setData || [])) {
        for (const item of (set.pbd_curriculum_items || [])) {
          flatCurriculum.push({
            id: item.id,
            set_id: set.id,
            set_name: set.name,
            tema: item.tema,
            tajuk_code: item.tajuk,
            tajuk_title: item.tajuk,
          })
        }
      }
      setCurriculum(flatCurriculum)

      // Build results map per session: { session_id: { student_id: "TP3" } }
      const resultsIndex = {}
      for (const r of resultData) {
        if (!resultsIndex[r.session_id]) resultsIndex[r.session_id] = {}
        resultsIndex[r.session_id][r.student_id] = `TP${r.tp_value}`
      }

      // Sessions: { id, tarikh, kelas, curriculum_set, tema, tajuk_code, tajuk_title, catatan, finalized, results }
      const flatSessions = (sessionData || []).map(s => ({
        id: s.id,
        tarikh: s.date,
        kelas: s.pbd_classes?.name || '',
        class_id: s.class_id,
        curriculum_set: s.pbd_curriculum_items?.pbd_curriculum_sets?.name || '',
        tema: s.pbd_curriculum_items?.tema || '',
        tajuk_code: s.pbd_curriculum_items?.tajuk || '',
        tajuk_title: s.pbd_curriculum_items?.tajuk || '',
        curriculum_item_id: s.curriculum_item_id,
        catatan: s.notes || '',
        finalized: false,
        results: resultsIndex[s.id] || {},
      }))
      setSessions(flatSessions)

      // Check if user has data (determines onboarding vs main view)
      setHasData((classData?.length || 0) > 0 && (flatStudents.length > 0))

    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── Create class ─────────────────────────────────────────────────────
  const createClass = useCallback(async (name) => {
    const { data, error } = await supabase
      .from('pbd_classes')
      .insert({ teacher_id: user.id, name })
      .select()
      .single()
    if (error) throw error
    setClasses(prev => [...prev, data])
    return data
  }, [user, supabase])

  // ── Import students ──────────────────────────────────────────────────
  const importStudents = useCallback(async (classId, studentNames) => {
    const records = studentNames.map(name => ({
      teacher_id: user.id,
      class_id: classId,
      name: name.trim(),
    }))
    const { data, error } = await supabase
      .from('pbd_students')
      .insert(records)
      .select('*, pbd_classes(name)')
    if (error) throw error

    const flat = data.map(s => ({
      id: s.id,
      class_id: s.class_id,
      class_name: s.pbd_classes?.name || '',
      full_name: s.name,
    }))
    setStudents(prev => [...prev, ...flat])
    return flat
  }, [user, supabase])

  // ── Import curriculum set + items ────────────────────────────────────
  const importCurriculum = useCallback(async (setName, items) => {
    // Create set
    const { data: set, error: setErr } = await supabase
      .from('pbd_curriculum_sets')
      .insert({ teacher_id: user.id, name: setName })
      .select()
      .single()
    if (setErr) throw setErr

    // Create items
    const records = items.map((item, idx) => ({
      set_id: set.id,
      tema: item.tema,
      tajuk: item.tajuk_code || item.tajuk_title || item.tajuk || '',
      sort_order: idx,
    }))
    const { data: itemData, error: itemErr } = await supabase
      .from('pbd_curriculum_items')
      .insert(records)
      .select()
    if (itemErr) throw itemErr

    const flat = itemData.map(item => ({
      id: item.id,
      set_id: set.id,
      set_name: set.name,
      tema: item.tema,
      tajuk_code: item.tajuk,
      tajuk_title: item.tajuk,
    }))
    setCurriculum(prev => [...prev, ...flat])
    return flat
  }, [user, supabase])

  // ── Create session ───────────────────────────────────────────────────
  const createSession = useCallback(async (form) => {
    // form has: tarikh, kelas, curriculum_set, tema, tajuk_code, tajuk_title, catatan
    // Need to find the class_id and curriculum_item_id from the names

    // Find class_id
    const cls = classes.find(c => c.name === form.kelas)
    if (!cls) throw new Error('Class not found')

    // Find curriculum_item_id
    const item = curriculum.find(c =>
      c.set_name === form.curriculum_set &&
      c.tema === form.tema &&
      (c.tajuk_code === form.tajuk_code || c.tajuk_title === form.tajuk_code)
    )
    if (!item) throw new Error('Curriculum item not found')

    const { data, error } = await supabase
      .from('pbd_sessions')
      .insert({
        teacher_id: user.id,
        class_id: cls.id,
        curriculum_item_id: item.id,
        date: form.tarikh,
        notes: form.catatan || null,
      })
      .select(`
        *,
        pbd_classes(name),
        pbd_curriculum_items(
          tema, tajuk, set_id,
          pbd_curriculum_sets(name)
        )
      `)
      .single()
    if (error) throw error

    const flat = {
      id: data.id,
      tarikh: data.date,
      kelas: data.pbd_classes?.name || '',
      class_id: data.class_id,
      curriculum_set: data.pbd_curriculum_items?.pbd_curriculum_sets?.name || '',
      tema: data.pbd_curriculum_items?.tema || '',
      tajuk_code: data.pbd_curriculum_items?.tajuk || '',
      tajuk_title: data.pbd_curriculum_items?.tajuk || '',
      curriculum_item_id: data.curriculum_item_id,
      catatan: data.notes || '',
      finalized: false,
      results: {},
    }
    setSessions(prev => [flat, ...prev])
    return flat
  }, [user, supabase, classes, curriculum])

  // ── Update result (TP value) ─────────────────────────────────────────
  const updateResult = useCallback(async (sessionId, studentId, tpValue) => {
    if (!tpValue || tpValue === '') {
      // Delete the result
      await supabase
        .from('pbd_session_results')
        .delete()
        .eq('session_id', sessionId)
        .eq('student_id', studentId)

      setSessions(prev => prev.map(s => {
        if (s.id !== sessionId) return s
        const newResults = { ...s.results }
        delete newResults[studentId]
        return { ...s, results: newResults }
      }))
    } else {
      // Parse TP value: "TP3" -> 3, "TD" -> special handling
      // TD is not stored as a tp_value (which is 1-6), we handle it differently
      if (tpValue === 'TD') {
        // TD = Tidak Dinilai — we delete the result
        await supabase
          .from('pbd_session_results')
          .delete()
          .eq('session_id', sessionId)
          .eq('student_id', studentId)

        setSessions(prev => prev.map(s => {
          if (s.id !== sessionId) return s
          return { ...s, results: { ...s.results, [studentId]: 'TD' } }
        }))
      } else {
        const numValue = parseInt(tpValue.replace('TP', ''), 10)
        if (numValue < 1 || numValue > 6) return

        await supabase
          .from('pbd_session_results')
          .upsert({
            session_id: sessionId,
            student_id: studentId,
            tp_value: numValue,
          }, { onConflict: 'session_id,student_id' })

        setSessions(prev => prev.map(s => {
          if (s.id !== sessionId) return s
          return { ...s, results: { ...s.results, [studentId]: tpValue } }
        }))
      }
    }
  }, [supabase])

  return {
    loading,
    classes,
    students,
    curriculum,
    sessions,
    hasData,
    fetchAll,
    createClass,
    importStudents,
    importCurriculum,
    createSession,
    updateResult,
  }
}
