# API Testing Guide - Using curl/URL

## Prerequisites
- Backend server running on `http://localhost:5000`
- Terminal/Command Prompt open

## Step 1: Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"testpass123\",\"firstName\":\"Test\",\"lastName\":\"User\"}"
```

**Copy the `token` from the response!** You'll need it for authenticated requests.

---

## Step 2: Login (Alternative to Register)

```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"testpass123\"}"
```

**Copy the `token` from the response!**

---

## Step 3: Test Portfolio Endpoints

Replace `YOUR_TOKEN_HERE` with the actual token from Step 1 or 2.

### Create a Portfolio

```bash
curl -X POST http://localhost:5000/api/portfolios ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"name\":\"My Investment Portfolio\",\"description\":\"Test portfolio\",\"holdings\":[{\"symbol\":\"AAPL\",\"assetType\":\"stock\",\"quantity\":10,\"averagePrice\":150.00}],\"goals\":[{\"name\":\"Retirement\",\"targetAmount\":1000000,\"currentAmount\":50000,\"priority\":\"high\"}]}"
```

**Copy the portfolio `id` from the response!**

### Get All Portfolios

```bash
curl -X GET http://localhost:5000/api/portfolios ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Single Portfolio

Replace `PORTFOLIO_ID` with the actual portfolio ID from create response.

```bash
curl -X GET http://localhost:5000/api/portfolios/PORTFOLIO_ID ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Portfolio

```bash
curl -X PUT http://localhost:5000/api/portfolios/PORTFOLIO_ID ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"name\":\"Updated Portfolio Name\",\"description\":\"Updated description\"}"
```

### Sync Market Data

```bash
curl -X POST http://localhost:5000/api/portfolios/PORTFOLIO_ID/sync ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Generate Investment Plan

Replace `GOAL_ID` with the actual goal ID from the portfolio.

```bash
curl -X POST http://localhost:5000/api/portfolios/PORTFOLIO_ID/generate-plan ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"goalId\":\"GOAL_ID\"}"
```

### Delete Portfolio

```bash
curl -X DELETE http://localhost:5000/api/portfolios/PORTFOLIO_ID ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Quick Test Script (PowerShell)

Save this as `test-api.ps1` and run it:

```powershell
# Step 1: Register
$registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"testpass123","firstName":"Test","lastName":"User"}'

$token = $registerResponse.data.token
Write-Host "Token: $token" -ForegroundColor Green

# Step 2: Create Portfolio
$portfolioBody = @{
  name = "My Investment Portfolio"
  description = "Test portfolio"
  holdings = @(
    @{
      symbol = "AAPL"
      assetType = "stock"
      quantity = 10
      averagePrice = 150.00
    }
  )
  goals = @(
    @{
      name = "Retirement"
      targetAmount = 1000000
      currentAmount = 50000
      priority = "high"
    }
  )
} | ConvertTo-Json -Depth 10

$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

$portfolioResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/portfolios" `
  -Method POST `
  -Headers $headers `
  -Body $portfolioBody

$portfolioId = $portfolioResponse.data._id
Write-Host "Portfolio ID: $portfolioId" -ForegroundColor Green

# Step 3: Get All Portfolios
$portfolios = Invoke-RestMethod -Uri "http://localhost:5000/api/portfolios" `
  -Method GET `
  -Headers $headers

Write-Host "Portfolios: $($portfolios.count)" -ForegroundColor Green
```

---

## Browser Testing (Limited)

You can test GET endpoints in browser, but you'll need to add the token:

1. **Health Check** (No auth needed):
   ```
   http://localhost:5000/api/health
   ```

2. **Get Portfolios** (Requires token in header - use browser extension):
   - Install "ModHeader" or similar browser extension
   - Add header: `Authorization: Bearer YOUR_TOKEN_HERE`
   - Visit: `http://localhost:5000/api/portfolios`

---

## Expected Responses

### Success Response Format:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Error Response Format:
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Troubleshooting

- **401 Unauthorized**: Check if token is correct and includes "Bearer " prefix
- **404 Not Found**: Check if portfolio ID is correct
- **500 Server Error**: Check server logs in terminal
- **Connection Refused**: Make sure backend server is running

