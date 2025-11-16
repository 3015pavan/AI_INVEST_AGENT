import { createSlice } from '@reduxjs/toolkit';

// Safely get token from localStorage
const getStoredToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

const initialState = {
  user: null,
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      try {
        localStorage.setItem('token', action.payload.token);
      } catch (error) {
        console.error('Error saving token to localStorage:', error);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        localStorage.removeItem('token');
      } catch (error) {
        console.error('Error removing token from localStorage:', error);
      }
    },
    updateUserProfile: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUserProfile, clearError } = authSlice.actions;
export default authSlice.reducer;
