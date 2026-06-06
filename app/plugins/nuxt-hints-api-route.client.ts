/**
 * `/__nuxt_hints/*` adalah endpoint API modul @nuxt/hints, bukan halaman Nuxt.
 * Cegah Vue Router menangani navigasi SPA ke path ini (menyebabkan 404).
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.beforeEach((to) => {
    if (to.path.startsWith('/__nuxt_hints')) {
      return false
    }
  })
})
