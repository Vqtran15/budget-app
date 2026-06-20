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
        <span class="cat-icon">
          <CategoryIcon :name="meta.icon" :size="18" :color="meta.color" />
        </span>
        <span v-if="!renaming" class="cat-name">{{ category }}</span>
        <input
          v-else
          ref="renameInput"
          class="cat-rename-input"
          v-model="renameValue"
          @blur="commitRename"
          @keydown.enter.prevent="commitRename"
          @keydown.esc.prevent="cancelRename"
          @click.stop
        />
        <template v-if="canEdit && !renaming">
          <button class="btn-rename" title="Rename" @click.stop="startRename">
            <Pencil :size="11" />
          </button>
          <template v-if="!confirmingDelete">
            <button class="btn-delete" title="Delete category" @click.stop="confirmingDelete = true">
              <Trash2 :size="11" />
            </button>
          </template>
          <template v-else>
            <span class="delete-confirm-label" @click.stop>Delete?</span>
            <button class="btn-delete-yes" @click.stop="emit('delete', category)">Yes</button>
            <button class="btn-delete-no"  @click.stop="confirmingDelete = false">No</button>
          </template>
        </template>
        <span class="cat-count">{{ transactions.length }}</span>
        <span v-if="category === 'Uncategorized'" class="review-badge">Review needed</span>
      </div>
      <div class="header-right">
        <span class="cat-total" :class="totalClass">{{ totalFormatted }}</span>
        <span class="chevron" :class="{ rotated: !collapsed }">›</span>
      </div>
    </button>

    <Transition name="collapse">
    <div v-show="!collapsed" class="tx-list">
      <TransitionGroup name="tx" tag="div" class="tx-inner">
        <TransactionCard
          v-for="tx in transactions"
          :key="tx.id"
          :tx="tx"
          :all-categories="allCategories"
          :selected="selectedIds.has(tx.id)"
          @update-category="(id, cat) => emit('update-category', id, cat)"
          @remove="id => emit('remove', id)"
          @toggle-select="id => emit('toggle-select', id)"
          @split="tx => emit('split', tx)"
        />
      </TransitionGroup>
    </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { CATEGORY_META, CATEGORIES } from '../utils/categories.js'
import { useCustomCategories } from '../composables/useCustomCategories.js'
import TransactionCard from './TransactionCard.vue'
import CategoryIcon from './CategoryIcon.vue'

const props = defineProps({
  category:      { type: String,  required: true },
  transactions:  { type: Array,   required: true },
  allCategories: { type: Array,   required: true },
  selectedIds:   { type: Set,     default: () => new Set() },
  canEdit:       { type: Boolean, default: false },
})

const emit = defineEmits(['update-category', 'remove', 'toggle-select', 'toggle-select-all', 'split', 'rename', 'delete'])

const confirmingDelete = ref(false)

const renaming = ref(false)
const renameValue = ref('')
const renameInput = ref(null)

async function startRename() {
  renameValue.value = props.category
  renaming.value = true
  await nextTick()
  renameInput.value?.focus()
  renameInput.value?.select()
}

function commitRename() {
  if (!renaming.value) return
  renaming.value = false
  const newName = renameValue.value.trim()
  if (newName && newName !== props.category) {
    emit('rename', props.category, newName)
  }
}

function cancelRename() {
  renaming.value = false
}

const { customMeta } = useCustomCategories()
const meta = computed(() =>
  CATEGORY_META[props.category] ??
  customMeta.value[props.category] ??
  { icon: 'HelpCircle', color: '#8faab8', bg: '#edede9' }
)
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

.cat-rename-input {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  background: var(--bg);
  border: 1.5px solid var(--accent);
  border-radius: 6px;
  padding: 2px 7px;
  outline: none;
  width: 160px;
  font-family: inherit;
}

.btn-rename {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: none;
  background: none;
  color: var(--text-xs);
  cursor: pointer;
  opacity: 0;
  transition: opacity .15s, color .15s, background .15s;
  flex-shrink: 0;
}
.section-header:hover .btn-rename { opacity: 1; }
.btn-rename:hover { color: var(--accent); background: var(--accent-light); }

.btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: none;
  background: none;
  color: var(--text-xs);
  cursor: pointer;
  opacity: 0;
  transition: opacity .15s, color .15s, background .15s;
  flex-shrink: 0;
}
.section-header:hover .btn-delete { opacity: 1; }
.btn-delete:hover { color: var(--red); background: var(--red-light); }

.delete-confirm-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--red);
  white-space: nowrap;
}

.btn-delete-yes, .btn-delete-no {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid;
  white-space: nowrap;
}
.btn-delete-yes {
  background: var(--red-light);
  color: var(--red);
  border-color: var(--red);
}
.btn-delete-yes:hover { background: var(--red); color: white; }
.btn-delete-no {
  background: none;
  color: var(--text-muted);
  border-color: var(--border);
}
.btn-delete-no:hover { background: var(--bg); }

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
  color: #8b6914;
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
  padding: 0 12px 12px;
}

.tx-inner {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

/* enter — new manual transactions sliding in */
.tx-enter-active { transition: opacity .2s ease, transform .2s ease; }
.tx-enter-from   { opacity: 0; transform: translateX(-10px); }

/* leave — removal slides out and collapses height */
.tx-leave-active {
  transition: opacity .22s ease, transform .22s ease, max-height .25s ease, margin .25s ease;
  max-height: 80px;
  overflow: hidden;
}
.tx-leave-to {
  opacity: 0;
  transform: translateX(16px);
  max-height: 0;
  margin-bottom: 0;
}

/* keep remaining items in place while one leaves */
.tx-move { transition: transform .25s ease; }

/* section expand/collapse */
.collapse-enter-active, .collapse-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}
.collapse-enter-from, .collapse-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 640px) {
  .section-header      { padding: 11px 12px; }
  .header-left         { gap: 6px; }
  .cat-name            { font-size: 14px; }
  .cat-total           { font-size: 13px; }
  .review-badge        { display: none; }
  .cat-rename-input    { width: 120px; font-size: 13px; }
  .btn-rename, .btn-delete { opacity: 1; }
  .tx-list             { padding: 0 8px 8px; }
}
</style>
