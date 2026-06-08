/**
 * `/__nuxt_hints/*` adalah endpoint API modul @nuxt/hints (lazy-load, hydration, dll),
 * bukan halaman aplikasi. Cegah Vue Router menavigasi ke path ini — sumber 404 SPA.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/__nuxt_hints')) {
    return abortNavigation()
  }
})
