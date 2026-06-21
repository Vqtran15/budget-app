<template>
  <div class="upload-page">
    <div class="hero fade-up">
      <h1 class="title"><BarChart3 :size="32" class="title-icon" /> Cash Flow</h1>
      <p class="sub">Import your bank statement — we'll categorize it automatically</p>
    </div>

    <PdfUploader class="fade-up-1"
      :loading="loading"
      :error="error"
      @file-selected="handleFile"
    />

    <Transition name="toast">
      <div v-if="successMsg" class="success-toast">
        <CheckCircle2 :size="16" class="toast-icon" />
        <span class="toast-msg">{{ successMsg }}</span>
        <button v-if="previousState" class="btn-undo" @click="undo">Undo</button>
      </div>
    </Transition>

    <div v-if="store.transactions.value.length" class="reset-wrap fade-up-2">
      <button class="btn-reset" @click="confirmReset">
        <Trash2 :size="13" /> Start over
      </button>
    </div>

    <div v-if="history.length" class="history-wrap fade-up-2">
      <button class="history-toggle" @click="showHistory = !showHistory">
        <History :size="14" />
        Upload History
        <span class="history-count">{{ history.length }}</span>
        <ChevronDown :size="14" class="chevron" :class="{ open: showHistory }" />
      </button>
      <Transition name="slide">
        <div v-if="showHistory" class="history-panel">
          <UploadHistory @removed="onHistoryRemoved" />
        </div>
      </Transition>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BarChart3, CheckCircle2, History, ChevronDown, Trash2 } from 'lucide-vue-next'
import PdfUploader from '../components/PdfUploader.vue'
import UploadHistory from '../components/UploadHistory.vue'
import { useCsvParser } from '../composables/useCsvParser.js'
import { useExcelParser } from '../composables/useExcelParser.js'
import { useCategorizer } from '../composables/useCategorizer.js'
import { useTransactionStore } from '../composables/useTransactionStore.js'
import { useUploadHistory } from '../composables/useUploadHistory.js'
import { CATEGORIES } from '../utils/categories.js'

const { parseCsvFile, parseTxtFile } = useCsvParser()
const { parseExcelFile } = useExcelParser()
const { categorizeAll } = useCategorizer()
const store = useTransactionStore()
const { addEntry, clearHistory, history } = useUploadHistory()
const showHistory = ref(false)

const loading = ref(false)
const error = ref('')
const successMsg = ref('')
const previousState = ref(null)
let successTimer = null

const BALANCE_PATTERN = /\b(beginning|starting|opening|ending|previous|prior)\s+balance\b/i

function filterBalanceLines(txs) {
  return txs.filter(tx => !BALANCE_PATTERN.test(tx.description))
}

function saveSnapshot() {
  previousState.value = {
    transactions:  [...store.transactions.value],
    fileName:      store.fileName.value,
    parseWarning:  store.parseWarning.value,
    aiParsed:      store.aiParsed.value,
  }
}

function undo() {
  if (!previousState.value) return
  const s = previousState.value
  store.transactions.value = s.transactions
  store.fileName.value     = s.fileName
  store.parseWarning.value = s.parseWarning
  store.aiParsed.value     = s.aiParsed
  previousState.value      = null
  clearTimeout(successTimer)
  successMsg.value = ''
}

function finalize(parsed, { isAi = false } = {}) {
  saveSnapshot()

  const incoming = categorizeAll(filterBalanceLines(parsed))

  // Merge with existing — skip rows already present by date+description+amount
  const existingKeys = new Set(
    store.transactions.value.map(t => `${t.date}|${t.description}|${t.amount}`)
  )
  const toAdd = incoming.filter(t => !existingKeys.has(`${t.date}|${t.description}|${t.amount}`))

  store.transactions.value = [...store.transactions.value, ...toAdd]
  store.aiParsed.value = isAi

  const uncat = store.transactions.value.filter(t => t.category === CATEGORIES.UNCATEGORIZED).length
  store.parseWarning.value = uncat > 0
    ? `${uncat} item${uncat > 1 ? 's' : ''} need review`
    : ''

  addEntry({
    fileName: store.fileName.value,
    transactions: store.transactions.value,
    parseWarning: store.parseWarning.value,
    aiParsed: isAi,
  })

  clearTimeout(successTimer)
  successMsg.value = toAdd.length
    ? `${toAdd.length} transactions added (${store.transactions.value.length} total)`
    : 'No new transactions — file already imported'
  successTimer = setTimeout(() => { successMsg.value = ''; previousState.value = null }, 8000)
}


async function handleFile(file) {
  loading.value = true
  error.value = ''
  store.fileName.value = file.name

  try {
    const name    = file.name.toLowerCase()
    const isCsv   = name.endsWith('.csv')
    const isTxt   = name.endsWith('.txt')
    const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls')

    if (isCsv) {
      const { transactions } = await parseCsvFile(file)
      if (!transactions.length) {
        error.value = 'No transactions found in this CSV. Make sure it was exported from your bank.'
      } else {
        finalize(transactions)
      }
    } else if (isTxt) {
      const { transactions } = await parseTxtFile(file)
      if (!transactions.length) {
        error.value = 'No transactions found in this TXT file. Try exporting as CSV from your bank instead.'
      } else {
        finalize(transactions)
      }
    } else if (isExcel) {
      const { transactions } = await parseExcelFile(file)
      if (!transactions.length) {
        error.value = 'No transactions found in this Excel file. Make sure the first sheet has Date, Description, and Amount columns.'
      } else {
        finalize(transactions)
      }
    } else {
      error.value = 'Unsupported file type. Please upload a CSV, Excel, or TXT file.'
    }
  } catch (e) {
    error.value = `Failed to parse file: ${e.message}`
  }

  loading.value = false
}

function onHistoryRemoved(_entry) {
  // Transactions are merged across files — use Start Over to clear all data
}

async function confirmReset() {
  if (!confirm('Delete all transactions and upload history? This cannot be undone.')) return
  await Promise.all([store.reset(), clearHistory()])
}
</script>

<style scoped>
.upload-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0 64px;
}

.hero {
  text-align: center;
  margin-bottom: 8px;
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -.02em;
  color: var(--text);
}

.title-icon { flex-shrink: 0; }

.sub {
  color: var(--text-muted);
  font-size: 15px;
  margin-top: 6px;
}

.success-toast {
  width: 100%;
  max-width: 520px;
  background: var(--green-light);
  color: var(--green);
  border: 1px solid var(--green);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-icon { flex-shrink: 0; }
.toast-msg  { flex: 1; }

.btn-undo {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1.5px solid var(--green);
  background: transparent;
  color: var(--green);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, color .15s;
  flex-shrink: 0;
}
.btn-undo:hover { background: var(--green); color: white; }

.reset-wrap {
  width: 100%;
  max-width: 520px;
  display: flex;
  justify-content: flex-end;
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;
}
.btn-reset:hover {
  background: var(--red-light, #fef2f2);
  color: var(--red, #ef4444);
  border-color: var(--red, #ef4444);
}

.history-wrap {
  width: 100%;
  max-width: 520px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.history-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  text-align: left;
  transition: background .15s, color .15s;
}
.history-toggle:hover { background: var(--surface-hover); color: var(--text); }

.history-count {
  font-size: 11px;
  font-weight: 700;
  background: var(--bg);
  color: var(--text-muted);
  padding: 1px 7px;
  border-radius: 99px;
}

.chevron { margin-left: auto; transition: transform .2s; }
.chevron.open { transform: rotate(180deg); }

.history-panel {
  border-top: 1px solid var(--border);
  padding: 0 12px 12px;
}

.history-panel :deep(.history) {
  max-width: 100%;
  margin-top: 12px;
}

.slide-enter-active, .slide-leave-active {
  transition: opacity .2s ease, max-height .25s ease;
  max-height: 600px;
  overflow: hidden;
}
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; }

.toast-enter-active { transition: opacity .3s, transform .3s; }
.toast-leave-active { transition: opacity .4s, transform .4s; }
.toast-enter-from  { opacity: 0; transform: translateY(-6px); }
.toast-leave-to    { opacity: 0; transform: translateY(-6px); }

@media (max-width: 640px) {
  .upload-page { padding: 24px 0 48px; }
  .title       { font-size: 24px; gap: 8px; }
}
</style>
