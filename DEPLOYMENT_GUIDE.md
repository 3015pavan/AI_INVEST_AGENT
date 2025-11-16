# Production Deployment Guide for InvestAgent

## Table of Contents
1. [MongoDB Atlas Setup](#mongodb-atlas-setup)
2. [Render Backend Deployment](#render-backend-deployment)
3. [Vercel Frontend Deployment](#vercel-frontend-deployment)
4. [Environment Variables Reference](#environment-variables-reference)
5. [CI/CD Configuration](#cicd-configuration)
6. [Health Checks & Monitoring](#health-checks--monitoring)
7. [Troubleshooting](#troubleshooting)

---

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **"Build a Database"**
4. Choose **"M0 Free"** tier (512MB storage, perfect for starting)
5. Select a cloud provider and region (choose closest to your Render region)
6. Name your cluster: `InvestAgent-Production`
7. Click **"Create"**

### 2. Configure Database Access

1. In Atlas Dashboard, go to **Database Access**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `investagent-api`
5. **Auto-generate Secure Password** → **Save this password!**
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### 3. Configure Network Access

1. Go to **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Render deployment)
   - IP: `0.0.0.0/0`
   - Comment: "Render deployment servers"
4. Click **"Confirm"**

> **Note**: For better security in production, you can whitelist only Render's IP ranges after deployment.

### 4. Get Connection String

1. Go to **Database** → **Connect**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **4.1 or later**
4. Copy the connection string:
   ```
   mongodb+srv://investagent-api:<password>@investagent-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `investagent` (append `/investagent` before `?`)
   ```
   mongodb+srv://investagent-api:YOUR_PASSWORD@investagent-production.xxxxx.mongodb.net/investagent?retryWrites=true&w=majority
   ```

---

## Render Backend Deployment

### 1. Create Render Account

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub (recommended for automatic deployments)

### 2. Create Web Service

1. Click **"New +"** → **"Web Service"**
2. **Connect Repository**: Select `InvestAgent` from your GitHub repos
3. Configure:
   - **Name**: `investagent-backend`
   - **Region**: Oregon (or closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `backend` (important for monorepo!)
   - **Environment**: `Node`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($0/month) or Standard ($7/month for zero downtime)

### 3. Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** for each:

#### Required Variables

```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=[Auto-generate in Render - click "Generate"]
JWT_EXPIRE=7d
MONGODB_URI=mongodb+srv://investagent-api:YOUR_PASSWORD@investagent-production.xxxxx.mongodb.net/investagent?retryWrites=true&w=majority
```

#### API Keys (Get from respective services)

```bash
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=investagent-vectors
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox
ALPHA_VANTAGE_API_KEY=...
FINNHUB_API_KEY=...
```

#### Additional Variables

```bash
FRONTEND_URL=https://your-app.vercel.app
SENTRY_DSN_BACKEND=https://...@sentry.io/...
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
LOG_LEVEL=info
```

### 4. Deploy

1. Click **"Create Web Service"**
2. Render will automatically deploy from your `main` branch
3. Wait 3-5 minutes for initial deployment
4. Your backend URL: `https://investagent-backend.onrender.com`

### 5. Configure Health Checks

Render automatically uses your `/health` endpoint. Verify it works:
```bash
curl https://investagent-backend.onrender.com/health
```

### 6. Enable Auto-Deploy from GitHub

1. In Render Dashboard → Your Service → **Settings**
2. **Auto-Deploy**: `Yes` (enabled by default with GitHub)
3. Deploys automatically on push to `main` branch

---

## Vercel Frontend Deployment

### 1. Create Vercel Account

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)

### 2. Import Project

1. Click **"Add New..."** → **"Project"**
2. **Import Git Repository**: Select `InvestAgent`
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (important for monorepo!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

### 3. Configure Environment Variables

Click **"Environment Variables"** and add:

```bash
VITE_API_BASE_URL=https://investagent-backend.onrender.com
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

> **Important**: All frontend env vars must start with `VITE_` prefix!

### 4. Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for build and deployment
3. Your frontend URL: `https://investagent-[random].vercel.app`
4. Optional: Add custom domain in **Settings** → **Domains**

### 5. Update Backend CORS

After deployment, update backend `FRONTEND_URL` in Render:
1. Go to Render Dashboard → `investagent-backend` → **Environment**
2. Update `FRONTEND_URL` to your Vercel URL: `https://investagent-[random].vercel.app`
3. Click **"Save Changes"** (auto-redeploys)

### 6. Configure Production Domain (Optional)

1. In Vercel → Your Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `app.investagent.com`)
3. Update DNS records as instructed by Vercel
4. SSL certificate is automatically provisioned

---

## Environment Variables Reference

### Backend Environment Variables (Render)

| Variable | Source | How to Get |
|----------|--------|------------|
| `MONGODB_URI` | MongoDB Atlas | See [MongoDB Atlas Setup](#mongodb-atlas-setup) |
| `JWT_SECRET` | Render Auto-generate | Click "Generate" in Render |
| `OPENAI_API_KEY` | OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `PINECONE_API_KEY` | Pinecone | [app.pinecone.io](https://app.pinecone.io) → API Keys |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | See `GOOGLE_OAUTH_SETUP.md` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | See `GOOGLE_OAUTH_SETUP.md` |
| `PLAID_CLIENT_ID` | Plaid Dashboard | [dashboard.plaid.com/team/keys](https://dashboard.plaid.com/team/keys) |
| `PLAID_SECRET` | Plaid Dashboard | Same as above |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage | [www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key) |
| `FINNHUB_API_KEY` | Finnhub | [finnhub.io/register](https://finnhub.io/register) |
| `SENTRY_DSN_BACKEND` | Sentry | [sentry.io](https://sentry.io) → Create Project → Copy DSN |
| `EMAIL_PASSWORD` | Gmail | [Google App Passwords](https://myaccount.google.com/apppasswords) |

### Frontend Environment Variables (Vercel)

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_BASE_URL` | `https://investagent-backend.onrender.com` | Your Render backend URL |
| `VITE_SENTRY_DSN` | Your Sentry DSN | From Sentry frontend project |
| `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID | Same as backend |

---

## CI/CD Configuration

### GitHub Secrets Setup

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** for each:

#### Required Secrets

```bash
# Testing
TEST_JWT_SECRET=test-jwt-secret-for-ci-only

# Deployment
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-xxxxx?key=xxxxx

# Optional (for preview deployments)
PREVIEW_API_URL=https://investagent-backend-preview.onrender.com
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-site-id
```

#### How to Get Secrets

**Vercel Token:**
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name: `GitHub Actions CI`
4. Scope: Select your account/team
5. Copy token (shown only once!)

**Vercel Project IDs:**
```bash
npm i -g vercel
cd frontend
vercel link
# Follow prompts, then:
cat .vercel/project.json
# Copy projectId and orgId
```

**Render Deploy Hook:**
1. Render Dashboard → Your Service → **Settings**
2. Scroll to **Deploy Hook**
3. Click **"Create Deploy Hook"**
4. Copy the URL

### Protected Branches

1. Go to GitHub repo → **Settings** → **Branches**
2. Click **"Add branch protection rule"**
3. Branch name pattern: `main`
4. Enable:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
     - Select: `Backend Tests`, `Frontend Tests`
   - ✅ **Require branches to be up to date before merging**
   - ✅ **Do not allow bypassing the above settings**
5. Click **"Create"**

### Workflow Triggers

- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Runs on push to `main` or `develop`
  - Runs on all pull requests to `main` or `develop`
  - Tests backend and frontend
  - Builds frontend
  - Uploads coverage to Codecov

- **Deploy Preview** (`.github/workflows/deploy-preview.yml`):
  - Runs on pull request open/update
  - Deploys preview to Vercel/Netlify
  - Triggers Render preview (if configured)
  - Comments preview URL on PR

---

## Health Checks & Monitoring

### Health Endpoint

Your backend includes a `/health` endpoint that returns:
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "database": "connected"
}
```

**Test it:**
```bash
curl https://investagent-backend.onrender.com/health
```

### Metrics Endpoint

The `/metrics` endpoint provides:
```json
{
  "uptime": 3600,
  "timestamp": "2025-11-16T10:30:00.000Z",
  "lastSync": "2025-11-16T10:25:00.000Z",
  "requestCount": 1234,
  "errorCount": 5,
  "activeUsers": 42
}
```

### Sentry Error Tracking

Errors are automatically sent to Sentry with:
- Stack traces
- User context
- Request details
- Environment information

**Access Sentry:**
1. Go to [sentry.io](https://sentry.io)
2. Select your project
3. View errors, performance, and releases

### Render Monitoring

Render provides built-in monitoring:
1. Go to Render Dashboard → Your Service → **Metrics**
2. View:
   - CPU usage
   - Memory usage
   - Request rate
   - Response time
   - Error rate

### Vercel Analytics

Enable Vercel Analytics:
1. Vercel Dashboard → Your Project → **Analytics**
2. Click **"Enable Analytics"**
3. View:
   - Page views
   - Unique visitors
   - Performance metrics
   - Geographic distribution

---

## Troubleshooting

### Backend Issues

**Issue: "Cannot connect to MongoDB"**
```bash
# Check MongoDB Atlas:
1. Network Access allows 0.0.0.0/0
2. Database user exists and password is correct
3. Connection string includes database name: /investagent
4. MONGODB_URI in Render matches your Atlas connection string
```

**Issue: "Health check failing"**
```bash
# Check Render logs:
1. Render Dashboard → Your Service → Logs
2. Look for startup errors
3. Verify all required environment variables are set
4. Check if server is binding to PORT from environment
```

**Issue: "OpenAI API errors"**
```bash
# Verify:
1. OPENAI_API_KEY is valid (not expired)
2. You have API credits remaining
3. Key has proper permissions
```

### Frontend Issues

**Issue: "Failed to fetch from API"**
```bash
# Check:
1. VITE_API_BASE_URL is set correctly in Vercel
2. Backend is running (visit /health endpoint)
3. Backend CORS allows your Vercel domain (FRONTEND_URL)
4. Browser console for CORS errors
```

**Issue: "Blank page after deployment"**
```bash
# Check Vercel logs:
1. Vercel Dashboard → Deployments → Latest → Logs
2. Look for build errors
3. Verify all VITE_ environment variables are set
4. Check browser console for errors
```

**Issue: "Environment variables not working"**
```bash
# Remember:
1. Frontend env vars MUST start with VITE_
2. Changing env vars requires redeployment
3. Env vars are baked into build (not runtime)
```

### CI/CD Issues

**Issue: "Tests failing in CI but passing locally"**
```bash
# Check:
1. All test dependencies are in package.json (not just globally installed)
2. TEST_JWT_SECRET is set in GitHub Secrets
3. Tests don't depend on local environment variables
4. MongoDB Memory Server has enough memory in CI
```

**Issue: "Deploy preview not working"**
```bash
# Verify GitHub Secrets:
1. VERCEL_TOKEN is valid
2. VERCEL_PROJECT_ID and VERCEL_ORG_ID are correct
3. RENDER_DEPLOY_HOOK URL is correct
4. Secrets are available to the workflow (not just main branch)
```

### Support Resources

- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Sentry Docs**: [docs.sentry.io](https://docs.sentry.io)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)

---

## Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed to Render with all environment variables
- [ ] Frontend deployed to Vercel with VITE_ variables
- [ ] Health check endpoint responding: `/health`
- [ ] Sentry integrated and receiving errors
- [ ] GitHub Actions CI passing on main branch
- [ ] Protected branches configured
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates active (auto via Render/Vercel)
- [ ] CORS configured correctly (backend FRONTEND_URL)
- [ ] API keys have sufficient quotas/credits
- [ ] Monitoring dashboards bookmarked
- [ ] Team has access to all dashboards
- [ ] Backup strategy documented
- [ ] Incident response plan in place

---

**Congratulations!** Your InvestAgent application is now live in production! 🚀
