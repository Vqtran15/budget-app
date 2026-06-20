<template>
  <div class="tx-card" :class="[tx.amount >= 0 ? 'credit' : 'debit', { selected }]">
    <input
      type="checkbox"
      class="tx-checkbox"
      :checked="selected"
      @change="emit('toggle-select', tx.id)"
    />

    <div class="tx-left">
      <span class="tx-date">{{ tx.date }}</span>
      <span class="tx-desc" :title="tx.description">{{ tx.description }}</span>
    </div>
    <div class="tx-right">
      <span class="tx-amount">{{ tx.amount >= 0 ? '+' : '' }}{{ fmt(tx.amount) }}</span>
      <div class="tx-category-wrap">
        <span class="cat-icon-pill" :style="{ background: currentMeta.bg, color: currentMeta.color }">
          <CategoryIcon :name="currentMeta.icon" :size="12" :color="currentMeta.color" />
        </span>
        <select
          class="category-select"
          :value="tx.category"
          @change="e => emit('update-category', tx.id, e.target.value)"
        >
          <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <span v-if="tx.isManual" class="manual-badge" title="Manually categorized">✎</span>
      </div>
      <button class="btn-remove" title="Remove transaction" @click.stop="emit('remove', tx.id)">✕</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CATEGORY_META } from '../utils/categories.js'
import { useCustomCategories } from '../composables/useCustomCategories.js'
import CategoryIcon from './CategoryIcon.vue'

const { customMeta } = useCustomCategories()
const currentMeta = computed(() =>
  CATEGORY_META[props.tx.category] ??
  customMeta.value[props.tx.category] ??
  { icon: 'HelpCircle', color: '#8faab8', bg: '#edede9' }
)

const props = defineProps({
  tx:            { type: Object,  required: true },
  allCategories: { type: Array,   required: true },
  selected:      { type: Boolean, default: false },
})

const emit = defineEmits(['update-category', 'remove', 'toggle-select'])

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
</script>

<style scoped>
.tx-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  transition: background .15s, border-color .15s;
}

.tx-card:hover { background: var(--surface-hover); }
.tx-card.selected { background: #fdf0ec; border-color: var(--accent); }

.tx-checkbox {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: var(--accent);
  opacity: 0;
  transition: opacity .15s;
}

.tx-card:hover .tx-checkbox,
.tx-card.selected .tx-checkbox { opacity: 1; }

.tx-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.tx-date { font-size: 11px; color: var(--text-xs); font-weight: 500; }

.tx-desc {
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.tx-amount { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
.credit .tx-amount { color: var(--green); }
.debit  .tx-amount { color: var(--red); }

.tx-category-wrap { display: flex; align-items: center; gap: 5px; }

.cat-icon-pill {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-select {
  font-size: 11px;
  padding: 2px 6px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: white;
  color: var(--text-muted);
  cursor: pointer;
  max-width: 160px;
}
.category-select:focus { outline: none; border-color: var(--accent); }

.manual-badge { font-size: 11px; color: var(--accent); font-style: italic; }

.btn-remove {
  margin-top: 2px;
  background: none;
  border: none;
  color: var(--text-xs);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;
  opacity: 0;
  transition: opacity .15s, color .15s, background .15s;
}
.tx-card:hover .btn-remove { opacity: 1; }
.btn-remove:hover { color: var(--accent-hover); background: var(--red-light); }
</style>
