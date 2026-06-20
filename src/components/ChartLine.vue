<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="title-group">
        <h3 class="chart-title">Monthly Expenses</h3>
        <span class="chart-sub">Total spending per month</span>
      </div>
      <button class="btn-settings" :class="{ active: showSettings }" title="Customize colors" @click="showSettings = !showSettings">
        <SlidersHorizontal :size="15" />
      </button>
    </div>

    <Transition name="panel">
    <div v-if="showSettings && hasData" class="settings-panel">
      <p class="settings-label">Line Colors</p>
      <div class="color-rows">
        <label class="color-row">
          <span class="color-swatch" :style="{ background: colors.lineBalance }"></span>
          <span class="color-name">Line</span>
          <input type="color" :value="colors.lineBalance" class="color-input" @input="e => setLineBalance(e.target.value)" />
        </label>
        <label class="color-row">
          <span class="color-swatch" :style="{ background: colors.lineFill }"></span>
          <span class="color-name">Fill</span>
          <input type="color" :value="colors.lineFill" class="color-input" @input="e => setLineFill(e.target.value)" />
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
import {
  Chart, LineController, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
} from 'chart.js'
import { SlidersHorizontal } from 'lucide-vue-next'
import { parseMonthYear } from '../utils/dateUtils.js'
import { useChartColors } from '../composables/useChartColors.js'

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const props = defineProps({ transactions: { type: Array, required: true } })

const canvasRef    = ref(null)
const showSettings = ref(false)
let chart = null

const { colors, setLineBalance, setLineFill } = useChartColors()

const chartData = computed(() => {
  const map = new Map()
  for (const tx of props.transactions) {
    if (tx.amount >= 0) continue
    const parsed = parseMonthYear(tx.date)
    if (!parsed) continue
    const prev = map.get(parsed.key) ?? { label: parsed.label, expenses: 0 }
    map.set(parsed.key, { label: parsed.label, expenses: prev.expenses + Math.abs(tx.amount) })
  }
  const rows = [...map.values()].sort((a, b) => a.label < b.label ? -1 : 1)
  return {
    labels:   rows.map(r => r.label),
    expenses: rows.map(r => parseFloat(r.expenses.toFixed(2))),
  }
})

const hasData = computed(() => chartData.value.labels.length > 0)

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function buildChart() {
  if (!canvasRef.value || !hasData.value) return
  chart?.destroy()
  const { labels, expenses } = chartData.value
  const lineColor = colors.lineBalance
  const fillColor = hexToRgba(colors.lineFill, 0.3)

  chart = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Expenses',
        data: expenses,
        borderColor: lineColor,
        backgroundColor: fillColor,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: lineColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` $${ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          grid: { color: '#e5e7eb' },
          ticks: {
            font: { size: 11 },
            callback: v => '$' + v.toLocaleString(),
          },
        },
      },
    },
  })
}

onMounted(buildChart)
watch([chartData, () => colors.lineBalance, () => colors.lineFill], buildChart, { flush: 'post' })
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
  align-items: flex-start;
  justify-content: space-between;
}

.title-group { display: flex; flex-direction: column; gap: 2px; }
.chart-title { font-size: 15px; font-weight: 700; color: var(--text); }
.chart-sub   { font-size: 12px; color: var(--text-muted); }

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
  flex-shrink: 0;
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

.canvas-wrap { position: relative; width: 100%; }

.empty {
  font-size: 13px;
  color: var(--text-xs);
  text-align: center;
  padding: 32px 0;
}

.panel-enter-active, .panel-leave-active {
  transition: opacity .18s ease, transform .18s ease, max-height .2s ease;
  overflow: hidden;
  max-height: 200px;
}
.panel-enter-from, .panel-leave-to { opacity: 0; transform: translateY(-6px); max-height: 0; }
</style>
