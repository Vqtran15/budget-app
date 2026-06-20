<template>
  <div class="tx-page">
    <header class="page-header fade-up">
      <h1 class="page-title">Transactions</h1>
      <button class="btn-add-tx" @click="showAddTransaction = true">
        <Plus :size="16" /> Add
      </button>
    </header>

    <div v-if="!store.transactions.value.length" class="empty-state">
      <ReceiptText :size="40" class="empty-icon" />
      <p class="empty-title">No transactions yet</p>
      <p class="empty-sub">Upload a bank statement or add a transaction manually</p>
      <button class="btn-add-first" @click="showAddTransaction = true">
        <Plus :size="15" /> Add Transaction
      </button>
    </div>

    <template v-else>
      <SearchFilter class="fade-up-1"
        v-model:search="search"
        v-model:date-from="dateFrom"
        v-model:date-to="dateTo"
        :filtered-count="filtered.length"
        :total-count="store.transactions.value.length"
        :has-filters="hasFilters"
        @clear="clearFilters"
      />

      <CategorySection
        v-if="grouped['Uncategorized']?.length"
        category="Uncategorized"
        :transactions="grouped['Uncategorized']"
        :all-categories="allCategoriesComputed"
        :selected-ids="selectedIds"
        @update-category="updateCategory"
        @remove="removeTransaction"
        @toggle-select="toggleSelect"
        @toggle-select-all="toggleSelectAll"
      />

      <CategorySection
        v-for="cat in sortedCategories"
        :key="cat"
        :category="cat"
        :transactions="grouped[cat]"
        :all-categories="allCategoriesComputed"
        :selected-ids="selectedIds"
        @update-category="updateCategory"
        @remove="removeTransaction"
        @toggle-select="toggleSelect"
        @toggle-select-all="toggleSelectAll"
      />

      <button class="btn-new-cat" @click="showNewCategory = true">
        + New Category
      </button>
    </template>

    <NewCategoryModal
      v-if="showNewCategory"
      @close="showNewCategory = false"
      @created="showNewCategory = false"
    />

    <AddTransactionModal
      v-if="showAddTransaction"
      @close="showAddTransaction = false"
      @add="addManualTransaction"
    />

    <BulkActionBar
      :count="selectedIds.size"
      :all-categories="allCategoriesComputed"
      @move="moveSelected"
      @delete="deleteSelected"
      @clear="clearSelection"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, ReceiptText } from 'lucide-vue-next'
import SearchFilter        from '../components/SearchFilter.vue'
import CategorySection     from '../components/CategorySection.vue'
import BulkActionBar       from '../components/BulkActionBar.vue'
import NewCategoryModal    from '../components/NewCategoryModal.vue'
import AddTransactionModal from '../components/AddTransactionModal.vue'
import { useCategorizer }       from '../composables/useCategorizer.js'
import { useMerchantMemory }    from '../composables/useMerchantMemory.js'
import { useTransactionFilter } from '../composables/useTransactionFilter.js'
import { useTransactionStore }  from '../composables/useTransactionStore.js'
import { useCustomCategories }  from '../composables/useCustomCategories.js'
import { ALL_CATEGORIES, CATEGORIES } from '../utils/categories.js'

const store = useTransactionStore()
const { recategorize } = useCategorizer()
const { learn }        = useMerchantMemory()
const { customCategoryNames, customCategories } = useCustomCategories()

const showNewCategory    = ref(false)
const showAddTransaction = ref(false)

const allCategoriesComputed = computed(() => [...ALL_CATEGORIES, ...customCategoryNames.value])

const { search, dateFrom, dateTo, hasFilters, filtered, clear: clearFilters } =
  useTransactionFilter(store.transactions)

const grouped = computed(() => {
  const result = {}
  for (const cat of allCategoriesComputed.value) result[cat] = []
  for (const tx of filtered.value) {
    if (result[tx.category] !== undefined) result[tx.category].push(tx)
    else result[CATEGORIES.UNCATEGORIZED].push(tx)
  }
  return result
})

const sortedCategories = computed(() => {
  const withTx = allCategoriesComputed.value
    .filter(cat => cat !== CATEGORIES.UNCATEGORIZED && grouped.value[cat]?.length > 0)
    .sort((a, b) => {
      const sumA = grouped.value[a].reduce((s, t) => s + Math.abs(t.amount), 0)
      const sumB = grouped.value[b].reduce((s, t) => s + Math.abs(t.amount), 0)
      return sumB - sumA
    })
  // Always show custom categories even if they have no transactions yet
  const emptyCustom = customCategories.value
    .map(c => c.name)
    .filter(name => !grouped.value[name]?.length)
  return [...withTx, ...emptyCustom]
})

const selectedIds = ref(new Set())

function toggleSelect(id) {
  const next = new Set(selectedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedIds.value = next
}

function toggleSelectAll(ids) {
  const current = selectedIds.value
  const allOn = ids.every(id => current.has(id))
  const next = new Set(current)
  allOn ? ids.forEach(id => next.delete(id)) : ids.forEach(id => next.add(id))
  selectedIds.value = next
}

function clearSelection() { selectedIds.value = new Set() }

function deleteSelected() {
  store.transactions.value = store.transactions.value.filter(tx => !selectedIds.value.has(tx.id))
  selectedIds.value = new Set()
}

function moveSelected(category) {
  store.transactions.value = store.transactions.value.map(tx =>
    selectedIds.value.has(tx.id) ? recategorize(tx, category) : tx
  )
  selectedIds.value = new Set()
}

function updateCategory(id, newCategory) {
  store.transactions.value = store.transactions.value.map(tx => {
    if (tx.id !== id) return tx
    learn(tx.description, newCategory)
    return recategorize(tx, newCategory)
  })
}

function removeTransaction(id) {
  store.transactions.value = store.transactions.value.filter(tx => tx.id !== id)
}

function addManualTransaction(tx) {
  store.transactions.value = [tx, ...store.transactions.value]
  showAddTransaction.value = false
}
</script>

<style scoped>
.tx-page { padding-bottom: 80px; }

.page-header {
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -.02em;
  color: var(--text);
}

.btn-add-tx {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background .15s;
}
.btn-add-tx:hover { background: var(--accent-hover); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 64px 24px;
  text-align: center;
}
.empty-icon  { color: var(--border); }
.empty-title { font-size: 18px; font-weight: 700; color: var(--text); }
.empty-sub   { font-size: 14px; color: var(--text-muted); }

.btn-add-first {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-add-first:hover { background: var(--accent-hover); }

.btn-new-cat {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px auto 0;
  padding: 9px 20px;
  border-radius: 10px;
  border: 1.5px dashed var(--border);
  background: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color .15s, color .15s, background .15s;
}
.btn-new-cat:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}
</style>
