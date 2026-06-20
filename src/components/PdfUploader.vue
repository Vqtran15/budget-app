<template>
  <div class="uploader-wrap">
    <div
      class="drop-zone"
      :class="{ dragging }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
      @click="fileInput.click()"
    >
      <div class="drop-icon">📄</div>
      <p class="drop-title">Drop your bank statement here</p>
      <p class="drop-sub">or click to browse</p>
      <div class="format-tags">
        <span class="tag">PDF</span>
        <span class="tag tag-csv">CSV</span>
        <span class="tag tag-csv">Excel</span>
        <span class="tag tag-csv">TXT</span>
      </div>
      <input ref="fileInput" type="file" accept=".pdf,.csv,.txt,.xlsx,.xls" hidden @change="onInputChange" />
    </div>

    <div v-if="loading" class="status loading">
      <span class="spinner"></span> Extracting transactions…
    </div>

    <div v-if="error" class="status error">
      ⚠️ {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  loading: Boolean,
  error: String,
})

const emit = defineEmits(['file-selected'])
const fileInput = ref(null)
const dragging = ref(false)

const ACCEPTED = ['.pdf', '.csv', '.txt', '.xlsx', '.xls']

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && ACCEPTED.some(ext => file.name.toLowerCase().endsWith(ext))) {
    emit('file-selected', file)
  }
}

function onInputChange(e) {
  const file = e.target.files[0]
  if (file) emit('file-selected', file)
}
</script>

<style scoped>
.uploader-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 0;
}

.drop-zone {
  width: 100%;
  max-width: 520px;
  border: 2px dashed var(--border);
  border-radius: 16px;
  background: var(--surface);
  padding: 48px 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color .2s, background .2s;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--accent);
  background: var(--accent-light);
}

.drop-icon { font-size: 48px; margin-bottom: 12px; }
.drop-title { font-size: 18px; font-weight: 600; color: var(--text); }
.drop-sub { color: var(--text-muted); margin: 4px 0 12px; }

.format-tags {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .04em;
  padding: 2px 10px;
  border-radius: 99px;
  background: var(--accent-light);
  color: var(--accent);
  border: 1px solid var(--border);
}

.tag-csv {
  background: var(--green-light);
  color: #5a9178;
  border-color: #b5d8cb;
}


.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
}

.loading { background: var(--accent-light); color: var(--accent); }
.error   { background: var(--red-light); color: #e11d48; }

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
