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
import NavBar from './components/NavBar.vue'
</script>

<style scoped>
.app {
  max-width: 780px;
  margin: 0 auto;
  padding: 36px 20px 64px;
}
</style>
