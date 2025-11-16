import { Portfolio } from '../models/portfolio.model.js';
import marketService from './market.service.js';
import agentService from './agent.service.js';

/**
 * Portfolio Service - Business logic for portfolio operations
 */
class PortfolioService {
  /**
   * Get all portfolios (no user filtering)
   * @returns {Promise<Array>} Array of portfolios
   */
  async getAllPortfolios() {
    return await Portfolio.find({}).sort({ createdAt: -1 });
  }

  /**
   * Get all portfolios for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of portfolios
   */
  async getPortfolios(userId) {
    return await Portfolio.find({ userId }).sort({ createdAt: -1 });
  }

  // Alias for backward compatibility
  async getUserPortfolios(userId) {
    return this.getPortfolios(userId);
  }

  /**
   * Get a single portfolio by ID
   * @param {string} portfolioId - Portfolio ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Portfolio document
   * @throws {Error} If portfolio not found or doesn't belong to user
   */
  async getPortfolioById(portfolioId, userId = null) {
    const query = userId ? { _id: portfolioId, userId } : { _id: portfolioId };
    const portfolio = await Portfolio.findOne(query);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }
    return portfolio;
  }

  /**
   * Create a new portfolio
   * @param {string} userId - User ID
   * @param {Object} portfolioData - Portfolio data
   * @returns {Promise<Object>} Created portfolio
   */
  async createPortfolio(userId, portfolioData) {
    const portfolio = await Portfolio.create({
      userId,
      ...portfolioData,
    });
    return portfolio;
  }

  /**
   * Update a portfolio
   * @param {string} portfolioId - Portfolio ID
   * @param {string} userId - User ID (for authorization)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated portfolio
   * @throws {Error} If portfolio not found or doesn't belong to user
   */
  async updatePortfolio(portfolioId, userId = null, updateData) {
    const query = userId ? { _id: portfolioId, userId } : { _id: portfolioId };
    const portfolio = await Portfolio.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    );

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    return portfolio;
  }

  /**
   * Delete a portfolio
   * @param {string} portfolioId - Portfolio ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<boolean>} True if deleted
   * @throws {Error} If portfolio not found or doesn't belong to user
   */
  async deletePortfolio(portfolioId, userId = null) {
    const query = userId ? { _id: portfolioId, userId } : { _id: portfolioId };
    const result = await Portfolio.findOneAndDelete(query);
    if (!result) {
      throw new Error('Portfolio not found');
    }
    return true;
  }

  /**
   * Sync portfolio with market data
   * @param {string} portfolioId - Portfolio ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Updated portfolio with synced data
   * @throws {Error} If portfolio not found or sync fails
   */
  async syncMarketData(portfolioId, userId) {
    // Verify portfolio exists and belongs to user
    const portfolio = await this.getPortfolioById(portfolioId, userId);

    if (!portfolio.holdings || portfolio.holdings.length === 0) {
      return portfolio;
    }

    // Enrich holdings with current market data
    const enrichedHoldings = await marketService.enrichHoldings(portfolio.holdings);
    
    // Update portfolio holdings
    portfolio.holdings = enrichedHoldings;
    
    // Recalculate totalValue using current prices if available
    const totalValue = enrichedHoldings.reduce((total, holding) => {
      if (holding.currentPrice && holding.quantity) {
        return total + (holding.currentPrice * holding.quantity);
      } else if (holding.averagePrice && holding.quantity) {
        // Fallback to average price if current price not available
        return total + (holding.averagePrice * holding.quantity);
      }
      return total;
    }, 0);
    
    portfolio.totalValue = totalValue;
    await portfolio.save();

    return portfolio;
  }

  /**
   * Generate investment plan using AI agent
   * @param {string} portfolioId - Portfolio ID
   * @param {string} userId - User ID (for authorization)
   * @param {string} goalId - Goal ID to generate plan for
   * @returns {Promise<Object>} Updated portfolio with allocationAdvice on goal
   * @throws {Error} If portfolio/goal not found or generation fails
   */
  async generateInvestmentPlan(portfolioId, userId = null, goalId) {
    // Verify portfolio exists
    const portfolio = await this.getPortfolioById(portfolioId, userId);

    // Find the goal
    const goal = portfolio.goals.id(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    // Use default user data if no userId
    let userData = { riskProfile: 'moderate' };
    if (userId) {
      const { User } = await import('../models/user.model.js');
      const user = await User.findById(userId);
      if (user) {
        userData = { riskProfile: user.riskProfile };
      }
    }

    // Prepare data for AI agent
    const portfolioData = {
      holdings: portfolio.holdings,
      totalValue: portfolio.totalValue,
    };

    const goalData = {
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
      priority: goal.priority,
    };

    // Call AI agent service
    const plan = await agentService.generateInvestmentPlan(
      portfolioData,
      goalData,
      userData
    );

    // Update goal with allocation advice
    goal.allocationAdvice = {
      recommendedAllocation: plan.allocations,
      trades: plan.trades,
      explanation: plan.explanation,
      riskConsiderations: plan.riskConsiderations,
      generatedAt: new Date(),
    };

    await portfolio.save();

    return portfolio;
  }
}

export default new PortfolioService();

