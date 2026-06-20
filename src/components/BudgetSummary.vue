<template>
  <div class="summary">
    <div class="stat income">
      <span class="label">Total Income</span>
      <span class="value">+{{ fmt(income) }}</span>
    </div>
    <div class="stat expenses">
      <span class="label">Total Expenses</span>
      <span class="value">-{{ fmt(expenses) }}</span>
    </div>
    <div class="stat net" :class="net >= 0 ? 'positive' : 'negative'">
      <span class="label">Net</span>
      <span class="value">{{ net >= 0 ? '+' : '' }}{{ fmt(net) }}</span>
    </div>
    <div class="stat count">
      <span class="label">Transactions</span>
      <span class="value">{{ transactions.length }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  transactions: { type: Array, default: () => [] },
})

const income = computed(() =>
  props.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
)

const expenses = computed(() =>
  props.transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
)

const net = computed(() => income.value - expenses.value)

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n))
}
</script>

<style scoped>
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}

.stat {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-muted);
}

.value {
  font-size: 24px;
  font-weight: 700;
}

.income  .value { color: var(--green); }
.expenses .value { color: var(--red); }
.net.positive .value { color: var(--green); }
.net.negative .value { color: var(--red); }
.count   .value { color: var(--accent); }
</style>
