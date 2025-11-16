# InvestAgent

A MERN stack application for investment analysis and insights.

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration (MongoDB URI, API keys, etc.)

5. Start development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
investagent/
├── backend/
│   ├── src/
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── store/
│   │   │   └── store.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Tech Stack

- **Backend**: Express.js (ES Modules), MongoDB (Mongoose)
- **Frontend**: React, Vite, Redux Toolkit, Chart.js
- **Future Integrations**: OpenAI, Pinecone

## Scripts

### Backend
- `npm run dev` - Start development server with watch mode
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

