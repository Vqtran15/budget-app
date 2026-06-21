// Core: normalize a 2D array of rows (first row = headers) into transactions
export function parseRows(rows) {
  if (rows.length < 2) return []

  // Some banks (e.g. BofA) prepend a summary block before the real header row
  let headerRowIdx = 0
  for (let i = 0; i < Math.min(rows.length - 1, 10); i++) {
    const lower = rows[i].map(h => String(h ?? '').toLowerCase().replace(/[^a-z0-9]/g, ''))
    const hasDate = lower.some(h => h === 'date' || h === 'transactiondate' || h === 'posteddate')
    const hasAmt  = lower.some(h => h.includes('amount') || h.includes('debit') || h.includes('credit'))
    if (hasDate && hasAmt) { headerRowIdx = i; break }
  }

  const headers = rows[headerRowIdx].map(h => String(h ?? '').toLowerCase().replace(/[^a-z0-9]/g, ''))

  function col(...names) {
    for (const name of names) {
      const idx = headers.findIndex(h => h.includes(name.replace(/[^a-z0-9]/g, '')))
      if (idx !== -1) return idx
    }
    return -1
  }

  const dateIdx   = col('transactiondate', 'date', 'posteddate')
  const descIdx   = col('description', 'memo', 'name', 'payee', 'merchant')
  const amtIdx    = col('amount')
  const debitIdx  = col('debit')
  const creditIdx = col('credit')

  if (dateIdx === -1 || descIdx === -1) return []

  const transactions = []

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every(c => !String(c ?? '').trim())) continue

    const date        = String(row[dateIdx] ?? '').trim()
    const description = String(row[descIdx] ?? '').trim()
    if (!date || !description) continue

    let amount

    if (debitIdx !== -1 && creditIdx !== -1) {
      // Capital One style: separate Debit / Credit columns (both positive)
      const debit  = parseFloat(String(row[debitIdx]  ?? '').replace(/[$,]/g, '')) || 0
      const credit = parseFloat(String(row[creditIdx] ?? '').replace(/[$,]/g, '')) || 0
      amount = credit > 0 ? credit : -debit
    } else if (amtIdx !== -1) {
      amount = parseFloat(String(row[amtIdx] ?? '').replace(/[$,]/g, ''))
    } else {
      continue
    }

    if (isNaN(amount) || Math.abs(amount) < 0.01) continue

    transactions.push({
      id: `tx-${i}-${Date.now()}`,
      date,
      description,
      amount,
      type: amount >= 0 ? 'credit' : 'debit',
    })
  }

  return transactions
}

// Parse a CSV or TSV text string into a 2D array
function textToRows(text, delimiter) {
  const lines = text.trim().split(/\r?\n/)

  function parseLine(line) {
    const fields = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuote = !inQuote
      } else if (ch === delimiter && !inQuote) {
        fields.push(cur.trim())
        cur = ''
      } else {
        cur += ch
      }
    }
    fields.push(cur.trim())
    return fields
  }

  return lines.map(parseLine)
}

export function useCsvParser() {
  async function parseCsvFile(file) {
    const text = await file.text()
    // Auto-detect delimiter: tab wins if tabs are more common than commas
    const tabs    = (text.match(/\t/g) ?? []).length
    const commas  = (text.match(/,/g)  ?? []).length
    const delim   = tabs > commas ? '\t' : ','
    const rows    = textToRows(text, delim)
    return { transactions: parseRows(rows) }
  }

  // TXT: same logic — auto-detect tab vs comma, or fall back to regex line parsing
  async function parseTxtFile(file) {
    const text = await file.text()
    const tabs   = (text.match(/\t/g) ?? []).length
    const commas = (text.match(/,/g)  ?? []).length

    if (tabs > 2 || commas > 2) {
      const delim = tabs > commas ? '\t' : ','
      const rows  = textToRows(text, delim)
      const transactions = parseRows(rows)
      if (transactions.length > 0) return { transactions }
    }

    // Fallback: regex-based line parsing (same heuristic as PDF parser)
    const DATE_RE   = /^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+/
    const AMOUNT_RE = /(-?\$?[\d,]+\.\d{2})/g
    const HEADER_RE = /^(date|description|amount|balance|transaction|posting|memo|type|debit|credit)\b/i

    const transactions = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const dateMatch = line.match(DATE_RE)
      if (!dateMatch || HEADER_RE.test(line)) continue

      const amounts = [...line.matchAll(AMOUNT_RE)]
      if (!amounts.length) continue

      const txAmountStr = amounts.length >= 2 ? amounts[amounts.length - 2][0] : amounts[amounts.length - 1][0]
      const amount = parseFloat(txAmountStr.replace(/[$,]/g, ''))
      if (isNaN(amount) || Math.abs(amount) < 0.01) continue

      const dateEnd = dateMatch[0].length
      const firstAmtIdx = line.indexOf(amounts[0][0], dateEnd)
      const description = line.substring(dateEnd, firstAmtIdx).trim()
      if (!description || description.length < 2) continue

      transactions.push({
        id: `txt-tx-${i}-${Date.now()}`,
        date: dateMatch[1],
        description,
        amount,
        type: amount >= 0 ? 'credit' : 'debit',
      })
    }

    return { transactions }
  }

  return { parseCsvFile, parseTxtFile }
}
