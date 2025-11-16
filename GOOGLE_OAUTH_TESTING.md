# Google OAuth Setup & Testing Guide

## Current Status
✅ Backend configured with Google Client ID
✅ Frontend configured with Google Client ID  
✅ Google Identity Services script loaded
✅ Backend endpoint `/api/auth/google` working

## How Google OAuth Works

1. User clicks "Continue with Google" button
2. Google Identity Services shows login dialog
3. User authenticates with Google
4. Google returns a signed JWT token (credential)
5. Frontend sends this token to backend `/api/auth/google`
6. Backend verifies token with Google servers
7. Backend creates/finds user and returns JWT token
8. User is logged in

## Testing Google OAuth

### Prerequisites
Your Google Client ID must be properly configured in Google Cloud Console with:
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000`

### Test in Browser

1. Open: `http://localhost:3000/login`
2. Open Browser Console (F12)
3. Click "Continue with Google"
4. Watch console for detailed logs:
   - Google library initialization
   - Google response with credential
   - Backend API call
   - Success/error messages

### Expected Console Output (Success):
```
Google response received: {credential: "eyJhbGc..."}
Sending credential to backend...
Backend response: {success: true, message: "Google authentication successful", ...}
```

### Expected Console Output (Error - Not Configured):
```
Missing VITE_GOOGLE_CLIENT_ID in .env file
Error: Google OAuth is not configured
```

### Common Issues & Solutions

#### Issue 1: "Google Sign-In library not loaded"
**Cause:** Script not loaded yet or blocked
**Solution:** 
- Refresh the page
- Check browser console for script loading errors
- Verify `index.html` has the Google script tag

#### Issue 2: "Invalid Google ID token"
**Cause:** 
- Token expired (tokens expire after a few minutes)
- Wrong Google Client ID in backend vs frontend
- Client ID not authorized for this domain

**Solution:**
- Make sure GOOGLE_CLIENT_ID in backend `.env` matches VITE_GOOGLE_CLIENT_ID in frontend `.env`
- Verify your domain is authorized in Google Cloud Console
- Try logging in again (don't reuse old tokens)

#### Issue 3: Google popup blocked
**Cause:** Browser blocking popups
**Solution:** Allow popups for localhost:3000

#### Issue 4: "Google OAuth is not configured"
**Cause:** Missing VITE_GOOGLE_CLIENT_ID in frontend `.env`
**Solution:** 
```bash
# Add to frontend/.env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```
Then restart frontend: `npm run dev`

## Verify Configuration

### Check Frontend Environment
```powershell
# In frontend directory
Get-Content .env
```

Should show:
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=979018169574-2jspfqkafrtronvsksnql7chhjhrdrv8.apps.googleusercontent.com
```

### Check Backend Environment
```powershell
# In backend directory
Get-Content .env | Select-String "GOOGLE_CLIENT_ID"
```

Should show:
```
GOOGLE_CLIENT_ID=979018169574-2jspfqkafrtronvsksnql7chhjhrdrv8.apps.googleusercontent.com
```

**Important:** The Client IDs must match!

## Manual Testing with PowerShell

You cannot manually test Google OAuth with PowerShell because you need a valid Google ID token, which can only be obtained through the Google Sign-In flow in a browser.

However, you can test the endpoint responds:

```powershell
# This will fail with "Invalid Google ID token" - which is expected!
$body = @{idToken='test_token'} | ConvertTo-Json
try {
    Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/google' -Method Post -Body $body -ContentType 'application/json'
} catch {
    Write-Host "Response: $($_.ErrorDetails.Message)"
}
```

Expected output: `{"success":false,"message":"Invalid Google ID token"}`

This confirms the endpoint is working and waiting for a real Google token.

## Testing with Real Google Account

1. Visit `http://localhost:3000/login`
2. Click "Continue with Google"
3. Select your Google account
4. Grant permissions
5. You should be redirected to `/dashboard`

**Check browser console for detailed logs!**

## Troubleshooting Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Backend `.env` has GOOGLE_CLIENT_ID
- [ ] Frontend `.env` has VITE_GOOGLE_CLIENT_ID
- [ ] Both Client IDs match
- [ ] Google script loaded in browser (check Network tab)
- [ ] No console errors about missing google object
- [ ] Browser allows popups from localhost

## Google Cloud Console Configuration

Your Client ID: `979018169574-2jspfqkafrtronvsksnql7chhjhrdrv8.apps.googleusercontent.com`

Make sure in Google Cloud Console you have:

1. **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `http://localhost:5000` (optional)

2. **Authorized redirect URIs:**
   - `http://localhost:3000`
   - `http://localhost:3000/login`

If you need to update these, visit:
https://console.cloud.google.com/apis/credentials

Changes may take a few minutes to propagate.

## Debug Mode

The LoginPage now has extensive console.log statements:
- "Submitting auth request" - form submission
- "Google response received" - Google returned credential
- "Sending credential to backend" - calling API
- "Backend response" - server response
- All errors are logged with full details

**Always check the browser console (F12) when testing!**
