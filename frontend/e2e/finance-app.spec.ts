import { test, expect } from '@playwright/test';

test.describe('Finance App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display dashboard with navigation', async ({ page }) => {
    // Check navigation
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Transactions' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reports' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Import/Export' })).toBeVisible();

    // Check dashboard title
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should navigate to Transactions page', async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click();
    
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();
    await expect(page.getByText('Add New Transaction')).toBeVisible();
  });

  test('should create a new transaction', async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click();

    // Fill in transaction form
    await page.getByLabel('Type').selectOption('expense');
    await page.getByLabel('Amount').fill('50.00');
    await page.getByLabel('Category').selectOption('Food');
    await page.getByLabel('Description').fill('E2E Test Transaction');

    // Submit form
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    // Verify transaction appears in list
    await expect(page.getByText('E2E Test Transaction')).toBeVisible();
    await expect(page.getByText('Food')).toBeVisible();
  });

  test('should edit a transaction', async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click();

    // First create a transaction
    await page.getByLabel('Type').selectOption('expense');
    await page.getByLabel('Amount').fill('100.00');
    await page.getByLabel('Category').selectOption('Transportation');
    await page.getByLabel('Description').fill('Original Description');
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    // Wait for the transaction to appear
    await expect(page.getByText('Original Description')).toBeVisible();

    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).first().click();

    // Update description
    await page.getByLabel('Description').fill('Updated Description');
    await page.getByRole('button', { name: 'Update Transaction' }).click();

    // Verify update
    await expect(page.getByText('Updated Description')).toBeVisible();
  });

  test('should delete a transaction', async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click();

    // Create a transaction to delete
    await page.getByLabel('Description').fill('To Be Deleted');
    await page.getByLabel('Amount').fill('25.00');
    await page.getByLabel('Category').selectOption('Entertainment');
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    // Wait for transaction to appear
    await expect(page.getByText('To Be Deleted')).toBeVisible();

    // Click delete and confirm
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).first().click();

    // Verify it's removed
    await expect(page.getByText('To Be Deleted')).not.toBeVisible();
  });

  test('should filter transactions', async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click();

    // Create transactions with different categories
    await page.getByLabel('Description').fill('Food Item');
    await page.getByLabel('Category').selectOption('Food');
    await page.getByLabel('Amount').fill('30.00');
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    await page.getByLabel('Description').fill('Transport Item');
    await page.getByLabel('Category').selectOption('Transportation');
    await page.getByLabel('Amount').fill('40.00');
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    // Apply category filter
    await page.getByLabel('Category').nth(1).selectOption('Food');
    await page.getByRole('button', { name: 'Apply Filters' }).click();

    // Verify only Food item is shown
    await expect(page.getByText('Food Item')).toBeVisible();
  });

  test('should navigate to Reports page and display charts', async ({ page }) => {
    await page.getByRole('link', { name: 'Reports' }).click();

    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
    await expect(page.getByText('Monthly Overview')).toBeVisible();
    await expect(page.getByText('Income by Category')).toBeVisible();
    await expect(page.getByText('Expenses by Category')).toBeVisible();
  });

  test('should navigate to Import/Export page', async ({ page }) => {
    await page.getByRole('link', { name: 'Import/Export' }).click();

    await expect(page.getByRole('heading', { name: 'Import & Export' })).toBeVisible();
    await expect(page.getByText('Import Transactions')).toBeVisible();
    await expect(page.getByText('Export Transactions')).toBeVisible();
  });

  test('should display summary cards on dashboard', async ({ page }) => {
    await expect(page.getByText('Total Income')).toBeVisible();
    await expect(page.getByText('Total Expenses')).toBeVisible();
    await expect(page.getByText('Net Balance')).toBeVisible();
    await expect(page.getByText('Transactions')).toBeVisible();
  });
});