import ExcelJS from 'exceljs'
import { parseRows } from './useCsvParser.js'

function normalizeCell(value) {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof value === 'object') {
    if ('result' in value) return normalizeCell(value.result)
    if ('richText' in value) return value.richText.map(r => r.text).join('')
    if ('text' in value) return String(value.text ?? '')
    if ('error' in value) return ''
  }
  return value
}

export function useExcelParser() {
  async function parseExcelFile(file) {
    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.worksheets[0]

    const rows = []
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const cells = []
      for (let c = 1; c <= row.cellCount; c++) {
        cells.push(normalizeCell(row.getCell(c).value))
      }
      rows.push(cells)
    })

    return { transactions: parseRows(rows) }
  }

  return { parseExcelFile }
}
