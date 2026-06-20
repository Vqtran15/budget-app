<template>
  <div class="dashboard">
    <header class="dash-header fade-up">
      <h1 class="dash-title">Dashboard</h1>
      <div class="file-badge">
        <span>📄 {{ store.fileName.value }}</span>
        <span v-if="store.parseWarning.value" class="badge warn">{{ store.parseWarning.value }}</span>
        <span v-if="store.aiParsed.value" class="badge ai">✦ AI parsed</span>
      </div>
    </header>

    <BudgetSummary class="fade-up-1" :transactions="filtered" />

    <div class="charts-grid fade-up-2">
      <ChartDonut :transactions="filtered" />
      <ChartBar   :transactions="filtered" />
    </div>

    <ChartLine class="fade-up-2 line-chart" :transactions="filtered" />

    <MonthlyBreakdown class="fade-up-3" :transactions="filtered" />

    <SearchFilter class="fade-up-4"
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

    <NewCategoryModal
      v-if="showNewCategory"
      @close="showNewCategory = false"
      @created="showNewCategory = false"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BudgetSummary     from '../components/BudgetSummary.vue'
import MonthlyBreakdown  from '../components/MonthlyBreakdown.vue'
import ChartDonut        from '../components/ChartDonut.vue'
import ChartBar          from '../components/ChartBar.vue'
import ChartLine         from '../components/ChartLine.vue'
import SearchFilter      from '../components/SearchFilter.vue'
import CategorySection   from '../components/CategorySection.vue'
import BulkActionBar     from '../components/BulkActionBar.vue'
import NewCategoryModal  from '../components/NewCategoryModal.vue'
import { useCategorizer }          from '../composables/useCategorizer.js'
import { useMerchantMemory }       from '../composables/useMerchantMemory.js'
import { useTransactionFilter }    from '../composables/useTransactionFilter.js'
import { useTransactionStore }     from '../composables/useTransactionStore.js'
import { useCustomCategories }     from '../composables/useCustomCategories.js'
import { ALL_CATEGORIES, CATEGORIES } from '../utils/categories.js'

const router = useRouter()
const store  = useTransactionStore()
const { recategorize }  = useCategorizer()
const { learn }         = useMerchantMemory()
const { customCategoryNames } = useCustomCategories()

const showNewCategory = ref(false)
const allCategoriesComputed = computed(() => [...ALL_CATEGORIES, ...customCategoryNames.value])

onMounted(() => {
  if (!store.transactions.value.length) router.replace('/upload')
})

// --- Filter ---
const { search, dateFrom, dateTo, hasFilters, filtered, clear: clearFilters } = useTransactionFilter(store.transactions)

// --- Grouping ---
const grouped = computed(() => {
  const result = {}
  for (const cat of allCategoriesComputed.value) result[cat] = []
  for (const tx of filtered.value) {
    if (result[tx.category] !== undefined) result[tx.category].push(tx)
    else result[CATEGORIES.UNCATEGORIZED].push(tx)
  }
  return result
})

const sortedCategories = computed(() =>
  allCategoriesComputed.value
    .filter(cat => cat !== CATEGORIES.UNCATEGORIZED && grouped.value[cat]?.length > 0)
    .sort((a, b) => {
      const sumA = grouped.value[a].reduce((s, t) => s + Math.abs(t.amount), 0)
      const sumB = grouped.value[b].reduce((s, t) => s + Math.abs(t.amount), 0)
      return sumB - sumA
    })
)

// --- Bulk select ---
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

// --- Per-transaction actions ---
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
</script>

<style scoped>
.dashboard { padding-bottom: 80px; }

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

.dash-header { margin-bottom: 28px; }

.dash-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -.02em;
  color: var(--text);
}

.file-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 99px;
}
.badge.warn { background: var(--yellow-light); color: #8b6914; }
.badge.ai   { background: var(--accent-light); color: var(--accent-hover); }

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.line-chart { margin-bottom: 16px; }

@media (max-width: 600px) {
  .charts-grid { grid-template-columns: 1fr; }
}
</style>
