import { expect, test } from '@playwright/test'

test('home can navigate to timeline and article', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '日本史リファレンス' })).toBeVisible()
  await page.getByRole('link', { name: '年表' }).click()
  await expect(page.getByRole('heading', { name: '年表ビュー' })).toBeVisible()

  await page.getByRole('link', { name: '織田信長' }).first().click()
  await expect(page.getByRole('heading', { name: '織田信長' })).toBeVisible()
  await expect(page.getByText('目次')).toBeVisible()
})

test('search box suggests article and opens detail', async ({ page }) => {
  await page.goto('/')
  const input = page.getByPlaceholder('キーワード検索（例: 鎌倉, 徳川家康）')
  await input.fill('明治')
  await page.getByRole('button', { name: '明治維新' }).click()
  await expect(page.getByRole('heading', { name: '明治維新' })).toBeVisible()
})
