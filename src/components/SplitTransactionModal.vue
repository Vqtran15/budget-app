<template>
  <Teleport to="body">
    <Transition name="modal-anim" appear @after-leave="emit('close')">
    <div v-if="visible" class="overlay" @click.self="close">
      <div class="modal">

        <div class="modal-header">
          <div class="header-left">
            <Scissors :size="18" class="header-icon" />
            <h2 class="modal-title">Split Transaction</h2>
          </div>
          <button class="btn-close" @click="close"><X :size="18" /></button>
        </div>

        <div class="tx-summary">
          <div class="tx-info">
            <span class="tx-desc">{{ tx.description }}</span>
            <span class="tx-date">{{ tx.date }}</span>
          </div>
          <span class="tx-total" :class="tx.amount >= 0 ? 'credit' : 'debit'">
            {{ tx.amount >= 0 ? '+' : '' }}{{ fmt(tx.amount) }}
          </span>
        </div>

        <div class="splits">
          <div v-for="(split, i) in splits" :key="i" class="split-row">
            <select v-model="split.category" class="split-cat">
              <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <div class="amount-wrap">
              <span class="amount-prefix">$</span>
              <input
                type="number"
                v-model="split.amountStr"
                class="split-amount"
                min="0"
                step="0.01"
                placeholder="0.00"
                @focus="e => e.target.select()"
              />
            </div>
            <button
              class="btn-fill"
              :disabled="remaining <= 0"
              title="Fill with remaining amount"
              @click="fillRemaining(i)"
            >↓</button>
            <button
              class="btn-row-remove"
              :disabled="splits.length <= 2"
              title="Remove split"
              @click="removeSplit(i)"
            ><X :size="13" /></button>
          </div>

          <button class="btn-add-split" @click="addSplit">
            <Plus :size="14" /> Add split
          </button>
        </div>

        <div class="remaining-bar" :class="remainingClass">
          <span class="remaining-label">
            {{ Math.abs(remaining) < 0.005 ? '✓ Fully allocated' : remaining > 0 ? `Remaining: ${fmtAbs(remaining)}` : `Over by: ${fmtAbs(Math.abs(remaining))}` }}
          </span>
          <span class="allocated-label">{{ fmtAbs(allocatedAbs) }} / {{ fmtAbs(totalAbs) }}</span>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="close">Cancel</button>
          <button class="btn-split" :disabled="!isValid" @click="submit">
            <Scissors :size="14" /> Split Transaction
          </button>
        </div>

      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { X, Plus, Scissors } from 'lucide-vue-next'
import { ALL_CATEGORIES } from '../utils/categories.js'
import { useCustomCategories } from '../composables/useCustomCategories.js'

const props = defineProps({
  tx: { type: Object, required: true },
})
const emit = defineEmits(['close', 'split'])

const { customCategoryNames } = useCustomCategories()
const allCategories = computed(() => [...ALL_CATEGORIES, ...customCategoryNames.value])

const visible = ref(false)
onMounted(async () => { await nextTick(); visible.value = true })
function close() { visible.value = false }

const totalAbs = computed(() => Math.abs(props.tx.amount))
const sign     = computed(() => props.tx.amount >= 0 ? 1 : -1)

const splits = ref([
  { category: props.tx.category, amountStr: totalAbs.value.toFixed(2) },
  { category: props.tx.category, amountStr: '0.00' },
])

function addSplit() {
  splits.value.push({ category: props.tx.category, amountStr: '0.00' })
}

function removeSplit(i) {
  if (splits.value.length <= 2) return
  splits.value.splice(i, 1)
}

function fillRemaining(i) {
  if (remaining.value <= 0) return
  const current = parseFloat(splits.value[i].amountStr) || 0
  splits.value[i].amountStr = (current + remaining.value).toFixed(2)
}

const allocatedAbs = computed(() =>
  splits.value.reduce((sum, s) => sum + (parseFloat(s.amountStr) || 0), 0)
)
const remaining = computed(() => parseFloat((totalAbs.value - allocatedAbs.value).toFixed(10)))

const isValid = computed(() =>
  Math.abs(remaining.value) < 0.005 &&
  splits.value.length >= 2 &&
  splits.value.every(s => (parseFloat(s.amountStr) || 0) > 0)
)

const remainingClass = computed(() => {
  if (Math.abs(remaining.value) < 0.005) return 'done'
  if (remaining.value < 0) return 'over'
  return 'under'
})

function submit() {
  if (!isValid.value) return
  const newTxs = splits.value.map((s, i) => ({
    ...props.tx,
    id:         `${props.tx.id}-split-${i}-${Date.now()}`,
    amount:     parseFloat((parseFloat(s.amountStr) * sign.value).toFixed(2)),
    category:   s.category,
    isSplit:    true,
    splitGroup: props.tx.id,
  }))
  emit('split', { originalId: props.tx.id, transactions: newTxs })
  close()
}

const fmt    = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
const fmtAbs = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 45, 61, .45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 16px;
}

.modal {
  background: var(--surface);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(30,45,61,.2);
  width: 100%;
  max-width: 480px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left { display: flex; align-items: center; gap: 8px; }
.header-icon { color: var(--accent); }
.modal-title { font-size: 18px; font-weight: 700; color: var(--text); }

.btn-close {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: none; border: none;
  color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background .15s;
}
.btn-close:hover { background: var(--bg); }

.tx-summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  background: var(--bg);
  border-radius: 10px;
  padding: 12px 14px;
}
.tx-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.tx-desc { font-size: 14px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-date { font-size: 12px; color: var(--text-muted); }
.tx-total { font-size: 16px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
.credit { color: var(--green); }
.debit  { color: var(--red); }

.splits { display: flex; flex-direction: column; gap: 8px; }

.split-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.split-cat {
  flex: 1;
  font-size: 13px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  min-width: 0;
}
.split-cat:focus { outline: none; border-color: var(--accent); }

.amount-wrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  overflow: hidden;
  width: 110px;
  flex-shrink: 0;
  transition: border-color .15s;
}
.amount-wrap:focus-within { border-color: var(--accent); }

.amount-prefix {
  padding: 0 6px 0 10px;
  font-size: 13px;
  color: var(--text-muted);
  user-select: none;
}

.split-amount {
  width: 100%;
  padding: 7px 8px 7px 0;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  outline: none;
}
.split-amount::-webkit-inner-spin-button,
.split-amount::-webkit-outer-spin-button { -webkit-appearance: none; }

.btn-fill {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s, border-color .15s;
}
.btn-fill:hover:not(:disabled) { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
.btn-fill:disabled { opacity: .3; cursor: not-allowed; }

.btn-row-remove {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: none;
  color: var(--text-xs);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: color .15s, border-color .15s, background .15s;
}
.btn-row-remove:hover:not(:disabled) { color: var(--red); border-color: var(--red); background: var(--red-light); }
.btn-row-remove:disabled { opacity: .25; cursor: not-allowed; }

.btn-add-split {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1.5px dashed var(--border);
  background: none;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
  transition: border-color .15s, color .15s, background .15s;
}
.btn-add-split:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

.remaining-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: background .2s, color .2s;
}
.remaining-bar.done  { background: var(--green-light); color: var(--green); }
.remaining-bar.under { background: var(--yellow-light); color: #8b6914; }
.remaining-bar.over  { background: var(--red-light); color: var(--red); }

.allocated-label { font-size: 12px; font-weight: 500; opacity: .75; }

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 2px;
}

.btn-cancel {
  padding: 9px 18px;
  border-radius: 9px;
  border: 1.5px solid var(--border);
  background: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s;
}
.btn-cancel:hover { background: var(--surface-hover); }

.btn-split {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  border-radius: 9px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-split:hover:not(:disabled) { background: var(--accent-hover); }
.btn-split:disabled { opacity: .4; cursor: not-allowed; }

/* Modal animation */
.modal-anim-enter-active { transition: opacity .2s ease; }
.modal-anim-enter-from   { opacity: 0; }
.modal-anim-leave-active { transition: opacity .22s ease; }
.modal-anim-leave-to     { opacity: 0; }

.modal-anim-enter-active .modal {
  transition: transform .32s cubic-bezier(.34, 1.56, .64, 1), opacity .2s ease;
}
.modal-anim-enter-from .modal { transform: translateY(28px) scale(.95); opacity: 0; }
.modal-anim-leave-active .modal { transition: transform .2s ease, opacity .2s ease; }
.modal-anim-leave-to .modal     { transform: translateY(12px) scale(.97); opacity: 0; }
</style>
