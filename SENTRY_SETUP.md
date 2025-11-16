# Sentry Setup Guide for InvestAgent

## Overview
This guide will help you set up Sentry for error tracking and performance monitoring in both backend (Node.js) and frontend (React) applications.

---

## Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with GitHub (recommended) or email
4. Complete the onboarding wizard

---

## Step 2: Create Backend Project (Node.js)

### Create Project

1. In Sentry Dashboard, click **"Projects"** in the left sidebar
2. Click **"Create Project"**
3. Select **"Node.js"** as platform
4. Name: `investagent-backend`
5. Alert frequency: **"Alert me on every new issue"** (recommended for production)
6. Click **"Create Project"**

### Get Backend DSN

1. After project creation, you'll see the **DSN (Data Source Name)**
2. Copy the DSN - it looks like:
   ```
   https://a1b2c3d4e5f6g7h8i9j0@o123456.ingest.sentry.io/7654321
   ```
3. Save this as `SENTRY_DSN_BACKEND` in your environment variables

### Configure Backend Alerts

1. Go to **Settings** → **Alerts**
2. Create an alert rule:
   - **Alert name**: "High Error Rate"
   - **Trigger**: When error count is above 10 in 1 minute
   - **Actions**: Send notification to Slack/Email
3. Create another alert:
   - **Alert name**: "New Issue"
   - **Trigger**: When a new issue is created
   - **Actions**: Send notification immediately

---

## Step 3: Create Frontend Project (React)

### Create Project

1. In Sentry Dashboard, click **"Create Project"** again
2. Select **"React"** as platform
3. Name: `investagent-frontend`
4. Alert frequency: **"Alert me on every new issue"**
5. Click **"Create Project"**

### Get Frontend DSN

1. Copy the DSN from the project page
2. Save this as `VITE_SENTRY_DSN` for Vercel
3. Save as `SENTRY_DSN_FRONTEND` in your environment variables

### Configure Session Replay

1. Go to **Settings** → **Replay**
2. Enable **Session Replay**
3. Configure privacy settings:
   - **Mask all text**: No (we want to see errors clearly)
   - **Block all media**: No
   - **Privacy Settings**: Review and adjust based on your needs

---

## Step 4: Add DSNs to Render (Backend)

### Method 1: Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `investagent-backend` service
3. Go to **Environment** tab
4. Click **"Add Environment Variable"**
5. Add:
   ```
   Key: SENTRY_DSN_BACKEND
   Value: https://a1b2c3d4e5f6g7h8i9j0@o123456.ingest.sentry.io/7654321
   ```
6. Click **"Save Changes"** (this will trigger a redeploy)

### Method 2: render.yaml (Infrastructure as Code)

Update your `render.yaml`:
```yaml
services:
  - type: web
    name: investagent-backend
    env: node
    envVars:
      - key: SENTRY_DSN_BACKEND
        sync: false  # Set manually in dashboard
```

Then manually set the value in Render Dashboard for security.

---

## Step 5: Add DSNs to Vercel (Frontend)

### Method 1: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your `investagent-frontend` project
3. Go to **Settings** → **Environment Variables**
4. Add variable:
   - **Key**: `VITE_SENTRY_DSN`
   - **Value**: `https://x1y2z3...@o123456.ingest.sentry.io/7654322`
   - **Environment**: Production, Preview, Development (select all)
5. Click **"Save"**
6. Redeploy your application:
   - Go to **Deployments**
   - Click **"..."** on latest deployment → **"Redeploy"**

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Add environment variable
vercel env add VITE_SENTRY_DSN production
# Paste your DSN when prompted

# Add for preview
vercel env add VITE_SENTRY_DSN preview

# Add for development
vercel env add VITE_SENTRY_DSN development

# Redeploy
vercel --prod
```

### Method 3: vercel.json

Update `vercel.json`:
```json
{
  "env": {
    "VITE_SENTRY_DSN": "@vite_sentry_dsn"
  },
  "build": {
    "env": {
      "VITE_SENTRY_DSN": "@vite_sentry_dsn"
    }
  }
}
```

Then set the secret in Vercel dashboard or CLI:
```bash
vercel secrets add vite_sentry_dsn "https://..."
```

---

## Step 6: Add DSNs to GitHub Secrets (CI/CD)

### For GitHub Actions

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add backend DSN:
   - **Name**: `SENTRY_DSN_BACKEND`
   - **Secret**: `https://...backend-dsn...`
5. Add frontend DSN:
   - **Name**: `SENTRY_DSN_FRONTEND`
   - **Secret**: `https://...frontend-dsn...`
6. Click **"Add secret"**

### Update GitHub Actions Workflows

Your workflows already reference these secrets:
```yaml
# In deploy-preview.yml
env:
  VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN_FRONTEND }}
```

---

## Step 7: Test Sentry Integration

### Test Backend Error Tracking

1. SSH into Render or test locally:
```bash
curl https://your-backend.onrender.com/api/test-error
```

2. Or add a test endpoint temporarily:
```javascript
// In backend/src/index.js
app.get('/api/test-error', (req, res) => {
  throw new Error('Test error from backend');
});
```

3. Visit the endpoint in your browser
4. Check Sentry dashboard for the error

### Test Frontend Error Tracking

1. Add a test button in your app:
```jsx
// In any component
<button onClick={() => {
  throw new Error('Test error from frontend');
}}>
  Test Sentry
</button>
```

2. Click the button
3. Check Sentry dashboard for the error
4. Session replay should also be captured

### Verify in Sentry Dashboard

1. Go to Sentry dashboard
2. Select `investagent-backend` or `investagent-frontend`
3. Click **"Issues"** in left sidebar
4. You should see your test errors
5. Click on an issue to see:
   - Stack trace
   - Request details
   - Environment info
   - Session replay (frontend only)

---

## Step 8: Configure Release Tracking (Optional but Recommended)

### Backend Release Tracking

Add to your `backend/package.json`:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "sentry:release": "sentry-cli releases new $npm_package_version && sentry-cli releases finalize $npm_package_version"
  }
}
```

Install Sentry CLI:
```bash
npm install -g @sentry/cli
```

Configure `.sentryclirc` in backend directory:
```ini
[defaults]
url=https://sentry.io/
org=your-org-slug
project=investagent-backend

[auth]
token=your-auth-token
```

### Frontend Release Tracking with Vercel

Vercel automatically sends release information to Sentry if configured.

Add to `vercel.json`:
```json
{
  "github": {
    "silent": false
  },
  "build": {
    "env": {
      "SENTRY_ORG": "your-org",
      "SENTRY_PROJECT": "investagent-frontend",
      "SENTRY_AUTH_TOKEN": "@sentry_auth_token"
    }
  }
}
```

Add Sentry auth token to Vercel:
```bash
vercel secrets add sentry_auth_token "your-sentry-auth-token"
```

---

## Step 9: Configure Notifications

### Email Notifications

1. Sentry Dashboard → **Settings** → **Notifications**
2. Configure email preferences:
   - **Issue Alerts**: On
   - **Workflow Notifications**: On
   - **Weekly Reports**: On

### Slack Integration

1. Sentry Dashboard → **Settings** → **Integrations**
2. Find **Slack** → Click **"Add to Slack"**
3. Authorize Sentry in your Slack workspace
4. Configure alert routing:
   - **#engineering**: All errors
   - **#critical**: High-priority errors only

### PagerDuty (for Critical Production Errors)

1. Sentry Dashboard → **Settings** → **Integrations**
2. Find **PagerDuty** → **"Add to PagerDuty"**
3. Configure:
   - **Service**: Production InvestAgent
   - **Alert Rule**: Error count > 50 in 5 minutes

---

## Step 10: Production Best Practices

### Environment Configuration

**Development:**
```bash
# Backend .env.development
SENTRY_DSN_BACKEND=  # Leave empty or use development DSN
LOG_LEVEL=debug

# Frontend .env.development
VITE_SENTRY_DSN=  # Leave empty or use development DSN
```

**Production:**
```bash
# Backend (Render)
SENTRY_DSN_BACKEND=https://...production-dsn...
LOG_LEVEL=info

# Frontend (Vercel)
VITE_SENTRY_DSN=https://...production-dsn...
```

### Sample Rates

Adjust these in your code based on traffic:

**Backend (`backend/src/index.js`):**
```javascript
Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod
});
```

**Frontend (`frontend/src/main.jsx`):**
```javascript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
});
```

### Privacy Settings

For frontend, configure PII scrubbing:
```javascript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  beforeSend(event) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['Authorization'];
    }
    return event;
  },
});
```

### Context Enhancement

Add user context for better debugging:

**Backend:**
```javascript
// In authentication middleware
Sentry.setUser({
  id: user._id,
  email: user.email,
  username: user.firstName + ' ' + user.lastName,
});
```

**Frontend:**
```javascript
// After login
Sentry.setUser({
  id: user._id,
  email: user.email,
  username: user.firstName + ' ' + user.lastName,
});
```

---

## Environment Variables Summary

### Backend (Render)
```bash
SENTRY_DSN_BACKEND=https://xxx@o123.ingest.sentry.io/456
LOG_LEVEL=info
```

### Frontend (Vercel)
```bash
VITE_SENTRY_DSN=https://yyy@o123.ingest.sentry.io/789
```

### GitHub Secrets
```bash
SENTRY_DSN_BACKEND=https://xxx@o123.ingest.sentry.io/456
SENTRY_DSN_FRONTEND=https://yyy@o123.ingest.sentry.io/789
```

---

## Troubleshooting

### Issue: "Sentry not capturing errors"

**Check:**
1. DSN is correctly set in environment variables
2. Environment variables are available at runtime (not just build time)
3. Errors are actually being thrown (not caught and handled)
4. Sentry.init() is called before any other code

**Test:**
```javascript
// Force an error
Sentry.captureException(new Error('Test error'));
```

### Issue: "Too many events quota exceeded"

**Solution:**
1. Reduce sample rates in production
2. Filter out common non-critical errors
3. Upgrade Sentry plan if needed

### Issue: "Session replays not working"

**Check:**
1. Session replay is enabled in Sentry project settings
2. `@sentry/react` version is 7.0+ 
3. Sample rate is > 0
4. Browser supports session replay (modern browsers only)

---

## Support & Resources

- **Sentry Docs**: [docs.sentry.io](https://docs.sentry.io)
- **Node.js Guide**: [docs.sentry.io/platforms/node](https://docs.sentry.io/platforms/node)
- **React Guide**: [docs.sentry.io/platforms/javascript/guides/react](https://docs.sentry.io/platforms/javascript/guides/react)
- **Support**: [sentry.io/support](https://sentry.io/support)

---

## Quick Reference Commands

```bash
# Test backend Sentry
curl https://your-backend.onrender.com/health

# Install dependencies
cd backend && npm install @sentry/node winston
cd frontend && npm install @sentry/react

# View logs (Render)
render logs -s investagent-backend

# View logs (Vercel)
vercel logs investagent-frontend

# Check Sentry issues
open https://sentry.io/organizations/your-org/issues/
```

---

**Congratulations!** Sentry is now tracking errors and performance in your InvestAgent application! 🎉
