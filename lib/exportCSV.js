'use client'

/**
 * Generate and download a Borang Transit PBD CSV file
 * matching the official template format.
 *
 * Template structure:
 *   Row 1: Title
 *   Row 2: (blank)
 *   Row 3: School name + Kelas
 *   Row 4: Mata Pelajaran + Nama Guru
 *   Row 5: (blank)
 *   Row 6: Header row 1 — BIL, NAMA MURID, JANTINA, then TEMA group names spanning their tajuk columns + TP col
 *   Row 7: Header row 2 — sub-tajuk codes under each tema, TP labels
 *   Row 8+: Student data rows
 */

function escapeCSV(val) {
  const str = val == null ? '' : String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function rowToCSV(cells, totalCols) {
  // Pad to totalCols so every row has same column count
  const padded = [...cells]
  while (padded.length < totalCols) padded.push('')
  return padded.map(escapeCSV).join(',')
}

/**
 * @param {Object} params
 * @param {string} params.title       – e.g. "BORANG TRANSIT PBD RBT TAHUN 3 / 2026"
 * @param {string} params.schoolName  – e.g. "SK COCHRANE PERKASA KUALA LUMPUR"
 * @param {string} params.className   – e.g. "3 ZAMRUD"
 * @param {string} params.subjectName – e.g. "REKA BENTUK DAN TEKNOLOGI"
 * @param {string} params.teacherName – e.g. "" (empty for now)
 * @param {Array}  params.students    – [{ id, full_name }]
 * @param {Array}  params.temaGroups  – [{ tema: "1.0 Reka Bentuk…", tajuks: [{ id, tajuk }] }]
 * @param {Object} params.resultMatrix – { student_id: { tajuk_id: tp_value_string } }
 */
export function generateBorangTransitCSV({
  title = 'BORANG TRANSIT PBD',
  schoolName = '',
  className = '',
  subjectName = '',
  teacherName = '',
  students = [],
  temaGroups = [],
  resultMatrix = {},
}) {
  // Calculate total columns
  // BIL + NAMA MURID + per-tema (tajuk_count + 1 TP col) + 1 TPS col
  const fixedCols = 2 // BIL, NAMA MURID
  let totalDataCols = 0
  temaGroups.forEach(g => { totalDataCols += g.tajuks.length + 1 }) // +1 for TP avg col each
  totalDataCols += 1 // TPS (overall avg)
  const totalCols = fixedCols + totalDataCols

  const rows = []

  // ── Row 1: Title ─────────────────────────────────────────────────────
  const row1 = [title]
  rows.push(rowToCSV(row1, totalCols))

  // ── Row 2: blank ─────────────────────────────────────────────────────
  rows.push(rowToCSV([], totalCols))

  // ── Row 3: School + Class ────────────────────────────────────────────
  const row3 = ['', `NAMA SEKOLAH                                       : ${schoolName}`]
  // Fill enough blanks to reach the class label position (roughly halfway)
  const classLabelPos = Math.max(fixedCols + Math.floor(totalDataCols / 3), 10)
  while (row3.length < classLabelPos) row3.push('')
  row3.push(`KELAS                            : ${className}`)
  rows.push(rowToCSV(row3, totalCols))

  // ── Row 4: Subject + Teacher ─────────────────────────────────────────
  const row4 = ['', `MATA PELAJARAN                                    : ${subjectName}`]
  while (row4.length < classLabelPos) row4.push('')
  row4.push(`NAMA GURU                : ${teacherName}`)
  rows.push(rowToCSV(row4, totalCols))

  // ── Row 5: blank ─────────────────────────────────────────────────────
  rows.push(rowToCSV([], totalCols))

  // ── Row 6: Header row 1 — Tema group names ───────────────────────────
  const hdr1 = ['BIL', 'NAMA MURID']
  temaGroups.forEach(g => {
    hdr1.push(g.tema) // First col of group = tema name
    for (let i = 1; i < g.tajuks.length; i++) hdr1.push('') // Span blanks
    hdr1.push('') // TP col (blank in header row 1, filled in row 2)
  })
  hdr1.push('TPS')
  rows.push(rowToCSV(hdr1, totalCols))

  // ── Row 7: Header row 2 — Tajuk codes + TP labels ───────────────────
  const hdr2 = ['', '']
  temaGroups.forEach(g => {
    g.tajuks.forEach(t => hdr2.push(t.tajuk))
    hdr2.push('TP') // Per-tema TP average column label
  })
  hdr2.push('') // TPS sub-header (already labeled in row above)
  rows.push(rowToCSV(hdr2, totalCols))

  // ── Student data rows ────────────────────────────────────────────────
  students.forEach((student, idx) => {
    const row = [idx + 1, student.full_name]
    const studentResults = resultMatrix[student.id] || {}
    let allTPs = []

    temaGroups.forEach(g => {
      const temaTPs = []
      g.tajuks.forEach(t => {
        const val = studentResults[t.id]
        if (val != null && val !== '' && val !== 'TD') {
          const num = typeof val === 'number' ? val : parseInt(String(val).replace('TP', ''), 10)
          if (!isNaN(num) && num >= 1 && num <= 6) {
            row.push(num)
            temaTPs.push(num)
            allTPs.push(num)
          } else {
            row.push('')
          }
        } else {
          row.push('')
        }
      })

      // Per-tema TP average
      if (temaTPs.length > 0) {
        const avg = Math.round(temaTPs.reduce((a, b) => a + b, 0) / temaTPs.length)
        row.push(avg)
      } else {
        row.push(0)
      }
    })

    // TPS — overall average across all temas
    if (allTPs.length > 0) {
      const tps = Math.round(allTPs.reduce((a, b) => a + b, 0) / allTPs.length)
      row.push(tps)
    } else {
      row.push(0)
    }

    rows.push(rowToCSV(row, totalCols))
  })

  return rows.join('\r\n')
}

/**
 * Trigger CSV file download in the browser
 */
export function downloadCSV(csvContent, filename = 'borang_transit_pbd.csv') {
  const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
