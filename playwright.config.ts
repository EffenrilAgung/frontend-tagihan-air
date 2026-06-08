import { defineConfig, devices } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Cursor sandbox bisa set PLAYWRIGHT_BROWSERS_PATH ke cache x64 — pakai cache user arm64 jika ada. */
const userBrowsersPath = join(homedir(), 'Library/Caches/ms-playwright')
const arm64Shell = join(
  userBrowsersPath,
  'chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell',
)
if (existsSync(arm64Shell)) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = userBrowsersPath
}

if (existsSync('.env.e2e')) {
  loadEnv({ path: '.env.e2e' })
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  webServer: [
    {
      command: 'php artisan serve',
      cwd: resolve(__dirname, '../backend-tagihan-air'),
      url: 'http://localhost:8000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
