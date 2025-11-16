# Quick Test Setup Script for InvestAgent
# Run this script to set up and verify the testing environment

Write-Host "=== InvestAgent Testing Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

if ($nodeVersion -notmatch "v(18|20)") {
    Write-Host "WARNING: Node.js 18.x or 20.x is recommended for compatibility with CI" -ForegroundColor Red
}
Write-Host ""

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "Root dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "Backend dependencies installed successfully" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "Frontend dependencies installed successfully" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Install Playwright browsers
Write-Host "Installing Playwright browsers (this may take a few minutes)..." -ForegroundColor Yellow
npx playwright install --with-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Playwright browser installation failed. You can retry with: npx playwright install --with-deps" -ForegroundColor Red
} else {
    Write-Host "Playwright browsers installed successfully" -ForegroundColor Green
}
Write-Host ""

# Verify backend tests
Write-Host "Running backend tests..." -ForegroundColor Yellow
Set-Location backend
npm test -- --passWithNoTests
$backendTestResult = $LASTEXITCODE
Set-Location ..

if ($backendTestResult -eq 0) {
    Write-Host "Backend tests passed!" -ForegroundColor Green
} else {
    Write-Host "Backend tests failed!" -ForegroundColor Red
}
Write-Host ""

# Verify frontend tests
Write-Host "Running frontend tests..." -ForegroundColor Yellow
Set-Location frontend
npm test -- --passWithNoTests
$frontendTestResult = $LASTEXITCODE
Set-Location ..

if ($frontendTestResult -eq 0) {
    Write-Host "Frontend tests passed!" -ForegroundColor Green
} else {
    Write-Host "Frontend tests failed!" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=== Setup Summary ===" -ForegroundColor Cyan
Write-Host "Node.js: $nodeVersion" -ForegroundColor White
Write-Host "Root dependencies: Installed" -ForegroundColor Green
Write-Host "Backend dependencies: Installed" -ForegroundColor Green
Write-Host "Frontend dependencies: Installed" -ForegroundColor Green

if ($backendTestResult -eq 0 -and $frontendTestResult -eq 0) {
    Write-Host "All tests: PASSING" -ForegroundColor Green
    Write-Host ""
    Write-Host "Setup complete! You can now run:" -ForegroundColor Cyan
    Write-Host "  npm test              - Run all tests" -ForegroundColor White
    Write-Host "  npm run test:coverage - Run with coverage" -ForegroundColor White
    Write-Host "  npm run e2e           - Run E2E tests" -ForegroundColor White
    Write-Host "  npm run e2e:ui        - Run E2E with UI" -ForegroundColor White
    Write-Host ""
    Write-Host "For detailed testing guide, see: TESTING_GUIDE.md" -ForegroundColor Cyan
} else {
    Write-Host "Some tests: FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the error messages above." -ForegroundColor Yellow
    Write-Host "You can manually run tests with:" -ForegroundColor Yellow
    Write-Host "  cd backend && npm test" -ForegroundColor White
    Write-Host "  cd frontend && npm test" -ForegroundColor White
}
Write-Host ""
