import type { Page } from '@playwright/test'

const DEFAULT_API_BASE = 'http://localhost:8000/api'

export function getE2eCredentials() {
  const email = process.env.E2E_EMAIL
  const password = process.env.E2E_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Set E2E_EMAIL dan E2E_PASSWORD (lihat .env.e2e.example) sebelum menjalankan test E2E.',
    )
  }

  return { email, password }
}

/** Seed sessionStorage auth agar halaman protected bisa diuji tanpa form login. */
export async function seedAuthenticatedSession(page: Page): Promise<void> {
  const { email, password } = getE2eCredentials()
  const apiBase = process.env.NUXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE

  const loginResponse = await page.request.post(`${apiBase}/login`, {
    headers: { Accept: 'application/json' },
    data: { email, password },
  })

  if (!loginResponse.ok()) {
    throw new Error(
      `Login API gagal (${loginResponse.status()}): ${await loginResponse.text()}`,
    )
  }

  const json = await loginResponse.json() as {
    success?: boolean
    data?: { token?: string; user?: unknown }
  }

  if (!json.success || !json.data?.token) {
    throw new Error('Respons login tidak valid — periksa E2E_EMAIL / E2E_PASSWORD.')
  }

  await page.addInitScript(({ token, user }) => {
    sessionStorage.setItem('auth_token', token)
    sessionStorage.setItem('auth_user', JSON.stringify(user))
  }, {
    token: json.data.token,
    user: json.data.user,
  })
}
