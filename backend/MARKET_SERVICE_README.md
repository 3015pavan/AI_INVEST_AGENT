# Market Data Service

Pluggable market data service supporting Yahoo Finance and Alpaca providers.

## Configuration

Add to your `.env` file:

```env
# Market Provider: 'yahoo' or 'alpaca'
MARKET_PROVIDER=yahoo

# Retry Configuration
MARKET_MAX_RETRIES=3
MARKET_RETRY_DELAY=1000
MARKET_BACKOFF_MULTIPLIER=2

# Alpaca API (if using Alpaca provider)
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET=your_alpaca_secret
ALPACA_BASE_URL=https://data.alpaca.markets/v2
```

## Usage

### Get Quotes

```javascript
import marketService from './services/market.service.js';

// Get current prices for symbols
const quotes = await marketService.getQuotes(['AAPL', 'GOOGL', 'MSFT']);
// Returns: { AAPL: { price: 150.50, timestamp: Date }, ... }
```

### Enrich Holdings

```javascript
const holdings = [
  { symbol: 'AAPL', quantity: 10, averagePrice: 150.00 },
  { symbol: 'GOOGL', quantity: 5, averagePrice: 2800.00 },
];

const enriched = await marketService.enrichHoldings(holdings);
// Returns holdings with: currentPrice, unrealizedPnL, unrealizedPnLPercent
```

## CLI Script

Sync holdings for a portfolio:

```bash
npm run sync-holdings <portfolioId>
```

Or directly:

```bash
node scripts/syncHoldings.js <portfolioId>
```

Example:
```bash
node scripts/syncHoldings.js 507f1f77bcf86cd799439011
```

## API Integration

The portfolio sync endpoint automatically uses the market service:

```bash
POST /api/portfolios/:id/sync
Authorization: Bearer <token>
```

## Providers

### Yahoo Finance (Default)
- No API key required
- Free to use
- Rate limits may apply

### Alpaca
- Requires API credentials
- More reliable for production
- Better rate limits
- Set `MARKET_PROVIDER=alpaca` in `.env`

## Retry Logic

The service includes automatic retry with exponential backoff:
- Default: 3 retries
- Initial delay: 1000ms
- Backoff multiplier: 2x

Configurable via environment variables.

## Testing

Run tests:

```bash
npm test market.service.test.js
```

Tests mock axios responses and verify:
- Quote fetching for both providers
- Retry logic
- Holdings enrichment
- Error handling

