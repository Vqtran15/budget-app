<template>
  <div v-if="history.length" class="history">
    <div class="history-header">
      <span class="history-title">Upload History</span>
      <button class="btn-clear" @click="confirmClearAll = true">Clear all</button>
    </div>

    <Transition name="warn-bar">
      <div v-if="confirmClearAll" class="confirm-bar">
        <span>Remove all uploads from history?</span>
        <div class="confirm-actions">
          <button class="btn-confirm-yes danger" @click="doClearAll">Yes, clear all</button>
          <button class="btn-confirm-no" @click="confirmClearAll = false">Cancel</button>
        </div>
      </div>
    </Transition>

    <TransitionGroup name="hist" tag="ul" class="history-list">
      <li v-for="entry in history" :key="entry.id" class="history-item">
        <div class="entry-icon">
          <FileText :size="18" />
        </div>
        <div class="entry-info">
          <span class="entry-name" :title="entry.fileName">{{ entry.fileName }}</span>
          <span class="entry-meta">
            {{ fmt(entry.uploadedAt) }} · {{ entry.transactionCount }} transactions
            <span v-if="entry.aiParsed" class="tag-ai">
              <Sparkles :size="10" /> AI
            </span>
          </span>
        </div>

        <Transition name="swap" mode="out-in">
          <!-- Confirmation state -->
          <div v-if="confirmingId === entry.id" key="confirm" class="entry-confirm">
            <span class="confirm-label">Remove this upload?</span>
            <button class="btn-confirm-yes danger" @click="doRemove(entry)">Remove</button>
            <button class="btn-confirm-no" @click="confirmingId = null">Cancel</button>
          </div>

          <!-- Default state -->
          <div v-else key="actions" class="entry-actions">
            <button class="btn-delete" title="Remove upload" @click="confirmingId = entry.id">
              <X :size="12" />
            </button>
          </div>
        </Transition>
      </li>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FileText, Sparkles, X } from 'lucide-vue-next'
import { useUploadHistory } from '../composables/useUploadHistory.js'

const emit = defineEmits(['removed'])

const { history, removeEntry, clearHistory } = useUploadHistory()

const confirmingId   = ref(null)
const confirmClearAll = ref(false)

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function doRemove(entry) {
  confirmingId.value = null
  await removeEntry(entry.id)
  emit('removed', entry)
}

async function doClearAll() {
  confirmClearAll.value = false
  const removed = [...history.value]
  await clearHistory()
  removed.forEach(e => emit('removed', e))
}
</script>

<style scoped>
.history {
  width: 100%;
  max-width: 520px;
  margin-top: 8px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.history-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .05em;
}

.btn-clear {
  font-size: 12px;
  color: var(--text-xs);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color .15s;
}
.btn-clear:hover { color: var(--red); }

/* ── Confirm bar (clear all) ── */
.confirm-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--red-light);
  border: 1px solid var(--red);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--red);
}

.confirm-actions { display: flex; gap: 6px; flex-shrink: 0; }

.btn-confirm-yes {
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .15s;
}
.btn-confirm-yes.danger { background: var(--red); color: white; }
.btn-confirm-yes.danger:hover { opacity: .85; }

.btn-confirm-no {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: background .15s;
}
.btn-confirm-no:hover { background: var(--surface-hover); }

/* ── List ── */
.history-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  transition: border-color .15s;
  min-height: 58px;
}
.history-item:hover { border-color: var(--accent); }

.entry-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.entry-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-meta {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-ai {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: var(--accent-light);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 99px;
}

/* ── Action / confirm swap ── */
.entry-actions, .entry-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.confirm-label {
  font-size: 12px;
  color: var(--red);
  font-weight: 500;
  white-space: nowrap;
}

.btn-delete {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-xs);
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}
.btn-delete:hover { color: var(--red); border-color: var(--red); background: var(--red-light); }

/* ── Transitions ── */
.swap-enter-active, .swap-leave-active { transition: opacity .15s ease; }
.swap-enter-from,  .swap-leave-to      { opacity: 0; }

.warn-bar-enter-active, .warn-bar-leave-active { transition: opacity .2s ease, max-height .2s ease; max-height: 80px; overflow: hidden; }
.warn-bar-enter-from,  .warn-bar-leave-to      { opacity: 0; max-height: 0; }

.hist-enter-active { transition: opacity .2s ease, transform .2s ease; }
.hist-enter-from   { opacity: 0; transform: translateX(-10px); }
.hist-leave-active {
  transition: opacity .2s ease, transform .2s ease, max-height .22s ease, margin .22s ease;
  max-height: 80px;
  overflow: hidden;
}
.hist-leave-to { opacity: 0; transform: translateX(10px); max-height: 0; margin-bottom: 0; }
.hist-move { transition: transform .22s ease; }
</style>
