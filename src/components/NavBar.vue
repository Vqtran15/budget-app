<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/upload" class="brand">
        <BarChart3 :size="20" />
        Cash Flow
      </RouterLink>

      <div class="nav-links">
        <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
        <RouterLink to="/transactions" class="nav-link">
          Transactions
          <span v-if="hasTransactions" class="tx-count">{{ transactionCount }}</span>
        </RouterLink>
        <RouterLink to="/upload" class="nav-link">Upload</RouterLink>

        <span class="sync-indicator" :class="syncStatus" :title="syncLabel">
          <Loader2     v-if="syncStatus === 'syncing'" :size="15" class="spin" />
          <Check       v-else-if="syncStatus === 'synced'" :size="15" />
          <AlertCircle v-else-if="syncStatus === 'error'" :size="15" />
        </span>

        <!-- Settings cog + dropdown -->
        <div ref="menuRoot" class="settings-wrap">
          <button class="btn-cog" :class="{ active: showMenu }" @click="toggleMenu" title="Settings">
            <span v-if="userEmail" class="cog-email">{{ userEmail }}</span>
            <Settings :size="17" />
          </button>

          <Transition name="menu">
            <div v-if="showMenu" class="settings-menu">
              <div class="menu-user">
                <span class="menu-user-email" :title="userEmail">{{ userEmail }}</span>
              </div>
              <div class="menu-divider" />
              <button class="menu-item" @click="openChangePassword">
                <KeyRound :size="14" />
                Change Password
              </button>
              <button class="menu-item sign-out" @click="signOut">
                <LogOut :size="14" />
                Sign Out
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </nav>

  <!-- Mobile bottom tab bar -->
  <nav class="bottom-nav">
    <RouterLink to="/dashboard" class="tab-link">
      <BarChart3 :size="22" />
      <span class="tab-label">Dashboard</span>
    </RouterLink>
    <RouterLink to="/transactions" class="tab-link">
      <Receipt :size="22" />
      <span class="tab-label">
        Transactions
        <span v-if="hasTransactions" class="tab-badge">{{ transactionCount }}</span>
      </span>
    </RouterLink>
    <RouterLink to="/upload" class="tab-link">
      <CloudUpload :size="22" />
      <span class="tab-label">Upload</span>
    </RouterLink>
  </nav>

  <ChangePasswordModal v-if="showChangePw" @close="showChangePw = false" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { BarChart3, Loader2, Check, AlertCircle, Settings, KeyRound, LogOut, Receipt, CloudUpload } from 'lucide-vue-next'
import { useTransactionStore } from '../composables/useTransactionStore.js'
import { useAuth } from '../composables/useAuth.js'
import { syncStatus } from '../lib/supabase.js'
import ChangePasswordModal from './ChangePasswordModal.vue'

const store = useTransactionStore()
const { user, signOut } = useAuth()

const hasTransactions  = computed(() => store.transactions.value.length > 0)
const transactionCount = computed(() => store.transactions.value.length)
const userEmail        = computed(() => user.value?.email ?? '')

const syncLabel = computed(() => ({
  syncing: 'Syncing…',
  synced:  'Saved to cloud',
  error:   'Sync error',
  idle:    '',
}[syncStatus.value] ?? ''))

// ── Settings menu ─────────────────────────────────────────────────────────────

const showMenu     = ref(false)
const showChangePw = ref(false)
const menuRoot     = ref(null)

function toggleMenu() { showMenu.value = !showMenu.value }

function onDocClick(e) {
  if (!menuRoot.value?.contains(e.target)) showMenu.value = false
}

watch(showMenu, (open) => {
  if (open) document.addEventListener('click', onDocClick, true)
  else       document.removeEventListener('click', onDocClick, true)
})

function openChangePassword() {
  showMenu.value     = false
  showChangePw.value = true
}
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
  display: flex;
  align-items: center;
  gap: 7px;
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
.nav-link:hover { background: var(--accent-light); color: var(--accent); }
.nav-link.router-link-active { background: var(--accent-light); color: var(--accent); font-weight: 600; }

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
  border-radius: 50%;
  margin-left: 4px;
  transition: color .2s;
}
.sync-indicator.syncing { color: var(--text-muted); }
.sync-indicator.synced  { color: var(--green); }
.sync-indicator.error   { color: var(--accent); }
.sync-indicator.idle    { display: none; }

.spin { animation: spin .7s linear infinite; }

/* ── Cog button ───────────────────────────────────────────────────────────── */

.settings-wrap {
  position: relative;
  margin-left: 4px;
}

.btn-cog {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 10px 0 12px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;
}
.btn-cog:hover  { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
.btn-cog.active { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
.btn-cog.active :deep(svg) { transform: rotate(60deg); transition: transform .3s ease; }

.cog-email {
  font-size: 12px;
  font-weight: 500;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Dropdown menu ────────────────────────────────────────────────────────── */

.settings-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(30, 45, 61, .14);
  padding: 6px;
  z-index: 200;
}

.menu-user { padding: 8px 10px 6px; }

.menu-user-email {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-divider { height: 1px; background: var(--border); margin: 4px 0; }

.menu-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 7px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background .12s, color .12s;
}
.menu-item:hover { background: var(--surface-hover); }
.menu-item.sign-out { color: var(--red); }
.menu-item.sign-out:hover { background: var(--red-light); }

/* ── Dropdown animation ───────────────────────────────────────────────────── */

.menu-enter-active { transition: opacity .15s ease, transform .15s ease; }
.menu-leave-active { transition: opacity .12s ease, transform .12s ease; }
.menu-enter-from   { opacity: 0; transform: translateY(-6px) scale(.97); }
.menu-leave-to     { opacity: 0; transform: translateY(-4px) scale(.98); }

/* ── Mobile bottom tab bar ────────────────────────────────────────────────── */

.bottom-nav {
  display: none;
}

.tab-link {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 4px;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 500;
  transition: color .15s;
  position: relative;
}
.tab-link.router-link-active { color: var(--accent); }

.tab-label {
  display: flex;
  align-items: center;
  gap: 3px;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 15px;
  height: 15px;
  background: var(--accent);
  color: white;
  font-size: 9px;
  font-weight: 700;
  border-radius: 99px;
  padding: 0 4px;
}

/* ── Responsive ───────────────────────────────────────────────────────────── */

@media (max-width: 640px) {
  .nav-link        { display: none; }
  .sync-indicator  { display: none; }
  .cog-email       { display: none; }
  .btn-cog         { padding: 0 8px; border: none; background: none; }

  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface);
    border-top: 1px solid var(--border);
    box-shadow: 0 -1px 8px rgba(30, 45, 61, .06);
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom);
  }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
