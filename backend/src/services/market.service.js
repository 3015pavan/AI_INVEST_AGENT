import axios from 'axios';

/**
 * Market Data Service with pluggable providers
 * Supports Yahoo Finance and Alpaca
 */
class MarketService {
  constructor() {
    // Read provider from env each time to support dynamic changes
    this.getProvider = () => process.env.MARKET_PROVIDER || 'yahoo';
    this.retryConfig = {
      maxRetries: parseInt(process.env.MARKET_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.MARKET_RETRY_DELAY || '1000'),
      backoffMultiplier: parseFloat(process.env.MARKET_BACKOFF_MULTIPLIER || '2'),
    };
  }

  get provider() {
    return this.getProvider();
  }

  /**
   * Retry wrapper with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {number} retries - Number of retries remaining
   * @param {number} delay - Current delay in ms
   * @returns {Promise} Result of function
   */
  async retryWithBackoff(fn, retries = this.retryConfig.maxRetries, delay = this.retryConfig.retryDelay) {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }

      console.warn(`Market service retry (${retries} remaining): ${error.message}`);
      await this.sleep(delay);
      return this.retryWithBackoff(fn, retries - 1, delay * this.retryConfig.backoffMultiplier);
    }
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get quotes from Yahoo Finance
   * @param {string[]} symbols - Array of stock symbols
   * @returns {Promise<Object>} { symbol: { price, timestamp } }
   */
  async getQuotesYahoo(symbols) {
    if (!symbols || symbols.length === 0) {
      return {};
    }

    // Yahoo Finance API endpoint (using yahoo-finance2 compatible endpoint)
    const symbolsParam = symbols.join(',');
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbolsParam}`;

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const quotes = {};
    const results = response.data?.chart?.result || [];

    results.forEach((result) => {
      const symbol = result.meta?.symbol;
      const price = result.meta?.regularMarketPrice;
      const timestamp = result.meta?.regularMarketTime;

      if (symbol && price !== undefined) {
        quotes[symbol] = {
          price: parseFloat(price),
          timestamp: timestamp ? new Date(timestamp * 1000) : new Date(),
        };
      }
    });

    return quotes;
  }

  /**
   * Get quotes from Alpaca
   * @param {string[]} symbols - Array of stock symbols
   * @returns {Promise<Object>} { symbol: { price, timestamp } }
   */
  async getQuotesAlpaca(symbols) {
    if (!symbols || symbols.length === 0) {
      return {};
    }

    const apiKey = process.env.ALPACA_API_KEY;
    const apiSecret = process.env.ALPACA_SECRET;
    const baseUrl = process.env.ALPACA_BASE_URL || 'https://data.alpaca.markets/v2';

    if (!apiKey || !apiSecret) {
      throw new Error('Alpaca API credentials not configured');
    }

    const symbolsParam = symbols.join(',');
    const url = `${baseUrl}/stocks/quotes/latest?symbols=${symbolsParam}`;

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
      },
    });

    const quotes = {};
    const quotesData = response.data?.quotes || {};

    Object.entries(quotesData).forEach(([symbol, quoteData]) => {
      if (quoteData && quoteData.bp && quoteData.ap) {
        // Use mid price (bid + ask) / 2
        const price = (quoteData.bp + quoteData.ap) / 2;
        quotes[symbol] = {
          price: parseFloat(price),
          timestamp: quoteData.t ? new Date(quoteData.t) : new Date(),
        };
      }
    });

    return quotes;
  }

  /**
   * Get quotes for symbols using configured provider
   * @param {string[]} symbols - Array of stock symbols
   * @returns {Promise<Object>} { symbol: { price, timestamp } }
   */
  async getQuotes(symbols) {
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return {};
    }

    // Remove duplicates and normalize symbols
    const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase().trim()))].filter(Boolean);

    if (uniqueSymbols.length === 0) {
      return {};
    }

    const getQuotesFn = this.provider === 'alpaca' 
      ? () => this.getQuotesAlpaca(uniqueSymbols)
      : () => this.getQuotesYahoo(uniqueSymbols);

    try {
      return await this.retryWithBackoff(getQuotesFn);
    } catch (error) {
      console.error(`Error fetching quotes from ${this.provider}:`, error.message);
      throw new Error(`Failed to fetch market data: ${error.message}`);
    }
  }

  /**
   * Enrich holdings with current prices and unrealized P&L
   * @param {Array} holdings - Array of holding objects with symbol, quantity, averagePrice
   * @returns {Promise<Array>} Holdings with currentPrice and unrealizedPnL
   */
  async enrichHoldings(holdings) {
    if (!Array.isArray(holdings) || holdings.length === 0) {
      return [];
    }

    // Extract unique symbols
    const symbols = holdings.map(h => h.symbol).filter(Boolean);
    
    if (symbols.length === 0) {
      return holdings.map(h => ({
        ...h,
        currentPrice: null,
        unrealizedPnL: null,
        unrealizedPnLPercent: null,
      }));
    }

    // Get current quotes
    const quotes = await this.getQuotes(symbols);

    // Enrich holdings with current prices and P&L
    return holdings.map(holding => {
      const quote = quotes[holding.symbol?.toUpperCase()];
      const currentPrice = quote?.price || null;
      
      let unrealizedPnL = null;
      let unrealizedPnLPercent = null;

      if (currentPrice !== null && holding.averagePrice && holding.quantity) {
        const costBasis = holding.averagePrice * holding.quantity;
        const currentValue = currentPrice * holding.quantity;
        unrealizedPnL = currentValue - costBasis;
        unrealizedPnLPercent = holding.averagePrice > 0 
          ? ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100 
          : 0;
      }

      return {
        ...holding,
        currentPrice,
        unrealizedPnL,
        unrealizedPnLPercent: unrealizedPnLPercent !== null ? parseFloat(unrealizedPnLPercent.toFixed(2)) : null,
        lastUpdated: quote?.timestamp || new Date(),
      };
    });
  }
}

export default new MarketService();

