import { CATEGORIES, CATEGORY_KEYWORDS } from '../utils/categories.js'
import { useMerchantMemory } from './useMerchantMemory.js'

const { lookup } = useMerchantMemory()

function categorize(transaction) {
  // Check learned merchant mappings first
  const remembered = lookup(transaction.description)
  if (remembered) return remembered

  const desc = transaction.description.toLowerCase()

  if (transaction.type === 'credit') {
    for (const kw of CATEGORY_KEYWORDS[CATEGORIES.INCOME]) {
      if (desc.includes(kw)) return CATEGORIES.INCOME
    }
    for (const kw of CATEGORY_KEYWORDS[CATEGORIES.TRANSFER]) {
      if (desc.includes(kw)) return CATEGORIES.TRANSFER
    }
    return CATEGORIES.UNCATEGORIZED
  }

  const order = [
    CATEGORIES.HOUSING,
    CATEGORIES.UTILITIES,
    CATEGORIES.HEALTHCARE,
    CATEGORIES.TRANSPORT,
    CATEGORIES.FOOD,
    CATEGORIES.ENTERTAINMENT,
    CATEGORIES.SHOPPING,
    CATEGORIES.TRANSFER,
  ]

  for (const category of order) {
    const keywords = CATEGORY_KEYWORDS[category] ?? []
    for (const kw of keywords) {
      if (desc.includes(kw)) return category
    }
  }

  return CATEGORIES.UNCATEGORIZED
}

export function useCategorizer() {
  function categorizeAll(transactions) {
    return transactions.map(tx => ({
      ...tx,
      category: categorize(tx),
      isManual: false,
    }))
  }

  function recategorize(transaction, newCategory) {
    return { ...transaction, category: newCategory, isManual: true }
  }

  return { categorizeAll, recategorize }
}
