# 1. Project Title and Tagline

## InvestAgent AI

AI-powered investment intelligence platform for portfolio tracking, market-aware analysis, and goal-based allocation planning.

---

# 2. Problem Statement

Retail investors often use disconnected tools for portfolio tracking, market research, and financial planning.

This creates three recurring issues:
- Decisions are reactive, not goal-driven.
- Portfolio risk and diversification are hard to evaluate consistently.
- Advice is generic and does not adapt to user profile, holdings, or targets.

---

# 3. Solution Overview

InvestAgent AI provides an API-first product foundation that combines:
- secure authentication,
- portfolio and goal management,
- market data enrichment,
- and AI-generated allocation guidance.

The backend includes a retrieval-augmented workflow (OpenAI + Pinecone) that can inject relevant context into planning prompts when enabled.

---

# 4. Key Features

## Implemented Features

- JWT authentication with protected routes (`/api/auth/me`, `/api/portfolios/*`)
- User registration/login with password hashing (`bcryptjs`)
- Google OAuth token verification flow (`/api/auth/google`)
- Portfolio CRUD with user-level isolation
- Holdings and goals modeled as embedded portfolio subdocuments
- Market data sync endpoint to enrich holdings with:
	- current price,
	- unrealized P&L,
	- unrealized P&L %
- AI investment plan generation endpoint (`/api/portfolios/:id/generate-plan`)
- JSON validation/sanitization for AI responses (allocations + trades)
- Optional RAG service with:
	- document indexing,
	- semantic retrieval,
	- context construction for prompts
- Health and observability endpoints:
	- `/health`
	- `/api/health`
	- `/metrics`
- CI workflows for tests, build checks, coverage upload, and security audit

## Upcoming Features

- Complete frontend application source integration (current repo contains frontend build/test/deploy scaffolding)
- Public API endpoints for document ingestion/retrieval over RAG service
- Transaction workflow APIs (schema is present; route/controller flow can be extended)
- Expanded integration runtime for configured providers (Plaid, Alpha Vantage, Finnhub)

---

# 5. Architecture

## Frontend
- Vite-based frontend configuration with React toolchain dependencies.
- API proxy configured in Vite (`/api -> http://localhost:5000`) for local development.
- Vercel deployment configuration included.

## Backend
- Express REST API with layered structure:
	- routes -> controllers -> services -> models
- Auth middleware validates JWT and binds authenticated user context.
- Service layer separates business logic for portfolio, market, AI, and RAG operations.
- Centralized error handling + optional Sentry instrumentation.

## Database
- MongoDB with Mongoose models:
	- `User`
	- `Portfolio` (embedded holdings + goals + generated advice)
	- `Transaction` (modeled for extension)
- Schema-level validation, indexes, and virtuals for query performance and consistency.

## AI Layer
- OpenAI chat completions for investment-plan generation.
- Optional RAG context pipeline with OpenAI embeddings + Pinecone vector search.
- Defensive parsing and sanitization for reliable machine-generated outputs.

## Deployment Architecture
- Backend deployment blueprint via `render.yaml` (Render web service).
- Frontend deployment config via `frontend/vercel.json` (Vercel).
- GitHub Actions for CI, build validation, and PR preview workflows.

---

# 6. Tech Stack

## Frontend
- React 18
- Vite 5
- Redux Toolkit + React Redux
- React Router
- Axios
- Chart.js, react-chartjs-2, Recharts
- Jest + Testing Library

## Backend
- Node.js (ES modules)
- Express
- Mongoose
- JSON Web Token (`jsonwebtoken`)
- bcryptjs
- Axios
- google-auth-library
- Winston
- Sentry (`@sentry/node`)

## Database
- MongoDB

## DevOps
- GitHub Actions
- Render
- Vercel

## AI/ML
- OpenAI API
- Pinecone vector database

---

# 7. Project Structure

```text
INVESTAGENT_AI/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── __tests__/
│   ├── scripts/
│   ├── API_TESTING_GUIDE.md
│   ├── POSTMAN_TESTING_GUIDE.md
│   ├── MARKET_SERVICE_README.md
│   └── RAG_SERVICE_README.md
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json
│   ├── jest.config.js
│   └── package.json
├── e2e/
│   └── user-journey.spec.js
├── .github/workflows/
├── render.yaml
└── package.json
```

### Key folders
- `backend/src/services`: Market sync, AI planning, RAG retrieval/indexing.
- `backend/src/models`: Domain schemas and indexing strategy.
- `backend/src/__tests__`: Unit/integration tests for core backend modules.
- `e2e`: Playwright end-to-end journey spec.
- `.github/workflows`: CI + deployment automation.

---

# 8. Local Setup

## Prerequisites
- Node.js 18+
- npm
- MongoDB (local or Atlas)
- Optional: OpenAI + Pinecone keys for AI/RAG features

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` values, then run:

```bash
npm run dev
```

Backend default URL: `http://localhost:5000`

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend default URL: `http://localhost:3000`

## Monorepo dev (optional)

From repository root:

```bash
npm install
npm run dev
```

---

# 9. Deployment

## Backend (Render)
- `render.yaml` defines service type, root directory, build/start commands, health check, and environment configuration blueprint.

## Frontend (Vercel)
- `frontend/vercel.json` defines Vite build output and SPA rewrites.

## CI/CD
- `ci.yml`, `test.yml`, and `deploy-preview.yml` provide:
	- backend/frontend test execution,
	- coverage artifact upload,
	- frontend build checks,
	- security audit steps,
	- preview deployment automation for pull requests.

---

# 10. Testing

## Test stack
- Backend: Jest + Supertest + Nock + mongodb-memory-server
- Frontend: Jest + jsdom + Testing Library configuration
- E2E: Playwright (`e2e/user-journey.spec.js`)

## Run tests

From root:

```bash
npm test
npm run test:coverage
npm run e2e
```

Backend only:

```bash
cd backend
npm test
npm run test:coverage
```

Frontend only:

```bash
cd frontend
npm test
npm run test:coverage
```

# 11. Environment Variables

## Backend (core)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=...
JWT_SECRET=...
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
```

## Backend (AI + RAG)

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002
USE_RAG=false
RAG_TOP_K=5
PINECONE_API_KEY=...
PINECONE_INDEX=...
PINECONE_BATCH_SIZE=100
```

## Backend (integrations)

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

MARKET_PROVIDER=yahoo
ALPACA_API_KEY=...
ALPACA_SECRET=...
ALPACA_BASE_URL=https://data.alpaca.markets/v2

PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox

ALPHA_VANTAGE_API_KEY=...
FINNHUB_API_KEY=...

SENTRY_DSN_BACKEND=
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASSWORD=
```

## Frontend

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=...
VITE_SENTRY_DSN=
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PLAID=true
VITE_ENABLE_AI_RECOMMENDATIONS=true


---
