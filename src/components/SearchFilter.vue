<template>
  <div class="search-filter">
    <div class="search-wrap">
      <span class="search-icon">⌕</span>
      <input
        v-model="search"
        class="search-input"
        placeholder="Search transactions…"
        autocomplete="off"
      />
      <button v-if="search" class="clear-inline" @click="search = ''">✕</button>
    </div>

    <div class="date-wrap">
      <input v-model="dateFrom" type="date" class="date-input" title="From date" />
      <span class="date-sep">—</span>
      <input v-model="dateTo" type="date" class="date-input" title="To date" />
    </div>

    <div class="right">
      <span class="count">{{ filteredCount }} of {{ totalCount }}</span>
      <button v-if="hasFilters" class="btn-clear-all" @click="clear">Clear</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  filteredCount: { type: Number, required: true },
  totalCount:    { type: Number, required: true },
  hasFilters:    { type: Boolean, required: true },
})

const search   = defineModel('search',   { default: '' })
const dateFrom = defineModel('dateFrom', { default: '' })
const dateTo   = defineModel('dateTo',   { default: '' })

const emit = defineEmits(['clear'])
function clear() { emit('clear') }
</script>

<style scoped>
.search-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 10px 14px;
  margin-bottom: 12px;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 6px 10px;
  flex: 1;
  min-width: 180px;
}

.search-icon { font-size: 16px; color: var(--text-muted); }

.search-input {
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text);
  width: 100%;
  outline: none;
}

.clear-inline {
  background: none;
  border: none;
  font-size: 11px;
  color: var(--text-xs);
  cursor: pointer;
  padding: 1px 3px;
  border-radius: 3px;
  line-height: 1;
  flex-shrink: 0;
}
.clear-inline:hover { color: var(--text); }

.date-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-input {
  font-size: 12px;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}

.date-sep { font-size: 12px; color: var(--text-xs); }

.right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.count {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.btn-clear-all {
  font-size: 12px;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color .15s, border-color .15s;
}
.btn-clear-all:hover { color: var(--accent-hover); border-color: var(--accent); }

@media (max-width: 640px) {
  .search-filter { flex-direction: column; align-items: stretch; gap: 8px; padding: 10px 12px; }
  .search-wrap   { min-width: 0; }
  .date-wrap     { justify-content: space-between; }
  .date-input    { flex: 1; min-width: 0; font-size: 11px; }
  .right         { margin-left: 0; justify-content: space-between; }
}
</style>
