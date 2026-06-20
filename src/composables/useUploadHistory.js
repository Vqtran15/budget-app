import { ref } from 'vue'
import { supabase, setSyncing, setSynced, setSyncError } from '../lib/supabase.js'
import { useAuth } from './useAuth.js'

const STORAGE_KEY = 'budget-upload-history'
const MAX_ENTRIES = 10

const history  = ref(loadLocal())
const { userId } = useAuth()

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') }
  catch { return [] }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

function toRow(entry) {
  return {
    id:                entry.id,
    user_id:           userId.value,
    file_name:         entry.fileName,
    uploaded_at:       entry.uploadedAt,
    transaction_count: entry.transactionCount,
    transactions:      entry.transactions,
    parse_warning:     entry.parseWarning,
    ai_parsed:         entry.aiParsed,
  }
}

function fromRow(row) {
  return {
    id:               row.id,
    fileName:         row.file_name,
    uploadedAt:       row.uploaded_at,
    transactionCount: row.transaction_count,
    transactions:     row.transactions,
    parseWarning:     row.parse_warning,
    aiParsed:         row.ai_parsed,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function useUploadHistory() {
  async function syncFromSupabase() {
    if (!userId.value) return
    setSyncing()
    try {
      const { data, error } = await supabase
        .from('upload_history')
        .select('*')
        .eq('user_id', userId.value)
        .order('uploaded_at', { ascending: false })
        .limit(MAX_ENTRIES)

      if (error) throw error
      history.value = data.map(fromRow)
      saveLocal()
      setSynced()
    } catch (e) {
      console.error('[upload_history] sync error:', e.message)
      setSyncError()
    }
  }

  async function addEntry({ fileName, transactions, parseWarning, aiParsed }) {
    const existing = history.value.findIndex(e => e.fileName === fileName)
    const entry = {
      id:               `hist-${Date.now()}`,
      fileName,
      uploadedAt:       new Date().toISOString(),
      transactionCount: transactions.length,
      transactions,
      parseWarning,
      aiParsed,
    }

    if (existing !== -1) history.value.splice(existing, 1, entry)
    else {
      history.value.unshift(entry)
      if (history.value.length > MAX_ENTRIES) history.value.pop()
    }
    saveLocal()

    if (userId.value) {
      setSyncing()
      try {
        // Remove old entry with same filename if it existed (different id)
        if (existing !== -1) {
          await supabase.from('upload_history').delete()
            .eq('user_id', userId.value).eq('file_name', fileName)
        }
        const { error } = await supabase.from('upload_history').upsert(toRow(entry))
        if (error) throw error
        setSynced()
      } catch (e) {
        console.error('[upload_history] save error:', e.message)
        setSyncError()
      }
    }
  }

  async function removeEntry(id) {
    history.value = history.value.filter(e => e.id !== id)
    saveLocal()

    if (userId.value) {
      await supabase.from('upload_history').delete()
        .eq('id', id).eq('user_id', userId.value)
    }
  }

  async function clearHistory() {
    history.value = []
    saveLocal()

    if (userId.value) {
      await supabase.from('upload_history').delete().eq('user_id', userId.value)
    }
  }

  return { history, addEntry, removeEntry, clearHistory, syncFromSupabase }
}
