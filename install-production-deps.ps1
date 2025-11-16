# Install Production Dependencies
# Run this script to install all new monitoring and deployment dependencies

Write-Host "=== Installing Production Dependencies ===" -ForegroundColor Cyan
Write-Host ""

# Backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend

Write-Host "  - @sentry/node (Error tracking)" -ForegroundColor White
Write-Host "  - winston (Logging)" -ForegroundColor White

npm install @sentry/node@^7.91.0 winston@^3.11.0

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Backend dependency installation failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""

# Frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend

Write-Host "  - @sentry/react (Error tracking + Session Replay)" -ForegroundColor White

npm install @sentry/react@^7.91.0

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend dependency installation failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""

# Summary
Write-Host "=== Installation Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "New features added:" -ForegroundColor White
Write-Host "  ✓ Error tracking with Sentry" -ForegroundColor Green
Write-Host "  ✓ Structured logging with Winston" -ForegroundColor Green
Write-Host "  ✓ Health check endpoints" -ForegroundColor Green
Write-Host "  ✓ Application metrics tracking" -ForegroundColor Green
Write-Host "  ✓ Session replay (frontend)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Set up Sentry account (see SENTRY_SETUP.md)" -ForegroundColor White
Write-Host "  2. Add SENTRY_DSN_BACKEND to .env" -ForegroundColor White
Write-Host "  3. Add VITE_SENTRY_DSN to frontend .env" -ForegroundColor White
Write-Host "  4. Test locally: npm run dev (in both backend and frontend)" -ForegroundColor White
Write-Host "  5. Deploy to production (see DEPLOYMENT_GUIDE.md)" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - DEPLOYMENT_GUIDE.md - Complete deployment instructions" -ForegroundColor White
Write-Host "  - SENTRY_SETUP.md - Sentry integration guide" -ForegroundColor White
Write-Host "  - PRODUCTION_SETUP_SUMMARY.md - Overview of all changes" -ForegroundColor White
Write-Host ""
