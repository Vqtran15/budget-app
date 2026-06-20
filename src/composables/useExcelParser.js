import * as XLSX from 'xlsx'
import { parseRows } from './useCsvParser.js'

export function useExcelParser() {
  async function parseExcelFile(file) {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    // Convert to 2D array; raw: true keeps numbers as numbers
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

    // Normalize date cells (SheetJS returns Date objects when cellDates: true)
    const normalizedRows = rows.map(row =>
      row.map(cell => {
        if (cell instanceof Date) {
          const y = cell.getFullYear()
          const m = String(cell.getMonth() + 1).padStart(2, '0')
          const d = String(cell.getDate()).padStart(2, '0')
          return `${y}-${m}-${d}`
        }
        return cell
      })
    )

    return { transactions: parseRows(normalizedRows) }
  }

  return { parseExcelFile }
}
