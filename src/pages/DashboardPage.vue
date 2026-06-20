<template>
  <div class="dashboard">
    <header class="dash-header fade-up">
      <div>
        <h1 class="dash-title">Dashboard</h1>
        <div v-if="store.parseWarning.value || store.aiParsed.value" class="file-badge">
          <span v-if="store.parseWarning.value" class="badge warn">{{ store.parseWarning.value }}</span>
          <span v-if="store.aiParsed.value" class="badge ai">AI parsed</span>
        </div>
      </div>
    </header>

    <div v-if="!store.transactions.value.length" class="empty-state">
      <ReceiptText :size="40" class="empty-icon" />
      <p class="empty-title">No data yet</p>
      <p class="empty-sub">Upload a bank statement to see your analytics</p>
    </div>

    <template v-else>
      <div class="period-bar fade-up-1">
        <div class="period-options">
          <button
            v-for="opt in PERIOD_OPTIONS"
            :key="opt.value ?? 'all'"
            class="period-btn"
            :class="{ active: periodYears === opt.value }"
            @click="applyPeriod(opt.value)"
          >{{ opt.label }}</button>
        </div>
        <div class="date-inputs">
          <input type="date" v-model="periodStart" class="date-input" @change="periodYears = null" />
          <span class="date-sep">–</span>
          <input type="date" v-model="periodEnd" class="date-input" @change="periodYears = null" />
        </div>
      </div>

      <BudgetSummary class="fade-up-1" :transactions="periodFiltered" />

      <div class="charts-grid fade-up-2">
        <ChartDonut :transactions="periodFiltered" />
        <ChartBar   :transactions="periodFiltered" />
      </div>

      <ChartLine class="fade-up-2 line-chart" :transactions="periodFiltered" />

      <MonthlyBreakdown class="fade-up-3" :transactions="periodFiltered" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ReceiptText } from 'lucide-vue-next'
import { toISODate } from '../utils/dateUtils.js'
import BudgetSummary    from '../components/BudgetSummary.vue'
import MonthlyBreakdown from '../components/MonthlyBreakdown.vue'
import ChartDonut       from '../components/ChartDonut.vue'
import ChartBar         from '../components/ChartBar.vue'
import ChartLine        from '../components/ChartLine.vue'
import { useTransactionStore } from '../composables/useTransactionStore.js'

const store = useTransactionStore()

const PERIOD_OPTIONS = [
  { label: '1Y',  value: 1 },
  { label: '2Y',  value: 2 },
  { label: '3Y',  value: 3 },
  { label: '5Y',  value: 5 },
  { label: 'All', value: null },
]

const periodYears = ref(1)
const periodStart = ref('')
const periodEnd   = ref('')

const allISO = computed(() =>
  store.transactions.value.map(tx => toISODate(tx.date)).filter(Boolean)
)
const maxISO = computed(() =>
  allISO.value.length ? allISO.value.reduce((a, b) => a > b ? a : b) : null
)
const minISO = computed(() =>
  allISO.value.length ? allISO.value.reduce((a, b) => a < b ? a : b) : null
)

watch([minISO, maxISO], () => {
  if (periodYears.value !== null) applyPeriod(periodYears.value)
}, { immediate: true })

function applyPeriod(years) {
  periodYears.value = years
  if (!maxISO.value) { periodStart.value = ''; periodEnd.value = ''; return }
  periodEnd.value = maxISO.value
  if (years === null) { periodStart.value = minISO.value ?? ''; return }
  const d = new Date(maxISO.value + 'T00:00:00')
  d.setFullYear(d.getFullYear() - years)
  const clamped = d.toISOString().slice(0, 10)
  periodStart.value = clamped < (minISO.value ?? '') ? (minISO.value ?? '') : clamped
}

const periodFiltered = computed(() => {
  if (!periodStart.value || !periodEnd.value) return store.transactions.value
  const [s, e] = [periodStart.value, periodEnd.value]
  return store.transactions.value.filter(tx => {
    const iso = toISODate(tx.date)
    return iso && iso >= s && iso <= e
  })
})
</script>

<style scoped>
.dashboard { padding-bottom: 80px; }

.dash-header {
  margin-bottom: 28px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.dash-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -.02em;
  color: var(--text);
}

.file-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 13px;
  flex-wrap: wrap;
}

.badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 99px;
}
.badge.warn { background: var(--yellow-light); color: #8b6914; }
.badge.ai   { background: var(--accent-light); color: var(--accent-hover); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 64px 24px;
  text-align: center;
}
.empty-icon  { color: var(--border); }
.empty-title { font-size: 18px; font-weight: 700; color: var(--text); }
.empty-sub   { font-size: 14px; color: var(--text-muted); }

.period-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.period-options {
  display: flex;
  gap: 4px;
  background: var(--bg);
  border-radius: 9px;
  padding: 3px;
  border: 1px solid var(--border);
}

.period-btn {
  padding: 4px 14px;
  border-radius: 6px;
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, color .15s;
}
.period-btn:hover { color: var(--text); }
.period-btn.active {
  background: var(--surface);
  color: var(--accent);
  box-shadow: var(--shadow);
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-input {
  font-size: 12px;
  font-family: inherit;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
  transition: border-color .15s;
}
.date-input:hover { border-color: var(--text-muted); }
.date-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }

.date-sep {
  font-size: 13px;
  color: var(--text-muted);
  user-select: none;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.line-chart { margin-bottom: 16px; }

@media (max-width: 640px) {
  .charts-grid        { grid-template-columns: 1fr; }
  .dash-title         { font-size: 22px; }
  .period-bar         { flex-direction: column; align-items: stretch; gap: 8px; }
  .period-options     { justify-content: space-between; }
  .period-btn         { flex: 1; text-align: center; padding: 5px 4px; font-size: 12px; }
  .date-inputs        { justify-content: center; }
  .date-input         { flex: 1; min-width: 0; }
}
</style>
