# API Testing Guide for InvestAgent

## Authentication Endpoints

### 1. Register New User
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**PowerShell Test:**
```powershell
$body = @{
    email='user@example.com'
    password='password123'
    firstName='John'
    lastName='Doe'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' -Method Post -Body $body -ContentType 'application/json'
```

**Expected Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "riskProfile": "moderate"
    },
    "token": "jwt_token_here"
  }
}
```

**Possible Errors:**
- 400: Missing required fields
- 409: User already exists
- 400: Password too short (< 6 characters)

---

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**PowerShell Test:**
```powershell
$body = @{
    email='user@example.com'
    password='password123'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
```

**Expected Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "riskProfile": "moderate"
    },
    "token": "jwt_token_here"
  }
}
```

**Possible Errors:**
- 400: Missing email or password
- 401: Invalid credentials

---

### 3. Google OAuth
**Endpoint:** `POST /api/auth/google`

**Request Body:**
```json
{
  "idToken": "google_id_token_from_google_signin"
}
```

**PowerShell Test:**
```powershell
$body = @{
    idToken='actual_google_id_token_here'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/google' -Method Post -Body $body -ContentType 'application/json'
```

**Expected Success Response (200):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@gmail.com",
      "firstName": "John",
      "lastName": "Doe",
      "riskProfile": "moderate",
      "picture": "https://profile.picture.url"
    },
    "token": "jwt_token_here"
  }
}
```

**Possible Errors:**
- 400: Missing idToken
- 401: Invalid Google token
- 500: GOOGLE_CLIENT_ID not configured

---

### 4. Get Current User
**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**PowerShell Test:**
```powershell
$token = "your_jwt_token_here"
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/me' -Method Get -Headers $headers
```

**Expected Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "riskProfile": "moderate"
    }
  }
}
```

**Possible Errors:**
- 401: No token provided or invalid token
- 404: User not found

---

## Portfolio Endpoints (All require authentication)

### 5. Get All Portfolios
**Endpoint:** `GET /api/portfolios`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**PowerShell Test:**
```powershell
$token = "your_jwt_token_here"
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri 'http://localhost:5000/api/portfolios' -Method Get -Headers $headers
```

**Expected Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "portfolio_id",
      "name": "My Portfolio",
      "description": "Tech stocks",
      "holdings": [],
      "totalValue": 0,
      "performance": {
        "totalGain": 0,
        "totalGainPercent": 0
      }
    }
  ]
}
```

---

### 6. Create Portfolio
**Endpoint:** `POST /api/portfolios`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "My Tech Portfolio",
  "description": "Technology sector investments",
  "holdings": [],
  "goals": []
}
```

**PowerShell Test:**
```powershell
$token = "your_jwt_token_here"
$headers = @{
    Authorization = "Bearer $token"
}
$body = @{
    name='My Tech Portfolio'
    description='Technology sector investments'
    holdings=@()
    goals=@()
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/portfolios' -Method Post -Headers $headers -Body $body -ContentType 'application/json'
```

**Expected Success Response (201):**
```json
{
  "success": true,
  "message": "Portfolio created successfully",
  "data": {
    "_id": "new_portfolio_id",
    "name": "My Tech Portfolio",
    "userId": "user_id",
    "holdings": [],
    "totalValue": 0
  }
}
```

---

## Complete Testing Workflow

### Step 1: Register a New User
```powershell
$body = @{
    email='demo@investagent.com'
    password='demo123456'
    firstName='Demo'
    lastName='User'
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' -Method Post -Body $body -ContentType 'application/json'
$token = $registerResponse.data.token
Write-Host "Token: $token"
```

### Step 2: Login with Existing User
```powershell
$body = @{
    email='demo@investagent.com'
    password='demo123456'
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
$token = $loginResponse.data.token
Write-Host "Token: $token"
```

### Step 3: Get Current User Info
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/me' -Method Get -Headers $headers
```

### Step 4: Create a Portfolio
```powershell
$headers = @{
    Authorization = "Bearer $token"
}
$body = @{
    name='Demo Portfolio'
    description='My first portfolio'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/portfolios' -Method Post -Headers $headers -Body $body -ContentType 'application/json'
```

### Step 5: Get All Portfolios
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri 'http://localhost:5000/api/portfolios' -Method Get -Headers $headers
```

---

## Common Issues & Solutions

### Issue 1: "Route not found"
**Solution:** Check the URL path. Ensure you're using:
- `/api/auth/register` (not `/auth/register`)
- `/api/auth/login` (not `/auth/login`)
- `/api/portfolios` (not `/portfolios`)

### Issue 2: "Authentication failed" on register
**Possible causes:**
1. Missing required fields (email, password, firstName, lastName)
2. Password too short (must be at least 6 characters)
3. User already exists with that email

**Check backend logs for details**

### Issue 3: 401 Unauthorized on portfolio endpoints
**Solution:** Make sure you're including the Authorization header with a valid JWT token

### Issue 4: Google OAuth "Route not found"
**Problem:** Frontend is trying GET `/api/auth/google` but backend only supports POST
**Solution:** Use the Google Identity Services library in frontend (already implemented)

---

## Environment Variables Required

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Testing with Postman

1. Import the collection: `backend/InvestAgent_API.postman_collection.json`
2. Set environment variable `baseUrl` to `http://localhost:5000/api`
3. After login/register, the token will be automatically saved
4. All subsequent requests will use the saved token

---

## Quick Health Check

Test if the API is running:
```powershell
Invoke-RestMethod -Uri 'http://localhost:5000/api/health' -Method Get
```

Expected response:
```json
{
  "status": "ok",
  "message": "InvestAgent API is running"
}
```
