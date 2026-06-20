<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">Spending by Category</h3>
      <button class="btn-settings" :class="{ active: showSettings }" title="Customize colors" @click="showSettings = !showSettings">
        <SlidersHorizontal :size="15" />
      </button>
    </div>

    <Transition name="panel">
    <div v-if="showSettings && hasData" class="settings-panel">
      <p class="settings-label">Category Colors</p>
      <div class="color-rows">
        <label v-for="cat in chartData.labels" :key="cat" class="color-row">
          <span class="color-swatch" :style="{ background: resolvedColors[cat] }"></span>
          <span class="color-name">{{ cat }}</span>
          <input
            type="color"
            :value="resolvedColors[cat]"
            class="color-input"
            @input="e => setCategoryColor(cat, e.target.value)"
          />
        </label>
      </div>
    </div>
    </Transition>

    <div v-if="hasData" class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>
    <p v-else class="empty">No expense data</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js'
import { SlidersHorizontal } from 'lucide-vue-next'
import { CATEGORIES, CATEGORY_META } from '../utils/categories.js'
import { useCustomCategories } from '../composables/useCustomCategories.js'
import { useChartColors } from '../composables/useChartColors.js'

Chart.register(ArcElement, DoughnutController, Tooltip, Legend)

const props = defineProps({ transactions: { type: Array, required: true } })

const canvasRef    = ref(null)
const showSettings = ref(false)
let chart = null

const { customMeta }                          = useCustomCategories()
const { colors, getCategoryColor, setCategoryColor } = useChartColors()

const EXCLUDED = new Set([CATEGORIES.INCOME, CATEGORIES.TRANSFER, CATEGORIES.UNCATEGORIZED])

const chartData = computed(() => {
  const totals = {}
  for (const tx of props.transactions) {
    if (tx.amount >= 0 || EXCLUDED.has(tx.category)) continue
    totals[tx.category] = (totals[tx.category] ?? 0) + Math.abs(tx.amount)
  }
  const labels = Object.keys(totals).sort((a, b) => totals[b] - totals[a])
  return { labels, data: labels.map(l => totals[l]) }
})

const resolvedColors = computed(() => {
  const out = {}
  for (const cat of chartData.value.labels) {
    const fallback = CATEGORY_META[cat]?.color ?? customMeta.value[cat]?.color ?? '#94a3b8'
    out[cat] = getCategoryColor(cat, fallback)
  }
  // track colors.categories so this recomputes when a color changes
  void colors.categories
  return out
})

const hasData = computed(() => chartData.value.data.length > 0)

function buildChart() {
  if (!canvasRef.value || !hasData.value) return
  chart?.destroy()
  const { labels, data } = chartData.value
  const bgColors = labels.map(l => resolvedColors.value[l])
  chart = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: bgColors, borderWidth: 0 }],
    },
    options: {
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 12 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 },
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
              const pct = ((val / total) * 100).toFixed(1)
              return ` $${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pct}%)`
            },
          },
        },
      },
    },
  })
}

onMounted(buildChart)
watch([chartData, resolvedColors], buildChart, { flush: 'post' })
onBeforeUnmount(() => chart?.destroy())
</script>

<style scoped>
.chart-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title { font-size: 15px; font-weight: 700; color: var(--text); }

.btn-settings {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;
}
.btn-settings:hover, .btn-settings.active {
  background: var(--accent-light);
  color: var(--accent);
  border-color: var(--accent);
}

.settings-panel {
  background: var(--bg);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-muted);
}

.color-rows { display: flex; flex-direction: column; gap: 6px; }

.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.color-swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.color-name { font-size: 13px; color: var(--text); flex: 1; }

.color-input {
  width: 32px;
  height: 24px;
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 1px 2px;
  background: none;
  cursor: pointer;
}

.canvas-wrap {
  position: relative;
  max-width: 280px;
  margin: 0 auto;
  width: 100%;
}

.empty {
  font-size: 13px;
  color: var(--text-xs);
  text-align: center;
  padding: 32px 0;
}

.panel-enter-active, .panel-leave-active {
  transition: opacity .18s ease, transform .18s ease, max-height .2s ease;
  overflow: hidden;
  max-height: 400px;
}
.panel-enter-from, .panel-leave-to { opacity: 0; transform: translateY(-6px); max-height: 0; }
</style>
