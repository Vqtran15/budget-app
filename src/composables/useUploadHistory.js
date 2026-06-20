import { ref } from 'vue'

const STORAGE_KEY = 'budget-upload-history'
const MAX_ENTRIES = 10

const history = ref(load())

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
}

export function useUploadHistory() {
  function addEntry({ fileName, transactions, parseWarning, aiParsed }) {
    // Replace existing entry with same file name so re-uploads don't pile up
    const existing = history.value.findIndex(e => e.fileName === fileName)
    const entry = {
      id: `hist-${Date.now()}`,
      fileName,
      uploadedAt: new Date().toISOString(),
      transactionCount: transactions.length,
      transactions,
      parseWarning,
      aiParsed,
    }
    if (existing !== -1) {
      history.value.splice(existing, 1, entry)
    } else {
      history.value.unshift(entry)
      if (history.value.length > MAX_ENTRIES) history.value.pop()
    }
    save()
  }

  function removeEntry(id) {
    history.value = history.value.filter(e => e.id !== id)
    save()
  }

  function clearHistory() {
    history.value = []
    save()
  }

  return { history, addEntry, removeEntry, clearHistory }
}
