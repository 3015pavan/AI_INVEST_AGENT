import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete User Journey
 * Simulates: register → login → create portfolio → generate plan
 */

// Generate unique test user for each run
const generateTestUser = () => ({
  email: `test-${Date.now()}@example.com`,
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User',
  monthlyInvestmentBudget: 2000,
  annualIncome: 100000,
  riskTolerance: 'Moderate',
});

test.describe('Complete User Journey', () => {
  let testUser;

  test.beforeEach(() => {
    testUser = generateTestUser();
  });

  test('should complete full flow: register → login → portfolio → plan', async ({ page, context }) => {
    // Mock external API calls to keep tests deterministic
    await context.route('**/api/market/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          symbol: 'AAPL',
          price: 178.18,
          change: 2.34,
          changePercent: 1.33,
        }),
      });
    });

    // Step 1: Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/InvestAgent/i);
    
    // Verify homepage elements
    await expect(page.getByRole('heading', { name: /Your AI-Powered Investment Partner/i })).toBeVisible();

    // Step 2: Click "Get Started" to go to registration
    const getStartedButton = page.getByRole('button', { name: /get started/i }).first();
    await getStartedButton.click();
    
    // Should navigate to login page
    await expect(page).toHaveURL(/\/login/);

    // Step 3: Switch to Register form
    const createAccountLink = page.getByText(/create one/i);
    await createAccountLink.click();
    
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

    // Step 4: Fill registration form
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password/i).first().fill(testUser.password);
    await page.getByLabel(/first name/i).fill(testUser.firstName);
    await page.getByLabel(/last name/i).fill(testUser.lastName);
    
    // Fill financial information
    await page.getByLabel(/monthly investment budget/i).fill(testUser.monthlyInvestmentBudget.toString());
    await page.getByLabel(/annual income/i).fill(testUser.annualIncome.toString());
    await page.getByLabel(/risk tolerance/i).selectOption(testUser.riskTolerance);

    // Submit registration
    const registerButton = page.getByRole('button', { name: /sign up/i });
    await registerButton.click();

    // Step 5: Verify redirect to dashboard after registration
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(/investment dashboard/i)).toBeVisible();

    // Step 6: Verify user stats are displayed
    await expect(page.getByText(/total portfolio value/i)).toBeVisible();
    await expect(page.getByText(/total assets/i)).toBeVisible();

    // Step 7: Navigate to portfolio page
    const viewPortfoliosButton = page.getByRole('button', { name: /view all portfolios/i });
    await viewPortfoliosButton.click();
    
    await expect(page).toHaveURL(/\/portfolio/);

    // Step 8: Create new portfolio
    const createPortfolioButton = page.getByRole('button', { name: /create portfolio/i });
    await createPortfolioButton.click();

    // Fill portfolio creation form
    const portfolioNameInput = page.getByLabel(/portfolio name/i);
    await portfolioNameInput.fill('Tech Stocks Portfolio');
    
    const portfolioDescInput = page.getByLabel(/description/i);
    await portfolioDescInput.fill('Technology stocks focused portfolio');

    // Submit portfolio creation
    const submitPortfolioButton = page.getByRole('button', { name: /create/i });
    await submitPortfolioButton.click();

    // Step 9: Verify portfolio created
    await expect(page.getByText(/tech stocks portfolio/i)).toBeVisible({ timeout: 5000 });

    // Step 10: Add holdings to portfolio
    const addHoldingButton = page.getByRole('button', { name: /add holding/i }).first();
    await addHoldingButton.click();

    // Fill holding form
    await page.getByLabel(/symbol/i).fill('AAPL');
    await page.getByLabel(/quantity/i).fill('10');
    
    const saveHoldingButton = page.getByRole('button', { name: /add/i });
    await saveHoldingButton.click();

    // Verify holding added
    await expect(page.getByText(/AAPL/)).toBeVisible({ timeout: 5000 });

    // Step 11: Generate investment plan
    const generatePlanButton = page.getByRole('button', { name: /generate.*plan/i });
    await generatePlanButton.click();

    // Mock OpenAI API for plan generation
    await page.route('**/api/portfolios/**/generate-plan', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          plan: {
            explanation: 'Based on your moderate risk tolerance and current holdings, here is your investment plan.',
            allocations: [
              { symbol: 'AAPL', percentage: 40, amount: 800 },
              { symbol: 'MSFT', percentage: 30, amount: 600 },
              { symbol: 'GOOGL', percentage: 30, amount: 600 },
            ],
            trades: [
              { action: 'BUY', symbol: 'MSFT', quantity: 5, price: 120 },
              { action: 'BUY', symbol: 'GOOGL', quantity: 4, price: 150 },
            ],
            riskConsiderations: [
              'Consider diversifying into bonds',
              'Monitor tech sector volatility',
            ],
          },
        }),
      });
    });

    // Wait for plan generation (mocked, so should be fast)
    await expect(page.getByText(/investment plan/i)).toBeVisible({ timeout: 15000 });
    
    // Verify plan details
    await expect(page.getByText(/based on your.*risk tolerance/i)).toBeVisible();
    await expect(page.getByText(/MSFT/)).toBeVisible();

    // Step 12: Logout
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await logoutButton.click();

    // Verify redirect to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should prevent unauthenticated access to protected routes', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    const loginButton = page.getByRole('button', { name: /sign in/i });
    await loginButton.click();
    
    // Should show error message
    await expect(page.getByText(/invalid credentials|error/i)).toBeVisible({ timeout: 5000 });
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Mock network failure
    await context.route('**/api/auth/login', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/login');
    
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    const loginButton = page.getByRole('button', { name: /sign in/i });
    await loginButton.click();
    
    // Should show error
    await expect(page.getByText(/error|failed/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Portfolio Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login with existing user (assumes backend has test seed data)
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('Test123!@#');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should filter portfolios by type', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Wait for portfolios to load
    await expect(page.getByText(/all portfolios/i)).toBeVisible();
    
    // Click filter
    const stocksFilter = page.getByRole('button', { name: /stocks/i });
    await stocksFilter.click();
    
    // Verify filter applied (portfolios should update)
    await page.waitForTimeout(1000);
  });

  test('should update portfolio holdings', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Click on first portfolio
    const portfolioCard = page.locator('[data-testid="portfolio-card"]').first();
    await portfolioCard.click();
    
    // Edit holding
    const editButton = page.getByRole('button', { name: /edit/i }).first();
    await editButton.click();
    
    // Update quantity
    const quantityInput = page.getByLabel(/quantity/i);
    await quantityInput.clear();
    await quantityInput.fill('20');
    
    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();
    
    // Verify update
    await expect(page.getByText(/20/)).toBeVisible({ timeout: 5000 });
  });

  test('should delete portfolio', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Get portfolio name to verify deletion
    const firstPortfolioName = await page.locator('[data-testid="portfolio-name"]').first().textContent();
    
    // Click delete
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    await deleteButton.click();
    
    // Confirm deletion
    const confirmButton = page.getByRole('button', { name: /confirm/i });
    await confirmButton.click();
    
    // Verify portfolio removed
    await expect(page.getByText(firstPortfolioName)).not.toBeVisible({ timeout: 5000 });
  });
});
