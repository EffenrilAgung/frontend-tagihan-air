import { test, expect } from '@playwright/test'
import { seedAuthenticatedSession } from './helpers/auth'
import { attachHydrationCollector, waitForPageStable } from './helpers/hydration'

/** Semua route halaman Nuxt (bukan komponen nested). */
const PUBLIC_ROUTES = [
  { path: '/', name: 'Login' },
] as const

const PROTECTED_ROUTES = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/customer', name: 'Daftar Pelanggan' },
  { path: '/customer/register', name: 'Registrasi Pelanggan' },
  { path: '/tarif', name: 'Tarif' },
  { path: '/pencatatan-meter', name: 'Pencatatan Meter' },
  { path: '/billing', name: 'Billing' },
  { path: '/reports', name: 'Reports' },
  { path: '/settings', name: 'Profil Akun' },
] as const

test.describe('Hydration — halaman publik', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`tidak ada hydration error: ${route.name} (${route.path})`, async ({ page }) => {
      const hydrationErrors = attachHydrationCollector(page)

      await page.goto(route.path, { waitUntil: 'networkidle' })
      await waitForPageStable(page)

      expect(
        hydrationErrors,
        hydrationErrors.length
          ? `Ditemukan di ${route.path}:\n${hydrationErrors.join('\n')}`
          : undefined,
      ).toHaveLength(0)
    })
  }
})

test.describe('Hydration — halaman setelah login', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page)
  })

  for (const route of PROTECTED_ROUTES) {
    test(`tidak ada hydration error: ${route.name} (${route.path})`, async ({ page }) => {
      const hydrationErrors = attachHydrationCollector(page)

      await page.goto(route.path, { waitUntil: 'networkidle' })
      await waitForPageStable(page)

      expect(
        hydrationErrors,
        hydrationErrors.length
          ? `Ditemukan di ${route.path}:\n${hydrationErrors.join('\n')}`
          : undefined,
      ).toHaveLength(0)
    })
  }
})
