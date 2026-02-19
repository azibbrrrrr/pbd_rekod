'use client'

const TEMA_COLOR_PALETTE = [
  'FF8BC34A', // Bacaan - medium green
  'FFBA68C8', // Hafazan - soft purple
  'FFE6D5A8', // Akidah - beige / sand
  'FF29B6F6', // Ibadat - bright blue
  'FFFFC107', // Sirah - amber yellow
  'FFEF9A9A', // Adab - soft pink
  'FF26C6DA', // Jawi - teal cyan
]

const FALLBACK_BORDER = {
  top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
}

const FALLBACK_TITLE_STYLE = {
  font: { name: 'Calibri', bold: true, size: 14 },
  alignment: { horizontal: 'center', vertical: 'middle' },
}

const FALLBACK_META_STYLE = {
  font: { name: 'Calibri', bold: true, size: 11 },
  alignment: { horizontal: 'left', vertical: 'middle' },
}

const FALLBACK_HEADER_TOP_STYLE = {
  font: { name: 'Calibri', bold: true, size: 10 },
  alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
  border: FALLBACK_BORDER,
}

const FALLBACK_HEADER_SUB_STYLE = {
  font: { name: 'Calibri', bold: true, size: 9 },
  alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
  border: FALLBACK_BORDER,
}

const FALLBACK_DATA_STYLE = {
  font: { name: 'Calibri', size: 10 },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: FALLBACK_BORDER,
}

const FALLBACK_NAME_STYLE = {
  ...FALLBACK_DATA_STYLE,
  alignment: { horizontal: 'left', vertical: 'middle' },
}

function deepClone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : {}
}

function hasStyle(style) {
  return !!style && Object.keys(style).length > 0
}

function resolveStyle(primaryStyle, fallbackStyle) {
  return deepClone(hasStyle(primaryStyle) ? primaryStyle : fallbackStyle)
}

function getColumnLetter(index) {
  let n = index
  let result = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    result = String.fromCharCode(65 + rem) + result
    n = Math.floor((n - 1) / 26)
  }
  return result
}

function setFillColor(cell, argb) {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb },
  }
}

function parseTP(value) {
  if (value == null || value === '' || value === 'TD') return null
  const raw = typeof value === 'number' ? value : parseInt(String(value).replace('TP', ''), 10)
  if (Number.isNaN(raw)) return null
  if (raw < 1 || raw > 6) return null
  return raw
}

function sanitizeFileNamePart(text) {
  return String(text || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .replace(/\s+/g, '_')
}

function sanitizeSheetName(text, fallback = 'Sheet1') {
  const cleaned = String(text || '')
    .replace(/[\\/*?:[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return (cleaned || fallback).slice(0, 31)
}

/**
 * Build the content of a single Borang Transit sheet.
 */
function buildSheetContent(ws, templateStyles, {
  title = 'BORANG TRANSIT PBD',
  schoolName = '',
  className = '',
  subjectName = '',
  teacherName = '',
  students = [],
  temaGroups = [],
  resultMatrix = {},
}) {
  const fixedCols = 2 // BIL, NAMA MURID
  let dynamicCols = 1 // TPS
  temaGroups.forEach(group => {
    dynamicCols += (group.tajuks?.length || 0) + 1 // tajuk cols + TP
  })
  const totalCols = fixedCols + dynamicCols

  // Basic column widths
  ws.getColumn(1).width = 6
  ws.getColumn(2).width = 34
  for (let col = 3; col <= totalCols; col += 1) {
    ws.getColumn(col).width = 12
  }

  // Title row
  ws.mergeCells(1, 1, 1, totalCols)
  const titleCell = ws.getCell(1, 1)
  titleCell.value = title
  titleCell.style = resolveStyle(templateStyles.title, FALLBACK_TITLE_STYLE)
  ws.getRow(1).height = 28

  // Meta rows
  const splitCol = Math.max(6, Math.min(totalCols - 2, Math.floor(totalCols * 0.6)))
  ws.mergeCells(3, 2, 3, splitCol - 1)
  ws.mergeCells(3, splitCol, 3, totalCols)
  ws.mergeCells(4, 2, 4, splitCol - 1)
  ws.mergeCells(4, splitCol, 4, totalCols)

  const metaLeftStyle = resolveStyle(templateStyles.metaLeft, FALLBACK_META_STYLE)
  const metaRightStyle = resolveStyle(templateStyles.metaRight, FALLBACK_META_STYLE)

  const schoolCell = ws.getCell(3, 2)
  schoolCell.value = `NAMA SEKOLAH : ${schoolName}`
  schoolCell.style = deepClone(metaLeftStyle)

  const classCell = ws.getCell(3, splitCol)
  classCell.value = `KELAS : ${className}`
  classCell.style = deepClone(metaRightStyle)

  const subjectCell = ws.getCell(4, 2)
  subjectCell.value = `MATA PELAJARAN : ${subjectName}`
  subjectCell.style = deepClone(metaLeftStyle)

  const teacherCell = ws.getCell(4, splitCol)
  teacherCell.value = `NAMA GURU : ${teacherName}`
  teacherCell.style = deepClone(metaRightStyle)

  // Header rows
  ws.mergeCells(6, 1, 7, 1)
  ws.mergeCells(6, 2, 7, 2)

  const fixedTopStyle = resolveStyle(templateStyles.fixedHeaderTop, FALLBACK_HEADER_TOP_STYLE)
  const fixedSubStyle = resolveStyle(templateStyles.fixedHeaderSub, FALLBACK_HEADER_SUB_STYLE)
  const temaTopStyle = resolveStyle(templateStyles.temaHeaderTop, FALLBACK_HEADER_TOP_STYLE)
  const temaSubStyle = resolveStyle(templateStyles.temaHeaderSub, FALLBACK_HEADER_SUB_STYLE)

  const bilHeader = ws.getCell(6, 1)
  bilHeader.value = 'BIL'
  bilHeader.style = deepClone(fixedTopStyle)

  const nameHeader = ws.getCell(6, 2)
  nameHeader.value = 'NAMA MURID'
  nameHeader.style = deepClone(fixedTopStyle)

  // Ensure merged partner cells carry style too
  ws.getCell(7, 1).style = deepClone(fixedSubStyle)
  ws.getCell(7, 2).style = deepClone(fixedSubStyle)

  let startCol = 3
  temaGroups.forEach((group, temaIdx) => {
    const tajukCount = group.tajuks?.length || 0
    const endCol = startCol + tajukCount // include TP column
    const color = TEMA_COLOR_PALETTE[temaIdx % TEMA_COLOR_PALETTE.length]

    ws.mergeCells(6, startCol, 6, endCol)

    for (let col = startCol; col <= endCol; col += 1) {
      const topCell = ws.getCell(6, col)
      topCell.style = deepClone(temaTopStyle)
      setFillColor(topCell, color)
    }

    const temaCell = ws.getCell(6, startCol)
    temaCell.value = group.tema || `TEMA ${temaIdx + 1}`

    for (let idx = 0; idx < tajukCount; idx += 1) {
      const col = startCol + idx
      const tajuk = group.tajuks[idx]
      const subCell = ws.getCell(7, col)
      subCell.value = tajuk?.tajuk || ''
      subCell.style = deepClone(temaSubStyle)
      setFillColor(subCell, color)
    }

    const tpCell = ws.getCell(7, endCol)
    tpCell.value = 'TP'
    tpCell.style = deepClone(temaSubStyle)
    setFillColor(tpCell, color)

    startCol = endCol + 1
  })

  const tpsCol = startCol
  ws.mergeCells(6, tpsCol, 7, tpsCol)
  const tpsHeader = ws.getCell(6, tpsCol)
  tpsHeader.value = 'TPS'
  tpsHeader.style = deepClone(fixedTopStyle)
  ws.getCell(7, tpsCol).style = deepClone(fixedSubStyle)

  ws.getRow(6).height = 24
  ws.getRow(7).height = 36

  const bilDataStyle = resolveStyle(templateStyles.studentBil, FALLBACK_DATA_STYLE)
  const nameDataStyle = resolveStyle(templateStyles.studentName, FALLBACK_NAME_STYLE)
  const valueDataStyle = resolveStyle(templateStyles.studentValue, FALLBACK_DATA_STYLE)
  const summaryDataStyle = resolveStyle(templateStyles.studentSummary, FALLBACK_DATA_STYLE)

  // Data rows
  students.forEach((student, idx) => {
    const rowNum = 8 + idx
    const row = ws.getRow(rowNum)
    const studentResults = resultMatrix[student.id] || {}

    const bilCell = ws.getCell(rowNum, 1)
    bilCell.value = idx + 1
    bilCell.style = deepClone(bilDataStyle)

    const studentCell = ws.getCell(rowNum, 2)
    studentCell.value = student.full_name || ''
    studentCell.style = deepClone(nameDataStyle)

    let col = 3
    const allTPs = []

    temaGroups.forEach((group, temaIdx) => {
      const tajukCount = group.tajuks?.length || 0
      const color = TEMA_COLOR_PALETTE[temaIdx % TEMA_COLOR_PALETTE.length]
      const temaTPs = []

      for (let t = 0; t < tajukCount; t += 1) {
        const tajuk = group.tajuks[t]
        const num = parseTP(studentResults[tajuk.id])

        const valueCell = ws.getCell(rowNum, col)
        valueCell.value = num == null ? '' : num
        valueCell.style = deepClone(valueDataStyle)
        if (num != null) {
          temaTPs.push(num)
          allTPs.push(num)
        }
        col += 1
      }

      const temaAvg = temaTPs.length > 0
        ? Math.round(temaTPs.reduce((a, b) => a + b, 0) / temaTPs.length)
        : 0

      const tpAvgCell = ws.getCell(rowNum, col)
      tpAvgCell.value = temaAvg
      tpAvgCell.style = deepClone(summaryDataStyle)
      setFillColor(tpAvgCell, color)
      col += 1
    })

    const tps = allTPs.length > 0
      ? Math.round(allTPs.reduce((a, b) => a + b, 0) / allTPs.length)
      : 0

    const tpsCell = ws.getCell(rowNum, tpsCol)
    tpsCell.value = tps
    tpsCell.style = deepClone(summaryDataStyle)
    row.height = 20
  })

  // Keep printable area tightly around written content
  const lastDataRow = Math.max(8, 7 + students.length)
  ws.pageSetup = {
    printArea: `A1:${getColumnLetter(totalCols)}${lastDataRow}`,
  }
}

export function createBorangTransitFilename(className, setName, ext = 'xlsx') {
  const cls = sanitizeFileNamePart(className) || 'Kelas'
  const set = sanitizeFileNamePart(setName) || 'Set'
  return `Borang_Transit_PBD_${cls}_${set}.${ext}`
}

/**
 * Build Borang Transit workbook and return XLSX bytes.
 * Kept function name for compatibility with existing imports.
 */
export async function generateBorangTransitWorkbookFromTemplate({
  title = 'BORANG TRANSIT PBD',
  schoolName = '',
  className = '',
  subjectName = '',
  teacherName = '',
  students = [],
  temaGroups = [],
  resultMatrix = {},
} = {}) {
  const ExcelJSImport = await import('exceljs/dist/exceljs.min.js')
  const ExcelJS = ExcelJSImport.default || ExcelJSImport
  const workbook = new ExcelJS.Workbook()
  const ws = workbook.addWorksheet(sanitizeSheetName(className, 'Sheet1'))

  buildSheetContent(ws, {}, {
    title,
    schoolName,
    className,
    subjectName,
    teacherName,
    students,
    temaGroups,
    resultMatrix,
  })

  return workbook.xlsx.writeBuffer()
}

/**
 * Generate a workbook with one sheet per class.
 */
export async function generateMultiClassWorkbook({
  classes = [],
  temaGroups = [],
  title = 'BORANG TRANSIT PBD',
  schoolName = '',
  subjectName = '',
  teacherName = '',
} = {}) {
  const ExcelJSImport = await import('exceljs/dist/exceljs.min.js')
  const ExcelJS = ExcelJSImport.default || ExcelJSImport
  const workbook = new ExcelJS.Workbook()

  classes.forEach(({ className, students, resultMatrix }, idx) => {
    const sheetName = sanitizeSheetName(className, `Sheet${idx + 1}`)
    const ws = workbook.addWorksheet(sheetName)
    buildSheetContent(ws, {}, {
      title,
      schoolName,
      className,
      subjectName,
      teacherName,
      students,
      temaGroups,
      resultMatrix,
    })
  })

  return workbook.xlsx.writeBuffer()
}

export function downloadXLSX(buffer, filename = 'borang_transit_pbd.xlsx') {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
