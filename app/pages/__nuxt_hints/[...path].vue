<script setup lang="ts">
/**
 * Fallback route agar navigasi SPA ke `/__nuxt_hints/*` tidak memicu
 * `Page not found` dari Nuxt router (afterEach + matched.length === 0).
 * Request HTTP asli tetap ditangani Nitro dev handler @nuxt/hints.
 */
definePageMeta({
  layout: 'blank',
})

const router = useRouter()

onMounted(() => {
  if (import.meta.client && window.history.length > 1) {
    router.back()
    return
  }
  navigateTo('/dashboard', { replace: true })
})
</script>

<template>
  <div class="hidden" aria-hidden="true" />
</template>
