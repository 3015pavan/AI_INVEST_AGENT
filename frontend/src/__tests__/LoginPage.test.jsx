import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '../pages/LoginPage';
import authReducer from '../store/authSlice';

// Mock API
jest.mock('../api/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    googleLogin: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginPage Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    mockNavigate.mockClear();
  });

  const renderLoginPage = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Initial Render', () => {
    it('should render login form by default', () => {
      renderLoginPage();
      
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should have InvestAgent title', () => {
      renderLoginPage();
      
      expect(screen.getByText('InvestAgent')).toBeInTheDocument();
    });

    it('should display Google Sign-In button', () => {
      renderLoginPage();
      
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
    });

    it('should have link to switch to register', () => {
      renderLoginPage();
      
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/create one/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require email and password', async () => {
      renderLoginPage();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Form should not submit without values
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should update email input value', () => {
      renderLoginPage();
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input value', () => {
      renderLoginPage();
      
      const passwordInput = screen.getByPlaceholderText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(passwordInput.value).toBe('password123');
    });

    it('should mask password input', () => {
      renderLoginPage();
      
      const passwordInput = screen.getByPlaceholderText(/password/i);
      expect(passwordInput.type).toBe('password');
    });
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const { authAPI } = require('../api/api');
      authAPI.login.mockResolvedValue({
        data: {
          data: {
            user: {
              _id: '123',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
            },
            token: 'mock-jwt-token',
          },
        },
      });

      renderLoginPage();
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should display error message on failed login', async () => {
      const { authAPI } = require('../api/api');
      authAPI.login.mockRejectedValue({
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      });

      renderLoginPage();
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show loading state during login', async () => {
      const { authAPI } = require('../api/api');
      authAPI.login.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderLoginPage();
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Register Flow', () => {
    it('should switch to register form', () => {
      renderLoginPage();
      
      const createAccountLink = screen.getByText(/create one/i);
      fireEvent.click(createAccountLink);

      expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should successfully register new user', async () => {
      const { authAPI } = require('../api/api');
      authAPI.register.mockResolvedValue({
        data: {
          data: {
            user: {
              _id: '123',
              email: 'newuser@example.com',
              firstName: 'New',
              lastName: 'User',
            },
            token: 'mock-jwt-token',
          },
        },
      });

      renderLoginPage();
      
      // Switch to register
      fireEvent.click(screen.getByText(/create one/i));

      const firstNameInput = screen.getByPlaceholderText(/first name/i);
      const lastNameInput = screen.getByPlaceholderText(/last name/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(firstNameInput, { target: { value: 'New' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should switch back to login form', () => {
      renderLoginPage();
      
      // Switch to register
      fireEvent.click(screen.getByText(/create one/i));
      
      // Switch back to login
      fireEvent.click(screen.getByText(/sign in here/i));

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/first name/i)).not.toBeInTheDocument();
    });
  });

  describe('Redux State Integration', () => {
    it('should update Redux store on successful login', async () => {
      const { authAPI } = require('../api/api');
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      const mockToken = 'mock-jwt-token';

      authAPI.login.mockResolvedValue({
        data: {
          data: {
            user: mockUser,
            token: mockToken,
          },
        },
      });

      renderLoginPage();
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const state = store.getState();
        expect(state.auth.isAuthenticated).toBe(true);
        expect(state.auth.user).toEqual(mockUser);
        expect(state.auth.token).toBe(mockToken);
      });
    });

    it('should redirect if already authenticated', () => {
      const authenticatedStore = configureStore({
        reducer: {
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: { email: 'test@example.com' },
            token: 'existing-token',
            loading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={authenticatedStore}>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </Provider>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
