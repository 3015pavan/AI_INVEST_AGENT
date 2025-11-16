import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { authAPI } from '../api/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      console.log('Submitting auth request:', { email, isRegister });
      const response = isRegister
        ? await authAPI.register({ email, password, firstName, lastName })
        : await authAPI.login({ email, password });

      console.log('Auth response:', response.data);
      dispatch(loginSuccess({
        user: response.data.data.user,
        token: response.data.data.token,
      }));
      navigate('/dashboard');
    } catch (err) {
      console.error('Auth error:', err);
      console.error('Error response:', err.response);
      dispatch(loginFailure(err.response?.data?.message || 'Authentication failed'));
    }
  };

const handleGoogleResponse = useCallback(async (response) => {
    console.log('Google response received:', response);
    dispatch(loginStart());
    try {
      console.log('Sending credential to backend...');
      const result = await authAPI.googleLogin(response.credential);
      console.log('Backend response:', result.data);
      
      dispatch(loginSuccess({
        user: result.data.data.user,
        token: result.data.data.token,
      }));
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      console.error('Error details:', err.response?.data);
      dispatch(loginFailure(err.response?.data?.message || 'Google authentication failed'));
    }
  }, [dispatch, navigate]);

  // Initialize Google Sign-In on component mount
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    console.log('Google Client ID configured:', !!clientId);
    console.log('Google library loaded:', !!window.google);
    
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID not configured in .env');
      return;
    }
    
    if (!window.google) {
      console.warn('Google Identity Services library not loaded yet');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });
      console.log('Google Sign-In initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  }, [handleGoogleResponse]);

  const handleGoogleLogin = () => {
    // Check if GOOGLE_CLIENT_ID is configured
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      dispatch(loginFailure('Google OAuth is not configured. Please add VITE_GOOGLE_CLIENT_ID to .env'));
      console.error('Missing VITE_GOOGLE_CLIENT_ID in .env file');
      return;
    }

    // Initialize Google Sign-In
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.prompt(); // Show One Tap dialog
      } catch (error) {
        console.error('Google Sign-In initialization error:', error);
        dispatch(loginFailure('Failed to initialize Google Sign-In'));
      }
    } else {
      console.error('Google Sign-In library not loaded. Check if script is in index.html');
      dispatch(loginFailure('Google Sign-In library not loaded. Please refresh the page.'));
    }
  };

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>← Back to Home</Link>
      
      <div style={styles.card}>
        <h1 style={styles.title}>InvestAgent</h1>
        <h2 style={styles.subtitle}>{isRegister ? 'Create Account' : 'Sign In'}</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={styles.input}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>OR</span>
        </div>

        {/* Custom styled Google button */}
        <button onClick={handleGoogleLogin} style={styles.googleButton} type="button" disabled={loading}>
          <svg style={styles.googleIcon} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Hidden div for Google-rendered button (fallback) */}
        <div id="googleSignInButton" style={{ display: 'none' }}></div>
        
        <p style={styles.toggle}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={styles.toggleButton}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    position: 'relative',
  },
  backLink: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'background 0.3s ease',
  },
  card: {
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '440px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#333',
  },
  subtitle: {
    fontSize: '1.5rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#666',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.3s ease',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '24px 0',
    height: '1px',
    background: '#e0e0e0',
  },
  dividerText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '0 16px',
    color: '#666',
    fontSize: '14px',
  },
  googleButton: {
    width: '100%',
    padding: '14px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    background: 'white',
    color: '#3c4043',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
  },
  googleIcon: {
    width: '20px',
    height: '20px',
  },
  toggle: {
    marginTop: '1rem',
    textAlign: 'center',
    color: '#666',
  },
  toggleButton: {
    marginLeft: '0.5rem',
    color: '#667eea',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: '500',
  },
};

export default LoginPage;
