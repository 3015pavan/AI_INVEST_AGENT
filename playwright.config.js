import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * Simulates complete user journeys: register → login → portfolio → plan
 */
export default defineConfig({
  testDir: './e2e',
  
  // Maximum time one test can run
  timeout: 60 * 1000,
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Reporter to use
  reporter: process.env.CI 
    ? [['html'], ['junit', { outputFile: 'test-results/junit.xml' }], ['github']]
    : [['html'], ['list']],
  
  // Shared settings for all the projects below
  use: {
    // Base URL for frontend
    baseURL: 'http://localhost:3002',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 10 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: [
    {
      command: 'cd backend && npm start',
      url: 'http://localhost:5000',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'test',
        JWT_SECRET: 'test-jwt-secret',
        MONGODB_URI: 'mongodb://localhost:27017/investagent-e2e',
        PORT: '5000',
      },
    },
    {
      command: 'cd frontend && npm run dev',
      url: 'http://localhost:3002',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
