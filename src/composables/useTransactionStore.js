import { ref, watch } from 'vue'

const STORAGE_KEY = 'budget-active-session'

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

const saved = loadSession()

const transactions = ref(saved.transactions ?? [])
const fileName     = ref(saved.fileName     ?? '')
const parseWarning = ref(saved.parseWarning ?? '')
const aiParsed     = ref(saved.aiParsed     ?? false)

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    transactions: transactions.value,
    fileName: fileName.value,
    parseWarning: parseWarning.value,
    aiParsed: aiParsed.value,
  }))
}

watch(transactions, persist, { deep: true })
watch([fileName, parseWarning, aiParsed], persist)

export function useTransactionStore() {
  function reset() {
    transactions.value = []
    fileName.value     = ''
    parseWarning.value = ''
    aiParsed.value     = false
    localStorage.removeItem(STORAGE_KEY)
  }

  return { transactions, fileName, parseWarning, aiParsed, reset }
}
