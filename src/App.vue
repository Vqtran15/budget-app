<template>
  <NavBar />
  <main class="app">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import { useAuth } from './composables/useAuth.js'
import { useUploadHistory } from './composables/useUploadHistory.js'
import { useMerchantMemory } from './composables/useMerchantMemory.js'

const { initAuth, authReady } = useAuth()
const { syncFromSupabase: syncHistory } = useUploadHistory()
const { syncFromSupabase: syncMerchants } = useMerchantMemory()

onMounted(async () => {
  await initAuth()
  if (authReady.value) {
    await Promise.all([syncHistory(), syncMerchants()])
  }
})
</script>

<style scoped>
.app {
  max-width: 780px;
  margin: 0 auto;
  padding: 36px 20px 64px;
}
</style>
