import express from 'express';
import {
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  syncMarketData,
  generateInvestmentPlan,
} from '../controllers/portfolio.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/portfolios
 * @desc    Get all portfolios for authenticated user
 * @access  Private
 */
router.get('/', getPortfolios);

/**
 * @route   POST /api/portfolios
 * @desc    Create a new portfolio
 * @access  Private
 */
router.post('/', createPortfolio);

/**
 * @route   GET /api/portfolios/:id
 * @desc    Get a single portfolio by ID
 * @access  Private
 */
router.get('/:id', getPortfolio);

/**
 * @route   PUT /api/portfolios/:id
 * @desc    Update a portfolio
 * @access  Private
 */
router.put('/:id', updatePortfolio);

/**
 * @route   DELETE /api/portfolios/:id
 * @desc    Delete a portfolio
 * @access  Private
 */
router.delete('/:id', deletePortfolio);

/**
 * @route   POST /api/portfolios/:id/sync
 * @desc    Sync portfolio with market data
 * @access  Private
 */
router.post('/:id/sync', syncMarketData);

/**
 * @route   POST /api/portfolios/:id/generate-plan
 * @desc    Generate investment plan using AI agent
 * @access  Private
 */
router.post('/:id/generate-plan', generateInvestmentPlan);

export default router;

