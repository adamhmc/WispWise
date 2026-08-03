import { expect, test } from '@playwright/test'

test('loads the Geesten application shell', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '閃靈快手' })).toBeVisible()
})
