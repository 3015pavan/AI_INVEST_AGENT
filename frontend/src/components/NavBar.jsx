import { Link } from 'react-router-dom';
import { useState } from 'react';

function NavBar({ onLogout, user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.firstName?.[0] || user.email?.[0] || 'U';
    const lastInitial = user.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.brand}>
          🤖 InvestAgent
        </Link>
        
        <div style={styles.menu}>
          <Link to="/dashboard" style={styles.link}>
            📊 Dashboard
          </Link>
          
          {user && (
            <div style={styles.profileContainer}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={styles.profileButton}
              >
                <div style={styles.avatar}>
                  {getInitials()}
                </div>
                <span style={styles.userName}>
                  {user.firstName || user.email}
                </span>
                <span style={styles.dropdownArrow}>
                  {dropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.avatarLarge}>
                      {getInitials()}
                    </div>
                    <div style={styles.userInfo}>
                      <div style={styles.userFullName}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={styles.userEmail}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.dropdownDivider} />
                  
                  <Link to="/profile" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    👤 My Profile
                  </Link>
                  <Link to="/settings" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    ⚙️ Settings
                  </Link>
                  <Link to="/portfolio" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    💼 My Portfolios
                  </Link>
                  <Link to="/analytics" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    📈 Analytics
                  </Link>
                  
                  <div style={styles.dropdownDivider} />
                  
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }} 
                    style={styles.logoutButton}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  profileContainer: {
    position: 'relative',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    borderRadius: '25px',
    padding: '6px 12px 6px 6px',
    cursor: 'pointer',
    color: 'white',
    transition: 'background 0.2s',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white',
  },
  avatarLarge: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    flexShrink: 0,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: '10px',
  },
  dropdown: {
    position: 'absolute',
    top: '110%',
    right: 0,
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    minWidth: '280px',
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownHeader: {
    padding: '20px',
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userFullName: {
    fontSize: '16px',
    fontWeight: '600',
  },
  userEmail: {
    fontSize: '13px',
    opacity: 0.9,
  },
  dropdownDivider: {
    height: '1px',
    background: '#e0e0e0',
    margin: '8px 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: '#333',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.2s',
    cursor: 'pointer',
    background: 'white',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: '#ef4444',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.2s',
    cursor: 'pointer',
    background: 'white',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  },
};

export default NavBar;
