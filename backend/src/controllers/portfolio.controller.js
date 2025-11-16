import portfolioService from '../services/portfolio.service.js';

/**
 * Get all portfolios for the authenticated user
 * @route GET /api/portfolios
 */
export const getPortfolios = async (req, res) => {
  try {
    const userId = req.user.userId;
    const portfolios = await portfolioService.getPortfolios(userId);
    
    res.json({
      success: true,
      count: portfolios.length,
      data: portfolios,
    });
  } catch (error) {
    console.error('Get portfolios error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get a single portfolio by ID
 * @route GET /api/portfolios/:id
 */
export const getPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const portfolio = await portfolioService.getPortfolioById(id, userId);
    
    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    if (error.message === 'Portfolio not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create a new portfolio
 * @route POST /api/portfolios
 */
export const createPortfolio = async (req, res) => {
  try {
    const { name, description, holdings, goals } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio name is required',
      });
    }

    const portfolio = await portfolioService.createPortfolio(userId, {
      name,
      description,
      holdings: holdings || [],
      goals: goals || [],
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: portfolio,
    });
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update a portfolio
 * @route PUT /api/portfolios/:id
 */
export const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.userId;
    delete updateData._id;

    const portfolio = await portfolioService.updatePortfolio(
      id,
      userId,
      updateData
    );

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: portfolio,
    });
  } catch (error) {
    if (error.message === 'Portfolio not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete a portfolio
 * @route DELETE /api/portfolios/:id
 */
export const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    await portfolioService.deletePortfolio(id, userId);

    res.json({
      success: true,
      message: 'Portfolio deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Portfolio not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Sync portfolio with market data
 * @route POST /api/portfolios/:id/sync
 */
export const syncMarketData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const portfolio = await portfolioService.syncMarketData(id, userId);

    res.json({
      success: true,
      message: 'Market data synced successfully',
      data: portfolio,
    });
  } catch (error) {
    if (error.message === 'Portfolio not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Sync market data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing market data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Generate investment plan using AI agent
 * @route POST /api/portfolios/:id/generate-plan
 */
export const generateInvestmentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { goalId } = req.body;
    const userId = req.user.userId;

    if (!goalId) {
      return res.status(400).json({
        success: false,
        message: 'Goal ID is required',
      });
    }

    const portfolio = await portfolioService.generateInvestmentPlan(
      id,
      userId,
      goalId
    );

    res.json({
      success: true,
      message: 'Investment plan generated successfully',
      data: portfolio,
    });
  } catch (error) {
    if (error.message === 'Portfolio not found' || error.message === 'Goal not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Generate investment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating investment plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

