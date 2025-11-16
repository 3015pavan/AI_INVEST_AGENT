import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DarkLayout from '../components/DarkLayout';

function InvestmentPlanPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Use user profile data if no state passed
  const income = location.state?.income || user?.annualIncome || 0;
  const goal = location.state?.goal || user?.investmentGoal || 'Not set';
  const risk = location.state?.risk || user?.riskTolerance || 'Moderate';
  const horizon = location.state?.horizon || user?.investmentHorizon || 'Medium Term (1-5 years)';
  


  // Calculate investment recommendations based on user's actual monthly budget
  const monthlyBudget = parseFloat(user?.monthlyInvestmentBudget || 0);
  const annualIncome = parseFloat(income);
  const monthlyIncome = annualIncome / 12;
  const recommendedMonthlyInvestment = monthlyBudget > 0 ? monthlyBudget : monthlyIncome * 0.15;
  const emergencyFund = monthlyIncome * 6;
  
  // Portfolio allocation based on risk tolerance
  const portfolioMix = {
    aggressive: { stocks: 70, crypto: 20, bonds: 10 },
    moderate: { stocks: 60, crypto: 15, bonds: 25 },
    conservative: { stocks: 40, crypto: 10, bonds: 50 },
  }[risk] || { stocks: 60, crypto: 15, bonds: 25 };

  // Calculate dollar amounts
  const stocksAmount = recommendedMonthlyInvestment * (portfolioMix.stocks / 100);
  const cryptoAmount = recommendedMonthlyInvestment * (portfolioMix.crypto / 100);
  const bondsAmount = recommendedMonthlyInvestment * (portfolioMix.bonds / 100);

  // Specific investment suggestions
  const stockSuggestions = [
    { name: 'S&P 500 Index Fund (VOO)', allocation: 40, amount: stocksAmount * 0.4 },
    { name: 'Technology Sector (QQQ)', allocation: 30, amount: stocksAmount * 0.3 },
    { name: 'Dividend Stocks (VYM)', allocation: 20, amount: stocksAmount * 0.2 },
    { name: 'International Index (VXUS)', allocation: 10, amount: stocksAmount * 0.1 },
  ];

  const cryptoSuggestions = [
    { name: 'Bitcoin (BTC)', allocation: 50, amount: cryptoAmount * 0.5 },
    { name: 'Ethereum (ETH)', allocation: 30, amount: cryptoAmount * 0.3 },
    { name: 'Binance Coin (BNB)', allocation: 15, amount: cryptoAmount * 0.15 },
    { name: 'Solana (SOL)', allocation: 5, amount: cryptoAmount * 0.05 },
  ];

  const bondSuggestions = [
    { name: 'Total Bond Market (BND)', allocation: 60, amount: bondsAmount * 0.6 },
    { name: 'Treasury Bonds (GOVT)', allocation: 40, amount: bondsAmount * 0.4 },
  ];

  return (
    <DarkLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Your Personalized Investment Plan</h1>
          <p style={styles.subtitle}>AI-powered recommendations based on your financial profile</p>
        </div>

        {/* Summary Cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>💰</div>
            <div style={styles.summaryLabel}>Annual Income</div>
            <div style={styles.summaryValue}>${parseFloat(income).toLocaleString()}</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>📊</div>
            <div style={styles.summaryLabel}>Monthly Investment</div>
            <div style={styles.summaryValue}>${recommendedMonthlyInvestment.toFixed(0)}</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>🎯</div>
            <div style={styles.summaryLabel}>Investment Goal</div>
            <div style={styles.summaryValue}>{goal || 'Not set'}</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>⚖️</div>
            <div style={styles.summaryLabel}>Risk Level</div>
            <div style={styles.summaryValue}>{risk || 'Moderate'}</div>
          </div>
        </div>

        {/* Portfolio Allocation */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📈 Recommended Portfolio Allocation</h2>
          <div style={styles.allocationGrid}>
            <div style={{...styles.allocationCard, background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'}}>
              <div style={styles.allocationPercentage}>{portfolioMix.stocks}%</div>
              <div style={styles.allocationLabel}>Stocks</div>
              <div style={styles.allocationAmount}>${stocksAmount.toFixed(2)}/month</div>
            </div>
            <div style={{...styles.allocationCard, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
              <div style={styles.allocationPercentage}>{portfolioMix.crypto}%</div>
              <div style={styles.allocationLabel}>Crypto</div>
              <div style={styles.allocationAmount}>${cryptoAmount.toFixed(2)}/month</div>
            </div>
            <div style={{...styles.allocationCard, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
              <div style={styles.allocationPercentage}>{portfolioMix.bonds}%</div>
              <div style={styles.allocationLabel}>Bonds</div>
              <div style={styles.allocationAmount}>${bondsAmount.toFixed(2)}/month</div>
            </div>
          </div>
        </div>

        {/* Specific Investment Recommendations */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>💼 Specific Investment Recommendations</h2>
          
          <h3 style={styles.subTitle}>📈 Stock Investments</h3>
          <div style={styles.investmentGrid}>
            {stockSuggestions.map((item, index) => (
              <div key={index} style={styles.investmentCard}>
                <div style={styles.investmentHeader}>
                  <span style={styles.investmentName}>{item.name}</span>
                  <span style={styles.investmentPercentage}>{item.allocation}%</span>
                </div>
                <div style={styles.investmentAmount}>${item.amount.toFixed(2)}/month</div>
              </div>
            ))}
          </div>

          <h3 style={styles.subTitle}>₿ Cryptocurrency Investments</h3>
          <div style={styles.investmentGrid}>
            {cryptoSuggestions.map((item, index) => (
              <div key={index} style={styles.investmentCard}>
                <div style={styles.investmentHeader}>
                  <span style={styles.investmentName}>{item.name}</span>
                  <span style={styles.investmentPercentage}>{item.allocation}%</span>
                </div>
                <div style={styles.investmentAmount}>${item.amount.toFixed(2)}/month</div>
              </div>
            ))}
          </div>

          <h3 style={styles.subTitle}>🏦 Bond Investments</h3>
          <div style={styles.investmentGrid}>
            {bondSuggestions.map((item, index) => (
              <div key={index} style={styles.investmentCard}>
                <div style={styles.investmentHeader}>
                  <span style={styles.investmentName}>{item.name}</span>
                  <span style={styles.investmentPercentage}>{item.allocation}%</span>
                </div>
                <div style={styles.investmentAmount}>${item.amount.toFixed(2)}/month</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🎯 Your Action Plan</h2>
          <div style={styles.actionList}>
            <div style={styles.actionItem}>
              <div style={styles.actionNumber}>1</div>
              <div style={styles.actionContent}>
                <h4 style={styles.actionTitle}>Build Emergency Fund</h4>
                <p style={styles.actionDesc}>
                  Save ${emergencyFund.toFixed(0)} (6 months of expenses) in a high-yield savings account
                </p>
              </div>
            </div>
            <div style={styles.actionItem}>
              <div style={styles.actionNumber}>2</div>
              <div style={styles.actionContent}>
                <h4 style={styles.actionTitle}>Open Investment Accounts</h4>
                <p style={styles.actionDesc}>
                  Set up brokerage account for stocks, crypto exchange account, and bond purchases
                </p>
              </div>
            </div>
            <div style={styles.actionItem}>
              <div style={styles.actionNumber}>3</div>
              <div style={styles.actionContent}>
                <h4 style={styles.actionTitle}>Start Dollar-Cost Averaging</h4>
                <p style={styles.actionDesc}>
                  Invest ${recommendedMonthlyInvestment.toFixed(0)} monthly following the allocation above
                </p>
              </div>
            </div>
            <div style={styles.actionItem}>
              <div style={styles.actionNumber}>4</div>
              <div style={styles.actionContent}>
                <h4 style={styles.actionTitle}>Review & Rebalance</h4>
                <p style={styles.actionDesc}>
                  Review your portfolio quarterly and rebalance to maintain target allocation
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={() => navigate('/dashboard')} style={styles.createButton}>
            🚀 View Dashboard
          </button>
          <button onClick={() => navigate('/profile')} style={styles.backButton}>
            ← Back to Profile
          </button>
        </div>
      </div>
    </DarkLayout>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#9ca3af',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  summaryCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  summaryIcon: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '25px',
  },
  subTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginTop: '30px',
    marginBottom: '15px',
  },
  allocationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  allocationCard: {
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    color: 'white',
  },
  allocationPercentage: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  allocationLabel: {
    fontSize: '18px',
    marginBottom: '8px',
    opacity: 0.9,
  },
  allocationAmount: {
    fontSize: '16px',
    fontWeight: '600',
    opacity: 0.9,
  },
  investmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  investmentCard: {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid #e0e0e0',
  },
  investmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  investmentName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
  },
  investmentPercentage: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#667eea',
    background: '#e0e7ff',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  investmentAmount: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#10b981',
  },
  actionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  actionItem: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '10px',
  },
  actionNumber: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  actionDesc: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  createButton: {
    padding: '15px 40px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
  },
  backButton: {
    padding: '15px 40px',
    background: 'white',
    color: '#333',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default InvestmentPlanPage;
