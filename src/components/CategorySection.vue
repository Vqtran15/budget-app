<template>
  <div class="section" :class="{ uncategorized: category === 'Uncategorized' }">
    <button class="section-header" @click="collapsed = !collapsed">
      <div class="header-left">
        <input
          type="checkbox"
          class="select-all-cb"
          :checked="allSelected"
          :indeterminate="someSelected && !allSelected"
          @click.stop
          @change.stop="toggleAll"
        />
        <span class="cat-icon">{{ meta.icon }}</span>
        <span class="cat-name">{{ category }}</span>
        <span class="cat-count">{{ transactions.length }}</span>
        <span v-if="category === 'Uncategorized'" class="review-badge">Review needed</span>
      </div>
      <div class="header-right">
        <span class="cat-total" :class="totalClass">{{ totalFormatted }}</span>
        <span class="chevron" :class="{ rotated: !collapsed }">›</span>
      </div>
    </button>

    <div v-show="!collapsed" class="tx-list">
      <TransactionCard
        v-for="tx in transactions"
        :key="tx.id"
        :tx="tx"
        :all-categories="allCategories"
        :selected="selectedIds.has(tx.id)"
        @update-category="(id, cat) => emit('update-category', id, cat)"
        @remove="id => emit('remove', id)"
        @toggle-select="id => emit('toggle-select', id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CATEGORY_META, CATEGORIES } from '../utils/categories.js'
import TransactionCard from './TransactionCard.vue'

const props = defineProps({
  category:      { type: String, required: true },
  transactions:  { type: Array,  required: true },
  allCategories: { type: Array,  required: true },
  selectedIds:   { type: Set,    default: () => new Set() },
})

const emit = defineEmits(['update-category', 'remove', 'toggle-select', 'toggle-select-all'])

const meta      = computed(() => CATEGORY_META[props.category] ?? { icon: '❓', color: '#94a3b8', bg: '#f1f5f9' })
const collapsed = ref(true)

const allSelected  = computed(() => props.transactions.length > 0 && props.transactions.every(tx => props.selectedIds.has(tx.id)))
const someSelected = computed(() => props.transactions.some(tx => props.selectedIds.has(tx.id)))

function toggleAll() {
  emit('toggle-select-all', props.transactions.map(tx => tx.id))
}

const total = computed(() => props.transactions.reduce((s, t) => s + t.amount, 0))

const totalFormatted = computed(() =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total.value)
)

const totalClass = computed(() => {
  if (props.category === CATEGORIES.INCOME) return 'positive'
  return total.value > 0 ? 'positive' : 'negative'
})
</script>

<style scoped>
.section {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: 12px;
}

.section.uncategorized { border: 2px solid var(--yellow); }

.section-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background .15s;
}
.section-header:hover { background: var(--surface-hover); }

.header-left { display: flex; align-items: center; gap: 8px; }

.select-all-cb {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: var(--accent);
  flex-shrink: 0;
}

.cat-icon { font-size: 18px; }
.cat-name { font-size: 15px; font-weight: 600; }

.cat-count {
  font-size: 12px;
  background: var(--bg);
  color: var(--text-muted);
  padding: 1px 7px;
  border-radius: 99px;
  font-weight: 500;
}

.review-badge {
  font-size: 11px;
  background: var(--yellow-light);
  color: #92400e;
  padding: 2px 8px;
  border-radius: 99px;
  font-weight: 600;
}

.header-right { display: flex; align-items: center; gap: 12px; }

.cat-total { font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }
.positive { color: var(--green); }
.negative { color: var(--red); }

.chevron {
  font-size: 20px;
  color: var(--text-muted);
  transition: transform .2s;
  display: inline-block;
}
.chevron.rotated { transform: rotate(90deg); }

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 12px 12px;
}
</style>
