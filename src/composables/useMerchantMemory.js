import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.js'

const STORAGE_KEY = 'budget-merchant-memory'
const { userId } = useAuth()

function normalize(description) {
  return String(description).toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50)
}

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  catch { return {} }
}

function saveLocal(memory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
}

export function useMerchantMemory() {
  async function syncFromSupabase() {
    if (!userId.value) return
    try {
      const { data, error } = await supabase
        .from('merchant_memory')
        .select('merchant_key, category')
        .eq('user_id', userId.value)

      if (error) throw error

      const memory = {}
      for (const row of data) memory[row.merchant_key] = row.category
      saveLocal(memory)
    } catch (e) {
      console.error('[merchant_memory] sync error:', e.message)
    }
  }

  function lookup(description) {
    return loadLocal()[normalize(description)] ?? null
  }

  function learn(description, category) {
    const key = normalize(description)
    const memory = loadLocal()
    memory[key] = category
    saveLocal(memory)

    if (userId.value) {
      supabase.from('merchant_memory')
        .upsert({ user_id: userId.value, merchant_key: key, category }, { onConflict: 'user_id,merchant_key' })
        .then(({ error }) => { if (error) console.error('[merchant_memory] save error:', error.message) })
    }
  }

  return { learn, lookup, syncFromSupabase }
}
