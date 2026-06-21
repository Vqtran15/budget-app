<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">Monthly Income vs Expenses</h3>
      <button class="btn-settings" :class="{ active: showSettings }" title="Customize colors" @click="showSettings = !showSettings">
        <SlidersHorizontal :size="15" />
      </button>
    </div>

    <Transition name="panel">
    <div v-if="showSettings && hasData" class="settings-panel">
      <p class="settings-label">Bar Colors</p>
      <div class="color-rows">
        <label class="color-row">
          <span class="color-swatch" :style="{ background: colors.barIncome }"></span>
          <span class="color-name">Income</span>
          <input type="color" :value="colors.barIncome"  class="color-input" @input="e => setBarIncome(e.target.value)" />
        </label>
        <label class="color-row">
          <span class="color-swatch" :style="{ background: colors.barExpense }"></span>
          <span class="color-name">Expenses</span>
          <input type="color" :value="colors.barExpense" class="color-input" @input="e => setBarExpense(e.target.value)" />
        </label>
      </div>
    </div>
    </Transition>

    <div v-if="hasData" class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>
    <p v-else class="empty">No data</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { SlidersHorizontal } from 'lucide-vue-next'
import { parseMonthYear } from '../utils/dateUtils.js'
import { useChartColors } from '../composables/useChartColors.js'

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({ transactions: { type: Array, required: true } })

const canvasRef    = ref(null)
const showSettings = ref(false)
let chart = null

const { colors, setBarIncome, setBarExpense } = useChartColors()

const chartData = computed(() => {
  const map = new Map()
  for (const tx of props.transactions) {
    const parsed = parseMonthYear(tx.date)
    if (!parsed) continue
    if (!map.has(parsed.key)) map.set(parsed.key, { key: parsed.key, label: parsed.label, income: 0, expenses: 0 })
    const b = map.get(parsed.key)
    if (tx.amount > 0) b.income   += tx.amount
    else               b.expenses += Math.abs(tx.amount)
  }
  const rows = [...map.values()].sort((a, b) => a.key < b.key ? -1 : 1)
  return {
    labels:   rows.map(r => r.label),
    income:   rows.map(r => parseFloat(r.income.toFixed(2))),
    expenses: rows.map(r => parseFloat(r.expenses.toFixed(2))),
  }
})

const hasData = computed(() => chartData.value.labels.length > 0)

function buildChart() {
  if (!canvasRef.value || !hasData.value) return
  chart?.destroy()
  const { labels, income, expenses } = chartData.value
  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income',   data: income,   backgroundColor: colors.barIncome,  borderRadius: 4, borderWidth: 0 },
        { label: 'Expenses', data: expenses, backgroundColor: colors.barExpense, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 12 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 },
        },
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
          ticks: { font: { size: 11 }, callback: v => '$' + v.toLocaleString() },
        },
      },
    },
  })
}

onMounted(buildChart)
watch([chartData, () => colors.barIncome, () => colors.barExpense], buildChart, { flush: 'post' })
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
