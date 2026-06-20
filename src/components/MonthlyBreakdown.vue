<template>
  <div class="monthly">
    <h2 class="section-title">Monthly Breakdown</h2>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th class="num">Income</th>
            <th class="num">Expenses</th>
            <th class="num">Net</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in months" :key="row.key">
            <td class="month-label">{{ row.label }}</td>
            <td class="num income">+{{ fmt(row.income) }}</td>
            <td class="num expense">-{{ fmt(row.expenses) }}</td>
            <td class="num" :class="row.net >= 0 ? 'income' : 'expense'">
              {{ row.net >= 0 ? '+' : '-' }}{{ fmt(Math.abs(row.net)) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="total-label">Total</td>
            <td class="num income">+{{ fmt(totals.income) }}</td>
            <td class="num expense">-{{ fmt(totals.expenses) }}</td>
            <td class="num" :class="totals.net >= 0 ? 'income' : 'expense'">
              {{ totals.net >= 0 ? '+' : '-' }}{{ fmt(Math.abs(totals.net)) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { parseMonthYear } from '../utils/dateUtils.js'

const props = defineProps({
  transactions: { type: Array, required: true },
})

const months = computed(() => {
  const map = new Map()

  for (const tx of props.transactions) {
    const parsed = parseMonthYear(tx.date)
    if (!parsed) continue
    const key = parsed.key
    if (!map.has(key)) {
      map.set(key, { key, label: parsed.label, year: parsed.year, month: parsed.month, income: 0, expenses: 0 })
    }
    const bucket = map.get(key)
    if (tx.amount > 0) bucket.income  += tx.amount
    else               bucket.expenses += Math.abs(tx.amount)
  }

  return [...map.values()]
    .sort((a, b) => b.key.localeCompare(a.key))
    .map(r => ({
      ...r,
      net: r.income - r.expenses,
    }))
})

const totals = computed(() => {
  const income   = months.value.reduce((s, r) => s + r.income, 0)
  const expenses = months.value.reduce((s, r) => s + r.expenses, 0)
  return { income, expenses, net: income - expenses }
})

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
</script>

<style scoped>
.monthly {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-muted);
  padding: 6px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}

tbody tr:last-child td { border-bottom: none; }

tbody tr:hover td { background: var(--surface-hover); }

tfoot td {
  border-top: 2px solid var(--border);
  border-bottom: none;
  font-weight: 700;
}

.num { text-align: right; font-variant-numeric: tabular-nums; }

.month-label { font-weight: 500; }
.total-label { font-weight: 700; color: var(--text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }

.income  { color: var(--green); }
.expense { color: var(--red); }
</style>
