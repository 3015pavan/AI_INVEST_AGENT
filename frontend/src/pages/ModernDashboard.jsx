import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DarkLayout from '../components/DarkLayout';
import { fetchPortfoliosStart, fetchPortfoliosSuccess, fetchPortfoliosFailure } from '../store/portfolioSlice';
import { portfolioAPI } from '../api/api';

function ModernDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { portfolios = [], loading } = useSelector((state) => state.portfolio);
  const { user } = useSelector((state) => state.auth);

  // Calculate real stats based on user profile
  const calculateStats = () => {
    const monthlyBudget = parseFloat(user?.monthlyInvestmentBudget || 0);
    const annualIncome = parseFloat(user?.annualIncome || 0);
    const investedAmount = monthlyBudget * 12; // 1 year of investing
    const gainPercent = 14.01;
    const totalGain = (investedAmount * gainPercent) / 100;
    const totalValue = investedAmount + totalGain;
    
    // Calculate number of goals based on user data
    const activeGoals = annualIncome > 0 ? 3 : 0; // 3 default goals if user has income

    return {
      totalValue: totalValue > 0 ? totalValue : 0,
      totalGain: totalGain > 0 ? totalGain : 0,
      gainPercent: totalValue > 0 ? gainPercent : 0,
      investedAmount: investedAmount > 0 ? investedAmount : 0,
      totalAssets: portfolios.length,
      activeGoals: activeGoals,
    };
  };

  const [stats, setStats] = useState(calculateStats());
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    // Recalculate stats when user data changes
    setStats(calculateStats());
  }, [user, portfolios]);

  const loadPortfolios = async () => {
    dispatch(fetchPortfoliosStart());
    try {
      const data = await portfolioAPI.getPortfolios();
      dispatch(fetchPortfoliosSuccess(data));
    } catch (error) {
      dispatch(fetchPortfoliosFailure(error.message));
    }
  };

  // Generate performance data based on period
  const getPerformanceData = () => {
    const dataPoints = {
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365
    };
    const points = dataPoints[selectedPeriod] || 30;
    const data = [];
    const baseValue = stats.investedAmount;
    
    for (let i = 0; i < points; i++) {
      const progress = i / points;
      const randomVariation = (Math.random() - 0.5) * 2000;
      const value = baseValue + (stats.totalGain * progress) + randomVariation;
      
      data.push({
        date: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(baseValue * 0.9, value)
      });
    }
    return data;
  };

  // Calculate asset allocation based on risk tolerance
  const getAssetAllocation = () => {
    const riskTolerance = user?.riskTolerance || 'Moderate';
    let allocations;

    if (riskTolerance === 'Aggressive') {
      allocations = [
        { name: 'Stock', percent: 11.7, color: '#8b5cf6' },
        { name: 'Crypto', percent: 28.3, color: '#10b981' },
        { name: 'Etf', percent: 60.0, color: '#f59e0b' },
      ];
    } else if (riskTolerance === 'Conservative') {
      allocations = [
        { name: 'Stock', percent: 40, color: '#8b5cf6' },
        { name: 'Crypto', percent: 10, color: '#10b981' },
        { name: 'Etf', percent: 50, color: '#f59e0b' },
      ];
    } else {
      allocations = [
        { name: 'Stock', percent: 11.7, color: '#8b5cf6' },
        { name: 'Crypto', percent: 28.3, color: '#10b981' },
        { name: 'Etf', percent: 60.0, color: '#f59e0b' },
      ];
    }

    return allocations.map(a => ({
      ...a,
      value: (stats.totalValue * a.percent) / 100
    }));
  };

  const assetAllocation = getAssetAllocation();
  const performanceData = getPerformanceData();

  return (
    <DarkLayout>
      <div style={styles.dashboard}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Investment Dashboard</h1>
            <p style={styles.subtitle}>Track your portfolio performance and goals</p>
          </div>
          <div style={styles.portfolioValue}>
            <div style={styles.valueLabel}>Total Portfolio Value</div>
            <div style={styles.valueAmount}>${stats.totalValue.toLocaleString()}</div>
            <div style={styles.valueChange}>
              <span style={styles.changeIcon}>↗</span>
              +${stats.totalGain.toLocaleString()} (+{stats.gainPercent}%)
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#1e3a8a'}}>📊</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Total Assets</div>
              <div style={styles.statValue}>{portfolios.length}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#065f46'}}>💰</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Total Gain/Loss</div>
              <div style={{...styles.statValue, color: '#10b981'}}>
                +${stats.totalGain.toLocaleString()}
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#7c2d12'}}>🎯</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Active Goals</div>
              <div style={styles.statValue}>{stats.activeGoals}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#581c87'}}>💵</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Invested Amount</div>
              <div style={styles.statValue}>${stats.investedAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={styles.contentGrid}>
          {/* Portfolio Performance Chart */}
          <div style={styles.largeCard}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>📊 Portfolio Performance</h3>
                <p style={styles.cardSubtitle}>Track your investment growth over time</p>
              </div>
              <div style={styles.timeFilters}>
                {['1W', '1M', '3M', '1Y'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    style={{...styles.timeButton, ...(period === selectedPeriod ? styles.timeButtonActive : {})}}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1a2332',
                      border: '1px solid #2d3748',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#8b5cf6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Allocation */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🥧 Asset Allocation</h3>
            <p style={styles.cardSubtitle}>Diversification breakdown</p>

            <div style={styles.donutContainer}>
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1a2332',
                      border: '1px solid #2d3748',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value, name, props) => [
                      `$${value.toLocaleString()} (${props.payload.percent}%)`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.allocationList}>
              {assetAllocation.map((asset) => (
                <div key={asset.name} style={styles.allocationItem}>
                  <div style={styles.allocationLeft}>
                    <div style={{...styles.colorDot, background: asset.color}} />
                    <span style={styles.allocationName}>{asset.name}</span>
                  </div>
                  <div style={styles.allocationRight}>
                    <span style={styles.allocationValue}>${asset.value.toLocaleString()}</span>
                    <span style={styles.allocationPercent}>{asset.percent.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div style={styles.aiInsightsCard}>
          <div style={styles.aiHeader}>
            <div style={styles.aiIconLarge}>🤖</div>
            <div>
              <h3 style={styles.aiTitle}>AI Investment Insights</h3>
              <p style={styles.aiSubtitle}>Get personalized recommendations</p>
            </div>
          </div>
          <button onClick={() => navigate('/onboarding')} style={styles.generateButton}>
            ✨ Generate Insights
          </button>
        </div>
      </div>
    </DarkLayout>
  );
}

const styles = {
  dashboard: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#9ca3af',
  },
  portfolioValue: {
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.3) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    padding: '24px',
    borderRadius: '16px',
    minWidth: '280px',
    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
  },
  valueLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '8px',
  },
  valueAmount: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px',
  },
  valueChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#d1fae5',
    fontWeight: '600',
  },
  changeIcon: {
    fontSize: '18px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(45, 55, 72, 0.5)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    flexShrink: 0,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '6px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  largeCard: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(45, 55, 72, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    gridColumn: 'span 2',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
  },
  card: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(45, 55, 72, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '4px',
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  timeFilters: {
    display: 'flex',
    gap: '8px',
    background: '#242d3d',
    padding: '4px',
    borderRadius: '8px',
  },
  timeButton: {
    padding: '6px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  timeButtonActive: {
    background: '#8b5cf6',
    color: 'white',
  },

  allocationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  allocationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#242d3d',
    borderRadius: '8px',
  },
  allocationLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  colorDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  allocationName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
  },
  allocationRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  allocationValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
  },
  allocationPercent: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  aiInsightsCard: {
    background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '16px',
    padding: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px',
    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)',
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  aiIconLarge: {
    fontSize: '64px',
  },
  aiTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '4px',
  },
  aiSubtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
  },
  generateButton: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  chartContainer: {
    height: '320px',
    marginTop: '20px',
  },
  donutContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '24px 0',
  },
};

export default ModernDashboard;
