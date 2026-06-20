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

    <!-- AI parse fallback panel -->
    <Transition name="ai-panel">
    <div v-if="showAiPanel" class="ai-panel">
      <div class="ai-panel-header">
        <Sparkles :size="18" class="ai-icon" />
        <div>
          <p class="ai-title">Try AI-powered parsing</p>
          <p class="ai-sub">Works with Capital One, Discover, Amex, and any other format</p>
        </div>
      </div>

      <div class="ai-key-row">
        <input
          v-model="apiKeyInput"
          type="password"
          class="api-key-input"
          placeholder="sk-ant-..."
          autocomplete="off"
          @keydown.enter="handleAiParse"
        />
        <button
          class="btn-ai"
          :disabled="!apiKeyInput.trim() || aiLoading"
          @click="handleAiParse"
        >
          <span v-if="aiLoading" class="spinner-sm"></span>
          {{ aiLoading ? 'Parsing…' : 'Parse with AI' }}
        </button>
      </div>

      <p class="ai-note">
        Requires a
        <a href="https://console.anthropic.com/" target="_blank" rel="noopener">Claude API key</a>.
        Your key is saved in your browser only and never sent to any server other than Anthropic.
      </p>

      <div v-if="aiError" class="ai-error"><AlertTriangle :size="14" /> {{ aiError }}</div>
    </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BarChart3, CheckCircle2, Sparkles, AlertTriangle, History, ChevronDown } from 'lucide-vue-next'
import PdfUploader from '../components/PdfUploader.vue'
import UploadHistory from '../components/UploadHistory.vue'
import { usePdfParser } from '../composables/usePdfParser.js'
import { useClaudeParser } from '../composables/useClaudeParser.js'
import { useCsvParser } from '../composables/useCsvParser.js'
import { useExcelParser } from '../composables/useExcelParser.js'
import { useCategorizer } from '../composables/useCategorizer.js'
import { useTransactionStore } from '../composables/useTransactionStore.js'
import { useUploadHistory } from '../composables/useUploadHistory.js'
import { CATEGORIES } from '../utils/categories.js'

const { parseFile } = usePdfParser()
const { parseWithClaude } = useClaudeParser()
const { parseCsvFile, parseTxtFile } = useCsvParser()
const { parseExcelFile } = useExcelParser()
const { categorizeAll } = useCategorizer()
const store = useTransactionStore()
const { addEntry, history } = useUploadHistory()
const showHistory = ref(false)

const loading = ref(false)
const error = ref('')
const showAiPanel = ref(false)
const aiLoading = ref(false)
const aiError = ref('')
const lastFile = ref(null)
const apiKeyInput = ref(localStorage.getItem('claude-api-key') ?? '')
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
  store.transactions.value = categorizeAll(filterBalanceLines(parsed))
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
  successMsg.value = `${store.transactions.value.length} transactions loaded`
  successTimer = setTimeout(() => { successMsg.value = ''; previousState.value = null }, 8000)
}


async function handleFile(file) {
  loading.value = true
  error.value = ''
  showAiPanel.value = false
  aiError.value = ''
  store.fileName.value = file.name
  lastFile.value = file

  try {
    const name  = file.name.toLowerCase()
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
      const { transactions, rawLineCount } = await parseFile(file)
      if (!transactions.length) {
        error.value = `No transactions found. Extracted ${rawLineCount} text lines — the PDF may use an unsupported format. Try downloading a CSV from your bank instead.`
        showAiPanel.value = true
      } else {
        finalize(transactions)
      }
    }
  } catch (e) {
    error.value = `Failed to parse file: ${e.message}`
  }

  loading.value = false
}

function onHistoryRemoved(entry) {
  if (store.fileName.value === entry.fileName) store.reset()
}

async function handleAiParse() {
  if (!apiKeyInput.value.trim() || !lastFile.value) return
  localStorage.setItem('claude-api-key', apiKeyInput.value.trim())

  aiLoading.value = true
  aiError.value = ''

  try {
    const parsed = await parseWithClaude(lastFile.value, apiKeyInput.value.trim())
    if (!parsed.length) {
      aiError.value = 'Claude could not find any transactions. The PDF may be image-based (scanned) rather than text-based.'
    } else {
      finalize(parsed, { isAi: true })
    }
  } catch (e) {
    aiError.value = e.message?.includes('401')
      ? 'Invalid API key — check your key at console.anthropic.com.'
      : `AI parsing failed: ${e.message}`
  }

  aiLoading.value = false
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

/* AI panel */
.ai-panel {
  width: 100%;
  max-width: 520px;
  margin-top: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-panel-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.ai-icon { color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.ai-title { font-size: 15px; font-weight: 700; color: var(--text); }
.ai-sub   { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

.ai-key-row { display: flex; gap: 8px; }

.api-key-input {
  flex: 1;
  font-size: 13px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-family: monospace;
  min-width: 0;
}

.api-key-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }

.btn-ai {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s;
}

.btn-ai:hover:not(:disabled) { background: var(--accent-hover); }
.btn-ai:disabled { opacity: .5; cursor: not-allowed; }

.spinner-sm {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.ai-note { font-size: 12px; color: var(--text-xs); line-height: 1.5; }
.ai-note a { color: var(--accent); text-decoration: underline; }
.ai-error { font-size: 13px; color: var(--accent-hover); background: var(--red-light); padding: 10px 14px; border-radius: 8px; display: flex; align-items: center; gap: 6px; }

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

.ai-panel-enter-active {
  transition: opacity .25s ease, transform .25s ease, max-height .3s ease;
  overflow: hidden;
  max-height: 400px;
}
.ai-panel-leave-active {
  transition: opacity .2s ease, transform .18s ease, max-height .25s ease;
  overflow: hidden;
  max-height: 400px;
}
.ai-panel-enter-from, .ai-panel-leave-to { opacity: 0; transform: translateY(-8px); max-height: 0; }

@media (max-width: 640px) {
  .upload-page  { padding: 24px 0 48px; }
  .title        { font-size: 24px; gap: 8px; }
  .ai-key-row   { flex-direction: column; }
  .btn-ai       { width: 100%; justify-content: center; }
}
</style>
