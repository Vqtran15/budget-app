<template>
  <div v-if="!authReady" class="loading-screen">
    <div class="loading-ring" />
  </div>

  <AuthPage v-else-if="!userId || authEvent === 'PASSWORD_RECOVERY'" />

  <template v-else>
    <NavBar />
    <main class="app">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </template>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import NavBar   from './components/NavBar.vue'
import AuthPage from './pages/AuthPage.vue'
import { useAuth }             from './composables/useAuth.js'
import { useUploadHistory }    from './composables/useUploadHistory.js'
import { useMerchantMemory }   from './composables/useMerchantMemory.js'
import { useTransactionStore } from './composables/useTransactionStore.js'
import { useCustomCategories } from './composables/useCustomCategories.js'

const { initAuth, userId, authReady, authEvent } = useAuth()
const { syncFromSupabase: syncHistory }      = useUploadHistory()
const { syncFromSupabase: syncMerchants }    = useMerchantMemory()
const { syncFromSupabase: syncTransactions } = useTransactionStore()
const { syncFromSupabase: syncSettings }     = useCustomCategories()

// Sync all data whenever the user signs in (including on page load if already logged in)
watch(userId, (newId) => {
  if (newId) {
    Promise.all([syncHistory(), syncMerchants(), syncTransactions(), syncSettings()])
  }
})

onMounted(() => initAuth())
</script>

<style>
/* Global page transition */
.page-enter-active, .page-leave-active { transition: opacity .18s ease, transform .18s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to   { opacity: 0; transform: translateY(-4px); }
</style>

<style scoped>
.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

.loading-ring {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.app {
  max-width: 780px;
  margin: 0 auto;
  padding: 36px 20px 64px;
}

@media (max-width: 640px) {
  .app {
    padding: 20px 12px calc(72px + env(safe-area-inset-bottom));
  }
}
</style>
