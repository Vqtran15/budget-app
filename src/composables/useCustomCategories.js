import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.js'

const STORAGE_KEY         = 'budget-custom-categories'
const HIDDEN_BUILTINS_KEY = 'budget-hidden-builtins'

const { userId } = useAuth()

const customCategories = ref(loadLocal())
const hiddenBuiltins   = ref(loadHidden())

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') }
  catch { return [] }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories.value))
}

function loadHidden() {
  try { return JSON.parse(localStorage.getItem(HIDDEN_BUILTINS_KEY) ?? '[]') }
  catch { return [] }
}

function saveHidden() {
  localStorage.setItem(HIDDEN_BUILTINS_KEY, JSON.stringify(hiddenBuiltins.value))
}

async function pushSettingsToSupabase() {
  if (!userId.value) return
  try {
    await supabase.from('user_settings').upsert({
      user_id:           userId.value,
      custom_categories: customCategories.value,
      hidden_builtins:   hiddenBuiltins.value,
    }, { onConflict: 'user_id' })
  } catch (e) {
    console.error('[user_settings] sync error:', e.message)
  }
}

export function useCustomCategories() {
  const customMeta = computed(() => {
    const meta = {}
    for (const cat of customCategories.value) {
      meta[cat.name] = { icon: cat.icon, color: cat.color, bg: cat.bg }
    }
    return meta
  })

  const customCategoryNames = computed(() => customCategories.value.map(c => c.name))

  function addCategory({ name, icon, color, bg }) {
    if (!name.trim()) return false
    if (customCategories.value.some(c => c.name === name)) return false
    customCategories.value = [...customCategories.value, { name: name.trim(), icon, color, bg }]
    saveLocal()
    pushSettingsToSupabase()
    return true
  }

  function removeCategory(name) {
    customCategories.value = customCategories.value.filter(c => c.name !== name)
    saveLocal()
    pushSettingsToSupabase()
  }

  function renameCategory(oldName, newName) {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return false
    if (customCategories.value.some(c => c.name === trimmed)) return false
    customCategories.value = customCategories.value.map(c =>
      c.name === oldName ? { ...c, name: trimmed } : c
    )
    saveLocal()
    pushSettingsToSupabase()
    return true
  }

  function hideBuiltin(name) {
    if (hiddenBuiltins.value.includes(name)) return
    hiddenBuiltins.value = [...hiddenBuiltins.value, name]
    saveHidden()
    pushSettingsToSupabase()
  }

  async function syncFromSupabase() {
    if (!userId.value) return
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('custom_categories, hidden_builtins')
        .eq('user_id', userId.value)
        .single()

      // PGRST116 = no rows found — first time user, nothing to restore
      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        if (data.custom_categories?.length) {
          customCategories.value = data.custom_categories
          saveLocal()
        }
        if (data.hidden_builtins?.length) {
          hiddenBuiltins.value = data.hidden_builtins
          saveHidden()
        }
      } else if (customCategories.value.length > 0 || hiddenBuiltins.value.length > 0) {
        // Migrate localStorage data up to Supabase
        await pushSettingsToSupabase()
      }
    } catch (e) {
      console.error('[user_settings] sync error:', e.message)
    }
  }

  return {
    customCategories, customMeta, customCategoryNames, hiddenBuiltins,
    addCategory, removeCategory, renameCategory, hideBuiltin,
    syncFromSupabase,
  }
}
