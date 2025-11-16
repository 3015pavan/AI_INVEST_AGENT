# Postman Testing Guide

## Quick Start

1. **Import Collection**: Import `InvestAgent_API.postman_collection.json` into Postman
2. **Set Environment** (Optional): Create a new environment with variable `auth_token` to auto-save tokens
3. **Start Testing**: Run requests in order

## Testing Steps

### 1. Health Check ✅
**Request:**
- Method: `GET`
- URL: `http://localhost:5000/api/health`

**Expected Response (200):**
```json
{
  "status": "ok",
  "message": "InvestAgent API is running"
}
```

---

### 2. Register a New User ✅
**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "testpassword123",
  "firstName": "Test",
  "lastName": "User",
  "riskProfile": "moderate"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "riskProfile": "moderate"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ Important**: Copy the `token` from the response - you'll need it for authenticated requests!

**Test Error Cases:**
- Try registering with the same email again → Should get 409 (Conflict)
- Try without required fields → Should get 400 (Bad Request)
- Try with password < 6 characters → Should get 400

---

### 3. Login User ✅
**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "testpassword123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "riskProfile": "moderate"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Test Error Cases:**
- Wrong password → Should get 401 (Unauthorized)
- Wrong email → Should get 401 (Unauthorized)
- Missing fields → Should get 400 (Bad Request)

---

### 4. Get Current User (Protected Route) ✅
**Request:**
- Method: `GET`
- URL: `http://localhost:5000/api/auth/me`
- Headers: 
  - `Authorization: Bearer YOUR_TOKEN_HERE`
  - Replace `YOUR_TOKEN_HERE` with the token from login/register

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "riskProfile": "moderate"
    }
  }
}
```

**Test Error Cases:**
- No Authorization header → Should get 401 (Unauthorized)
- Invalid token → Should get 401 (Unauthorized)
- Expired token → Should get 401 (Unauthorized)

---

### 5. Google OAuth (Optional) ⚠️
**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/google`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "idToken": "google_id_token_from_frontend"
}
```

**Note**: This requires a valid Google ID token from your frontend. Without `GOOGLE_CLIENT_ID` in `.env`, you'll get a 500 error.

---

## Postman Tips

### Auto-Save Token
1. Create a Postman Environment
2. Add variable: `auth_token`
3. In the collection, the Register/Login requests automatically save the token
4. Use `{{auth_token}}` in Authorization header for protected routes

### Environment Variables
Create these variables in Postman:
- `base_url`: `http://localhost:5000`
- `auth_token`: (auto-populated after login/register)

### Testing Workflow
1. ✅ Health Check → Verify server is running
2. ✅ Register → Create a new user
3. ✅ Login → Get a fresh token
4. ✅ Get Me → Test protected route with token
5. ⚠️ Google OAuth → Test if you have Google setup

---

## Common Issues

### 401 Unauthorized
- Check if token is copied correctly
- Make sure "Bearer " prefix is included: `Bearer YOUR_TOKEN`
- Token might be expired (default: 7 days)

### 500 Server Error
- Check MongoDB connection
- Check if JWT_SECRET is set in `.env`
- Check server logs in terminal

### 400 Bad Request
- Verify JSON format is correct
- Check all required fields are present
- Validate email format

---

## Success Checklist

- [ ] Health check returns 200
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] Can access protected route with token
- [ ] Invalid token returns 401
- [ ] Duplicate email returns 409
- [ ] Missing fields return 400

