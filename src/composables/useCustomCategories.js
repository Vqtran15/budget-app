import { ref, computed } from 'vue'

const STORAGE_KEY = 'budget-custom-categories'

const customCategories = ref(loadLocal())

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') }
  catch { return [] }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories.value))
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
    return true
  }

  function removeCategory(name) {
    customCategories.value = customCategories.value.filter(c => c.name !== name)
    saveLocal()
  }

  return { customCategories, customMeta, customCategoryNames, addCategory, removeCategory }
}
