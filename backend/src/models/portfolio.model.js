import mongoose from 'mongoose';

/**
 * @typedef {Object} Holding
 * @property {string} symbol - Stock/asset symbol (required)
 * @property {string} assetType - Type of asset
 * @property {number} quantity - Number of shares/units (required)
 * @property {number} averagePrice - Average purchase price per unit (required)
 * @property {Date} purchaseDate - Date of first purchase
 */

/**
 * Asset type enumeration
 * @enum {string}
 */
export const AssetType = {
  STOCK: 'stock',
  BOND: 'bond',
  ETF: 'etf',
  MUTUAL_FUND: 'mutual_fund',
  CRYPTO: 'crypto',
  COMMODITY: 'commodity',
  REAL_ESTATE: 'real_estate',
  CASH: 'cash',
};

/**
 * Holding subdocument schema
 */
const holdingSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      uppercase: true,
      trim: true,
      maxlength: [20, 'Symbol cannot exceed 20 characters'],
    },
    assetType: {
      type: String,
      enum: {
        values: Object.values(AssetType),
        message: 'Asset type must be one of the valid types',
      },
      required: [true, 'Asset type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    averagePrice: {
      type: Number,
      required: [true, 'Average price is required'],
      min: [0, 'Average price cannot be negative'],
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true, // Allow individual holding IDs
  }
);

/**
 * @typedef {Object} Goal
 * @property {string} name - Goal name (required)
 * @property {string} description - Goal description
 * @property {number} targetAmount - Target amount to achieve (required)
 * @property {number} currentAmount - Current amount saved
 * @property {Date} targetDate - Target completion date
 * @property {string} priority - Goal priority level
 */

/**
 * Goal priority enumeration
 * @enum {string}
 */
export const GoalPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Goal subdocument schema
 */
const goalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [100, 'Goal name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0, 'Target amount cannot be negative'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    targetDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > new Date();
        },
        message: 'Target date must be in the future',
      },
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(GoalPriority),
        message: 'Priority must be one of: low, medium, high, critical',
      },
      default: GoalPriority.MEDIUM,
    },
    allocationAdvice: {
      type: {
        recommendedAllocation: {
          stocks: Number,
          bonds: Number,
          cash: Number,
        },
        reasoning: String,
        generatedAt: Date,
      },
      default: null,
    },
  },
  {
    _id: true,
  }
);

/**
 * @typedef {Object} Portfolio
 * @property {mongoose.Types.ObjectId} userId - Reference to User (required)
 * @property {string} name - Portfolio name (required)
 * @property {string} description - Portfolio description
 * @property {Holding[]} holdings - Array of holdings
 * @property {Goal[]} goals - Array of financial goals
 * @property {number} totalValue - Total portfolio value (calculated)
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Portfolio name is required'],
      trim: true,
      maxlength: [100, 'Portfolio name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    holdings: {
      type: [holdingSchema],
      default: [],
    },
    goals: {
      type: [goalSchema],
      default: [],
    },
    totalValue: {
      type: Number,
      default: 0,
      min: [0, 'Total value cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user portfolios
portfolioSchema.index({ userId: 1, name: 1 }, { unique: true });

// Index for holdings symbol lookup
portfolioSchema.index({ 'holdings.symbol': 1 });

// Virtual for total holdings count
portfolioSchema.virtual('holdingsCount').get(function () {
  return this.holdings.length;
});

// Virtual for total goals count
portfolioSchema.virtual('goalsCount').get(function () {
  return this.goals.length;
});

// Method to calculate total portfolio value
portfolioSchema.methods.calculateTotalValue = function () {
  const holdingsValue = this.holdings.reduce((total, holding) => {
    return total + holding.quantity * holding.averagePrice;
  }, 0);
  this.totalValue = holdingsValue;
  return holdingsValue;
};

// Pre-save hook to calculate total value
portfolioSchema.pre('save', function (next) {
  this.calculateTotalValue();
  next();
});

// Ensure virtuals are included in JSON output
portfolioSchema.set('toJSON', {
  virtuals: true,
});

/**
 * Portfolio model
 * @type {mongoose.Model<Portfolio>}
 */
export const Portfolio = mongoose.model('Portfolio', portfolioSchema);

