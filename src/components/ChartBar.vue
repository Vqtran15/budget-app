<template>
  <div class="chart-card">
    <h3 class="chart-title">Monthly Income vs Expenses</h3>
    <div v-if="hasData" class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>
    <p v-else class="empty">No data</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { parseMonthYear } from '../utils/dateUtils.js'

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({ transactions: { type: Array, required: true } })

const canvasRef = ref(null)
let chart = null

const chartData = computed(() => {
  const map = new Map()
  for (const tx of props.transactions) {
    const parsed = parseMonthYear(tx.date)
    if (!parsed) continue
    if (!map.has(parsed.key)) map.set(parsed.key, { label: parsed.label, income: 0, expenses: 0 })
    const b = map.get(parsed.key)
    if (tx.amount > 0) b.income   += tx.amount
    else               b.expenses += Math.abs(tx.amount)
  }
  const rows = [...map.values()].sort((a, b) => a.label < b.label ? -1 : 1)
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
        { label: 'Income',   data: income,   backgroundColor: '#10b981', borderRadius: 4 },
        { label: 'Expenses', data: expenses, backgroundColor: '#ef4444', borderRadius: 4 },
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
          grid: { color: '#f1f5f9' },
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
watch(chartData, buildChart, { flush: 'post' })
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

.chart-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.canvas-wrap { position: relative; width: 100%; }

.empty {
  font-size: 13px;
  color: var(--text-xs);
  text-align: center;
  padding: 32px 0;
}
</style>
