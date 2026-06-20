import * as pdfjs from 'pdfjs-dist'

// Dynamically set worker to match installed version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

/**
 * Extracts text lines from a PDF file, using Y-position grouping to
 * reconstruct logical lines from pdfjs text items.
 */
async function extractLines(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  const allLines = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()

    // Group items by rounded Y coordinate to reconstruct rows
    const byY = new Map()
    for (const item of content.items) {
      const y = Math.round(item.transform[5])
      if (!byY.has(y)) byY.set(y, [])
      byY.get(y).push(item)
    }

    // Sort Y descending (top of page first), then sort items left-to-right
    const sortedYs = [...byY.keys()].sort((a, b) => b - a)
    for (const y of sortedYs) {
      const items = byY.get(y).sort((a, b) => a.transform[4] - b.transform[4])
      const lineText = items.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim()
      if (lineText) allLines.push(lineText)
    }
  }

  return allLines
}

const DATE_RE = /^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+/
const AMOUNT_RE = /(-?\$?[\d,]+\.\d{2})/g
const HEADER_RE = /^(date|description|amount|balance|transaction|posting|memo|type|debit|credit)\b/i

function parseLine(line, index) {
  const dateMatch = line.match(DATE_RE)
  if (!dateMatch) return null
  if (HEADER_RE.test(line)) return null

  const amounts = [...line.matchAll(AMOUNT_RE)]
  if (amounts.length === 0) return null

  // If 2+ amounts, the last is typically the running balance — use second-to-last
  const txAmountStr = amounts.length >= 2
    ? amounts[amounts.length - 2][0]
    : amounts[amounts.length - 1][0]

  const amount = parseFloat(txAmountStr.replace(/[$,]/g, ''))
  if (isNaN(amount) || Math.abs(amount) < 0.01) return null

  // Description lives between the date token and the first dollar amount
  const dateEnd = dateMatch[0].length
  const firstAmountIndex = line.indexOf(amounts[0][0], dateEnd)
  const description = line.substring(dateEnd, firstAmountIndex).trim()

  if (!description || description.length < 2 || description.length > 120) return null

  return {
    id: `tx-${index}-${Date.now()}`,
    date: dateMatch[1],
    description,
    amount,
    type: amount >= 0 ? 'credit' : 'debit',
  }
}

export function usePdfParser() {
  async function parseFile(file) {
    const lines = await extractLines(file)
    const transactions = []

    for (let i = 0; i < lines.length; i++) {
      const tx = parseLine(lines[i], i)
      if (tx) transactions.push(tx)
    }

    return { transactions, rawLineCount: lines.length }
  }

  return { parseFile }
}
