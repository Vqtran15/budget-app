<template>
  <Teleport to="body">
    <Transition name="modal-anim" appear @after-leave="emit('close')">
    <div v-if="visible" class="overlay" @click.self="close">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">New Category</h2>
          <button class="btn-close" @click="close">
            <X :size="18" />
          </button>
        </div>

        <div class="field">
          <label class="field-label">Name</label>
          <input
            ref="nameInput"
            v-model="name"
            class="name-input"
            placeholder="e.g. Pet Care"
            maxlength="32"
            @keydown.enter="submit"
          />
          <p v-if="nameError" class="field-error">{{ nameError }}</p>
        </div>

        <div class="field">
          <label class="field-label">Icon</label>
          <div class="icon-grid">
            <button
              v-for="iconName in ICON_OPTIONS"
              :key="iconName"
              class="icon-opt"
              :class="{ active: selectedIcon === iconName }"
              :title="iconName"
              @click="selectedIcon = iconName"
            >
              <CategoryIcon :name="iconName" :size="20" />
            </button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Color</label>
          <div class="color-row">
            <button
              v-for="swatch in COLOR_PALETTE"
              :key="swatch.color"
              class="swatch"
              :class="{ active: selectedColor?.color === swatch.color }"
              :style="{ background: swatch.color }"
              @click="selectedColor = swatch"
            />
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="close">Cancel</button>
          <button class="btn-create" :disabled="!canSubmit" @click="submit">
            Create Category
          </button>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { X } from 'lucide-vue-next'
import CategoryIcon from './CategoryIcon.vue'
import { ICON_OPTIONS, COLOR_PALETTE } from '../utils/categories.js'
import { useCustomCategories } from '../composables/useCustomCategories.js'
import { ALL_CATEGORIES } from '../utils/categories.js'

const emit = defineEmits(['close', 'created'])

const { customCategoryNames, addCategory } = useCustomCategories()

const nameInput    = ref(null)
const name         = ref('')
const selectedIcon = ref('Star')
const selectedColor= ref(COLOR_PALETTE[0])
const nameError    = ref('')
const visible      = ref(false)

onMounted(async () => {
  await nextTick()
  visible.value = true
  await nextTick()
  nameInput.value?.focus()
})

function close() { visible.value = false }

const takenNames = computed(() => [
  ...ALL_CATEGORIES.map(c => c.toLowerCase()),
  ...customCategoryNames.value.map(c => c.toLowerCase()),
])

const canSubmit = computed(() =>
  name.value.trim().length > 0 && selectedIcon.value && selectedColor.value
)

function submit() {
  nameError.value = ''
  const trimmed = name.value.trim()
  if (!trimmed) { nameError.value = 'Name is required.'; return }
  if (takenNames.value.includes(trimmed.toLowerCase())) {
    nameError.value = 'A category with that name already exists.'
    return
  }
  const ok = addCategory({
    name:  trimmed,
    icon:  selectedIcon.value,
    color: selectedColor.value.color,
    bg:    selectedColor.value.bg,
  })
  if (ok) emit('created', trimmed)
}
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
  gap: 20px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
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

.field { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-muted);
}

.name-input {
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color .15s;
}
.name-input:focus { border-color: var(--accent); }

.field-error { font-size: 12px; color: var(--red); }

.icon-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 4px;
}

.icon-opt {
  aspect-ratio: 1;
  border-radius: 8px;
  background: var(--bg);
  border: 1.5px solid transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .12s, border-color .12s, color .12s;
}
.icon-opt:hover { background: var(--surface-hover); color: var(--text); }
.icon-opt.active {
  background: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent);
}

.color-row { display: flex; gap: 8px; flex-wrap: wrap; }

.swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2.5px solid transparent;
  cursor: pointer;
  transition: transform .12s, border-color .12s;
  outline: none;
}
.swatch:hover { transform: scale(1.15); }
.swatch.active {
  border-color: var(--text);
  transform: scale(1.15);
  box-shadow: 0 0 0 2px var(--surface);
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 4px;
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

.btn-create {
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
.btn-create:hover:not(:disabled) { background: var(--accent-hover); }
.btn-create:disabled { opacity: .4; cursor: not-allowed; }

/* ── Modal animation ── */
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
