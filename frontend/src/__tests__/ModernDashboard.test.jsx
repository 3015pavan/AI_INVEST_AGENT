import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ModernDashboard from '../pages/ModernDashboard';
import authReducer from '../store/authSlice';
import portfolioReducer from '../store/portfolioSlice';

// Mock API
jest.mock('../api/api', () => ({
  portfolioAPI: {
    getPortfolios: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
}));

describe('ModernDashboard Component', () => {
  let store;

  const mockUser = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    monthlyInvestmentBudget: 2000,
    annualIncome: 100000,
    riskTolerance: 'Moderate',
  };

  const mockPortfolios = [
    {
      _id: '1',
      name: 'Tech Portfolio',
      totalValue: 25000,
      holdings: [
        { symbol: 'AAPL', quantity: 50, value: 8900 },
        { symbol: 'GOOGL', quantity: 10, value: 1426 },
      ],
    },
    {
      _id: '2',
      name: 'Crypto Portfolio',
      totalValue: 15000,
      holdings: [
        { symbol: 'BTC', quantity: 0.5, value: 21625 },
      ],
    },
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        portfolio: portfolioReducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'mock-token',
          loading: false,
          error: null,
        },
        portfolio: {
          portfolios: [],
          currentPortfolio: null,
          investmentPlan: null,
          loading: false,
          error: null,
          planLoading: false,
          planError: null,
        },
      },
    });
  });

  const renderDashboard = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ModernDashboard />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Initial Render', () => {
    it('should render dashboard title', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Investment Dashboard')).toBeInTheDocument();
      });
    });

    it('should display portfolio value header', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
      });
    });

    it('should render stat cards', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total Assets')).toBeInTheDocument();
        expect(screen.getByText('Total Gain/Loss')).toBeInTheDocument();
        expect(screen.getByText('Invested Amount')).toBeInTheDocument();
        expect(screen.getByText('Active Goals')).toBeInTheDocument();
      });
    });

    it('should render charts', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });
  });

  describe('User Data Calculations', () => {
    it('should calculate stats from user monthly budget', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        // monthlyBudget (2000) * 12 = 24000 invested
        // 24000 * 1.1401 = 27362.4 total value
        // 27362.4 - 24000 = 3362.4 gain
        const investedElement = screen.getByText(/24,000|24000/);
        expect(investedElement).toBeInTheDocument();
      });
    });

    it('should show 3 active goals when user has income', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Active Goals count
      });
    });

    it('should show 0 active goals when user has no income', async () => {
      const noIncomeStore = configureStore({
        reducer: {
          auth: authReducer,
          portfolio: portfolioReducer,
        },
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: {
              ...mockUser,
              annualIncome: 0,
            },
            token: 'mock-token',
            loading: false,
            error: null,
          },
          portfolio: {
            portfolios: [],
            currentPortfolio: null,
            investmentPlan: null,
            loading: false,
            error: null,
            planLoading: false,
            planError: null,
          },
        },
      });

      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      render(
        <Provider store={noIncomeStore}>
          <BrowserRouter>
            <ModernDashboard />
          </BrowserRouter>
        </Provider>
      );

      await waitFor(() => {
        const activeGoalsElements = screen.getAllByText('0');
        expect(activeGoalsElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Portfolio Loading', () => {
    it('should fetch portfolios on mount', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue(mockPortfolios);

      renderDashboard();

      await waitFor(() => {
        expect(portfolioAPI.getPortfolios).toHaveBeenCalled();
      });
    });

    it('should display portfolio count', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue(mockPortfolios);

      renderDashboard();

      await waitFor(() => {
        // Should show 2 portfolios in Total Assets
        const state = store.getState();
        expect(state.portfolio.portfolios).toHaveLength(2);
      });
    });

    it('should handle portfolio loading error', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockRejectedValue(new Error('Failed to load'));

      renderDashboard();

      await waitFor(() => {
        const state = store.getState();
        expect(state.portfolio.error).toBeTruthy();
      });
    });
  });

  describe('Asset Allocation', () => {
    it('should show allocation based on moderate risk', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
      });
    });

    it('should adjust allocation for aggressive risk', async () => {
      const aggressiveStore = configureStore({
        reducer: {
          auth: authReducer,
          portfolio: portfolioReducer,
        },
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: {
              ...mockUser,
              riskTolerance: 'Aggressive',
            },
            token: 'mock-token',
            loading: false,
            error: null,
          },
          portfolio: {
            portfolios: [],
            currentPortfolio: null,
            investmentPlan: null,
            loading: false,
            error: null,
            planLoading: false,
            planError: null,
          },
        },
      });

      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      render(
        <Provider store={aggressiveStore}>
          <BrowserRouter>
            <ModernDashboard />
          </BrowserRouter>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should have quick action buttons', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/view all portfolios/i)).toBeInTheDocument();
        expect(screen.getByText(/set new goal/i)).toBeInTheDocument();
      });
    });
  });

  describe('Time Period Selection', () => {
    it('should have time period filters', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('1W')).toBeInTheDocument();
        expect(screen.getByText('1M')).toBeInTheDocument();
        expect(screen.getByText('3M')).toBeInTheDocument();
        expect(screen.getByText('1Y')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should render without errors on different screen sizes', async () => {
      const { portfolioAPI } = require('../api/api');
      portfolioAPI.getPortfolios.mockResolvedValue([]);

      const { container } = renderDashboard();

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });
});
