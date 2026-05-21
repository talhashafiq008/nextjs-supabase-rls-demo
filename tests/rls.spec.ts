import { test, expect } from '@playwright/test'

// Covers all 5 scenarios Mark asked to verify on the call

test('scenario 1: home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('PanAfricanMines')).toBeVisible()
  await expect(page.getByText('Browse listings')).toBeVisible()
  await expect(page.getByText('infinite recursion')).not.toBeVisible()
})

test('scenario 5: logged-out user sees /listings without error', async ({ page }) => {
  await page.goto('/listings')
  await expect(page.getByText('infinite recursion')).not.toBeVisible()
  await expect(page.getByText('Live Listings')).toBeVisible()
})

test('scenario 5: logged-out user cannot see pending listings', async ({ page }) => {
  await page.goto('/listings')
  // Page must not contain any mention of pending_review status
  const content = await page.textContent('body')
  expect(content).not.toContain('pending_review')
  expect(content).not.toContain('pending review')
})

test('scenario 2: unauthenticated user hitting /sell redirects to login', async ({ page }) => {
  await page.goto('/sell')
  await expect(page).toHaveURL(/\/login/)
})

test('login page renders correctly', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('Sign in to your account')).toBeVisible()
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('login page toggle works', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign up' }).click()
  await expect(page.getByText('Create an account')).toBeVisible()
  await expect(page.getByText('New accounts start with the')).toBeVisible()
})

test('scenario 2: signing up and trying /sell shows blocked message', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`

  // Sign up
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign up' }).click()
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('password123')
  await page.getByRole('button', { name: 'Create account' }).click()

  // Should land on home page after signup
  await expect(page).toHaveURL('/')

  // Now try /sell — should see blocked message (not redirect, user is logged in)
  await page.goto('/sell')
  await expect(page.getByText('Access blocked by RLS')).toBeVisible()
  await expect(page.getByText('buyer')).toBeVisible()
})

test('profile page loads for authenticated user', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`

  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign up' }).click()
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('password123')
  await page.getByRole('button', { name: 'Create account' }).click()

  await page.goto('/profile')
  await expect(page.getByText('Your Profile')).toBeVisible()
  await expect(page.getByText('RLS Self-Promotion Test')).toBeVisible()
  await expect(page.getByRole('button', { name: /promote yourself/i })).toBeVisible()
})
