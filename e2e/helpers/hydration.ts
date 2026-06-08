import type { Page } from '@playwright/test'

/**
 * Pasang listener konsol sebelum navigasi.
 * Mengumpulkan warning/error yang mengandung "Hydration" atau "mismatch".
 */
export function attachHydrationCollector(page: Page): string[] {
  const hydrationErrors: string[] = []

  page.on('console', (msg) => {
    const type = msg.type()
    if (type !== 'warning' && type !== 'error') return

    const text = msg.text()
    if (/hydration|mismatch/i.test(text)) {
      hydrationErrors.push(`[${type}] ${text}`)
    }
  })

  return hydrationErrors
}

export async function waitForPageStable(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  const skeleton = page.locator('[data-slot="skeleton"]')
  if (await skeleton.count() > 0) {
    await skeleton.first().waitFor({ state: 'detached', timeout: 15_000 }).catch(() => {})
  }
  await page.waitForTimeout(300)
}

export async function assertNoHydrationErrors(
  page: Page,
  path: string,
  hydrationErrors: string[],
): Promise<void> {
  await page.goto(path, { waitUntil: 'networkidle' })
  await waitForPageStable(page)

  if (hydrationErrors.length > 0) {
    throw new Error(
      `Hydration issues on ${path}:\n${hydrationErrors.join('\n')}`,
    )
  }
}
