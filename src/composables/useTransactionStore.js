import { ref, watch } from 'vue'
import { supabase, setSyncing, setSynced, setSyncError } from '../lib/supabase.js'
import { useAuth } from './useAuth.js'

const STORAGE_KEY = 'budget-active-session'
const { userId } = useAuth()

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
    fileName:     fileName.value,
    parseWarning: parseWarning.value,
    aiParsed:     aiParsed.value,
  }))
}

watch(transactions, persist, { deep: true })
watch([fileName, parseWarning, aiParsed], persist)

// ── Supabase sync ─────────────────────────────────────────────────────────────

function toRow(t) {
  return {
    id:          t.id,
    user_id:     userId.value,
    date:        t.date,
    description: t.description,
    amount:      t.amount,
    category:    t.category,
    is_manual:   t.isManual   ?? false,
    is_split:    t.isSplit    ?? false,
    split_group: t.splitGroup ?? null,
  }
}

function fromRow(row) {
  return {
    id:          row.id,
    date:        row.date,
    description: row.description,
    amount:      Number(row.amount),
    category:    row.category,
    isManual:    row.is_manual,
    isSplit:     row.is_split,
    splitGroup:  row.split_group ?? undefined,
  }
}

let syncedIds   = new Set()
let syncEnabled = false
let syncTimer   = null

function scheduleSync() {
  if (!userId.value || !syncEnabled) return
  clearTimeout(syncTimer)
  syncTimer = setTimeout(pushToSupabase, 600)
}

async function pushToSupabase() {
  if (!userId.value) return
  setSyncing()
  try {
    const current    = transactions.value
    const currentIds = new Set(current.map(t => t.id))

    // Delete rows that no longer exist locally
    const toDelete = [...syncedIds].filter(id => !currentIds.has(id))
    if (toDelete.length) {
      const { error } = await supabase.from('transactions')
        .delete().eq('user_id', userId.value).in('id', toDelete)
      if (error) throw error
    }

    // Upsert all current transactions (chunked for large uploads)
    if (current.length) {
      const rows = current.map(toRow)
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.from('transactions').upsert(rows.slice(i, i + 500))
        if (error) throw error
      }
    }

    syncedIds = currentIds
    setSynced()
  } catch (e) {
    console.error('[transactions] sync error:', e.message)
    setSyncError()
  }
}

// Trigger Supabase sync whenever transactions change (after init)
watch(transactions, scheduleSync, { deep: true })

// ── Public API ────────────────────────────────────────────────────────────────

export function useTransactionStore() {
  async function syncFromSupabase() {
    if (!userId.value) return
    setSyncing()
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId.value)

      if (error) throw error

      if (data.length > 0) {
        // Supabase is source of truth — replace local data
        transactions.value = data.map(fromRow)
        syncedIds = new Set(data.map(r => r.id))
        setSynced()
      } else if (transactions.value.length > 0) {
        // Nothing in Supabase yet — migrate localStorage data up
        syncEnabled = true
        await pushToSupabase()
      } else {
        setSynced()
      }

      syncEnabled = true
    } catch (e) {
      console.error('[transactions] sync error:', e.message)
      setSyncError()
      syncEnabled = true // still allow local-only use
    }
  }

  async function reset() {
    clearTimeout(syncTimer)
    transactions.value = []
    fileName.value     = ''
    parseWarning.value = ''
    aiParsed.value     = false
    localStorage.removeItem(STORAGE_KEY)

    if (userId.value) {
      syncedIds = new Set()
      await supabase.from('transactions').delete().eq('user_id', userId.value)
    }
  }

  return { transactions, fileName, parseWarning, aiParsed, reset, syncFromSupabase }
}
