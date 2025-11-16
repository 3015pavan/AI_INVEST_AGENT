// Mock OpenAI API
export const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                explanation: 'Based on your retirement goal, here is a diversified investment strategy...',
                allocations: [
                  { asset: 'stocks', percentage: 60, amount: 6000 },
                  { asset: 'bonds', percentage: 30, amount: 3000 },
                  { asset: 'crypto', percentage: 10, amount: 1000 },
                ],
                trades: [
                  {
                    action: 'buy',
                    symbol: 'VOO',
                    quantity: 10,
                    reason: 'S&P 500 index fund for broad market exposure',
                  },
                  {
                    action: 'buy',
                    symbol: 'BND',
                    quantity: 50,
                    reason: 'Total bond market for stability',
                  },
                ],
                riskConsiderations: 'This portfolio is balanced for long-term growth with moderate risk...',
              }),
            },
          },
        ],
      }),
    },
  },
};

// Mock Pinecone Vector Store
export const mockPinecone = {
  Index: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue({
      matches: [
        {
          id: 'doc-1',
          score: 0.85,
          metadata: {
            text: 'Historical market data shows that diversified portfolios perform better...',
          },
        },
        {
          id: 'doc-2',
          score: 0.78,
          metadata: {
            text: 'For retirement planning, consider a mix of growth and income assets...',
          },
        },
      ],
    }),
    upsert: jest.fn().mockResolvedValue({ upsertedCount: 1 }),
  }),
};

// Mock Market Data API
export const mockMarketAPI = {
  getStockPrice: jest.fn().mockResolvedValue({
    symbol: 'AAPL',
    price: 178.25,
    change: 2.45,
    changePercent: 1.39,
    volume: 52000000,
  }),
  
  getCryptoPrice: jest.fn().mockResolvedValue({
    symbol: 'BTC',
    price: 43250.00,
    change: 850.00,
    changePercent: 2.01,
    volume: 28000000000,
  }),
  
  getMarketData: jest.fn().mockResolvedValue({
    stocks: [
      { symbol: 'AAPL', price: 178.25, change: 1.42 },
      { symbol: 'MSFT', price: 378.90, change: 1.03 },
      { symbol: 'GOOGL', price: 142.65, change: -0.50 },
    ],
    crypto: [
      { symbol: 'BTC', price: 43250, change: 2.01 },
      { symbol: 'ETH', price: 2280, change: 3.80 },
    ],
  }),
};

// Mock Email Service
export const mockEmailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
};

// Mock Plaid API (Bank Integration)
export const mockPlaid = {
  createLinkToken: jest.fn().mockResolvedValue({
    link_token: 'link-sandbox-mock-token',
    expiration: '2025-12-31T23:59:59Z',
  }),
  
  exchangePublicToken: jest.fn().mockResolvedValue({
    access_token: 'access-sandbox-mock-token',
    item_id: 'mock-item-id',
  }),
  
  getAccounts: jest.fn().mockResolvedValue({
    accounts: [
      {
        account_id: 'account-1',
        name: 'Checking Account',
        type: 'depository',
        balances: {
          available: 5000,
          current: 5200,
        },
      },
    ],
  }),
};

// Mock Google OAuth
export const mockGoogleOAuth = {
  verifyIdToken: jest.fn().mockResolvedValue({
    payload: {
      email: 'google-user@example.com',
      given_name: 'Google',
      family_name: 'User',
      email_verified: true,
    },
  }),
};

// Helper to setup all mocks
export function setupMocks() {
  jest.mock('openai', () => ({
    default: jest.fn().mockImplementation(() => mockOpenAI),
  }));
  
  jest.mock('@pinecone-database/pinecone', () => ({
    Pinecone: jest.fn().mockImplementation(() => mockPinecone),
  }));
  
  jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn().mockImplementation(() => mockGoogleOAuth),
  }));
}

// Reset all mocks
export function resetAllMocks() {
  mockOpenAI.chat.completions.create.mockClear();
  mockMarketAPI.getStockPrice.mockClear();
  mockMarketAPI.getCryptoPrice.mockClear();
  mockMarketAPI.getMarketData.mockClear();
  mockEmailService.sendVerificationEmail.mockClear();
  mockEmailService.sendPasswordResetEmail.mockClear();
  mockEmailService.sendWelcomeEmail.mockClear();
  mockPlaid.createLinkToken.mockClear();
  mockPlaid.exchangePublicToken.mockClear();
  mockPlaid.getAccounts.mockClear();
  mockGoogleOAuth.verifyIdToken.mockClear();
}
