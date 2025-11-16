import dotenv from 'dotenv';
import { connectDB } from '../src/config/database.js';
import { Portfolio } from '../src/models/portfolio.model.js';
import marketService from '../src/services/market.service.js';

dotenv.config();

/**
 * CLI script to sync holdings for a portfolio
 * Usage: node scripts/syncHoldings.js <portfolioId>
 */
async function syncHoldings(portfolioId) {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Find portfolio
    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio) {
      console.error(`Portfolio with ID ${portfolioId} not found`);
      process.exit(1);
    }

    console.log(`Syncing holdings for portfolio: ${portfolio.name}`);
    console.log(`Holdings count: ${portfolio.holdings.length}`);

    if (portfolio.holdings.length === 0) {
      console.log('No holdings to sync');
      process.exit(0);
    }

    // Enrich holdings with market data
    const enrichedHoldings = await marketService.enrichHoldings(portfolio.holdings);

    // Update portfolio holdings
    portfolio.holdings = enrichedHoldings;

    // Recalculate total value
    portfolio.calculateTotalValue();

    // Save portfolio
    await portfolio.save();

    console.log('\n✅ Holdings synced successfully!');
    console.log('\nUpdated Holdings:');
    enrichedHoldings.forEach((holding, index) => {
      console.log(`\n${index + 1}. ${holding.symbol}`);
      console.log(`   Quantity: ${holding.quantity}`);
      console.log(`   Average Price: $${holding.averagePrice?.toFixed(2)}`);
      console.log(`   Current Price: ${holding.currentPrice ? `$${holding.currentPrice.toFixed(2)}` : 'N/A'}`);
      if (holding.unrealizedPnL !== null) {
        const pnlSign = holding.unrealizedPnL >= 0 ? '+' : '';
        console.log(`   Unrealized P&L: ${pnlSign}$${holding.unrealizedPnL.toFixed(2)} (${pnlSign}${holding.unrealizedPnLPercent?.toFixed(2)}%)`);
      }
    });

    console.log(`\nTotal Portfolio Value: $${portfolio.totalValue.toFixed(2)}`);

    process.exit(0);
  } catch (error) {
    console.error('Error syncing holdings:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Get portfolio ID from command line arguments
const portfolioId = process.argv[2];

if (!portfolioId) {
  console.error('Usage: node scripts/syncHoldings.js <portfolioId>');
  console.error('Example: node scripts/syncHoldings.js 507f1f77bcf86cd799439011');
  process.exit(1);
}

syncHoldings(portfolioId);

