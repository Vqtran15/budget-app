<template>
  <Teleport to="body">
    <Transition name="modal-anim" appear @after-leave="emit('close')">
      <div v-if="visible" class="overlay" @click.self="close">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Add Transaction</h2>
          <button class="btn-close" @click="close"><X :size="18" /></button>
        </div>

        <div class="type-toggle">
          <div class="toggle-indicator" :class="type"></div>
          <button class="type-btn expense" :class="{ active: type === 'expense' }" @click="setType('expense')">
            <TrendingDown :size="15" /> Expense
          </button>
          <button class="type-btn income" :class="{ active: type === 'income' }" @click="setType('income')">
            <TrendingUp :size="15" /> Income
          </button>
        </div>

        <div class="fields">
          <div class="field">
            <label class="field-label">Description</label>
            <input
              ref="descInput"
              v-model="description"
              class="field-input"
              placeholder="e.g. Grocery run, Freelance payment…"
              maxlength="100"
              @keydown.enter="submit"
            />
          </div>

          <div class="field">
            <label class="field-label">Amount</label>
            <div class="amount-wrap">
              <span class="currency">$</span>
              <input
                v-model="amount"
                class="field-input amount-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                @keydown.enter="submit"
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label">Date</label>
            <input v-model="date" class="field-input" type="date" />
          </div>

          <div class="field">
            <label class="field-label">Category</label>
            <select v-model="category" class="field-input">
              <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>

        <p v-if="error" class="field-error">{{ error }}</p>

        <div class="modal-actions">
          <button class="btn-cancel" @click="close">Cancel</button>
          <button class="btn-add" :class="type" :disabled="!canSubmit" @click="submit">
            Add {{ type === 'income' ? 'Income' : 'Expense' }}
          </button>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { X, TrendingDown, TrendingUp } from 'lucide-vue-next'
import { ALL_CATEGORIES, CATEGORIES } from '../utils/categories.js'
import { useCustomCategories } from '../composables/useCustomCategories.js'

const emit = defineEmits(['close', 'add'])

const { customCategoryNames } = useCustomCategories()

const visible     = ref(false)
const descInput   = ref(null)
const type        = ref('expense')
const description = ref('')
const amount      = ref('')
const date        = ref(new Date().toISOString().slice(0, 10))
const category    = ref(CATEGORIES.UNCATEGORIZED)
const error       = ref('')

onMounted(async () => {
  await nextTick()
  visible.value = true
  await nextTick()
  descInput.value?.focus()
})

function close() { visible.value = false }

const allCategories = computed(() => [...ALL_CATEGORIES, ...customCategoryNames.value])

const categoryOptions = computed(() =>
  type.value === 'income'
    ? allCategories.value.filter(c => c !== CATEGORIES.UNCATEGORIZED)
    : allCategories.value.filter(c => c !== CATEGORIES.INCOME)
)

function setType(t) {
  type.value = t
  category.value = t === 'income' ? CATEGORIES.INCOME : CATEGORIES.UNCATEGORIZED
}

const canSubmit = computed(() =>
  description.value.trim().length > 0 &&
  Number(amount.value) > 0 &&
  date.value
)

function submit() {
  error.value = ''
  if (!canSubmit.value) { error.value = 'Please fill in all fields.'; return }

  const sign = type.value === 'expense' ? -1 : 1
  emit('add', {
    id:          `manual-${Date.now()}`,
    date:        date.value,
    description: description.value.trim(),
    amount:      parseFloat((sign * Math.abs(Number(amount.value))).toFixed(2)),
    type:        type.value === 'income' ? 'credit' : 'debit',
    category:    category.value,
    isManual:    true,
  })
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, .4);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 16px;
}

.modal {
  background: var(--surface);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,.15);
  width: 100%;
  max-width: 420px;
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

.modal-title { font-size: 17px; font-weight: 700; color: var(--text); }

.btn-close {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: none;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .15s;
}
.btn-close:hover { background: var(--bg); }

.type-toggle {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--bg);
  border-radius: 10px;
  padding: 4px;
}

.toggle-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  border-radius: 7px;
  pointer-events: none;
  z-index: 0;
  transition: transform .22s cubic-bezier(.4, 0, .2, 1),
              background-color .22s ease;
}
.toggle-indicator.expense { background: var(--red-light);   transform: translateX(0); }
.toggle-indicator.income  { background: var(--green-light); transform: translateX(100%); }

.type-btn {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 7px;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: color .22s ease;
}
.type-btn.active.expense { color: var(--red); }
.type-btn.active.income  { color: var(--green); }

.fields { display: flex; flex-direction: column; gap: 12px; }

.field { display: flex; flex-direction: column; gap: 5px; }

.field-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-muted);
}

.field-input {
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color .15s;
  width: 100%;
}
.field-input:focus { border-color: var(--accent); }

.amount-wrap { position: relative; }
.currency {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 14px;
  pointer-events: none;
}
.amount-input { padding-left: 24px; }

.field-error { font-size: 12px; color: var(--red); }

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 9px 18px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s;
}
.btn-cancel:hover { background: var(--bg); }

.btn-add {
  padding: 9px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .15s;
}
.btn-add.expense { background: var(--red);   color: white; }
.btn-add.income  { background: var(--green); color: white; }
.btn-add:disabled { opacity: .4; cursor: not-allowed; }

/* ── Modal animation ── */
.modal-anim-enter-active { transition: opacity .2s ease; }
.modal-anim-leave-active { transition: opacity .18s ease; }
.modal-anim-enter-from,
.modal-anim-leave-to     { opacity: 0; }

.modal-anim-enter-active .modal { transition: transform .28s cubic-bezier(.34, 1.56, .64, 1), opacity .22s ease; }
.modal-anim-leave-active .modal { transition: transform .18s ease, opacity .18s ease; }
.modal-anim-enter-from   .modal { transform: translateY(32px) scale(.95); opacity: 0; }
.modal-anim-leave-to     .modal { transform: translateY(16px) scale(.97); opacity: 0; }
</style>
