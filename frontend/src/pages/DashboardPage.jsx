import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPortfoliosStart, fetchPortfoliosSuccess, fetchPortfoliosFailure } from '../store/portfolioSlice';
import { logout } from '../store/authSlice';
import { portfolioAPI } from '../api/api';
import NavBar from '../components/NavBar';

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { portfolios = [], loading, error } = useSelector((state) => state.portfolio);
  const { user } = useSelector((state) => state.auth);

  // Chat and AI states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Market data states
  const [liveStocks, setLiveStocks] = useState([]);
  const [liveCrypto, setLiveCrypto] = useState([]);
  const [marketNews, setMarketNews] = useState([]);

  // User preferences
  const [userIncome, setUserIncome] = useState('');
  const [investmentGoal, setInvestmentGoal] = useState('');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [portfolioType, setPortfolioType] = useState('stocks'); // stocks, crypto, mixed

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    loadPortfolios();
    loadMarketData();
    loadNews();
    
    // Welcome message
    if (user) {
      setChatMessages([{
        id: 1,
        type: 'ai',
        text: `Welcome ${user.firstName || user.email || 'Investor'}! I'm your AI investment assistant. I can help you with portfolio management, market analysis, and investment suggestions. What would you like to know?`,
        timestamp: new Date()
      }]);
    }

    // Refresh market data every 30 seconds
    const marketInterval = setInterval(loadMarketData, 30000);
    const newsInterval = setInterval(loadNews, 60000);

    return () => {
      clearInterval(marketInterval);
      clearInterval(newsInterval);
    };
  }, []);

  const loadPortfolios = async () => {
    dispatch(fetchPortfoliosStart());
    try {
      const response = await portfolioAPI.getPortfolios();
      dispatch(fetchPortfoliosSuccess(response.data));
    } catch (err) {
      dispatch(fetchPortfoliosFailure(err.response?.data?.error || 'Failed to load portfolios'));
    }
  };

  const loadMarketData = () => {
    // Mock live stock data (replace with real API)
    setLiveStocks([
      { symbol: 'AAPL', name: 'Apple', price: 178.52, change: 2.34, changePercent: 1.33, volume: '52.4M' },
      { symbol: 'MSFT', name: 'Microsoft', price: 374.58, change: -1.23, changePercent: -0.33, volume: '28.1M' },
      { symbol: 'GOOGL', name: 'Alphabet', price: 140.25, change: 3.15, changePercent: 2.30, volume: '31.7M' },
      { symbol: 'TSLA', name: 'Tesla', price: 242.84, change: 8.45, changePercent: 3.60, volume: '89.2M' },
      { symbol: 'NVDA', name: 'NVIDIA', price: 505.48, change: 12.30, changePercent: 2.49, volume: '45.8M' },
    ]);

    setLiveCrypto([
      { symbol: 'BTC', name: 'Bitcoin', price: 43250.50, change: 1250.30, changePercent: 2.98 },
      { symbol: 'ETH', name: 'Ethereum', price: 2280.75, change: -45.20, changePercent: -1.94 },
      { symbol: 'BNB', name: 'Binance Coin', price: 312.45, change: 8.90, changePercent: 2.93 },
      { symbol: 'SOL', name: 'Solana', price: 98.32, change: 5.67, changePercent: 6.12 },
    ]);
  };

  const loadNews = () => {
    // Mock news data (replace with real API)
    setMarketNews([
      {
        id: 1,
        title: 'Fed Keeps Interest Rates Steady, Markets Rally',
        source: 'Reuters',
        time: '5 min ago',
        sentiment: 'positive'
      },
      {
        id: 2,
        title: 'Tech Stocks Surge on Strong Earnings Reports',
        source: 'Bloomberg',
        time: '15 min ago',
        sentiment: 'positive'
      },
      {
        id: 3,
        title: 'Bitcoin ETF Approval Sparks Crypto Rally',
        source: 'CoinDesk',
        time: '25 min ago',
        sentiment: 'positive'
      },
      {
        id: 4,
        title: 'Oil Prices Drop on Oversupply Concerns',
        source: 'CNBC',
        time: '45 min ago',
        sentiment: 'negative'
      },
    ]);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = getAIResponse(chatInput);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('portfolio') || lowerQuery.includes('invest')) {
      return `Based on your income and risk profile, I recommend diversifying across stocks and bonds. Would you like to create a new ${portfolioType} portfolio? I can help you build one tailored to your goals.`;
    }
    
    if (lowerQuery.includes('stock') || lowerQuery.includes('buy')) {
      return `I see tech stocks are performing well today. NVDA is up 2.49% and AAPL gained 1.33%. Based on current market trends, tech and AI-related stocks show strong momentum. Would you like detailed analysis on any specific stock?`;
    }
    
    if (lowerQuery.includes('crypto') || lowerQuery.includes('bitcoin')) {
      return `Cryptocurrency markets are showing positive movement. Bitcoin is up 2.98% at $43,250. Recent ETF approvals are driving institutional interest. Remember, crypto is high-risk. What's your risk tolerance?`;
    }
    
    if (lowerQuery.includes('news') || lowerQuery.includes('market')) {
      return `Today's key headlines: Fed held rates steady (bullish for markets), tech earnings exceeded expectations, and crypto ETF approvals are boosting sentiment. Overall market sentiment is positive. Want specific sector analysis?`;
    }
    
    return `I can help you with portfolio management, stock analysis, crypto insights, and personalized investment suggestions based on your income. What would you like to explore?`;
  };

  const createNewPortfolio = (type) => {
    setPortfolioType(type);
    navigate('/portfolio/new?type=' + type);
  };

  return (
    <div style={styles.pageContainer}>
      <NavBar onLogout={handleLogout} user={user} />
      
      <div style={styles.mainLayout}>
        {/* Left Sidebar - AI Assistant Chat */}
        <div style={{...styles.chatSidebar, ...(isChatOpen ? {} : {width: '60px'})}}>
          <div style={styles.chatHeader}>
            <h3 style={styles.chatTitle}>{isChatOpen && '🤖 AI Assistant'}</h3>
            <button onClick={() => setIsChatOpen(!isChatOpen)} style={styles.chatToggle}>
              {isChatOpen ? '◀' : '▶'}
            </button>
          </div>
          
          {isChatOpen && (
            <>
              <div style={styles.chatMessages}>
                {Array.isArray(chatMessages) && chatMessages.map((msg) => (
                  <div key={msg.id} style={msg.type === 'user' ? styles.userMessage : styles.aiMessage}>
                    <div style={styles.messageText}>{msg.text}</div>
                    <div style={styles.messageTime}>
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={styles.aiMessage}>
                    <div style={styles.typingIndicator}>AI is typing...</div>
                  </div>
                )}
              </div>
              
              <div style={styles.chatInput}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask me anything..."
                  style={styles.chatInputField}
                />
                <button onClick={sendChatMessage} style={styles.chatSendButton}>
                  Send
                </button>
              </div>
              
              <button onClick={() => setShowIncomeModal(true)} style={styles.incomeButton}>
                💰 Set Income & Goals
              </button>
            </>
          )}
        </div>

        {/* Main Content Area */}
        <div style={styles.mainContent}>
          <div style={styles.header}>
            <h1 style={styles.title}>Investment Dashboard</h1>
            <p style={styles.welcome}>Welcome back, {user?.firstName || user?.email || 'Investor'}! 👋</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {/* Quick Start Banner */}
          {Array.isArray(portfolios) && portfolios.length === 0 && (
            <div style={styles.quickStartBanner}>
              <div style={styles.bannerContent}>
                <div style={styles.bannerIcon}>🚀</div>
                <div>
                  <h3 style={styles.bannerTitle}>Ready to start investing?</h3>
                  <p style={styles.bannerText}>
                    Complete our quick 2-minute setup to get personalized investment recommendations
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/onboarding')} style={styles.bannerButton}>
                Get Started →
              </button>
            </div>
          )}

          {/* Portfolio Type Selection */}
          <div style={styles.portfolioTypes}>
            <h2 style={styles.sectionTitle}>Create New Portfolio</h2>
            <div style={styles.typeGrid}>
              <div onClick={() => createNewPortfolio('stocks')} style={styles.typeCard}>
                <div style={styles.typeIcon}>📈</div>
                <h3 style={styles.typeTitle}>Stocks</h3>
                <p style={styles.typeDesc}>Invest in companies</p>
              </div>
              <div onClick={() => createNewPortfolio('crypto')} style={styles.typeCard}>
                <div style={styles.typeIcon}>₿</div>
                <h3 style={styles.typeTitle}>Crypto</h3>
                <p style={styles.typeDesc}>Digital currencies</p>
              </div>
              <div onClick={() => createNewPortfolio('mixed')} style={styles.typeCard}>
                <div style={styles.typeIcon}>🔄</div>
                <h3 style={styles.typeTitle}>Mixed</h3>
                <p style={styles.typeDesc}>Diversified portfolio</p>
              </div>
              <div onClick={() => createNewPortfolio('retirement')} style={styles.typeCard}>
                <div style={styles.typeIcon}>🏦</div>
                <h3 style={styles.typeTitle}>Retirement</h3>
                <p style={styles.typeDesc}>Long-term growth</p>
              </div>
            </div>
          </div>

          {/* Your Portfolios */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Your Portfolios</h2>
            {loading ? (
              <p>Loading...</p>
            ) : !Array.isArray(portfolios) || portfolios.length === 0 ? (
              <div style={styles.empty}>
                <p>No portfolios yet. Create one above to get started!</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {portfolios.map((portfolio) => (
                  <Link key={portfolio._id} to={`/portfolio/${portfolio._id}`} style={styles.card}>
                    <h3 style={styles.cardTitle}>{portfolio.name}</h3>
                    <p style={styles.cardValue}>${portfolio.totalValue?.toLocaleString() || '0'}</p>
                    <p style={styles.cardHoldings}>{portfolio.holdings?.length || 0} holdings</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Live Market Data */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📊 Live Stock Market</h2>
            <div style={styles.marketScroll}>
              {Array.isArray(liveStocks) && liveStocks.map((stock) => (
                <div key={stock.symbol} style={styles.stockCard}>
                  <div style={styles.stockHeader}>
                    <span style={styles.stockSymbol}>{stock.symbol}</span>
                    <span style={stock.change >= 0 ? styles.priceUp : styles.priceDown}>
                      {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                    </span>
                  </div>
                  <div style={styles.stockName}>{stock.name}</div>
                  <div style={styles.stockPrice}>${stock.price.toFixed(2)}</div>
                  <div style={styles.stockVolume}>Vol: {stock.volume}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Crypto Market */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>₿ Live Crypto Market</h2>
            <div style={styles.marketScroll}>
              {Array.isArray(liveCrypto) && liveCrypto.map((crypto) => (
                <div key={crypto.symbol} style={styles.stockCard}>
                  <div style={styles.stockHeader}>
                    <span style={styles.stockSymbol}>{crypto.symbol}</span>
                    <span style={crypto.change >= 0 ? styles.priceUp : styles.priceDown}>
                      {crypto.change >= 0 ? '▲' : '▼'} {Math.abs(crypto.changePercent).toFixed(2)}%
                    </span>
                  </div>
                  <div style={styles.stockName}>{crypto.name}</div>
                  <div style={styles.stockPrice}>${crypto.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Live News */}
        <div style={styles.newsSidebar}>
          <h3 style={styles.newsTitle}>📰 Live Market News</h3>
          <div style={styles.newsScroll}>
            {Array.isArray(marketNews) && marketNews.map((news) => (
              <div key={news.id} style={styles.newsCard}>
                <div style={styles.newsHeader}>
                  <span style={styles.newsSource}>{news.source}</span>
                  <span style={styles.newsTime}>{news.time}</span>
                </div>
                <p style={styles.newsText}>{news.title}</p>
                <span style={news.sentiment === 'positive' ? styles.sentimentPositive : styles.sentimentNegative}>
                  {news.sentiment === 'positive' ? '📈 Bullish' : '📉 Bearish'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Income Modal */}
      {showIncomeModal && (
        <div style={styles.modalOverlay} onClick={() => setShowIncomeModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Your Financial Profile</h2>
            <div style={styles.modalContent}>
              <label style={styles.label}>
                Annual Income ($)
                <input
                  type="number"
                  value={userIncome}
                  onChange={(e) => setUserIncome(e.target.value)}
                  placeholder="e.g., 75000"
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Investment Goal
                <select
                  value={investmentGoal}
                  onChange={(e) => setInvestmentGoal(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select a goal</option>
                  <option value="growth">Aggressive Growth</option>
                  <option value="balanced">Balanced Growth</option>
                  <option value="income">Income Generation</option>
                  <option value="retirement">Retirement Planning</option>
                  <option value="preservation">Capital Preservation</option>
                </select>
              </label>
              <div style={styles.modalActions}>
                <button onClick={() => setShowIncomeModal(false)} style={styles.modalButton}>
                  Save & Get Recommendations
                </button>
                <button onClick={() => setShowIncomeModal(false)} style={styles.modalCancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  mainLayout: {
    display: 'flex',
    height: 'calc(100vh - 70px)',
    overflow: 'hidden',
  },
  chatSidebar: {
    width: '320px',
    background: 'white',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
  },
  chatHeader: {
    padding: '20px',
    borderBottom: '2px solid #667eea',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  chatToggle: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userMessage: {
    alignSelf: 'flex-end',
    background: '#667eea',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '18px 18px 4px 18px',
    maxWidth: '80%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    background: '#f0f0f0',
    color: '#333',
    padding: '12px 16px',
    borderRadius: '18px 18px 18px 4px',
    maxWidth: '80%',
  },
  messageText: {
    fontSize: '14px',
    lineHeight: '1.4',
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
    marginTop: '4px',
  },
  typingIndicator: {
    fontSize: '14px',
    fontStyle: 'italic',
    color: '#666',
  },
  chatInput: {
    padding: '15px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: '10px',
  },
  chatInputField: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    fontSize: '14px',
    outline: 'none',
  },
  chatSendButton: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  incomeButton: {
    margin: '15px',
    padding: '12px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '30px',
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  },
  welcome: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.9)',
  },
  error: {
    background: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  portfolioTypes: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  typeCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '25px',
    borderRadius: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  typeIcon: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  typeTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '5px',
  },
  typeDesc: {
    fontSize: '14px',
    opacity: 0.9,
  },
  section: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '10px',
    padding: '20px',
    textDecoration: 'none',
    transition: 'transform 0.2s',
    cursor: 'pointer',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  cardValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  cardHoldings: {
    fontSize: '14px',
    opacity: 0.9,
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
  marketScroll: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  stockCard: {
    background: 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)',
    borderRadius: '8px',
    padding: '15px',
    border: '1px solid #ddd',
  },
  stockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  stockSymbol: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  stockName: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
  },
  stockPrice: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  stockVolume: {
    fontSize: '11px',
    color: '#888',
  },
  priceUp: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  priceDown: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  newsSidebar: {
    width: '350px',
    background: 'white',
    borderLeft: '1px solid #e0e0e0',
    padding: '20px',
    overflowY: 'auto',
  },
  newsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
    borderBottom: '2px solid #667eea',
    paddingBottom: '10px',
  },
  newsScroll: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  newsCard: {
    background: '#f9f9f9',
    borderRadius: '8px',
    padding: '15px',
    border: '1px solid #e0e0e0',
    transition: 'box-shadow 0.2s',
    cursor: 'pointer',
  },
  newsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  newsSource: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#667eea',
  },
  newsTime: {
    fontSize: '11px',
    color: '#888',
  },
  newsText: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.4',
    marginBottom: '8px',
  },
  sentimentPositive: {
    display: 'inline-block',
    background: '#d1fae5',
    color: '#065f46',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  sentimentNegative: {
    display: 'inline-block',
    background: '#fee2e2',
    color: '#991b1b',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
  },
  modalButton: {
    flex: 1,
    padding: '12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalCancelButton: {
    flex: 1,
    padding: '12px',
    background: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  quickStartBanner: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
    flexWrap: 'wrap',
    gap: '20px',
  },
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    color: 'white',
  },
  bannerIcon: {
    fontSize: '64px',
  },
  bannerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  bannerText: {
    fontSize: '16px',
    opacity: 0.95,
  },
  bannerButton: {
    padding: '15px 35px',
    background: 'white',
    color: '#059669',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
};

export default DashboardPage;
