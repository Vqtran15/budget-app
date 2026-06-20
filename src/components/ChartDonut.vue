<template>
  <div class="chart-card">
    <h3 class="chart-title">Spending by Category</h3>
    <div v-if="hasData" class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>
    <p v-else class="empty">No expense data</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js'
import { CATEGORIES, CATEGORY_META } from '../utils/categories.js'

Chart.register(ArcElement, DoughnutController, Tooltip, Legend)

const props = defineProps({ transactions: { type: Array, required: true } })

const canvasRef = ref(null)
let chart = null

const EXCLUDED = new Set([CATEGORIES.INCOME, CATEGORIES.TRANSFER, CATEGORIES.UNCATEGORIZED])

const chartData = computed(() => {
  const totals = {}
  for (const tx of props.transactions) {
    if (tx.amount >= 0 || EXCLUDED.has(tx.category)) continue
    totals[tx.category] = (totals[tx.category] ?? 0) + Math.abs(tx.amount)
  }
  const labels = Object.keys(totals).sort((a, b) => totals[b] - totals[a])
  return {
    labels,
    data: labels.map(l => totals[l]),
    colors: labels.map(l => CATEGORY_META[l]?.color ?? '#94a3b8'),
  }
})

const hasData = computed(() => chartData.value.data.length > 0)

function buildChart() {
  if (!canvasRef.value || !hasData.value) return
  chart?.destroy()
  const { labels, data, colors } = chartData.value
  chart = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }],
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
</style>
