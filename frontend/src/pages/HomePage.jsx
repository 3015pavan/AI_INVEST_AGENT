import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function HomePage() {
  const [userLocation, setUserLocation] = useState('US');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Detect user location (simplified)
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserLocation(data.country_code || 'US');
      } catch (error) {
        console.log('Location detection failed, using default US');
      }
    };
    detectLocation();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <Link to="/" style={styles.navLogo}>
            <span style={styles.logoIcon}>🤖</span>
            <span style={styles.logoText}>InvestAgent</span>
          </Link>

          <div style={styles.navLinks} className="nav-links">
            <button onClick={() => scrollToSection('features')} style={styles.navLink} className="nav-link">
              Features
            </button>
            <button onClick={() => scrollToSection('trending')} style={styles.navLink} className="nav-link">
              Market
            </button>
            <button onClick={() => scrollToSection('crypto')} style={styles.navLink} className="nav-link">
              Crypto
            </button>
            <button onClick={() => scrollToSection('news')} style={styles.navLink} className="nav-link">
              News
            </button>
            <Link to="/login" style={styles.navLinkLogin} className="nav-link">
              Sign In
            </Link>
            <Link to="/login" style={styles.navButtonPrimary} className="nav-button-primary">
              Get Started
            </Link>
          </div>

          <button 
            style={styles.mobileMenuButton}
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={styles.mobileMenu} className="mobile-menu">
            <button onClick={() => scrollToSection('features')} style={styles.mobileMenuLink} className="mobile-menu-link">
              Features
            </button>
            <button onClick={() => scrollToSection('trending')} style={styles.mobileMenuLink} className="mobile-menu-link">
              Market
            </button>
            <button onClick={() => scrollToSection('crypto')} style={styles.mobileMenuLink} className="mobile-menu-link">
              Crypto
            </button>
            <button onClick={() => scrollToSection('news')} style={styles.mobileMenuLink} className="mobile-menu-link">
              News
            </button>
            <Link to="/login" style={styles.mobileMenuLink} className="mobile-menu-link">
              Sign In
            </Link>
            <Link to="/login" style={styles.mobileMenuButton} className="mobile-menu-button">
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.heroGlassCard}>
            <h1 style={styles.heroTitle}>InvestAgent</h1>
            <p style={styles.heroSubtitle}>
              Your AI-Powered Investment Assistant
            </p>
            <p style={styles.heroDescription}>
              Get personalized investment recommendations, track trending stocks, and manage your portfolio with AI-driven insights.
            </p>
            <div style={styles.heroButtons}>
              <Link to="/login" style={styles.primaryButton}>
                Get Started
              </Link>
              <Link to="/login" style={styles.secondaryButton}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section id="features" style={styles.section}>
        <h2 style={styles.sectionTitle}>🤖 AI Investment Assistant</h2>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Smart Portfolio Analysis</h3>
            <p style={styles.featureText}>
              AI-powered analysis of your portfolio with personalized recommendations for optimal allocation.
            </p>
          </div>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Risk Assessment</h3>
            <p style={styles.featureText}>
              Understand your risk profile and get tailored investment strategies that match your goals.
            </p>
          </div>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Goal Planning</h3>
            <p style={styles.featureText}>
              Set financial goals and receive AI-generated investment plans to achieve them.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Stocks Section */}
      <section id="trending" style={styles.section}>
        <h2 style={styles.sectionTitle}>📈 Trending in {userLocation}</h2>
        <div style={styles.trendingTabs}>
          <button style={styles.tabActive}>Stocks</button>
          <button style={styles.tab}>Crypto</button>
          <button style={styles.tab}>ETFs</button>
        </div>
        <div style={styles.stockGrid}>
          {getTrendingAssets(userLocation).map((stock) => (
            <div key={stock.symbol} style={styles.stockCard}>
              <div style={styles.stockHeader}>
                <div style={styles.stockSymbolGroup}>
                  <div style={styles.stockIcon}>{stock.icon}</div>
                  <div>
                    <h3 style={styles.stockSymbol}>{stock.symbol}</h3>
                    <p style={styles.stockName}>{stock.name}</p>
                  </div>
                </div>
              </div>
              <p style={styles.stockPrice}>${stock.price.toLocaleString()}</p>
              <div style={styles.stockChangeRow}>
                <span style={stock.change >= 0 ? styles.stockUp : styles.stockDown}>
                  {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change)}%
                </span>
                <span style={styles.stockVolume}>{stock.volume}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Cryptocurrencies */}
      <section id="crypto" style={styles.section}>
        <h2 style={styles.sectionTitle}>₿ Top Cryptocurrencies</h2>
        <div style={styles.cryptoGrid}>
          {topCrypto.map((crypto) => (
            <div key={crypto.symbol} style={styles.cryptoCard}>
              <div style={styles.cryptoHeader}>
                <span style={styles.cryptoIcon}>{crypto.icon}</span>
                <div>
                  <h3 style={styles.cryptoName}>{crypto.name}</h3>
                  <p style={styles.cryptoSymbol}>{crypto.symbol}</p>
                </div>
              </div>
              <div style={styles.cryptoStats}>
                <div>
                  <p style={styles.cryptoPrice}>${crypto.price.toLocaleString()}</p>
                  <span style={crypto.change24h >= 0 ? styles.stockUp : styles.stockDown}>
                    {crypto.change24h >= 0 ? '▲' : '▼'} {Math.abs(crypto.change24h)}%
                  </span>
                </div>
                <div style={styles.cryptoMarketCap}>
                  <p style={styles.cryptoCapLabel}>Market Cap</p>
                  <p style={styles.cryptoCapValue}>${crypto.marketCap}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>💡 AI Recommendations</h2>
        <div style={styles.recommendationsGrid}>
          <div style={styles.recommendationCard}>
            <h3 style={styles.recommendationTitle}>Diversify into ETFs</h3>
            <p style={styles.recommendationText}>
              Consider adding broad-market ETFs like VTI or VOO for balanced exposure.
            </p>
            <span style={styles.recommendationTag}>Low Risk</span>
          </div>
          <div style={styles.recommendationCard}>
            <h3 style={styles.recommendationTitle}>Tech Sector Growth</h3>
            <p style={styles.recommendationText}>
              Technology sector showing strong momentum. Consider QQQ or individual tech stocks.
            </p>
            <span style={styles.recommendationTag}>Medium Risk</span>
          </div>
          <div style={styles.recommendationCard}>
            <h3 style={styles.recommendationTitle}>Dividend Aristocrats</h3>
            <p style={styles.recommendationText}>
              Stable dividend-paying stocks for consistent income and lower volatility.
            </p>
            <span style={styles.recommendationTag}>Low Risk</span>
          </div>
        </div>
      </section>

      {/* Market News Section */}
      <section id="news" style={styles.section}>
        <h2 style={styles.sectionTitle}>📰 Latest Market News</h2>
        <div style={styles.newsGrid}>
          {getRealTimeNews().map((item, index) => (
            <div key={index} style={styles.newsCard}>
              {item.image && <div style={{...styles.newsImage, backgroundImage: `url(${item.image})`}} />}
              <div style={styles.newsContent}>
                <div style={styles.newsHeader}>
                  <span style={styles.newsCategory}>{item.category}</span>
                  <span style={styles.newsDate}>{item.date}</span>
                </div>
                <h3 style={styles.newsTitle}>{item.title}</h3>
                <p style={styles.newsExcerpt}>{item.excerpt}</p>
                <div style={styles.newsFooter}>
                  <span style={styles.newsSource}>{item.source}</span>
                  <Link to="/market" style={styles.newsReadMore}>Read more →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Start Investing Smarter?</h2>
        <p style={styles.ctaText}>
          Join thousands of investors using AI to make better investment decisions.
        </p>
        <Link to="/login" style={styles.ctaButton}>
          Create Your Portfolio
        </Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>&copy; 2025 InvestAgent. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Location-based trending assets
const getTrendingAssets = (location) => {
  const baseAssets = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.50, change: 2.3, volume: '52M', icon: '🍎' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.20, change: 1.8, volume: '28M', icon: '💻' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.30, change: 4.2, volume: '45M', icon: '🎮' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.80, change: -1.2, volume: '98M', icon: '🚗' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: -0.5, volume: '24M', icon: '🔍' },
    { symbol: 'AMZN', name: 'Amazon.com', price: 178.90, change: 0.9, volume: '41M', icon: '📦' },
  ];
  
  // Add location-specific trending stocks
  if (location === 'IN') {
    return [
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2850, change: 1.5, volume: '12M', icon: '🏭' },
      { symbol: 'TCS', name: 'Tata Consultancy', price: 3750, change: 2.1, volume: '8M', icon: '💼' },
      ...baseAssets.slice(0, 4)
    ];
  }
  
  return baseAssets;
};

const topCrypto = [
  { symbol: 'BTC', name: 'Bitcoin', price: 43250, change24h: 5.2, marketCap: '845B', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', price: 2280, change24h: 3.8, marketCap: '274B', icon: 'Ξ' },
  { symbol: 'BNB', name: 'Binance Coin', price: 315, change24h: -1.2, marketCap: '48B', icon: '🔶' },
  { symbol: 'SOL', name: 'Solana', price: 98, change24h: 8.5, marketCap: '42B', icon: '◎' },
  { symbol: 'XRP', name: 'Ripple', price: 0.62, change24h: 2.1, marketCap: '33B', icon: '💧' },
  { symbol: 'ADA', name: 'Cardano', price: 0.48, change24h: -0.8, marketCap: '17B', icon: '♦️' },
];

const getRealTimeNews = () => {
  return [
    {
      category: 'Markets',
      date: '2 hours ago',
      title: 'S&P 500 Reaches New All-Time High Amid Tech Rally',
      excerpt: 'The S&P 500 surged to a new record as technology stocks led the market higher, with AI-focused companies seeing significant gains...',
      source: 'Bloomberg',
      image: null,
    },
    {
      category: 'Crypto',
      date: '4 hours ago',
      title: 'Bitcoin Breaks $43,000 as Institutional Adoption Accelerates',
      excerpt: 'Bitcoin reached a new milestone as major financial institutions announce expanded cryptocurrency services and ETF approvals...',
      source: 'CoinDesk',
      image: null,
    },
    {
      category: 'Economy',
      date: '6 hours ago',
      title: 'Fed Signals Potential Rate Cuts in Q1 2026',
      excerpt: 'Federal Reserve officials hint at possible interest rate reductions as inflation shows consistent cooling trends across all sectors...',
      source: 'Reuters',
      image: null,
    },
    {
      category: 'Tech',
      date: '8 hours ago',
      title: 'NVIDIA Announces Next-Gen AI Chips, Stock Jumps 4%',
      excerpt: 'NVIDIA unveils breakthrough AI processors with 3x performance improvement, strengthening its dominance in the AI hardware market...',
      source: 'TechCrunch',
      image: null,
    },
    {
      category: 'Markets',
      date: '10 hours ago',
      title: 'Emerging Markets See Record Investment Inflows',
      excerpt: 'Developing economies attract $85B in foreign investment this quarter, signaling growing confidence in emerging market opportunities...',
      source: 'Financial Times',
      image: null,
    },
    {
      category: 'Energy',
      date: '12 hours ago',
      title: 'Oil Prices Stabilize as OPEC Maintains Production Levels',
      excerpt: 'Crude oil markets find equilibrium as OPEC+ countries agree to maintain current production quotas through early 2026...',
      source: 'WSJ',
      image: null,
    },
  ];
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f1729 0%, #1a1f35 50%, #0f1729 100%)',
    position: 'relative',
  },
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'rgba(15, 23, 41, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '16px 0',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '700',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    background: 'linear-gradient(135deg, #fff 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navLink: {
    padding: '8px 16px',
    color: '#c7d2fe',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  navLinkLogin: {
    padding: '8px 16px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  navButtonPrimary: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.2s',
  },
  mobileMenuButton: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
  },
  mobileMenu: {
    display: 'none',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px 2rem',
    background: 'rgba(26, 35, 50, 0.98)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  mobileMenuLink: {
    padding: '12px 16px',
    color: '#c7d2fe',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  mobileMenuButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'block',
  },
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    paddingTop: '100px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '900px',
    width: '100%',
  },
  heroGlassCard: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '60px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: '800',
    marginBottom: '1.5rem',
    background: 'linear-gradient(135deg, #fff 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '1.75rem',
    marginBottom: '1rem',
    color: '#e0e7ff',
    fontWeight: '600',
  },
  heroDescription: {
    fontSize: '1.125rem',
    marginBottom: '2.5rem',
    color: '#c7d2fe',
    lineHeight: '1.8',
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    color: 'white',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1.125rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
  },
  secondaryButton: {
    padding: '1rem 2.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1.125rem',
    transition: 'all 0.2s',
  },
  section: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '4rem 2rem',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '2rem',
    color: '#fff',
  },
  trendingTabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  tab: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '10px 20px',
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '8px',
    padding: '10px 20px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '2rem',
    borderRadius: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#fff',
  },
  featureText: {
    color: '#c7d2fe',
    lineHeight: '1.6',
  },
  stockGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  stockCard: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1.5rem',
    borderRadius: '16px',
    transition: 'transform 0.2s, border-color 0.2s',
    cursor: 'pointer',
  },
  stockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  stockSymbolGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stockIcon: {
    fontSize: '32px',
  },
  stockSymbol: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '4px',
  },
  stockName: {
    color: '#9ca3af',
    fontSize: '0.875rem',
  },
  stockPrice: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
  },
  stockChangeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockUp: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: '14px',
  },
  stockDown: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: '14px',
  },
  stockVolume: {
    color: '#6b7280',
    fontSize: '12px',
  },
  cryptoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  cryptoCard: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1.5rem',
    borderRadius: '16px',
    transition: 'transform 0.2s',
    cursor: 'pointer',
  },
  cryptoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  cryptoIcon: {
    fontSize: '36px',
  },
  cryptoName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#fff',
  },
  cryptoSymbol: {
    fontSize: '0.875rem',
    color: '#9ca3af',
  },
  cryptoStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cryptoPrice: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '4px',
  },
  cryptoMarketCap: {
    textAlign: 'right',
  },
  cryptoCapLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginBottom: '4px',
  },
  cryptoCapValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#9ca3af',
  },
  recommendationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  recommendationCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  recommendationTitle: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
  },
  recommendationText: {
    color: '#666',
    marginBottom: '1rem',
    lineHeight: '1.6',
  },
  recommendationTag: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  newsCard: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.2s, border-color 0.2s',
    cursor: 'pointer',
  },
  newsImage: {
    width: '100%',
    height: '180px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  newsContent: {
    padding: '1.5rem',
  },
  newsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  newsCategory: {
    background: 'rgba(139, 92, 246, 0.2)',
    color: '#a78bfa',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  newsDate: {
    color: '#6b7280',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.75rem',
    lineHeight: '1.5',
  },
  newsExcerpt: {
    color: '#9ca3af',
    lineHeight: '1.6',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  newsFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  newsSource: {
    color: '#6b7280',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  newsReadMore: {
    color: '#8b5cf6',
    fontSize: '0.875rem',
    fontWeight: '600',
    textDecoration: 'none',
  },
  ctaSection: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    margin: '4rem 2rem',
    color: 'white',
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #fff 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  ctaText: {
    fontSize: '1.125rem',
    marginBottom: '2rem',
    color: '#c7d2fe',
  },
  ctaButton: {
    display: 'inline-block',
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    color: 'white',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1.125rem',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
    transition: 'transform 0.2s',
  },
  footer: {
    background: 'rgba(15, 23, 41, 0.8)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#9ca3af',
    textAlign: 'center',
    padding: '2rem',
  },
};

// Add responsive styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @media (max-width: 768px) {
      .nav-links {
        display: none !important;
      }
      .mobile-menu-button {
        display: block !important;
      }
      .mobile-menu {
        display: flex !important;
      }
    }
    .nav-link:hover, .mobile-menu-link:hover {
      background: rgba(139, 92, 246, 0.1) !important;
      color: #fff !important;
    }
    .nav-button-primary:hover, .mobile-menu-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5) !important;
    }
  `;
  
  if (!document.head.querySelector('#homepage-styles')) {
    styleSheet.id = 'homepage-styles';
    document.head.appendChild(styleSheet);
  }
}

export default HomePage;
