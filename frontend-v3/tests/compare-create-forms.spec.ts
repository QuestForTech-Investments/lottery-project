/**
 * Compare CreateBettingPool forms between V2 and V3
 * Takes screenshots of all tabs in both versions for visual comparison
 */

import { test, expect } from '@playwright/test'

const V2_URL = 'http://88.223.95.55:4000'
const V3_URL = 'http://88.223.95.55:4005'

// Helper function to login
async function login(page: any, baseUrl: string) {
  await page.goto(`${baseUrl}/login`)
  await page.fill('input#username', 'admin')
  await page.fill('input#password', 'Admin123456')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
}

test.describe('Compare Create Betting Pool Forms V2 vs V3', () => {
  test('should compare General tab between V2 and V3', async ({ browser }) => {
    // Create two contexts (like two browsers)
    const contextV2 = await browser.newContext()
    const contextV3 = await browser.newContext()

    const pageV2 = await contextV2.newPage()
    const pageV3 = await contextV3.newPage()

    try {
      // Login to both
      console.log('=== Logging in to V2 ===')
      await login(pageV2, V2_URL)
      console.log('=== Logging in to V3 ===')
      await login(pageV3, V3_URL)

      // Navigate to create forms
      console.log('=== Navigating to create forms ===')
      await pageV2.goto(`${V2_URL}/betting-pools/new`)
      await pageV3.goto(`${V3_URL}/betting-pools/new`)

      // Wait for forms to load
      await pageV2.waitForTimeout(2000)
      await pageV3.waitForTimeout(2000)

      // Take screenshots of General tab
      console.log('=== Taking screenshots of General tab ===')
      await pageV2.screenshot({
        path: '/tmp/v2-general-tab.png',
        fullPage: true
      })
      await pageV3.screenshot({
        path: '/tmp/v3-general-tab.png',
        fullPage: true
      })

      console.log('✅ Screenshots saved:')
      console.log('   V2: /tmp/v2-general-tab.png')
      console.log('   V3: /tmp/v3-general-tab.png')

      // Count fields in both versions
      const v2Fields = await pageV2.locator('input[type="text"], textarea, input[type="password"]').count()
      const v3Fields = await pageV3.locator('input[type="text"], textarea, input[type="password"]').count()

      console.log(`\n📊 Field count comparison:`)
      console.log(`   V2: ${v2Fields} fields`)
      console.log(`   V3: ${v3Fields} fields`)

      // List all field labels in V2
      const v2Labels = await pageV2.locator('label').allTextContents()
      console.log(`\n📝 V2 Field labels:`)
      v2Labels.forEach((label, i) => console.log(`   ${i + 1}. ${label}`))

      // List all field labels in V3
      const v3Labels = await pageV3.locator('label').allTextContents()
      console.log(`\n📝 V3 Field labels:`)
      v3Labels.forEach((label, i) => console.log(`   ${i + 1}. ${label}`))

    } finally {
      await contextV2.close()
      await contextV3.close()
    }
  })

  test('should compare Configuration tab between V2 and V3', async ({ browser }) => {
    const contextV2 = await browser.newContext()
    const contextV3 = await browser.newContext()

    const pageV2 = await contextV2.newPage()
    const pageV3 = await contextV3.newPage()

    try {
      await login(pageV2, V2_URL)
      await login(pageV3, V3_URL)

      await pageV2.goto(`${V2_URL}/betting-pools/new`)
      await pageV3.goto(`${V3_URL}/betting-pools/new`)

      await pageV2.waitForTimeout(2000)
      await pageV3.waitForTimeout(2000)

      // Click on Configuration tab
      console.log('=== Clicking Configuration tab ===')
      await pageV2.getByRole('tab', { name: /Configuración/i }).click()
      await pageV3.getByRole('tab', { name: /Configuración/i }).click()

      await pageV2.waitForTimeout(1000)
      await pageV3.waitForTimeout(1000)

      // Take screenshots
      console.log('=== Taking screenshots of Configuration tab ===')
      await pageV2.screenshot({
        path: '/tmp/v2-configuration-tab.png',
        fullPage: true
      })
      await pageV3.screenshot({
        path: '/tmp/v3-configuration-tab.png',
        fullPage: true
      })

      console.log('✅ Screenshots saved:')
      console.log('   V2: /tmp/v2-configuration-tab.png')
      console.log('   V3: /tmp/v3-configuration-tab.png')

      // Count select dropdowns
      const v2Selects = await pageV2.locator('select, div[role="button"][aria-haspopup="listbox"]').count()
      const v3Selects = await pageV3.locator('select, div[role="button"][aria-haspopup="listbox"]').count()

      console.log(`\n📊 Dropdown count:`)
      console.log(`   V2: ${v2Selects} dropdowns`)
      console.log(`   V3: ${v3Selects} dropdowns`)

    } finally {
      await contextV2.close()
      await contextV3.close()
    }
  })

  test('should compare Schedules tab between V2 and V3', async ({ browser }) => {
    const contextV2 = await browser.newContext()
    const contextV3 = await browser.newContext()

    const pageV2 = await contextV2.newPage()
    const pageV3 = await contextV3.newPage()

    try {
      await login(pageV2, V2_URL)
      await login(pageV3, V3_URL)

      await pageV2.goto(`${V2_URL}/betting-pools/new`)
      await pageV3.goto(`${V3_URL}/betting-pools/new`)

      await pageV2.waitForTimeout(2000)
      await pageV3.waitForTimeout(2000)

      // Click on Schedules tab
      console.log('=== Clicking Schedules tab ===')
      await pageV2.getByRole('tab', { name: /Horarios/i }).click()
      await pageV3.getByRole('tab', { name: /Horarios/i }).click()

      await pageV2.waitForTimeout(1000)
      await pageV3.waitForTimeout(1000)

      // Take screenshots
      console.log('=== Taking screenshots of Schedules tab ===')
      await pageV2.screenshot({
        path: '/tmp/v2-schedules-tab.png',
        fullPage: true
      })
      await pageV3.screenshot({
        path: '/tmp/v3-schedules-tab.png',
        fullPage: true
      })

      console.log('✅ Screenshots saved:')
      console.log('   V2: /tmp/v2-schedules-tab.png')
      console.log('   V3: /tmp/v3-schedules-tab.png')

    } finally {
      await contextV2.close()
      await contextV3.close()
    }
  })

  test('should compare all tabs systematically', async ({ browser }) => {
    const contextV2 = await browser.newContext()
    const contextV3 = await browser.newContext()

    const pageV2 = await contextV2.newPage()
    const pageV3 = await contextV3.newPage()

    const tabs = [
      'General',
      'Configuración',
      'Pies de Página',
      'Premios & Comisiones',
      'Horarios',
      'Sorteos',
      'Estilos',
      'Gastos Automáticos'
    ]

    try {
      await login(pageV2, V2_URL)
      await login(pageV3, V3_URL)

      await pageV2.goto(`${V2_URL}/betting-pools/new`)
      await pageV3.goto(`${V3_URL}/betting-pools/new`)

      await pageV2.waitForTimeout(2000)
      await pageV3.waitForTimeout(2000)

      console.log('\n🔍 Comparing all tabs...\n')

      for (const tabName of tabs) {
        console.log(`\n=== Comparing: ${tabName} ===`)

        // Click tab in both versions
        await pageV2.getByRole('tab', { name: new RegExp(tabName, 'i') }).click()
        await pageV3.getByRole('tab', { name: new RegExp(tabName, 'i') }).click()

        await pageV2.waitForTimeout(1000)
        await pageV3.waitForTimeout(1000)

        // Generate filename-safe name
        const filename = tabName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')

        // Take screenshots
        await pageV2.screenshot({
          path: `/tmp/v2-${filename}.png`,
          fullPage: true
        })
        await pageV3.screenshot({
          path: `/tmp/v3-${filename}.png`,
          fullPage: true
        })

        console.log(`✅ Screenshots saved for ${tabName}`)
      }

      console.log('\n\n📸 All screenshots saved to /tmp/')
      console.log('   Compare them to find visual differences')

    } finally {
      await contextV2.close()
      await contextV3.close()
    }
  })
})
