import nock from 'nock';
import axios from 'axios';
import agentService from '../services/agent.service.js';

// Mock axios for nock
axios.defaults.adapter = require('axios/lib/adapters/http');

describe('Agent Service', () => {
  const openaiBaseURL = 'https://api.openai.com';
  const mockApiKey = 'sk-test-key-12345';

  beforeEach(() => {
    nock.cleanAll();
    process.env.OPENAI_API_KEY = mockApiKey;
    process.env.OPENAI_MODEL = 'gpt-4o-mini';
    delete process.env.OPENAI_MAX_RETRIES;
    delete process.env.OPENAI_TIMEOUT;
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('generateInvestmentPlan', () => {
    const mockPortfolioData = {
      holdings: [
        { symbol: 'AAPL', quantity: 10, averagePrice: 150 },
        { symbol: 'GOOGL', quantity: 5, averagePrice: 2800 },
      ],
      totalValue: 50000,
    };

    const mockGoalData = {
      name: 'Retirement',
      targetAmount: 1000000,
      currentAmount: 50000,
      targetDate: new Date('2045-01-01'),
      priority: 'high',
    };

    const mockUserData = {
      riskProfile: 'moderate',
    };

    it('should generate investment plan with valid JSON response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                allocations: {
                  stocks: 60,
                  bonds: 30,
                  cash: 10,
                  other: 0,
                },
                trades: [
                  {
                    action: 'buy',
                    symbol: 'VTI',
                    quantity: 20,
                    reason: 'Increase broad market exposure',
                  },
                  {
                    action: 'sell',
                    symbol: 'AAPL',
                    quantity: 5,
                    reason: 'Reduce concentration',
                  },
                ],
                explanation: 'Based on your moderate risk profile, a 60/30/10 allocation is recommended.',
                riskConsiderations: 'Market volatility may impact short-term performance.',
              }),
            },
          },
        ],
      };

      nock(openaiBaseURL)
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      const result = await agentService.generateInvestmentPlan(
        mockPortfolioData,
        mockGoalData,
        mockUserData
      );

      expect(result).toHaveProperty('allocations');
      expect(result).toHaveProperty('trades');
      expect(result).toHaveProperty('explanation');
      expect(result).toHaveProperty('riskConsiderations');
      expect(result).toHaveProperty('rawText');

      expect(result.allocations.stocks).toBe(60);
      expect(result.allocations.bonds).toBe(30);
      expect(result.allocations.cash).toBe(10);
      expect(result.trades).toHaveLength(2);
      expect(result.trades[0].action).toBe('buy');
      expect(result.trades[0].symbol).toBe('VTI');
    });

    it('should extract JSON from markdown code block', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '```json\n' + JSON.stringify({
                allocations: { stocks: 70, bonds: 20, cash: 10, other: 0 },
                trades: [],
                explanation: 'Test explanation',
                riskConsiderations: 'Test risks',
              }) + '\n```',
            },
          },
        ],
      };

      nock(openaiBaseURL)
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      const result = await agentService.generateInvestmentPlan(
        mockPortfolioData,
        mockGoalData,
        mockUserData
      );

      expect(result.allocations.stocks).toBe(70);
      expect(result.allocations.bonds).toBe(20);
    });

    it('should extract JSON from text with extra content', async () => {
      const jsonData = {
        allocations: { stocks: 50, bonds: 40, cash: 10, other: 0 },
        trades: [],
        explanation: 'Test',
        riskConsiderations: 'Test',
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: `Here's the investment plan:\n${JSON.stringify(jsonData)}\nHope this helps!`,
            },
          },
        ],
      };

      nock(openaiBaseURL)
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      const result = await agentService.generateInvestmentPlan(
        mockPortfolioData,
        mockGoalData,
        mockUserData
      );

      expect(result.allocations.stocks).toBe(50);
    });

    it('should normalize allocations to sum to 100%', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                allocations: {
                  stocks: 120, // Over 100%
                  bonds: 30,
                  cash: 10,
                  other: 0,
                },
                trades: [],
                explanation: 'Test',
                riskConsiderations: 'Test',
              }),
            },
          },
        ],
      };

      nock(openaiBaseURL)
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      const result = await agentService.generateInvestmentPlan(
        mockPortfolioData,
        mockGoalData,
        mockUserData
      );

      const sum = result.allocations.stocks + result.allocations.bonds +
                  result.allocations.cash + result.allocations.other;
      expect(sum).toBeCloseTo(100, 1);
    });

    it('should sanitize and validate trades', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                allocations: { stocks: 60, bonds: 30, cash: 10, other: 0 },
                trades: [
                  {
                    action: 'BUY', // Should be lowercased
                    symbol: '  vti  ', // Should be trimmed and uppercased
                    quantity: 10.7, // Should be floored
                    reason: 'Test reason',
                  },
                  {
                    action: 'invalid', // Should be filtered out
                    symbol: 'AAPL',
                    quantity: 5,
                  },
                  {
                    action: 'sell',
                    symbol: 'GOOGL',
                    quantity: -5, // Should be filtered out (negative)
                  },
                ],
                explanation: 'Test',
                riskConsiderations: 'Test',
              }),
            },
          },
        ],
      };

      nock(openaiBaseURL)
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      const result = await agentService.generateInvestmentPlan(
        mockPortfolioData,
        mockGoalData,
        mockUserData
      );

      expect(result.trades).toHaveLength(1);
      expect(result.trades[0].action).toBe('buy');
      expect(result.trades[0].symbol).toBe('VTI');
      expect(result.trades[0].quantity).toBe(10);
    });

    it('should truncate long text fields', async () => {
      const longText = 'a'.repeat(2000);
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                allocations: { stocks: 60, bonds: 30, cash: 10, other: 0 },
                trades: [],
                explanation: longText,
                riskConsiderations: longText,
              }),
            },
          },
        ],
      };

      nock(openaiBaseURL)
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      const result = await agentService.generateInvestmentPlan(
        mockPortfolioData,
        mockGoalData,
        mockUserData
      );

      expect(result.explanation.length).toBeLessThanOrEqual(1000);
      expect(result.riskConsiderations.length).toBeLessThanOrEqual(1000);
    });

    it('should throw error if OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY;

      await expect(
        agentService.generateInvestmentPlan(mockPortfolioData, mockGoalData, mockUserData)
      ).rejects.toThrow('OPENAI_API_KEY is not configured');
    });

    it('should handle OpenAI API errors', async () => {
      nock(openaiBaseURL)
        .post('/v1/chat/completions')
        .reply(401, {
          error: {
            message: 'Invalid API key',
            type: 'invalid_request_error',
          },
        });

      await expect(
        agentService.generateInvestmentPlan(mockPortfolioData, mockGoalData, mockUserData)
      ).rejects.toThrow('OpenAI API error');
    });

    it('should handle network errors', async () => {
      nock(openaiBaseURL)
        .post('/v1/chat/completions')
        .replyWithError('Network error');

      await expect(
        agentService.generateInvestmentPlan(mockPortfolioData, mockGoalData, mockUserData)
      ).rejects.toThrow();
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is not valid JSON at all!',
            },
          },
        ],
      };

      nock(openaiBaseURL)
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      await expect(
        agentService.generateInvestmentPlan(mockPortfolioData, mockGoalData, mockUserData)
      ).rejects.toThrow('Failed to parse JSON');
    });

    it('should handle missing content in response', async () => {
      const mockResponse = {
        choices: [{}], // No message content
      };

      nock(openaiBaseURL)
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      await expect(
        agentService.generateInvestmentPlan(mockPortfolioData, mockGoalData, mockUserData)
      ).rejects.toThrow('No content in OpenAI response');
    });
  });

  describe('extractJSON', () => {
    it('should parse direct JSON string', () => {
      const json = { test: 'value' };
      const result = agentService.extractJSON(JSON.stringify(json));
      expect(result).toEqual(json);
    });

    it('should extract JSON from markdown code block', () => {
      const json = { test: 'value' };
      const text = `\`\`\`json\n${JSON.stringify(json)}\n\`\`\``;
      const result = agentService.extractJSON(text);
      expect(result).toEqual(json);
    });

    it('should extract JSON from text with extra content', () => {
      const json = { test: 'value' };
      const text = `Here is the data: ${JSON.stringify(json)} and more text`;
      const result = agentService.extractJSON(text);
      expect(result).toEqual(json);
    });

    it('should return null for invalid text', () => {
      const result = agentService.extractJSON('not json at all');
      expect(result).toBeNull();
    });

    it('should handle null or undefined input', () => {
      expect(agentService.extractJSON(null)).toBeNull();
      expect(agentService.extractJSON(undefined)).toBeNull();
    });
  });

  describe('validateAndSanitize', () => {
    it('should validate and sanitize valid input', () => {
      const input = {
        allocations: {
          stocks: 60,
          bonds: 30,
          cash: 10,
          other: 0,
        },
        trades: [
          {
            action: 'buy',
            symbol: 'VTI',
            quantity: 10,
            reason: 'Test',
          },
        ],
        explanation: 'Test explanation',
        riskConsiderations: 'Test risks',
      };

      const result = agentService.validateAndSanitize(input);

      expect(result.allocations.stocks).toBe(60);
      expect(result.trades).toHaveLength(1);
      expect(result.explanation).toBe('Test explanation');
    });

    it('should clamp allocation values to 0-100', () => {
      const input = {
        allocations: {
          stocks: 150, // Over 100
          bonds: -10, // Negative
          cash: 50,
          other: 0,
        },
        trades: [],
        explanation: '',
        riskConsiderations: '',
      };

      const result = agentService.validateAndSanitize(input);

      expect(result.allocations.stocks).toBeLessThanOrEqual(100);
      expect(result.allocations.bonds).toBeGreaterThanOrEqual(0);
    });

    it('should filter invalid trades', () => {
      const input = {
        allocations: { stocks: 100, bonds: 0, cash: 0, other: 0 },
        trades: [
          { action: 'buy', symbol: 'VTI', quantity: 10, reason: 'Valid' },
          { action: 'invalid', symbol: 'AAPL', quantity: 5 }, // Invalid action
          { action: 'sell', symbol: '', quantity: 5 }, // Missing symbol
          { action: 'buy', symbol: 'GOOGL', quantity: 0 }, // Zero quantity
        ],
        explanation: '',
        riskConsiderations: '',
      };

      const result = agentService.validateAndSanitize(input);

      expect(result.trades).toHaveLength(1);
      expect(result.trades[0].symbol).toBe('VTI');
    });
  });

  describe('calculateTimeHorizon', () => {
    it('should calculate time horizon correctly', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);
      
      const horizon = agentService.calculateTimeHorizon(futureDate);
      expect(horizon).toContain('5');
    });

    it('should handle null dates', () => {
      const horizon = agentService.calculateTimeHorizon(null);
      expect(horizon).toBe('N/A');
    });
  });
});

