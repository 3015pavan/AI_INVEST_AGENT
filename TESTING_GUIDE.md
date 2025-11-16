# InvestAgent Testing Guide

This document provides comprehensive information about the testing infrastructure for InvestAgent.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [E2E Testing](#e2e-testing)
- [CI/CD Integration](#cicd-integration)
- [Coverage Reports](#coverage-reports)
- [Writing Tests](#writing-tests)

## Overview

InvestAgent uses a comprehensive testing strategy with three layers:

1. **Backend Unit/Integration Tests**: Test API endpoints, services, and business logic
2. **Frontend Component Tests**: Test React components in isolation
3. **E2E Tests**: Test complete user journeys across the full stack

All tests are designed to be **deterministic** and **fast** by mocking external dependencies.

## Testing Stack

### Backend
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory MongoDB for fast, isolated tests
- **Mocks**: OpenAI, Pinecone, Market APIs, Plaid, Google OAuth

### Frontend
- **Jest**: Test runner
- **React Testing Library**: Component testing utilities
- **jsdom**: Browser environment simulation
- **User Event**: Simulate user interactions

### E2E
- **Playwright**: Cross-browser automation
- **Multi-browser**: Chrome, Firefox, Safari, Mobile

## Setup

### Install All Dependencies

```powershell
# From project root
npm run install:all

# Install Playwright browsers (for E2E tests)
npm run install:playwright
```

### Individual Setup

```powershell
# Backend only
cd backend
npm install

# Frontend only
cd frontend
npm install

# E2E only (from root)
npm install
npx playwright install --with-deps
```

## Running Tests

### Quick Commands

```powershell
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run E2E tests
npm run e2e

# Run E2E tests in headed mode (see browser)
npm run e2e:headed

# Run E2E tests with UI mode (interactive)
npm run e2e:ui
```

### Watch Mode (Development)

```powershell
# Backend watch mode
cd backend
npm run test:watch

# Frontend watch mode
cd frontend
npm run test:watch
```

### Coverage Reports

```powershell
# Generate coverage for all tests
npm run test:coverage

# Backend coverage only
cd backend
npm run test:coverage

# Frontend coverage only
cd frontend
npm run test:coverage
```

### CI Mode

```powershell
# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

## Backend Testing

### Location
`backend/src/__tests__/`

### Test Files
- `setup.js` - MongoDB Memory Server configuration
- `auth.controller.test.js` - Authentication endpoints
- `portfolio.controller.test.js` - Portfolio CRUD operations
- `mocks/index.js` - Mock implementations for external services

### Configuration
`backend/jest.config.js`

### Running Backend Tests

```powershell
cd backend

# Run all tests
npm test

# Run specific test file
npm test auth.controller.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should register"

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Coverage Thresholds
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Key Features
- **In-Memory MongoDB**: Tests use MongoDB Memory Server for fast, isolated database operations
- **Mocked External APIs**: OpenAI, Pinecone, Market APIs are all mocked for deterministic tests
- **Authentication Helpers**: `createAuthUser()` utility for generating test JWT tokens
- **Automatic Cleanup**: Database cleared after each test

### Example Test

```javascript
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

## Frontend Testing

### Location
`frontend/src/__tests__/`

### Test Files
- `setupTests.js` - Testing Library configuration
- `LoginPage.test.jsx` - Login/Register component tests
- `ModernDashboard.test.jsx` - Dashboard component tests
- `__mocks__/fileMock.js` - Static asset mocks

### Configuration
`frontend/jest.config.js`

### Running Frontend Tests

```powershell
cd frontend

# Run all tests
npm test

# Run specific test file
npm test LoginPage.test.jsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Coverage Thresholds
- Branches: 60%
- Functions: 60%
- Lines: 60%
- Statements: 60%

### Key Features
- **React Testing Library**: User-centric testing approach
- **Redux Integration**: Tests include full Redux store setup
- **Mocked APIs**: All API calls are mocked for deterministic tests
- **Browser APIs**: window.matchMedia, localStorage, fetch all mocked
- **User Interactions**: Simulate real user behavior with userEvent

### Example Test

```javascript
describe('LoginPage', () => {
  it('should login successfully with valid credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      token: 'mock-token',
      user: { email: 'test@example.com' },
    });
    authAPI.login = mockLogin;

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

## E2E Testing

### Location
`e2e/`

### Test Files
- `user-journey.spec.js` - Complete user flow tests

### Configuration
`playwright.config.js`

### Running E2E Tests

```powershell
# From project root

# Run all E2E tests (headless)
npm run e2e

# Run with visible browser
npm run e2e:headed

# Run with interactive UI
npm run e2e:ui

# Run specific test file
npx playwright test e2e/user-journey.spec.js

# Run specific browser
npx playwright test --project=chromium

# View test report
npm run e2e:report
```

### Key Features
- **Multi-Browser**: Tests run on Chrome, Firefox, Safari
- **Mobile Testing**: Includes mobile viewport tests
- **Network Mocking**: External APIs mocked at network level
- **Auto-Start Servers**: Both backend and frontend start automatically
- **Screenshots/Videos**: Captured on failure for debugging
- **Parallel Execution**: Tests run in parallel for speed

### Test Flow

The E2E tests simulate this complete user journey:

1. Navigate to homepage
2. Click "Get Started"
3. Register new account
4. Verify redirect to dashboard
5. View portfolio page
6. Create new portfolio
7. Add holdings
8. Generate investment plan
9. Verify plan displayed
10. Logout

### Example E2E Test

```javascript
test('should complete full user journey', async ({ page }) => {
  // Navigate to homepage
  await page.goto('/');
  
  // Register
  await page.getByRole('button', { name: /get started/i }).click();
  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('Test123!@#');
  await page.getByRole('button', { name: /sign up/i }).click();
  
  // Verify dashboard
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(/investment dashboard/i)).toBeVisible();
});
```

## CI/CD Integration

### GitHub Actions

The project includes a comprehensive CI/CD workflow (`.github/workflows/test.yml`) that:

1. **Backend Tests**
   - Runs on Node 18.x and 20.x
   - Uses in-memory MongoDB
   - Generates coverage reports
   - Uploads to Codecov

2. **Frontend Tests**
   - Runs on Node 18.x and 20.x
   - Generates coverage reports
   - Uploads to Codecov

3. **E2E Tests**
   - Runs after backend and frontend tests pass
   - Uses real MongoDB service
   - Tests on all configured browsers
   - Uploads Playwright reports as artifacts

4. **Build Check**
   - Verifies frontend builds successfully
   - Uploads build artifacts

### Running Locally Like CI

```powershell
# Run tests exactly as CI does
npm run test:ci

# Run E2E with CI flag
$env:CI="true"; npm run e2e
```

## Coverage Reports

### Viewing Coverage

After running tests with coverage:

```powershell
# Backend coverage (open in browser)
start backend/coverage/lcov-report/index.html

# Frontend coverage (open in browser)
start frontend/coverage/lcov-report/index.html
```

### Coverage Thresholds

**Backend**: 70% minimum
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**Frontend**: 60% minimum
- Branches: 60%
- Functions: 60%
- Lines: 60%
- Statements: 60%

Tests will fail if coverage drops below these thresholds.

## Writing Tests

### Backend Test Template

```javascript
import request from 'supertest';
import express from 'express';

describe('Feature Name', () => {
  let app;

  beforeEach(() => {
    app = express();
    // Setup routes
  });

  it('should do something', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('field');
  });
});
```

### Frontend Test Template

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Component from '../Component';
import { store } from '../store/store';

describe('Component', () => {
  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Component />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render correctly', () => {
    renderComponent();
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    renderComponent();
    
    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Test Template

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('should complete user flow', async ({ page }) => {
    // Navigate
    await page.goto('/');
    
    // Interact
    await page.getByRole('button', { name: /submit/i }).click();
    
    // Assert
    await expect(page).toHaveURL(/\/success/);
    await expect(page.getByText(/complete/i)).toBeVisible();
  });
});
```

## Best Practices

### General
- ✅ Keep tests deterministic (no random data, fixed dates)
- ✅ Mock external dependencies (APIs, databases)
- ✅ Test user behavior, not implementation details
- ✅ Use descriptive test names
- ✅ One assertion per test when possible
- ✅ Clean up after tests (automatic in our setup)

### Backend
- ✅ Use MongoDB Memory Server for database tests
- ✅ Mock external APIs (OpenAI, Pinecone, etc.)
- ✅ Test both success and error cases
- ✅ Verify authentication and authorization
- ✅ Test input validation

### Frontend
- ✅ Use React Testing Library queries (getByRole, getByText)
- ✅ Test from user's perspective
- ✅ Wait for async operations with waitFor
- ✅ Use userEvent for interactions
- ✅ Mock API calls

### E2E
- ✅ Test critical user journeys
- ✅ Keep tests independent
- ✅ Use page object model for complex tests
- ✅ Mock external APIs at network level
- ✅ Take screenshots on failure (automatic)

## Troubleshooting

### Common Issues

**Tests failing locally but passing in CI**
- Check Node version matches CI (18.x or 20.x)
- Clear node_modules and reinstall
- Check environment variables

**MongoDB Memory Server issues**
- Increase timeout in jest.config.js
- Check available disk space
- Try manual cleanup: `rm -rf ~/.mongodb-binaries`

**Playwright browser issues**
- Reinstall browsers: `npx playwright install --with-deps`
- Check system dependencies on Linux

**Jest not finding modules**
- Check moduleNameMapper in jest.config.js
- Verify file extensions in testMatch pattern

**Coverage not meeting thresholds**
- Run `npm run test:coverage` to see detailed report
- Check which files are excluded in collectCoverageFrom

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest](https://github.com/ladjs/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

## Support

For issues or questions about testing:
1. Check this guide
2. Review existing tests for examples
3. Check CI logs for detailed error messages
4. Review test output and coverage reports
