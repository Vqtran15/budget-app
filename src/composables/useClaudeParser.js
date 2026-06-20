import Anthropic from '@anthropic-ai/sdk'
import * as pdfjs from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

async function extractRawText(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  let rawText = ''

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()

    const byY = new Map()
    for (const item of content.items) {
      const y = Math.round(item.transform[5])
      if (!byY.has(y)) byY.set(y, [])
      byY.get(y).push(item)
    }

    const sortedYs = [...byY.keys()].sort((a, b) => b - a)
    for (const y of sortedYs) {
      const items = byY.get(y).sort((a, b) => a.transform[4] - b.transform[4])
      const line = items.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim()
      if (line) rawText += line + '\n'
    }
    rawText += '\n--- PAGE BREAK ---\n'
  }

  return rawText
}

export function useClaudeParser() {
  async function parseWithClaude(file, apiKey) {
    const rawText = await extractRawText(file)

    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are a bank statement parser. Extract ALL financial transactions from this bank statement text.

Return ONLY a valid JSON array — no explanation, no markdown code blocks, just the raw JSON.

Each transaction object must have exactly these fields:
- "date": string (the transaction date as shown)
- "description": string (merchant or payee name, cleaned up — no reference numbers)
- "amount": number (NEGATIVE for charges/debits/purchases, POSITIVE for credits/payments/deposits)

Rules:
- Skip running balances — those are NOT transactions
- For credit card statements: purchases = NEGATIVE, payments to card = POSITIVE
- For checking/savings: withdrawals = NEGATIVE, deposits = POSITIVE
- Skip header rows, summary totals, and statement metadata
- Use the merchant name as description, not transaction codes or reference numbers

Bank statement text:
${rawText}`,
      }],
    })

    let text = response.content[0].text.trim()
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

    const parsed = JSON.parse(text)

    return parsed.map((tx, i) => ({
      id: `ai-tx-${i}-${Date.now()}`,
      date: String(tx.date),
      description: String(tx.description),
      amount: Number(tx.amount),
      type: tx.amount >= 0 ? 'credit' : 'debit',
    }))
  }

  return { parseWithClaude }
}
