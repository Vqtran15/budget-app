import { reactive } from 'vue'

const STORAGE_KEY = 'budget-chart-colors'

const DEFAULT = {
  barIncome:    '#16a34a',
  barExpense:   '#dc2626',
  lineBalance:  '#2563eb',
  lineFill:     '#bfdbfe',
  categories:   {},
}

function loadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return { ...DEFAULT, ...saved, categories: { ...DEFAULT.categories, ...(saved.categories ?? {}) } }
  } catch { return { ...DEFAULT } }
}

const colors = reactive(loadLocal())

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
}

export function useChartColors() {
  function getCategoryColor(category, fallback) {
    return colors.categories[category] ?? fallback
  }

  function setCategoryColor(category, color) {
    colors.categories = { ...colors.categories, [category]: color }
    save()
  }

  function setBarIncome(color)   { colors.barIncome  = color; save() }
  function setBarExpense(color)  { colors.barExpense = color; save() }
  function setLineBalance(color) { colors.lineBalance = color; save() }
  function setLineFill(color)    { colors.lineFill   = color; save() }

  return {
    colors,
    getCategoryColor, setCategoryColor,
    setBarIncome, setBarExpense,
    setLineBalance, setLineFill,
  }
}
