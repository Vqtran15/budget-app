<template>
  <Transition name="bar">
    <div v-if="count > 0" class="bulk-bar">
      <span class="bulk-count">{{ count }} selected</span>

      <div class="bulk-actions">
        <div class="move-wrap">
          <select v-model="moveTarget" class="cat-select">
            <option value="">Move to…</option>
            <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <button class="btn-move" :disabled="!moveTarget" @click="doMove">Apply</button>
        </div>

        <button class="btn-delete" @click="emit('delete')">Delete</button>
        <button class="btn-clear" @click="emit('clear')">✕ Clear</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  count:         { type: Number, required: true },
  allCategories: { type: Array,  required: true },
})

const emit = defineEmits(['move', 'delete', 'clear'])
const moveTarget = ref('')

function doMove() {
  if (!moveTarget.value) return
  emit('move', moveTarget.value)
  moveTarget.value = ''
}
</script>

<style scoped>
.bulk-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text);
  color: #fff;
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,.2);
  z-index: 200;
  white-space: nowrap;
}

.bulk-count {
  font-size: 13px;
  font-weight: 600;
  opacity: .85;
  flex-shrink: 0;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.move-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-select {
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 7px;
  border: 1px solid rgba(255,255,255,.2);
  background: rgba(255,255,255,.1);
  color: #fff;
  cursor: pointer;
}

.cat-select option { background: #3d405b; color: #fff; }

.btn-move {
  padding: 6px 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-move:hover:not(:disabled) { background: var(--accent-hover); }
.btn-move:disabled { opacity: .4; cursor: not-allowed; }

.btn-delete {
  padding: 6px 12px;
  background: rgba(239,68,68,.25);
  color: #fca5a5;
  border: 1px solid rgba(239,68,68,.3);
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-delete:hover { background: rgba(239,68,68,.4); }

.btn-clear {
  padding: 6px 10px;
  background: rgba(255,255,255,.1);
  color: rgba(255,255,255,.7);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 7px;
  font-size: 12px;
  cursor: pointer;
  transition: background .15s;
}
.btn-clear:hover { background: rgba(255,255,255,.2); color: #fff; }

.bar-enter-active, .bar-leave-active { transition: opacity .2s, transform .2s; }
.bar-enter-from, .bar-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
