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
  const [curriculumSets, setCurriculumSets] = useState([])
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

      // Curriculum sets + items
      const flatSets = (setData || []).map(s => ({ id: s.id, name: s.name }))
      setCurriculumSets(flatSets)

      const flatCurriculum = []
      for (const set of (setData || [])) {
        for (const item of (set.pbd_curriculum_items || [])) {
          flatCurriculum.push({
            id: item.id,
            set_id: set.id,
            set_name: set.name,
            tema: item.tema,
            tajuk: item.tajuk,
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

      // Sessions: { id, tarikh, kelas, curriculum_set, tema, tajuk, catatan, finalized, results }
      const flatSessions = (sessionData || []).map(s => ({
        id: s.id,
        tarikh: s.date,
        kelas: s.pbd_classes?.name || '',
        class_id: s.class_id,
        curriculum_set: s.pbd_curriculum_items?.pbd_curriculum_sets?.name || '',
        tema: s.pbd_curriculum_items?.tema || '',
        tajuk: s.pbd_curriculum_items?.tajuk || '',
        curriculum_item_id: s.curriculum_item_id,
        catatan: s.notes || '',
        finalized: false,
        results: resultsIndex[s.id] || {},
      }))
      setSessions(flatSessions)

      // Fetch teacher profile for onboarding status
      const { data: teacherData } = await supabase
        .from('pbd_teachers')
        .select('is_onboarded')
        .eq('id', user.id)
        .single()
      
      const isOnboarded = teacherData?.is_onboarded || false
      // Fallback to data check if not marked onboarded yet (for existing users)
      const hasDataCheck = (classData?.length || 0) > 0 && (flatStudents.length > 0)
      
      setHasData(isOnboarded || hasDataCheck)

    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── Complete Onboarding ──────────────────────────────────────────────
  const completeOnboarding = useCallback(async () => {
    const { error } = await supabase
      .from('pbd_teachers')
      .update({ is_onboarded: true })
      .eq('id', user.id)
    if (error) console.error('Error updating onboarding status:', error)
    setHasData(true)
  }, [user, supabase])

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

    // Track the new set immediately (even if no items)
    setCurriculumSets(prev => [...prev, { id: set.id, name: set.name }])

    // Create items only if any were provided
    const records = items.map((item, idx) => ({
      set_id: set.id,
      tema: item.tema,
      tajuk: item.tajuk || '',
      sort_order: idx,
    }))

    let flat = []
    if (records.length > 0) {
      const { data: itemData, error: itemErr } = await supabase
        .from('pbd_curriculum_items')
        .insert(records)
        .select()
      if (itemErr) throw itemErr

      flat = itemData.map(item => ({
        id: item.id,
        set_id: set.id,
        set_name: set.name,
        tema: item.tema,
        tajuk: item.tajuk,
      }))
      setCurriculum(prev => [...prev, ...flat])
    }

    return { setId: set.id, items: flat }
  }, [user, supabase])

  // ── Create session ───────────────────────────────────────────────────
  const createSession = useCallback(async (form) => {
    // form has: tarikh, kelas, curriculum_set, tema, tajuk_code, tajuk_title, catatan
    // Need to find the class_id and curriculum_item_id from the names

    // Find class_id
    const cls = classes.find(c => c.name === form.kelas)
    if (!cls) throw new Error('Class not found')

    // Find curriculum_item_id — match by tajuk
    const item = curriculum.find(c =>
      c.set_name === form.curriculum_set &&
      c.tema === form.tema &&
      c.tajuk === form.tajuk
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
      tajuk: data.pbd_curriculum_items?.tajuk || '',
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

  // ── Add a single student ────────────────────────────────────────────
  const addStudent = useCallback(async (classId, name) => {
    const { data, error } = await supabase
      .from('pbd_students')
      .insert({ teacher_id: user.id, class_id: classId, name: name.trim() })
      .select('*, pbd_classes(name)')
      .single()
    if (error) throw error
    const flat = { id: data.id, class_id: data.class_id, class_name: data.pbd_classes?.name || '', full_name: data.name }
    setStudents(prev => [...prev, flat])
    return flat
  }, [user, supabase])

  // ── Soft-delete a student ────────────────────────────────────────────
  const deleteStudent = useCallback(async (studentId) => {
    const { error } = await supabase
      .from('pbd_students')
      .update({ is_active: false })
      .eq('id', studentId)
    if (error) throw error
    setStudents(prev => prev.filter(s => s.id !== studentId))
  }, [supabase])

  // ── Rename a class ───────────────────────────────────────────────────
  const renameClass = useCallback(async (classId, newName) => {
    const { data, error } = await supabase
      .from('pbd_classes')
      .update({ name: newName })
      .eq('id', classId)
      .select()
      .single()
    if (error) throw error
    setClasses(prev => prev.map(c => c.id === classId ? data : c))
    setStudents(prev => prev.map(s => s.class_id === classId ? { ...s, class_name: newName } : s))
    return data
  }, [supabase])

  // ── Delete a class (only if no active students) ──────────────────────
  const deleteClass = useCallback(async (classId) => {
    const { error } = await supabase
      .from('pbd_classes')
      .delete()
      .eq('id', classId)
    if (error) throw error
    setClasses(prev => prev.filter(c => c.id !== classId))
    setStudents(prev => prev.filter(s => s.class_id !== classId))
  }, [supabase])

  // ── Delete a curriculum set (cascades to items) ──────────────────────
  const deleteCurriculumSet = useCallback(async (setId) => {
    const { error } = await supabase
      .from('pbd_curriculum_sets')
      .delete()
      .eq('id', setId)
    if (error) throw error
    setCurriculumSets(prev => prev.filter(s => s.id !== setId))
    setCurriculum(prev => prev.filter(c => c.set_id !== setId))
  }, [supabase])

  // ── Add items to an existing curriculum set ──────────────────────────
  const updateCurriculumSet = useCallback(async (setId, items) => {
    const setName = curriculum.find(c => c.set_id === setId)?.set_name || ''

    // 1. Delete rows that were removed (have _id but not in new items list)
    const existingIds = curriculum.filter(c => c.set_id === setId).map(c => c.id)
    const keptIds = new Set(items.filter(i => i._id).map(i => i._id))
    const deletedIds = existingIds.filter(id => !keptIds.has(id))
    if (deletedIds.length > 0) {
      const { error: delErr } = await supabase
        .from('pbd_curriculum_items')
        .delete()
        .in('id', deletedIds)
      if (delErr) throw delErr
    }

    // 2. Update existing rows that changed
    const changedItems = items.filter(i => i._id)
    for (const item of changedItems) {
      const { error: updErr } = await supabase
        .from('pbd_curriculum_items')
        .update({ tema: item.tema, tajuk: item.tajuk || '' })
        .eq('id', item._id)
      if (updErr) throw updErr
    }

    // 3. Insert new rows (no _id)
    const newItems = items.filter(i => !i._id)
    let inserted = []
    if (newItems.length > 0) {
      const records = newItems.map((item, idx) => ({
        set_id: setId,
        tema: item.tema,
        tajuk: item.tajuk || '',
        sort_order: changedItems.length + idx,
      }))
      const { data, error: insErr } = await supabase
        .from('pbd_curriculum_items')
        .insert(records)
        .select()
      if (insErr) throw insErr
      inserted = data
    }

    // 4. Rebuild local state for this set
    const updatedItems = [
      ...changedItems.map(item => ({
        id: item._id,
        set_id: setId,
        set_name: setName,
        tema: item.tema,
        tajuk: item.tajuk || '',
      })),
      ...inserted.map(item => ({
        id: item.id,
        set_id: setId,
        set_name: setName,
        tema: item.tema,
        tajuk: item.tajuk || '',
      })),
    ]

    setCurriculum(prev => [
      ...prev.filter(c => c.set_id !== setId),
      ...updatedItems,
    ])
    return updatedItems
  }, [supabase, curriculum])

  // ── Bulk soft-delete multiple students ───────────────────────────────
  const deleteStudents = useCallback(async (studentIds) => {
    const { error } = await supabase
      .from('pbd_students')
      .update({ is_active: false })
      .in('id', studentIds)
    if (error) throw error
  }, [supabase])

  // ── Delete ALL classes (cascades to students) ────────────────────────
  const deleteAllClasses = useCallback(async () => {
    // Delete all classes for this user (RLS restricted)
    // We can't delete without WHERE clause usually, so we use id.neq.0 or something
    const { error } = await supabase
      .from('pbd_classes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletes all rows matching RLS
    if (error) throw error
    setClasses([])
    setStudents(prev => prev.filter(s => s.class_id === null)) // Should be empty if all classes gone
  }, [supabase])

  return {
    loading,
    classes,
    students,
    curriculumSets,
    curriculum,
    sessions,
    hasData,
    fetchAll,
    createClass,
    renameClass,
    deleteClass,
    deleteAllClasses,
    importStudents,
    addStudent,
    deleteStudent,
    deleteStudents,
    importCurriculum,
    updateCurriculumSet,
    deleteCurriculumSet,
    createSession,
    updateResult,
    completeOnboarding,
  }
}

