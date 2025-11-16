# API Keys Setup Guide

This guide shows all API keys and credentials needed for the InvestAgent application.

## Required API Keys

### 1. ✅ JWT_SECRET (Already Configured)
**Status**: Already generated and added to `.env`

**What it is**: Secret key for signing JWT tokens
**Where to get it**: Already generated (cryptographically secure random string)

---

### 2. ✅ MONGODB_URI (Already Configured)
**Status**: Already configured with MongoDB Atlas

**What it is**: MongoDB connection string
**Where to get it**: Already set up from MongoDB Atlas

---

## Optional API Keys (Add as needed)

### 3. Google OAuth - GOOGLE_CLIENT_ID
**Status**: Optional - Only needed if using Google login

**What it is**: Google OAuth 2.0 Client ID for authentication

**Where to get it**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API** or **Google Identity Services**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - Your production domain
7. Copy the **Client ID**

**Add to `.env`**:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

---

### 4. Alpaca Market Data - ALPACA_API_KEY & ALPACA_SECRET
**Status**: Optional - Only needed if using Alpaca instead of Yahoo Finance

**What it is**: Alpaca API credentials for market data

**Where to get it**:
1. Go to [Alpaca Markets](https://alpaca.markets/)
2. Sign up for a free account
3. Go to **Paper Trading** or **Live Trading** dashboard
4. Navigate to **API Keys** section
5. Generate new API keys
6. Copy **API Key ID** and **Secret Key**

**Add to `.env`**:
```env
MARKET_PROVIDER=alpaca
ALPACA_API_KEY=your_alpaca_api_key_here
ALPACA_SECRET=your_alpaca_secret_here
ALPACA_BASE_URL=https://data.alpaca.markets/v2
```

**Note**: If not set, the app defaults to Yahoo Finance (free, no API key needed)

---

### 5. OpenAI - OPENAI_API_KEY
**Status**: Required for AI investment plan generation

**What it is**: OpenAI API key for GPT models

**Where to get it**:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (you won't see it again!)

**Add to `.env`**:
```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**Cost**: Pay-as-you-go. Check [OpenAI Pricing](https://openai.com/pricing)

---

### 6. Pinecone - PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX_NAME
**Status**: Required for vector database (AI agent memory)

**What it is**: Pinecone vector database credentials

**Where to get it**:
1. Go to [Pinecone](https://www.pinecone.io/)
2. Sign up for free account
3. Create a new project
4. Create an index (choose dimensions, e.g., 1536 for OpenAI embeddings)
5. Go to **API Keys** section
6. Copy:
   - **API Key**
   - **Environment** (e.g., `us-east-1-aws`)
   - **Index Name**

**Add to `.env`**:
```env
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=your_index_name
```

**Free Tier**: Available with limitations

---

## Complete .env Template

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investagent

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here

# Market Data Provider
MARKET_PROVIDER=yahoo
# Or use Alpaca:
# MARKET_PROVIDER=alpaca
# ALPACA_API_KEY=your_alpaca_api_key
# ALPACA_SECRET=your_alpaca_secret
# ALPACA_BASE_URL=https://data.alpaca.markets/v2

# Market Data Retry Configuration
MARKET_MAX_RETRIES=3
MARKET_RETRY_DELAY=1000
MARKET_BACKOFF_MULTIPLIER=2

# OpenAI (Required for AI features)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Pinecone (Required for AI features)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=investagent-index
```

---

## Priority Setup Order

### Phase 1: Core Functionality (Already Done ✅)
- [x] JWT_SECRET
- [x] MONGODB_URI

### Phase 2: Authentication (Optional)
- [ ] GOOGLE_CLIENT_ID (if using Google login)

### Phase 3: Market Data (Optional)
- [ ] ALPACA_API_KEY & ALPACA_SECRET (if using Alpaca instead of Yahoo)

### Phase 4: AI Features (Required for AI agent)
- [ ] OPENAI_API_KEY
- [ ] PINECONE_API_KEY
- [ ] PINECONE_ENVIRONMENT
- [ ] PINECONE_INDEX_NAME

---

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore` ✅
2. **Use different keys for development/production**
3. **Rotate keys periodically**
4. **Use environment variables in production** (not `.env` file)
5. **Limit API key permissions** when possible
6. **Monitor API usage** to detect anomalies

---

## Testing Without All Keys

You can test the application without all keys:

- **Without Google OAuth**: Google login won't work, but email/password auth works
- **Without Alpaca**: Uses Yahoo Finance (free, no key needed)
- **Without OpenAI/Pinecone**: AI features won't work, but other features work

---

## Quick Checklist

- [x] JWT_SECRET - ✅ Configured
- [x] MONGODB_URI - ✅ Configured
- [ ] GOOGLE_CLIENT_ID - Optional
- [ ] ALPACA_API_KEY - Optional (Yahoo Finance works without it)
- [ ] OPENAI_API_KEY - Required for AI features
- [ ] PINECONE_API_KEY - Required for AI features
- [ ] PINECONE_ENVIRONMENT - Required for AI features
- [ ] PINECONE_INDEX_NAME - Required for AI features

