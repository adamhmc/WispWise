import { expect, test } from '@playwright/test'

test('loads the Geesten application shell', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '閃靈快手' })).toBeVisible()
})

test('enters first-play tutorial and locks answers after one choice', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '開始遊戲' }).click()

  await expect(page.getByRole('heading', { name: '先找直接匹配' })).toBeVisible()
  await page.getByRole('button', { name: '選擇鬼' }).click()
  await expect(page.getByRole('status')).toContainText('答對了')
  await expect(page.getByRole('button', { name: /^選擇/ })).toHaveCount(5)
  await expect(page.getByRole('button', { name: /^選擇/ }).first()).toBeDisabled()
})
