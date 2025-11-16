import axios from 'axios';
import { jest } from '@jest/globals';
import marketService from '../services/market.service.js';

// Mock axios - using manual mock for ES modules
const mockAxiosGet = jest.fn();
axios.get = mockAxiosGet;

describe('Market Service', () => {
  beforeEach(() => {
    mockAxiosGet.mockClear();
    // Reset environment variables
    delete process.env.MARKET_PROVIDER;
    delete process.env.ALPACA_API_KEY;
    delete process.env.ALPACA_SECRET;
  });

  describe('getQuotes - Yahoo Finance', () => {
    it('should fetch quotes from Yahoo Finance successfully', async () => {
      const mockResponse = {
        data: {
          chart: {
            result: [
              {
                meta: {
                  symbol: 'AAPL',
                  regularMarketPrice: 150.50,
                  regularMarketTime: 1638360000,
                },
              },
              {
                meta: {
                  symbol: 'GOOGL',
                  regularMarketPrice: 2800.75,
                  regularMarketTime: 1638360000,
                },
              },
            ],
          },
        },
      };

      mockAxiosGet.mockResolvedValue(mockResponse);

      const quotes = await marketService.getQuotes(['AAPL', 'GOOGL']);

      expect(quotes).toEqual({
        AAPL: {
          price: 150.50,
          timestamp: expect.any(Date),
        },
        GOOGL: {
          price: 2800.75,
          timestamp: expect.any(Date),
        },
      });

      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining('yahoo.com'),
        expect.objectContaining({
          timeout: 10000,
        })
      );
    });

    it('should handle empty symbols array', async () => {
      const quotes = await marketService.getQuotes([]);
      expect(quotes).toEqual({});
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('should remove duplicates and normalize symbols', async () => {
      const mockResponse = {
        data: {
          chart: {
            result: [
              {
                meta: {
                  symbol: 'AAPL',
                  regularMarketPrice: 150.50,
                  regularMarketTime: 1638360000,
                },
              },
            ],
          },
        },
      };

      mockAxiosGet.mockResolvedValue(mockResponse);

      await marketService.getQuotes(['AAPL', 'aapl', 'AAPL ', '  aapl  ']);

      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet.mock.calls[0][0]).toContain('AAPL');
    });

    it('should retry on failure with exponential backoff', async () => {
      mockAxiosGet
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            chart: {
              result: [
                {
                  meta: {
                    symbol: 'AAPL',
                    regularMarketPrice: 150.50,
                    regularMarketTime: 1638360000,
                  },
                },
              ],
            },
          },
        });

      const quotes = await marketService.getQuotes(['AAPL']);

      expect(quotes).toEqual({
        AAPL: {
          price: 150.50,
          timestamp: expect.any(Date),
        },
      });

      expect(mockAxiosGet).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await expect(marketService.getQuotes(['AAPL'])).rejects.toThrow('Failed to fetch market data');
    }, 15000); // Increase timeout for retry test
  });

  describe('getQuotes - Alpaca', () => {
    let originalProvider;
    let originalKey;
    let originalSecret;

    beforeEach(() => {
      originalProvider = process.env.MARKET_PROVIDER;
      originalKey = process.env.ALPACA_API_KEY;
      originalSecret = process.env.ALPACA_SECRET;
      process.env.MARKET_PROVIDER = 'alpaca';
      process.env.ALPACA_API_KEY = 'test-key';
      process.env.ALPACA_SECRET = 'test-secret';
    });

    afterEach(() => {
      if (originalProvider !== undefined) {
        process.env.MARKET_PROVIDER = originalProvider;
      } else {
        delete process.env.MARKET_PROVIDER;
      }
      if (originalKey !== undefined) {
        process.env.ALPACA_API_KEY = originalKey;
      } else {
        delete process.env.ALPACA_API_KEY;
      }
      if (originalSecret !== undefined) {
        process.env.ALPACA_SECRET = originalSecret;
      } else {
        delete process.env.ALPACA_SECRET;
      }
    });

    it('should fetch quotes from Alpaca successfully', async () => {
      const mockResponse = {
        data: {
          quotes: {
            AAPL: {
              bp: 150.00, // bid price
              ap: 151.00, // ask price
              t: '2023-12-01T10:00:00Z',
            },
            GOOGL: {
              bp: 2800.00,
              ap: 2801.00,
              t: '2023-12-01T10:00:00Z',
            },
          },
        },
      };

      axios.get.mockResolvedValue(mockResponse);

      // The service reads provider from env dynamically, so it should work
      const quotes = await marketService.getQuotes(['AAPL', 'GOOGL']);

      expect(quotes).toEqual({
        AAPL: {
          price: 150.50, // (150 + 151) / 2
          timestamp: expect.any(Date),
        },
        GOOGL: {
          price: 2800.50, // (2800 + 2801) / 2
          timestamp: expect.any(Date),
        },
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('alpaca.markets'),
        expect.objectContaining({
          headers: {
            'APCA-API-KEY-ID': 'test-key',
            'APCA-API-SECRET-KEY': 'test-secret',
          },
        })
      );
    });

    it('should throw error if Alpaca credentials not configured', async () => {
      delete process.env.ALPACA_API_KEY;
      delete process.env.ALPACA_SECRET;

      await expect(marketService.getQuotes(['AAPL'])).rejects.toThrow('Alpaca API credentials not configured');
    });
  });

  describe('enrichHoldings', () => {
    beforeEach(() => {
      process.env.MARKET_PROVIDER = 'yahoo';
    });

    it('should enrich holdings with current prices and P&L', async () => {
      const holdings = [
        {
          symbol: 'AAPL',
          quantity: 10,
          averagePrice: 150.00,
        },
        {
          symbol: 'GOOGL',
          quantity: 5,
          averagePrice: 2800.00,
        },
      ];

      const mockResponse = {
        data: {
          chart: {
            result: [
              {
                meta: {
                  symbol: 'AAPL',
                  regularMarketPrice: 155.00, // +5 from average
                  regularMarketTime: 1638360000,
                },
              },
              {
                meta: {
                  symbol: 'GOOGL',
                  regularMarketPrice: 2750.00, // -50 from average
                  regularMarketTime: 1638360000,
                },
              },
            ],
          },
        },
      };

      mockAxiosGet.mockResolvedValue(mockResponse);

      const enriched = await marketService.enrichHoldings(holdings);

      expect(enriched).toHaveLength(2);

      // AAPL: bought at 150, now 155, quantity 10
      // P&L = (155 - 150) * 10 = 50
      // P&L % = (155 - 150) / 150 * 100 = 3.33%
      expect(enriched[0]).toMatchObject({
        symbol: 'AAPL',
        quantity: 10,
        averagePrice: 150.00,
        currentPrice: 155.00,
        unrealizedPnL: 50.00,
        unrealizedPnLPercent: 3.33,
      });

      // GOOGL: bought at 2800, now 2750, quantity 5
      // P&L = (2750 - 2800) * 5 = -250
      // P&L % = (2750 - 2800) / 2800 * 100 = -1.79%
      expect(enriched[1]).toMatchObject({
        symbol: 'GOOGL',
        quantity: 5,
        averagePrice: 2800.00,
        currentPrice: 2750.00,
        unrealizedPnL: -250.00,
        unrealizedPnLPercent: -1.79,
      });
    });

    it('should handle holdings with missing quotes', async () => {
      const holdings = [
        {
          symbol: 'AAPL',
          quantity: 10,
          averagePrice: 150.00,
        },
        {
          symbol: 'UNKNOWN',
          quantity: 5,
          averagePrice: 100.00,
        },
      ];

      const mockResponse = {
        data: {
          chart: {
            result: [
              {
                meta: {
                  symbol: 'AAPL',
                  regularMarketPrice: 155.00,
                  regularMarketTime: 1638360000,
                },
              },
            ],
          },
        },
      };

      mockAxiosGet.mockResolvedValue(mockResponse);

      const enriched = await marketService.enrichHoldings(holdings);

      expect(enriched[0].currentPrice).toBe(155.00);
      expect(enriched[1].currentPrice).toBeNull();
      expect(enriched[1].unrealizedPnL).toBeNull();
    });

    it('should handle empty holdings array', async () => {
      const enriched = await marketService.enrichHoldings([]);
      expect(enriched).toEqual([]);
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('should handle holdings without required fields', async () => {
      const holdings = [
        {
          symbol: 'AAPL',
          // Missing quantity and averagePrice
        },
      ];

      const mockResponse = {
        data: {
          chart: {
            result: [
              {
                meta: {
                  symbol: 'AAPL',
                  regularMarketPrice: 155.00,
                  regularMarketTime: 1638360000,
                },
              },
            ],
          },
        },
      };

      mockAxiosGet.mockResolvedValue(mockResponse);

      const enriched = await marketService.enrichHoldings(holdings);

      expect(enriched[0].currentPrice).toBe(155.00);
      expect(enriched[0].unrealizedPnL).toBeNull();
    });
  });
});

