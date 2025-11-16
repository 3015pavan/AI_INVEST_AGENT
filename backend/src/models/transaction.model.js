import mongoose from 'mongoose';

/**
 * Transaction type enumeration
 * @enum {string}
 */
export const TransactionType = {
  BUY: 'buy',
  SELL: 'sell',
  DIVIDEND: 'dividend',
  INTEREST: 'interest',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  FEE: 'fee',
};

/**
 * Transaction status enumeration
 * @enum {string}
 */
export const TransactionStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

/**
 * @typedef {Object} Transaction
 * @property {mongoose.Types.ObjectId} userId - Reference to User (required)
 * @property {mongoose.Types.ObjectId} portfolioId - Reference to Portfolio
 * @property {string} type - Type of transaction (required)
 * @property {string} status - Transaction status
 * @property {string} symbol - Asset symbol (required for buy/sell)
 * @property {string} assetType - Type of asset
 * @property {number} quantity - Number of shares/units
 * @property {number} price - Price per unit
 * @property {number} amount - Total transaction amount (required)
 * @property {number} fees - Transaction fees
 * @property {Date} transactionDate - Date of transaction (required)
 * @property {string} description - Transaction description/notes
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: Object.values(TransactionType),
        message: 'Transaction type must be one of the valid types',
      },
      required: [true, 'Transaction type is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TransactionStatus),
        message: 'Transaction status must be one of the valid statuses',
      },
      default: TransactionStatus.COMPLETED,
      index: true,
    },
    symbol: {
      type: String,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Symbol cannot exceed 20 characters'],
    },
    assetType: {
      type: String,
      enum: {
        values: [
          'stock',
          'bond',
          'etf',
          'mutual_fund',
          'crypto',
          'commodity',
          'real_estate',
          'cash',
        ],
        message: 'Asset type must be one of the valid types',
      },
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
      validate: {
        validator: function (value) {
          // Quantity required for buy/sell transactions
          if (['buy', 'sell'].includes(this.type)) {
            return value != null && value > 0;
          }
          return true;
        },
        message: 'Quantity is required for buy/sell transactions',
      },
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function (value) {
          // Price required for buy/sell transactions
          if (['buy', 'sell'].includes(this.type)) {
            return value != null && value > 0;
          }
          return true;
        },
        message: 'Price is required for buy/sell transactions',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      validate: {
        validator: function (value) {
          return value !== 0;
        },
        message: 'Transaction amount cannot be zero',
      },
    },
    fees: {
      type: Number,
      default: 0,
      min: [0, 'Fees cannot be negative'],
    },
    transactionDate: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, type: 1, transactionDate: -1 });
transactionSchema.index({ portfolioId: 1, transactionDate: -1 });
transactionSchema.index({ symbol: 1, transactionDate: -1 });

// Virtual for net amount (amount - fees)
transactionSchema.virtual('netAmount').get(function () {
  return this.amount - (this.fees || 0);
});

// Pre-save validation: calculate amount from quantity * price if not provided
transactionSchema.pre('save', function (next) {
  if (['buy', 'sell'].includes(this.type) && this.quantity && this.price) {
    if (!this.amount || this.amount === 0) {
      this.amount = this.quantity * this.price;
    }
  }
  next();
});

// Ensure virtuals are included in JSON output
transactionSchema.set('toJSON', {
  virtuals: true,
});

/**
 * Transaction model
 * @type {mongoose.Model<Transaction>}
 */
export const Transaction = mongoose.model('Transaction', transactionSchema);

