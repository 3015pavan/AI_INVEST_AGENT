# Google OAuth Setup Guide

## Implementation Complete ✅

The Google OAuth authentication is now fully implemented with JWT token generation.

## How It Works

1. **Frontend** sends Google ID token to `POST /api/auth/google`
2. **Backend** verifies the token with Google's API
3. **Backend** extracts user info (email, name, etc.)
4. **Backend** finds or creates user in database
5. **Backend** generates JWT token
6. **Backend** returns user data and JWT token

## Setup Steps

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** or **Google Identity Services**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain
7. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production callback URL
8. Copy the **Client ID**

### 2. Update Environment Variables

Add to your `backend/.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

The `google-auth-library` package is already added to `package.json`.

## API Usage

### Endpoint: `POST /api/auth/google`

**Request Body:**
```json
{
  "idToken": "google_id_token_from_frontend"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "riskProfile": "moderate",
      "picture": "https://..."
    },
    "token": "jwt_access_token"
  }
}
```

**Error Responses:**
- `400` - Missing idToken or email not verified
- `401` - Invalid Google ID token
- `500` - Server error or Google OAuth not configured

## Frontend Integration Example

```javascript
// After user signs in with Google on frontend
const idToken = googleUser.getAuthResponse().id_token;

// Send to backend
const response = await fetch('http://localhost:5000/api/auth/google', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ idToken }),
});

const data = await response.json();

if (data.success) {
  // Store JWT token
  localStorage.setItem('token', data.data.token);
  // Use token for authenticated requests
}
```

## Security Features

✅ **Token Verification**: Google ID token is verified with Google's servers  
✅ **Email Verification**: Only verified Google emails are accepted  
✅ **JWT Generation**: Secure JWT tokens with expiration  
✅ **User Creation**: Automatically creates user if doesn't exist  
✅ **Existing Users**: Logs in existing users by email  

## Notes

- Users created via Google OAuth don't have passwords
- Existing email/password users can also use Google OAuth (same email)
- The `authProvider` field tracks authentication method (local/google)
- Password field is optional for OAuth users

