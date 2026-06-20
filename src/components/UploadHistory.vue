<template>
  <div v-if="history.length" class="history">
    <div class="history-header">
      <span class="history-title">Recent uploads</span>
      <button class="btn-clear" @click="clearHistory">Clear all</button>
    </div>

    <ul class="history-list">
      <li v-for="entry in history" :key="entry.id" class="history-item">
        <div class="entry-icon">📄</div>
        <div class="entry-info">
          <span class="entry-name" :title="entry.fileName">{{ entry.fileName }}</span>
          <span class="entry-meta">
            {{ fmt(entry.uploadedAt) }} · {{ entry.transactionCount }} transactions
            <span v-if="entry.aiParsed" class="tag-ai">✦ AI</span>
          </span>
        </div>
        <div class="entry-actions">
          <button class="btn-load" @click="emit('load', entry)">Load</button>
          <button class="btn-delete" title="Remove from history" @click="removeEntry(entry.id)">✕</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useUploadHistory } from '../composables/useUploadHistory.js'

const { history, removeEntry, clearHistory } = useUploadHistory()
const emit = defineEmits(['load'])

function fmt(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
  font-size: 13px;
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
}

.history-item:hover { border-color: var(--accent); }

.entry-icon { font-size: 20px; flex-shrink: 0; }

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
  background: var(--accent-light);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 99px;
}

.entry-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.btn-load {
  padding: 5px 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-load:hover { background: var(--accent-hover); }

.btn-delete {
  padding: 5px 7px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 11px;
  color: var(--text-xs);
  cursor: pointer;
  line-height: 1;
  transition: color .15s, border-color .15s, background .15s;
}
.btn-delete:hover { color: var(--accent-hover); border-color: var(--accent); background: var(--red-light); }
</style>
