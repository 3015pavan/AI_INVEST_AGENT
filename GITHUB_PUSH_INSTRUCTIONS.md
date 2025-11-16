# Push to GitHub Instructions

## After creating your GitHub repository, run these commands:

```powershell
# Navigate to your project
cd C:\Users\Pavan\INVESTAGENT

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/InvestAgent.git

# Push your code to GitHub
git push -u origin main
```

## Example with actual username:
If your GitHub username is `301Pavan2005`, the command would be:
```powershell
git remote add origin https://github.com/301Pavan2005/InvestAgent.git
git push -u origin main
```

## After Pushing to GitHub:

### Deploy to Vercel (Frontend)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your `InvestAgent` repository
5. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_API_URL` = your Render backend URL (e.g., https://investagent-api.onrender.com/api)
   - `VITE_GOOGLE_CLIENT_ID` = your Google OAuth client ID
   - `VITE_SENTRY_DSN` = your Sentry frontend DSN (optional)
7. Click "Deploy"

### Deploy to Render (Backend)
1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your `InvestAgent` repository
5. Configure:
   - Name: `investagent-api`
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
6. Add Environment Variables:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = your JWT secret key
   - `GOOGLE_CLIENT_ID` = your Google OAuth client ID
   - `OPENAI_API_KEY` = your OpenAI API key
   - `PORT` = 5000
   - `NODE_ENV` = production
   - `FRONTEND_URL` = your Vercel frontend URL
7. Click "Create Web Service"

### After Deployment:
1. Update Vercel environment variable `VITE_API_URL` with your Render URL
2. Update Render environment variable `FRONTEND_URL` with your Vercel URL
3. Redeploy both services

## Your Repository is Ready! ✅
- 104 files committed
- 41,493 lines of code
- Full-stack application with testing, CI/CD, and deployment configs
- Ready for production deployment
