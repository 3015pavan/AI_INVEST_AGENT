# 🚀 InvestAgent Deployment Guide

## Quick Deployment Summary

- **Frontend**: Deploy to Vercel (Free)
- **Backend**: Deploy to Render (Free)
- **Database**: MongoDB Atlas (Free)

---

## 📦 Prerequisites

1. GitHub account with your code pushed to a repository
2. Vercel account (sign up at https://vercel.com)
3. Render account (sign up at https://render.com)
4. MongoDB Atlas account (sign up at https://mongodb.com/cloud/atlas)

---

## 🎯 Step 1: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Connect your GitHub account
   - Select your `INVESTAGENT` repository

3. **Configure Service**
   ```
   Name: investagent-backend
   Region: Oregon (or your preferred)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node src/index.js
   Plan: Free
   ```

4. **Add Environment Variables**
   Click "Environment" and add these variables:

   **Required:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-random-64-character-string>
   JWT_EXPIRES_IN=7d
   GOOGLE_CLIENT_ID=979018169574-2jspfqkafrtronvsksnql7chhjhrdrv8.apps.googleusercontent.com
   ```

   **Optional (for full features):**
   ```
   OPENAI_API_KEY=<your-openai-key>
   PINECONE_API_KEY=<your-pinecone-key>
   MARKET_PROVIDER=yahoo
   SENTRY_DSN_BACKEND=<your-sentry-dsn>
   ```

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait 3-5 minutes for deployment
   - Your backend URL will be: `https://investagent-backend.onrender.com`

### Option B: Using render.yaml (Blueprint)

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your repository
3. Select `render.yaml` file
4. Render will automatically configure everything
5. Add environment variables manually

---

## 🌐 Step 2: Deploy Frontend to Vercel

### Quick Deploy (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Click **"Import Project"**

2. **Import Repository**
   - Select your GitHub repository
   - Click **"Import"**

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: cd frontend && npm install && npm run build
   Output Directory: frontend/dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:

   ```
   VITE_API_URL=https://investagent-backend.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=979018169574-2jspfqkafrtronvsksnql7chhjhrdrv8.apps.googleusercontent.com
   ```

   **Optional:**
   ```
   VITE_SENTRY_DSN=<your-sentry-frontend-dsn>
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Your frontend URL will be: `https://investagent.vercel.app`

---

## 🗄️ Step 3: Setup MongoDB Atlas

1. **Create Cluster**
   - Go to: https://cloud.mongodb.com
   - Click **"Build a Database"** → **"M0 Free"**
   - Choose a cloud provider and region
   - Click **"Create Cluster"**

2. **Create Database User**
   - Go to **Database Access**
   - Click **"Add New Database User"**
   - Username: `investagent_user`
   - Password: Generate secure password
   - Click **"Add User"**

3. **Configure Network Access**
   - Go to **Network Access**
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click **"Confirm"**

4. **Get Connection String**
   - Go to **Database** → **Connect**
   - Select **"Connect your application"**
   - Copy connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your credentials
   - Add database name: `mongodb+srv://...mongodb.net/investagent?retryWrites=true&w=majority`

5. **Update Render Environment**
   - Go to Render dashboard
   - Select your backend service
   - Add/Update `MONGODB_URI` with your connection string

---

## 🔐 Step 4: Update CORS Configuration

After deployment, update your backend CORS settings:

1. Go to your Render backend service
2. Add environment variable:
   ```
   FRONTEND_URL=https://investagent.vercel.app
   ```
3. The backend already has dynamic CORS configured in `src/index.js`

---

## ✅ Step 5: Test Deployment

1. **Test Backend Health**
   ```bash
   curl https://investagent-backend.onrender.com/health
   ```
   Should return: `{"status":"ok","database":"connected",...}`

2. **Test Frontend**
   - Visit: https://investagent.vercel.app
   - Try registering a new account
   - Try logging in
   - Test Google Sign-In

3. **Test API Connection**
   - Open browser console (F12)
   - Should see no CORS errors
   - API calls should go to your Render backend

---

## 🔄 Automatic Deployments

### Vercel
- Automatically deploys on every push to `main` branch
- Preview deployments for pull requests
- Configure in: Vercel Dashboard → Settings → Git

### Render
- Automatically deploys on every push to `main` branch
- Configure in: Render Dashboard → Settings → Auto-Deploy

---

## 📊 Monitoring & Logs

### Render Logs
```
Render Dashboard → Your Service → Logs
```
View real-time logs and errors

### Vercel Logs
```
Vercel Dashboard → Your Project → Deployments → View Function Logs
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify all required environment variables are set
- Verify MongoDB connection string is correct

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check Render backend is running
- Verify CORS is configured properly

### Database connection failed
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify database user credentials
- Check connection string format

### Port errors (local development)
- Frontend now uses strict port 3000
- If port is busy: `Stop-Process -Name node -Force`
- Restart: `npm run dev`

---

## 💰 Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Render (Backend) | Free | $0/month |
| Vercel (Frontend) | Hobby | $0/month |
| MongoDB Atlas | M0 | $0/month |
| **Total** | | **$0/month** |

**Free Tier Limitations:**
- Render: Backend sleeps after 15 min inactivity (wakes in ~30 sec)
- Vercel: 100GB bandwidth/month
- MongoDB: 512MB storage

**Upgrade to Production:**
- Render Standard: $7/month (no sleep)
- Vercel Pro: $20/month (better performance)
- MongoDB M10: $0.08/hour (~$57/month, dedicated cluster)

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to random 64-char string
- [ ] Use strong MongoDB password
- [ ] Enable MongoDB IP Whitelist (not 0.0.0.0/0) in production
- [ ] Set NODE_ENV=production
- [ ] Enable Sentry error tracking
- [ ] Use HTTPS only
- [ ] Keep API keys secure (never commit to git)

---

## 📝 Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Configure MongoDB Atlas
4. ✅ Test authentication
5. 🔄 Setup custom domain (optional)
6. 🔄 Enable Sentry monitoring
7. 🔄 Setup CI/CD pipelines

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Docs**: https://docs.mongodb.com/manual/
- **Issues**: Create an issue in your GitHub repository

---

**Your app will be live at:**
- Frontend: `https://investagent.vercel.app`
- Backend: `https://investagent-backend.onrender.com`
- API: `https://investagent-backend.onrender.com/api`

🎉 **Happy Deploying!**
