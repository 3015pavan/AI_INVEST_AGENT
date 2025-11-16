import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  portfolios: [],
  currentPortfolio: null,
  investmentPlan: null,
  loading: false,
  error: null,
  planLoading: false,
  planError: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    // Fetch portfolios
    fetchPortfoliosStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPortfoliosSuccess: (state, action) => {
      state.loading = false;
      state.portfolios = action.payload;
      state.error = null;
    },
    fetchPortfoliosFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.portfolios = [];
    },

    // Set current portfolio
    setCurrentPortfolio: (state, action) => {
      state.currentPortfolio = action.payload;
    },

    // Generate investment plan
    generatePlanStart: (state) => {
      state.planLoading = true;
      state.planError = null;
    },
    generatePlanSuccess: (state, action) => {
      state.planLoading = false;
      state.investmentPlan = action.payload;
      state.planError = null;
    },
    generatePlanFailure: (state, action) => {
      state.planLoading = false;
      state.planError = action.payload;
    },

    // Clear investment plan
    clearPlan: (state) => {
      state.investmentPlan = null;
      state.planError = null;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.planError = null;
    },
  },
});

export const {
  fetchPortfoliosStart,
  fetchPortfoliosSuccess,
  fetchPortfoliosFailure,
  setCurrentPortfolio,
  generatePlanStart,
  generatePlanSuccess,
  generatePlanFailure,
  clearPlan,
  clearError,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
