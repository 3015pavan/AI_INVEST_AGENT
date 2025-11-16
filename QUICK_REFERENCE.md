# InvestAgent - Quick Reference Card

## 🚀 Installation & Setup

```powershell
# Initial setup
npm run install:all                    # Install all dependencies
.\install-production-deps.ps1          # Install monitoring dependencies
.\setup-tests.ps1                      # Setup testing infrastructure

# Start development servers
npm run dev                            # Start both backend and frontend
npm run dev:backend                    # Backend only (port 5000)
npm run dev:frontend                   # Frontend only (port 3002)
```

## 🧪 Testing

```powershell
# Run all tests
npm test                               # Backend + Frontend tests
npm run test:backend                   # Backend tests only
npm run test:frontend                  # Frontend tests only

# Coverage reports
npm run test:coverage                  # Generate coverage reports

# CI simulation
npm run test:ci                        # Run tests as CI would

# E2E tests
npm run e2e                            # Run Playwright E2E tests
npm run e2e:headed                     # E2E with browser UI
npm run e2e:ui                         # E2E with Playwright UI
```

## 🔍 Health & Monitoring

```powershell
# Health checks
curl http://localhost:5000/health      # Backend health (local)
curl https://your-backend.onrender.com/health  # Production

# Metrics
curl http://localhost:5000/metrics     # Application metrics

# Logs
# Backend (local): Check console output
# Render: https://dashboard.render.com → Your Service → Logs
# Vercel: https://vercel.com → Your Project → Deployments → Logs
```

## 🌐 Deployment

### Initial Deployment

```powershell
# 1. MongoDB Atlas
Visit: https://cloud.mongodb.com
- Create M0 free cluster
- Create database user
- Get connection string

# 2. Deploy Backend to Render
Visit: https://dashboard.render.com
- New Web Service
- Connect GitHub repo
- Root: backend
- Add environment variables
- Deploy

# 3. Deploy Frontend to Vercel
Visit: https://vercel.com
- Import GitHub repo
- Root: frontend
- Framework: Vite
- Add VITE_* environment variables
- Deploy

# 4. Configure CI/CD
Visit: GitHub → Settings → Secrets
- Add all required secrets (see DEPLOYMENT_GUIDE.md)
```

### Update Deployment

```powershell
# Automatic deployment (configured)
git push origin main                   # Triggers CI/CD pipeline

# Manual deployment
# Render: Dashboard → Your Service → Manual Deploy
# Vercel: Dashboard → Deployments → Redeploy
```

## 📊 Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/investagent
JWT_SECRET=your-secret
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
GOOGLE_CLIENT_ID=...
SENTRY_DSN_BACKEND=https://...@sentry.io/...
LOG_LEVEL=info
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
VITE_SENTRY_DSN=https://...@sentry.io/...
```

## 🛠️ Common Tasks

### Database Operations

```powershell
# Sync holdings
cd backend
npm run sync-holdings

# MongoDB shell (local)
mongosh mongodb://localhost:27017/investagent

# MongoDB Atlas
Visit: https://cloud.mongodb.com → Connect → Connect with MongoDB Compass
```

### Git Workflow

```powershell
# Create feature branch
git checkout -b feature/new-feature

# Make changes, commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
# Create PR on GitHub

# After PR merged
git checkout main
git pull origin main
```

### View Logs

```powershell
# Local development
# Backend: Check terminal where "npm run dev:backend" is running
# Frontend: Check browser console (F12)

# Production
# Render logs
render logs -s investagent-backend --tail

# Vercel logs
vercel logs investagent-frontend --follow
```

## 🐛 Troubleshooting

### Backend Issues

```powershell
# Check health
curl http://localhost:5000/health

# Check logs
# Windows: Get-Content backend/logs/combined.log -Tail 50
# Or check console output

# Restart server
# Ctrl+C in terminal, then npm run dev:backend

# Clear node_modules
cd backend
Remove-Item -Recurse -Force node_modules
npm install
```

### Frontend Issues

```powershell
# Clear Vite cache
cd frontend
Remove-Item -Recurse -Force node_modules/.vite
npm run dev

# Rebuild
npm run build
npm run preview

# Check API connection
# Browser console → Network tab → Filter: XHR
```

### Database Issues

```powershell
# Check MongoDB is running
# Local: mongosh --eval "db.runCommand({ ping: 1 })"
# Atlas: Check Network Access allows your IP

# Reset local database
mongosh mongodb://localhost:27017
use investagent
db.dropDatabase()
```

## 📈 Performance

### Backend Optimization

```powershell
# Check memory usage
curl http://localhost:5000/metrics

# Monitor performance
# Render: Dashboard → Metrics tab

# Optimize database queries
# Add indexes in MongoDB Atlas
```

### Frontend Optimization

```powershell
# Analyze bundle size
cd frontend
npm run build
# Check dist/ folder size

# Use Vercel Analytics
# Vercel Dashboard → Analytics tab
```

## 🔒 Security

### Update Dependencies

```powershell
# Check for vulnerabilities
cd backend
npm audit

cd frontend
npm audit

# Fix vulnerabilities
npm audit fix

# Update all dependencies
npm update
```

### Rotate Secrets

```powershell
# 1. Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Update in platforms
# - Render Dashboard → Environment
# - Vercel Dashboard → Settings → Environment Variables
# - GitHub → Settings → Secrets

# 3. Redeploy
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview |
| `DEPLOYMENT_GUIDE.md` | Complete deployment steps |
| `SENTRY_SETUP.md` | Error tracking setup |
| `TESTING_GUIDE.md` | Testing infrastructure |
| `PRODUCTION_SETUP_SUMMARY.md` | Production features overview |
| `backend/API_KEYS_SETUP.md` | API key acquisition |
| `backend/GOOGLE_OAUTH_SETUP.md` | Google OAuth setup |

## 🔗 Important URLs

### Development
- Frontend: http://localhost:3002
- Backend: http://localhost:5000
- Backend Health: http://localhost:5000/health
- Backend Metrics: http://localhost:5000/metrics

### Production
- Frontend: https://investagent-[random].vercel.app
- Backend: https://investagent-backend.onrender.com
- Health Check: https://investagent-backend.onrender.com/health

### Dashboards
- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Sentry: https://sentry.io
- GitHub Actions: https://github.com/[user]/[repo]/actions

## 💡 Quick Tips

```powershell
# Start fresh (nuclear option)
Remove-Item -Recurse -Force backend/node_modules, frontend/node_modules
npm run install:all

# Check all services are running
curl http://localhost:5000/health       # Backend
curl http://localhost:3002              # Frontend (should redirect)

# View all environment variables (local)
cd backend
Get-Content .env

cd frontend
Get-Content .env

# Check git status
git status
git log --oneline -10                   # Last 10 commits

# Check which tests are failing
npm run test:backend -- --verbose
npm run test:frontend -- --verbose
```

## 🆘 Emergency Contacts

- **GitHub Issues**: https://github.com/[user]/[repo]/issues
- **Render Support**: https://render.com/support
- **Vercel Support**: https://vercel.com/support
- **MongoDB Support**: https://support.mongodb.com

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
