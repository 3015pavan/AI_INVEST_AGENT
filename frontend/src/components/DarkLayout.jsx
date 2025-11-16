import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useState } from 'react';
import AIChatbot from './AIChatbot';

function DarkLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.firstName?.[0] || user.email?.[0] || 'U';
    const lastInitial = user.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/portfolio', icon: '💼', label: 'Portfolio' },
    { path: '/goals', icon: '🎯', label: 'Goals' },
    { path: '/market', icon: '📈', label: 'Market' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={{...styles.sidebar, width: sidebarCollapsed ? '80px' : '240px'}}>
        <div style={styles.sidebarHeader}>
          <Link to="/dashboard" style={styles.logo}>
            <div style={styles.logoIcon}>🤖</div>
            {!sidebarCollapsed && <span style={styles.logoText}>AI Portfolio Manager</span>}
          </Link>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.navItemActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {!sidebarCollapsed && <span style={styles.navLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.aiCard}>
            <div style={styles.aiIcon}>🤖</div>
            {!sidebarCollapsed && (
              <>
                <h4 style={styles.aiTitle}>AI Insights Ready</h4>
                <p style={styles.aiDesc}>Get personalized recommendations</p>
                <button onClick={() => setChatbotOpen(true)} style={styles.aiButton}>View Insights</button>
              </>
            )}
          </div>

          <div
            style={styles.userSection}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div style={styles.avatar}>{getInitials()}</div>
            {!sidebarCollapsed && (
              <>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{user?.email}</div>
                  <div style={styles.userRole}>Admin</div>
                </div>
                <span style={styles.dropdownIcon}>⋮</span>
              </>
            )}
          </div>

          {dropdownOpen && (
            <div style={styles.dropdownMenu}>
              <Link to="/settings" style={styles.dropdownItem}>
                ⚙️ Settings
              </Link>
              <button onClick={handleLogout} style={styles.dropdownItem}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.topBar}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={styles.toggleButton}
          >
            ☰
          </button>

          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search stocks, crypto, ETFs..."
              style={styles.searchInput}
            />
            <button style={styles.analyzeButton}>
              ✨ Analyze
            </button>
          </div>
        </div>

        <div style={styles.content}>
          {children}
        </div>
      </div>

      {/* Floating AI Chat Button */}
      <button onClick={() => setChatbotOpen(true)} style={styles.floatingChatButton}>
        <span style={styles.chatButtonIcon}>💬</span>
      </button>

      {/* AI Chatbot */}
      <AIChatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f1729',
  },
  sidebar: {
    background: '#1a2332',
    borderRight: '1px solid #2d3748',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid #2d3748',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'white',
  },
  logoIcon: {
    fontSize: '32px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    borderRadius: '10px',
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    color: '#9ca3af',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
  },
  navIcon: {
    fontSize: '20px',
    width: '24px',
    textAlign: 'center',
  },
  navLabel: {
    whiteSpace: 'nowrap',
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid #2d3748',
    position: 'relative',
  },
  aiCard: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  aiIcon: {
    fontSize: '36px',
    marginBottom: '8px',
  },
  aiTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '4px',
  },
  aiDesc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '12px',
  },
  aiButton: {
    padding: '8px 16px',
    background: 'white',
    color: '#7c3aed',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#242d3d',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'white',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  dropdownIcon: {
    fontSize: '20px',
    color: '#9ca3af',
  },
  dropdownMenu: {
    position: 'absolute',
    bottom: '90px',
    left: '20px',
    right: '20px',
    background: '#242d3d',
    borderRadius: '8px',
    padding: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    zIndex: 1000,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px',
    borderRadius: '6px',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  topBar: {
    background: '#1a2332',
    borderBottom: '1px solid #2d3748',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  toggleButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
  },
  searchContainer: {
    flex: 1,
    maxWidth: '600px',
    display: 'flex',
    gap: '12px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 16px',
    background: '#242d3d',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
  },
  analyzeButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
  floatingChatButton: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none',
    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
    zIndex: 1000,
  },
  chatButtonIcon: {
    fontSize: '28px',
  },
};

export default DarkLayout;
