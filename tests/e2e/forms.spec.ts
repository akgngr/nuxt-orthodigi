import { test, expect } from '@playwright/test'

test.describe('Form Builder Admin UI', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin forms page
    await page.goto('/admin/forms')
  })

  test('should open form modal', async ({ page }) => {
    // 1. Click "Yeni Form Oluştur"
    await page.getByRole('button', { name: 'Yeni Form Oluştur' }).click()

    // 2. Wait for drawer content
    const formDrawer = page.getByTestId('form-drawer-content')
    await expect(formDrawer).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Form ayarlarını ve alanlarını buradan yönetebilirsiniz.')).toBeVisible()
  })

  test('should handle drawer closing correctly', async ({ page }) => {
    await page.getByRole('button', { name: 'Yeni Form Oluştur' }).click()
    const formDrawer = page.getByTestId('form-drawer-content')
    await expect(formDrawer).toBeVisible({ timeout: 15000 })

    // Close form drawer
    await page.getByTestId('form-drawer-close-icon').click()
    await expect(formDrawer).toBeHidden({ timeout: 10000 })
  })
})
