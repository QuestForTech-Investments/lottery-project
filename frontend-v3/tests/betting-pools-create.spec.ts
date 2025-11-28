/**
 * CreateBettingPool Test
 * Tests the betting pool creation flow with all tabs
 */

import { test, expect } from '@playwright/test'

// Helper function to login before each test
async function login(page: any) {
  await page.goto('/login')
  await page.fill('input#username', 'admin')
  await page.fill('input#password', 'Admin123456')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
}

test.describe('Betting Pools - Create', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should navigate to create betting pool page', async ({ page }) => {
    // Navigate to betting pools list (assuming there's a menu item)
    // You may need to adjust this selector based on your actual navigation
    await page.goto('/betting-pools/create')

    // Should show the create page title
    await expect(page.getByRole('heading', { name: /Crear Nueva Banca/i })).toBeVisible()

    // Should show the tabs
    await expect(page.getByRole('tab', { name: /General/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Configuración/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Horarios/i })).toBeVisible()
  })

  test('should show General tab fields', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Should be on General tab by default
    const generalTab = page.getByRole('tab', { name: /General/i })
    await expect(generalTab).toHaveAttribute('aria-selected', 'true')

    // Should show required fields
    await expect(page.getByLabel(/Nombre de la Banca/i)).toBeVisible()
    await expect(page.getByLabel(/Código de la Banca/i)).toBeVisible()
    await expect(page.getByLabel(/Zona/i)).toBeVisible()

    // Should show optional fields
    await expect(page.getByLabel(/Ubicación/i)).toBeVisible()
    await expect(page.getByLabel(/Usuario/i)).toBeVisible()
    await expect(page.getByLabel(/Contraseña/i)).toBeVisible()
    await expect(page.getByLabel(/Comentarios/i)).toBeVisible()
  })

  test('should fill in General tab fields', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Fill in basic information
    await page.getByLabel(/Nombre de la Banca/i).fill('Test Banca Playwright')
    await page.getByLabel(/Ubicación/i).fill('Test Location')
    await page.getByLabel(/Usuario/i).fill('testuser')
    await page.getByLabel(/Contraseña/i).fill('Test123456')
    await page.getByLabel(/Confirmar Contraseña/i).fill('Test123456')
    await page.getByLabel(/Comentarios/i).fill('Created by Playwright test')

    // Select a zone (assuming at least one zone exists)
    await page.getByLabel(/Zona/i).click()
    // Wait for the dropdown to open and select first available zone
    await page.waitForTimeout(500)
    const firstZone = page.locator('li[role="option"]').first()
    if (await firstZone.isVisible()) {
      await firstZone.click()
    }

    // Verify values are filled
    await expect(page.getByLabel(/Nombre de la Banca/i)).toHaveValue('Test Banca Playwright')
    await expect(page.getByLabel(/Ubicación/i)).toHaveValue('Test Location')
    await expect(page.getByLabel(/Usuario/i)).toHaveValue('testuser')
  })

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Start on General tab
    await expect(page.getByRole('tab', { name: /General/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    // Switch to Configuration tab
    await page.getByRole('tab', { name: /Configuración/i }).click()
    await expect(page.getByRole('tab', { name: /Configuración/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(page.getByText(/Configuración del Sistema/i)).toBeVisible()

    // Switch to Schedules tab
    await page.getByRole('tab', { name: /Horarios/i }).click()
    await expect(page.getByRole('tab', { name: /Horarios/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(page.getByText(/Horarios de Sorteos/i)).toBeVisible()

    // Switch back to General
    await page.getByRole('tab', { name: /General/i }).click()
    await expect(page.getByRole('tab', { name: /General/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  test('should show Configuration tab options', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Navigate to Configuration tab
    await page.getByRole('tab', { name: /Configuración/i }).click()

    // Should show fall type options
    await expect(page.getByText(/Tipo de caída/i)).toBeVisible()
    await expect(page.getByLabel(/OFF/i).first()).toBeVisible()

    // Should show financial settings
    await expect(page.getByLabel(/Balance de Desactivación/i)).toBeVisible()
    await expect(page.getByLabel(/Límite de Venta Diaria/i)).toBeVisible()

    // Should show toggle switches
    await expect(page.getByText(/Control de Tickets Ganadores/i)).toBeVisible()
    await expect(page.getByText(/Permitir Pasar Bote/i)).toBeVisible()
  })

  test('should show Schedules tab with all days', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Navigate to Schedules tab
    await page.getByRole('tab', { name: /Horarios/i }).click()

    // Should show all days of the week
    await expect(page.getByText(/Domingo/i)).toBeVisible()
    await expect(page.getByText(/Lunes/i)).toBeVisible()
    await expect(page.getByText(/Martes/i)).toBeVisible()
    await expect(page.getByText(/Miércoles/i)).toBeVisible()
    await expect(page.getByText(/Jueves/i)).toBeVisible()
    await expect(page.getByText(/Viernes/i)).toBeVisible()
    await expect(page.getByText(/Sábado/i)).toBeVisible()

    // Should show time fields with default values
    const timeFields = await page.getByLabel(/Hora de/i).all()
    expect(timeFields.length).toBeGreaterThan(0)

    // Check that default times are set
    const firstStartField = page
      .getByLabel(/Hora de Inicio/i)
      .first()
    await expect(firstStartField).toHaveValue(/AM|PM/)
  })

  test('should open TimePicker on schedule field click', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Navigate to Schedules tab
    await page.getByRole('tab', { name: /Horarios/i }).click()

    // Click on first time field
    const firstTimeField = page.getByLabel(/Hora de Inicio/i).first()
    await firstTimeField.click()

    // Wait for TimePicker to appear
    await page.waitForTimeout(300)

    // Should show TimePicker popup (looking for hour options)
    // The TimePicker shows hours like "12 AM", "01 AM", etc.
    const timePicker = page.locator('div[role="listbox"], ul, .MuiList-root').first()
    await expect(timePicker).toBeVisible({ timeout: 2000 })
  })

  test('should validate required fields on submit', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /Guardar Banca/i }).click()

    // Should show validation errors
    await expect(page.getByText(/nombre de la banca es requerido/i)).toBeVisible({
      timeout: 2000,
    })
  })

  test('should show loading state when submitting', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Fill minimum required fields
    await page.getByLabel(/Nombre de la Banca/i).fill('Test Banca')

    // Select a zone
    await page.getByLabel(/Zona/i).click()
    await page.waitForTimeout(500)
    const firstZone = page.locator('li[role="option"]').first()
    if (await firstZone.isVisible()) {
      await firstZone.click()
    }

    // Submit the form
    const submitButton = page.getByRole('button', { name: /Guardar Banca/i })
    await submitButton.click()

    // Should show loading state (button becomes "Guardando...")
    await expect(page.getByText(/Guardando/i)).toBeVisible({ timeout: 2000 })
  })

  test('should have back button working', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Click back button
    await page.getByRole('button', { name: /Volver/i }).click()

    // Should navigate away (to list page or previous page)
    await expect(page).not.toHaveURL('/betting-pools/create')
  })

  test('should show all 8 tabs', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Verify all tabs are present
    const tabNames = [
      'General',
      'Configuración',
      'Pies de Página',
      'Premios & Comisiones',
      'Horarios',
      'Sorteos',
      'Estilos',
      'Gastos Automáticos',
    ]

    for (const tabName of tabNames) {
      await expect(page.getByRole('tab', { name: new RegExp(tabName, 'i') })).toBeVisible()
    }
  })

  test('should persist form data when switching tabs', async ({ page }) => {
    await page.goto('/betting-pools/create')

    // Fill in General tab
    await page.getByLabel(/Nombre de la Banca/i).fill('Persistent Test')
    await page.getByLabel(/Ubicación/i).fill('Test Location')

    // Switch to Configuration tab
    await page.getByRole('tab', { name: /Configuración/i }).click()
    await page.waitForTimeout(300)

    // Switch back to General tab
    await page.getByRole('tab', { name: /General/i }).click()

    // Data should still be there
    await expect(page.getByLabel(/Nombre de la Banca/i)).toHaveValue('Persistent Test')
    await expect(page.getByLabel(/Ubicación/i)).toHaveValue('Test Location')
  })
})
