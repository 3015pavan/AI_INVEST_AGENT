import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DarkLayout from '../components/DarkLayout';

function MarketPage() {
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insights, setInsights] = useState('');

  const [trendingAssets] = useState([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 178.25,
      change: 1.42,
      changePercent: '+1.42%',
      icon: '🍎',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 248.5,
      change: -3.2,
      changePercent: '-1.27%',
      icon: '⚡',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft',
      price: 378.9,
      change: 4.85,
      changePercent: '+1.03%',
      icon: '💻',
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA',
      price: 495.2,
      change: 12.3,
      changePercent: '+2.65%',
      icon: '🎮',
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 43250,
      change: 850,
      changePercent: '+2.01%',
      icon: '₿',
    },
  ]);

  const [marketNews] = useState([
    {
      category: 'Policy',
      time: '2 hours ago',
      title: 'Federal Reserve Maintains Interest Rates',
      source: 'Reuters',
    },
    {
      category: 'Tech',
      time: '4 hours ago',
      title: 'Apple Announces New AI Features',
      source: 'Bloomberg',
    },
    {
      category: 'Crypto',
      time: '6 hours ago',
      title: 'Bitcoin Surges Past $43K Mark',
      source: 'CoinDesk',
    },
    {
      category: 'Markets',
      time: '8 hours ago',
      title: 'S&P 500 Reaches New All-Time High',
      source: 'CNBC',
    },
  ]);

  const handleAnalyze = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert(`Analyzing ${searchQuery}... Feature coming soon!`);
    }, 1500);
  };

  const handleGenerateInsights = async () => {
    setInsightLoading(true);
    setShowInsights(true);
    
    // Simulate AI insights generation
    setTimeout(() => {
      setInsights(`📊 Market Analysis Insights:

• The technology sector is showing strong momentum with AAPL, MSFT, and NVDA leading gains
• Bitcoin's recent surge past $43K indicates renewed institutional interest in crypto markets
• Federal Reserve's decision to maintain rates suggests a cautious but optimistic economic outlook
• Recommendation: Consider diversifying portfolio with 60% stocks, 30% crypto, 10% bonds
• Risk Level: Moderate - Market volatility expected in Q1 2025

Key Opportunities:
1. Tech stocks remain attractive for long-term growth
2. Bitcoin could test $50K resistance level soon
3. Dividend stocks provide stability in current environment`);
      setInsightLoading(false);
    }, 2000);
  };

  return (
    <DarkLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Market Analysis</h1>
            <p style={styles.subtitle}>Real-time market data and AI-powered insights</p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchSection}>
          <div style={styles.searchBar}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search stocks, crypto, ETFs... (e.g., AAPL, Bitcoin)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              style={styles.searchInput}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={styles.analyzeButton}
          >
            <span style={styles.buttonIcon}>✨</span>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {/* Main Content Grid */}
        <div style={styles.contentGrid}>
          {/* Trending Assets */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleRow}>
                <span style={styles.cardIcon}>🔥</span>
                <h3 style={styles.cardTitle}>Trending Assets</h3>
              </div>
              <p style={styles.cardSubtitle}>Popular investments today</p>
            </div>

            <div style={styles.assetsList}>
              {trendingAssets.map((asset) => (
                <div key={asset.symbol} style={styles.assetItem}>
                  <div style={styles.assetInfo}>
                    <div style={styles.assetIcon}>{asset.icon}</div>
                    <div>
                      <div style={styles.assetSymbol}>{asset.symbol}</div>
                      <div style={styles.assetName}>{asset.name}</div>
                    </div>
                  </div>
                  <div style={styles.assetPrice}>
                    <div style={styles.priceValue}>${asset.price.toLocaleString()}</div>
                    <div
                      style={{
                        ...styles.priceChange,
                        color: asset.change >= 0 ? '#10b981' : '#ef4444',
                      }}
                    >
                      {asset.change >= 0 ? '📈' : '📉'} {asset.changePercent}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Insights */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleRow}>
                <span style={styles.cardIcon}>💡</span>
                <h3 style={styles.cardTitle}>Market Insights</h3>
              </div>
              <p style={styles.cardSubtitle}>AI-powered market analysis</p>
            </div>

            {!showInsights ? (
              <div style={styles.insightsPlaceholder}>
                <div style={styles.sparkleIcon}>✨</div>
                <p style={styles.insightsPrompt}>Get real-time market insights</p>
                <p style={styles.insightsDesc}>Click the sparkle button to analyze</p>
                <button
                  onClick={handleGenerateInsights}
                  disabled={insightLoading}
                  style={styles.generateButton}
                >
                  <span style={styles.buttonIcon}>🤖</span>
                  {insightLoading ? 'Generating...' : 'Generate Insights'}
                </button>
              </div>
            ) : (
              <div style={styles.insightsContent}>
                {insightLoading ? (
                  <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Analyzing market data...</p>
                  </div>
                ) : (
                  <>
                    <div style={styles.insightsText}>{insights}</div>
                    <button
                      onClick={handleGenerateInsights}
                      style={styles.refreshButton}
                    >
                      🔄 Refresh Insights
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Market News */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleRow}>
              <span style={styles.cardIcon}>📰</span>
              <h3 style={styles.cardTitle}>Market News</h3>
            </div>
            <p style={styles.cardSubtitle}>Latest financial updates</p>
          </div>

          <div style={styles.newsList}>
            {marketNews.map((news, index) => (
              <div key={index} style={styles.newsItem}>
                <div style={styles.newsHeader}>
                  <span style={styles.newsCategory}>{news.category}</span>
                  <span style={styles.newsTime}>{news.time}</span>
                </div>
                <h4 style={styles.newsTitle}>{news.title}</h4>
                <div style={styles.newsFooter}>
                  <span style={styles.newsSource}>{news.source}</span>
                  <button style={styles.newsLink}>
                    Read More <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DarkLayout>
  );
}

const isMobile = window.innerWidth <= 768;

const styles = {
  container: {
    padding: isMobile ? '16px' : '30px',
    maxWidth: '1400px',
  },
  header: {
    marginBottom: isMobile ? '20px' : '30px',
  },
  title: {
    fontSize: isMobile ? '22px' : '28px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: isMobile ? '13px' : '14px',
    color: '#9ca3af',
  },
  searchSection: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '12px' : '16px',
    marginBottom: isMobile ? '20px' : '30px',
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: '#1a2332',
    border: '1px solid #374151',
    borderRadius: isMobile ? '10px' : '12px',
    padding: isMobile ? '0 16px' : '0 20px',
  },
  searchIcon: {
    fontSize: '20px',
    marginRight: '12px',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: isMobile ? '14px' : '15px',
    padding: isMobile ? '14px 0' : '16px 0',
    minHeight: '44px',
  },
  analyzeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: isMobile ? '14px 24px' : '16px 32px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none',
    borderRadius: isMobile ? '10px' : '12px',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
    whiteSpace: 'nowrap',
    minHeight: '44px',
    width: isMobile ? '100%' : 'auto',
  },
  buttonIcon: {
    fontSize: isMobile ? '16px' : '18px',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: isMobile ? '16px' : '24px',
    marginBottom: isMobile ? '16px' : '24px',
  },
  card: {
    background: '#1a2332',
    borderRadius: isMobile ? '10px' : '12px',
    padding: isMobile ? '20px' : '30px',
    border: '1px solid #242d3d',
  },
  cardHeader: {
    marginBottom: '24px',
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  cardIcon: {
    fontSize: '24px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
  assetsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  assetItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#242d3d',
    borderRadius: '10px',
    transition: 'transform 0.2s',
    cursor: 'pointer',
  },
  assetInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  assetIcon: {
    fontSize: '32px',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#8b5cf6',
    borderRadius: '50%',
  },
  assetSymbol: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '4px',
  },
  assetName: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  assetPrice: {
    textAlign: 'right',
  },
  priceValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '4px',
  },
  priceChange: {
    fontSize: '14px',
    fontWeight: '600',
  },
  insightsPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  sparkleIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    animation: 'pulse 2s infinite',
  },
  insightsPrompt: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
  },
  insightsDesc: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '24px',
  },
  generateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  insightsContent: {
    padding: '20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #242d3d',
    borderTop: '4px solid #8b5cf6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#9ca3af',
  },
  insightsText: {
    fontSize: '14px',
    lineHeight: '1.8',
    color: '#d1d5db',
    whiteSpace: 'pre-wrap',
    marginBottom: '20px',
  },
  refreshButton: {
    padding: '10px 20px',
    background: '#242d3d',
    border: '1px solid #374151',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
  },
  newsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  newsItem: {
    padding: '20px',
    background: '#242d3d',
    borderRadius: '10px',
    border: '1px solid #374151',
  },
  newsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  newsCategory: {
    padding: '4px 12px',
    background: '#8b5cf6',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
  },
  newsTime: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  newsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '12px',
    lineHeight: '1.5',
  },
  newsFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  newsLink: {
    background: 'transparent',
    border: 'none',
    color: '#8b5cf6',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};

export default MarketPage;
