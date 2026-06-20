<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/upload" class="brand">💳 Budget App</RouterLink>

      <div class="nav-links">
        <RouterLink
          to="/dashboard"
          class="nav-link"
          :class="{ disabled: !hasTransactions }"
          @click.prevent="hasTransactions ? router.push('/dashboard') : null"
        >
          Dashboard
          <span v-if="hasTransactions" class="tx-count">{{ transactionCount }}</span>
        </RouterLink>
        <RouterLink to="/upload" class="nav-link">Upload</RouterLink>

        <span class="sync-indicator" :class="syncStatus" :title="syncLabel">
          <span v-if="syncStatus === 'syncing'" class="spin">↻</span>
          <span v-else-if="syncStatus === 'synced'">✓</span>
          <span v-else-if="syncStatus === 'error'">⚠</span>
        </span>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useTransactionStore } from '../composables/useTransactionStore.js'
import { syncStatus } from '../lib/supabase.js'

const router = useRouter()
const store = useTransactionStore()

const hasTransactions = computed(() => store.transactions.value.length > 0)
const transactionCount = computed(() => store.transactions.value.length)

const syncLabel = computed(() => ({
  syncing: 'Syncing…',
  synced:  'Saved to cloud',
  error:   'Sync error',
  idle:    '',
}[syncStatus.value] ?? ''))
</script>

<style scoped>
.navbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-inner {
  max-width: 780px;
  margin: 0 auto;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
  text-decoration: none;
  letter-spacing: -.02em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: background .15s, color .15s;
}

.nav-link:hover:not(.disabled) {
  background: var(--accent-light);
  color: var(--accent);
}

.nav-link.router-link-active {
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 600;
}

.nav-link.disabled {
  opacity: .4;
  cursor: not-allowed;
  pointer-events: none;
}

.tx-count {
  font-size: 11px;
  font-weight: 700;
  background: var(--accent);
  color: white;
  padding: 1px 7px;
  border-radius: 99px;
  line-height: 1.6;
}

.sync-indicator {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 50%;
  margin-left: 4px;
  transition: color .2s;
}

.sync-indicator.syncing { color: var(--text-muted); }
.sync-indicator.synced  { color: var(--green); }
.sync-indicator.error   { color: var(--accent); }
.sync-indicator.idle    { display: none; }

.spin {
  display: inline-block;
  animation: spin .7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
