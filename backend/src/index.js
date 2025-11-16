import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import { connectDB } from './config/database.js';
import logger from './utils/logger.js';
import { metrics } from './utils/metrics.js';
import mongoose from 'mongoose';

dotenv.config();

// Initialize Sentry for error tracking (must be first!)
if (process.env.SENTRY_DSN_BACKEND) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN_BACKEND,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: express() }),
    ],
  });
  logger.info('Sentry initialized for error tracking');
} else {
  logger.warn('Sentry DSN not configured - error tracking disabled');
}

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Sentry request handler (must be first middleware)
if (process.env.SENTRY_DSN_BACKEND) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Allow specific frontend URL if set
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // In production, only allow specific origins
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('Not allowed by CORS'));
    }
    
    // Allow all in development
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging and metrics middleware
app.use((req, res, next) => {
  metrics.incrementRequests();
  logger.http(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  };
  
  // Return 200 if healthy, 503 if database is down
  const statusCode = healthCheck.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(metrics.getMetrics());
});

// Legacy health endpoint for backward compatibility
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InvestAgent API is running' });
});

// Auth routes
import authRoutes from './routes/auth.routes.js';
app.use('/api/auth', authRoutes);

// Portfolio routes
import portfolioRoutes from './routes/portfolio.routes.js';
app.use('/api/portfolios', portfolioRoutes);

// Sentry error handler (must be before other error handlers)
if (process.env.SENTRY_DSN_BACKEND) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handling middleware
app.use((err, req, res, next) => {
  metrics.incrementErrors();
  logger.error(`Error: ${err.message}`, { stack: err.stack, url: req.url });
  
  // Send error to Sentry if configured
  if (process.env.SENTRY_DSN_BACKEND) {
    Sentry.captureException(err);
  }
  
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Metrics: http://localhost:${PORT}/metrics`);
});

