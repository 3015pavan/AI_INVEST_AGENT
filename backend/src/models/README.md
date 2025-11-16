# Mongoose Models

This directory contains Mongoose models for the finance planner application.

## Models

### User Model (`user.model.js`)
- **Fields**: email, password, firstName, lastName, riskProfile
- **Enums**: `RiskProfile` (conservative, moderate, aggressive)
- **Indexes**: email (unique), compound index on email + riskProfile
- **Features**: Password excluded from JSON, fullName virtual

### Portfolio Model (`portfolio.model.js`)
- **Fields**: userId, name, description, holdings[], goals[], totalValue
- **Embedded Schemas**:
  - `Holding`: symbol, assetType, quantity, averagePrice, purchaseDate
  - `Goal`: name, description, targetAmount, currentAmount, targetDate, priority
- **Enums**: 
  - `AssetType` (stock, bond, etf, mutual_fund, crypto, commodity, real_estate, cash)
  - `GoalPriority` (low, medium, high, critical)
- **Indexes**: userId, compound index on userId + name (unique), holdings.symbol
- **Features**: Auto-calculates totalValue, virtuals for counts

### Transaction Model (`transaction.model.js`)
- **Fields**: userId, portfolioId, type, status, symbol, assetType, quantity, price, amount, fees, transactionDate, description
- **Enums**:
  - `TransactionType` (buy, sell, dividend, interest, deposit, withdrawal, transfer, fee)
  - `TransactionStatus` (pending, completed, failed, cancelled)
- **Indexes**: Multiple compound indexes for efficient queries
- **Features**: Auto-calculates amount from quantity * price, netAmount virtual

## Usage Example

```javascript
import { connectDB, User, Portfolio, Transaction } from './config/database.js';

// Connect to database
await connectDB();

// Create a user
const user = await User.create({
  email: 'user@example.com',
  password: 'hashedPassword123',
  firstName: 'John',
  lastName: 'Doe',
  riskProfile: 'moderate'
});

// Create a portfolio
const portfolio = await Portfolio.create({
  userId: user._id,
  name: 'My Investment Portfolio',
  holdings: [{
    symbol: 'AAPL',
    assetType: 'stock',
    quantity: 10,
    averagePrice: 150.00
  }],
  goals: [{
    name: 'Retirement Fund',
    targetAmount: 1000000,
    currentAmount: 50000,
    targetDate: new Date('2045-01-01'),
    priority: 'high'
  }]
});

// Create a transaction
const transaction = await Transaction.create({
  userId: user._id,
  portfolioId: portfolio._id,
  type: 'buy',
  status: 'completed',
  symbol: 'AAPL',
  assetType: 'stock',
  quantity: 5,
  price: 155.00,
  fees: 1.00
});

// Query with population
const portfolioWithUser = await Portfolio.findById(portfolio._id)
  .populate('userId', 'firstName lastName email');
```

