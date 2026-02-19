'use client'

const TEMPLATE_PATH = '/templates/BORANG TRANSIT PBD TAHUN 2026.xlsx'

const TEMA_COLOR_PALETTE = [
  'FFFCE8E6', // soft rose
  'FFEAF6E9', // soft green
  'FFE8F1FD', // soft blue
  'FFFEF4D4', // soft amber
  'FFE9F7F3', // soft mint
  'FFFDEDEA', // soft coral
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

function clearAllMerges(worksheet) {
  const ranges = worksheet?.model?.merges ? [...worksheet.model.merges] : Object.keys(worksheet._merges || {})
  ranges.forEach(range => worksheet.unMergeCells(range))
}

function clearSheetRows(worksheet) {
  const count = worksheet.rowCount || 0
  if (count > 0) worksheet.spliceRows(1, count)
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

function captureTemplateStyles(worksheet) {
  return {
    title: deepClone(worksheet.getCell('A1').style),
    metaLeft: deepClone(worksheet.getCell('C3').style),
    metaRight: deepClone(worksheet.getCell('Q3').style),
    fixedHeaderTop: deepClone(worksheet.getCell('A6').style),
    fixedHeaderSub: deepClone(worksheet.getCell('A7').style),
    temaHeaderTop: deepClone(worksheet.getCell('D6').style),
    temaHeaderSub: deepClone(worksheet.getCell('D7').style),
    studentBil: deepClone(worksheet.getCell('A8').style),
    studentName: deepClone(worksheet.getCell('B8').style),
    studentValue: deepClone(worksheet.getCell('D8').style),
    studentSummary: deepClone(worksheet.getCell('AV8').style),
  }
}

export function createBorangTransitFilename(className, setName, ext = 'xlsx') {
  const cls = sanitizeFileNamePart(className) || 'Kelas'
  const set = sanitizeFileNamePart(setName) || 'Set'
  return `Borang_Transit_PBD_${cls}_${set}.${ext}`
}

/**
 * Build Borang Transit workbook from template and return XLSX bytes.
 */
export async function generateBorangTransitWorkbookFromTemplate({
  templatePath = TEMPLATE_PATH,
  sheetName = '',
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

  const templateResp = await fetch(templatePath)
  if (!templateResp.ok) {
    throw new Error(`Gagal memuat template XLSX (${templateResp.status})`)
  }

  const templateBuffer = await templateResp.arrayBuffer()
  await workbook.xlsx.load(templateBuffer)

  const worksheet = sheetName
    ? workbook.getWorksheet(sheetName)
    : workbook.worksheets[0]

  if (!worksheet) {
    throw new Error('Template worksheet tidak ditemui')
  }

  const templateStyles = captureTemplateStyles(worksheet)

  clearAllMerges(worksheet)
  clearSheetRows(worksheet)

  const fixedCols = 2 // BIL, NAMA MURID
  let dynamicCols = 1 // TPS
  temaGroups.forEach(group => {
    dynamicCols += (group.tajuks?.length || 0) + 1 // tajuk cols + TP
  })
  const totalCols = fixedCols + dynamicCols

  // Basic column widths
  worksheet.getColumn(1).width = 6
  worksheet.getColumn(2).width = 34
  for (let col = 3; col <= totalCols; col += 1) {
    worksheet.getColumn(col).width = 12
  }

  // Title row
  worksheet.mergeCells(1, 1, 1, totalCols)
  const titleCell = worksheet.getCell(1, 1)
  titleCell.value = title
  titleCell.style = resolveStyle(templateStyles.title, FALLBACK_TITLE_STYLE)
  worksheet.getRow(1).height = 28

  // Meta rows
  const splitCol = Math.max(6, Math.min(totalCols - 2, Math.floor(totalCols * 0.6)))
  worksheet.mergeCells(3, 2, 3, splitCol - 1)
  worksheet.mergeCells(3, splitCol, 3, totalCols)
  worksheet.mergeCells(4, 2, 4, splitCol - 1)
  worksheet.mergeCells(4, splitCol, 4, totalCols)

  const metaLeftStyle = resolveStyle(templateStyles.metaLeft, FALLBACK_META_STYLE)
  const metaRightStyle = resolveStyle(templateStyles.metaRight, FALLBACK_META_STYLE)

  const schoolCell = worksheet.getCell(3, 2)
  schoolCell.value = `NAMA SEKOLAH : ${schoolName}`
  schoolCell.style = deepClone(metaLeftStyle)

  const classCell = worksheet.getCell(3, splitCol)
  classCell.value = `KELAS : ${className}`
  classCell.style = deepClone(metaRightStyle)

  const subjectCell = worksheet.getCell(4, 2)
  subjectCell.value = `MATA PELAJARAN : ${subjectName}`
  subjectCell.style = deepClone(metaLeftStyle)

  const teacherCell = worksheet.getCell(4, splitCol)
  teacherCell.value = `NAMA GURU : ${teacherName}`
  teacherCell.style = deepClone(metaRightStyle)

  // Header rows
  worksheet.mergeCells(6, 1, 7, 1)
  worksheet.mergeCells(6, 2, 7, 2)

  const fixedTopStyle = resolveStyle(templateStyles.fixedHeaderTop, FALLBACK_HEADER_TOP_STYLE)
  const fixedSubStyle = resolveStyle(templateStyles.fixedHeaderSub, FALLBACK_HEADER_SUB_STYLE)
  const temaTopStyle = resolveStyle(templateStyles.temaHeaderTop, FALLBACK_HEADER_TOP_STYLE)
  const temaSubStyle = resolveStyle(templateStyles.temaHeaderSub, FALLBACK_HEADER_SUB_STYLE)

  const bilHeader = worksheet.getCell(6, 1)
  bilHeader.value = 'BIL'
  bilHeader.style = deepClone(fixedTopStyle)

  const nameHeader = worksheet.getCell(6, 2)
  nameHeader.value = 'NAMA MURID'
  nameHeader.style = deepClone(fixedTopStyle)

  // Ensure merged partner cells carry style too
  worksheet.getCell(7, 1).style = deepClone(fixedSubStyle)
  worksheet.getCell(7, 2).style = deepClone(fixedSubStyle)

  let startCol = 3
  temaGroups.forEach((group, temaIdx) => {
    const tajukCount = group.tajuks?.length || 0
    const endCol = startCol + tajukCount // include TP column
    const color = TEMA_COLOR_PALETTE[temaIdx % TEMA_COLOR_PALETTE.length]

    worksheet.mergeCells(6, startCol, 6, endCol)

    for (let col = startCol; col <= endCol; col += 1) {
      const topCell = worksheet.getCell(6, col)
      topCell.style = deepClone(temaTopStyle)
      setFillColor(topCell, color)
    }

    const temaCell = worksheet.getCell(6, startCol)
    temaCell.value = group.tema || `TEMA ${temaIdx + 1}`

    for (let idx = 0; idx < tajukCount; idx += 1) {
      const col = startCol + idx
      const tajuk = group.tajuks[idx]
      const subCell = worksheet.getCell(7, col)
      subCell.value = tajuk?.tajuk || ''
      subCell.style = deepClone(temaSubStyle)
      setFillColor(subCell, color)
    }

    const tpCell = worksheet.getCell(7, endCol)
    tpCell.value = 'TP'
    tpCell.style = deepClone(temaSubStyle)
    setFillColor(tpCell, color)

    startCol = endCol + 1
  })

  const tpsCol = startCol
  worksheet.mergeCells(6, tpsCol, 7, tpsCol)
  const tpsHeader = worksheet.getCell(6, tpsCol)
  tpsHeader.value = 'TPS'
  tpsHeader.style = deepClone(fixedTopStyle)
  worksheet.getCell(7, tpsCol).style = deepClone(fixedSubStyle)

  worksheet.getRow(6).height = 24
  worksheet.getRow(7).height = 36

  const bilDataStyle = resolveStyle(templateStyles.studentBil, FALLBACK_DATA_STYLE)
  const nameDataStyle = resolveStyle(templateStyles.studentName, FALLBACK_NAME_STYLE)
  const valueDataStyle = resolveStyle(templateStyles.studentValue, FALLBACK_DATA_STYLE)
  const summaryDataStyle = resolveStyle(templateStyles.studentSummary, FALLBACK_DATA_STYLE)

  // Data rows
  students.forEach((student, idx) => {
    const rowNum = 8 + idx
    const row = worksheet.getRow(rowNum)
    const studentResults = resultMatrix[student.id] || {}

    const bilCell = worksheet.getCell(rowNum, 1)
    bilCell.value = idx + 1
    bilCell.style = deepClone(bilDataStyle)

    const studentCell = worksheet.getCell(rowNum, 2)
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

        const valueCell = worksheet.getCell(rowNum, col)
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

      const tpAvgCell = worksheet.getCell(rowNum, col)
      tpAvgCell.value = temaAvg
      tpAvgCell.style = deepClone(summaryDataStyle)
      setFillColor(tpAvgCell, color)
      col += 1
    })

    const tps = allTPs.length > 0
      ? Math.round(allTPs.reduce((a, b) => a + b, 0) / allTPs.length)
      : 0

    const tpsCell = worksheet.getCell(rowNum, tpsCol)
    tpsCell.value = tps
    tpsCell.style = deepClone(summaryDataStyle)
    row.height = 20
  })

  // Keep printable area tightly around written content
  const lastDataRow = Math.max(8, 7 + students.length)
  worksheet.pageSetup = {
    ...worksheet.pageSetup,
    printArea: `A1:${getColumnLetter(totalCols)}${lastDataRow}`,
  }

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
