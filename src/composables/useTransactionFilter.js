import { ref, computed } from 'vue'
import { toISODate } from '../utils/dateUtils.js'

export function useTransactionFilter(transactions) {
  const search   = ref('')
  const dateFrom = ref('')
  const dateTo   = ref('')

  const hasFilters = computed(() => !!(search.value || dateFrom.value || dateTo.value))

  const filtered = computed(() => {
    const q    = search.value.toLowerCase().trim()
    const from = dateFrom.value  // YYYY-MM-DD
    const to   = dateTo.value

    return transactions.value.filter(tx => {
      if (q && !tx.description.toLowerCase().includes(q)) return false

      if (from || to) {
        const iso = toISODate(tx.date)
        if (iso) {
          if (from && iso < from) return false
          if (to   && iso > to)   return false
        }
      }

      return true
    })
  })

  function clear() {
    search.value   = ''
    dateFrom.value = ''
    dateTo.value   = ''
  }

  return { search, dateFrom, dateTo, hasFilters, filtered, clear }
}
