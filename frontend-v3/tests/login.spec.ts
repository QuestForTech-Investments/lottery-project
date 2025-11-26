/**
 * Login Flow Test
 * Tests authentication with real API
 */

import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // Should show login form
    await expect(page.getByRole('heading', { name: /Lottery System/i })).toBeVisible();
    await expect(page.getByLabel(/Usuario/i)).toBeVisible();
    await expect(page.getByLabel(/Contraseña/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.getByLabel(/Usuario/i).fill('admin');
    await page.getByLabel(/Contraseña/i).fill('Admin123456');

    // Submit form
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Should show dashboard
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();

    // Should show user in navbar
    await expect(page.getByText('admin')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with wrong credentials
    await page.getByLabel(/Usuario/i).fill('wronguser');
    await page.getByLabel(/Contraseña/i).fill('wrongpass');

    // Submit form
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    // Should show error message
    await expect(page.getByRole('alert')).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/Usuario/i).fill('admin');
    await page.getByLabel(/Contraseña/i).fill('Admin123456');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    await expect(page).toHaveURL('/');

    // Click logout
    await page.getByRole('button', { name: /Cerrar Sesión/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
