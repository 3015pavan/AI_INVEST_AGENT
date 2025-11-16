import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DarkLayout from '../components/DarkLayout';

function PortfolioPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [userHoldings, setUserHoldings] = useState([]);
  const [newAsset, setNewAsset] = useState({
    symbol: '',
    name: '',
    type: 'Stock',
    quantity: 0,
    purchasePrice: 0,
    currentPrice: 0,
  });

  // Mock holdings data based on user risk tolerance
  const generateHoldings = () => {
    const riskTolerance = user?.riskTolerance?.toLowerCase() || 'moderate';
    
    if (riskTolerance === 'aggressive') {
      return [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', quantity: 50, currentPrice: 178.25, currentValue: 8912.5, gain: 1412.5, gainPercent: 18.83 },
        { symbol: 'BTC', name: 'Bitcoin', type: 'Crypto', quantity: 0.5, currentPrice: 43250, currentValue: 21625, gain: 4125, gainPercent: 23.57 },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Stock', quantity: 30, currentPrice: 242.80, currentValue: 7284, gain: -516, gainPercent: -6.61 },
        { symbol: 'SPY', name: 'S&P 500 ETF', type: 'ETF', quantity: 100, currentPrice: 458.50, currentValue: 45850, gain: 3850, gainPercent: 9.17 },
      ];
    } else if (riskTolerance === 'conservative') {
      return [
        { symbol: 'VOO', name: 'Vanguard S&P 500', type: 'ETF', quantity: 150, currentPrice: 412.30, currentValue: 61845, gain: 5845, gainPercent: 10.44 },
        { symbol: 'BND', name: 'Total Bond Market', type: 'ETF', quantity: 200, currentPrice: 74.50, currentValue: 14900, gain: 900, gainPercent: 6.43 },
        { symbol: 'VYM', name: 'Vanguard High Dividend', type: 'ETF', quantity: 80, currentPrice: 112.75, currentValue: 9020, gain: 1020, gainPercent: 12.74 },
      ];
    } else {
      return [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', quantity: 50, currentPrice: 178.25, currentValue: 8912.5, gain: 1412.5, gainPercent: 18.83 },
        { symbol: 'BTC', name: 'Bitcoin', type: 'Crypto', quantity: 0.5, currentPrice: 43250, currentValue: 21625, gain: 4125, gainPercent: 23.57 },
        { symbol: 'VOO', name: 'Vanguard S&P 500', type: 'ETF', quantity: 100, currentPrice: 412.30, currentValue: 41230, gain: 3230, gainPercent: 8.49 },
      ];
    }
  };

  // Initialize with generated holdings on first load
  useEffect(() => {
    if (userHoldings.length === 0) {
      setUserHoldings(generateHoldings());
    }
  }, []);

  // Combine generated holdings with user-added holdings
  const allHoldings = [...userHoldings];

  const handleAddAsset = () => {
    if (!newAsset.symbol || !newAsset.name || newAsset.quantity <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const purchasePrice = parseFloat(newAsset.purchasePrice) || 0;
    const currentPrice = parseFloat(newAsset.currentPrice) || purchasePrice;
    const quantity = parseFloat(newAsset.quantity);
    const currentValue = currentPrice * quantity;
    const purchaseValue = purchasePrice * quantity;
    const gain = currentValue - purchaseValue;
    const gainPercent = purchaseValue > 0 ? ((gain / purchaseValue) * 100) : 0;

    const asset = {
      symbol: newAsset.symbol.toUpperCase(),
      name: newAsset.name,
      type: newAsset.type,
      quantity: quantity,
      currentPrice: currentPrice,
      currentValue: currentValue,
      gain: gain,
      gainPercent: gainPercent,
    };

    setUserHoldings([...userHoldings, asset]);
    setShowAddModal(false);
    setNewAsset({
      symbol: '',
      name: '',
      type: 'Stock',
      quantity: 0,
      purchasePrice: 0,
      currentPrice: 0,
    });
  };

  const handleDeleteAsset = (index) => {
    if (window.confirm('Are you sure you want to remove this asset?')) {
      const updated = userHoldings.filter((_, i) => i !== index);
      setUserHoldings(updated);
    }
  };

  // Calculate portfolio stats from user profile
  const calculatePortfolioStats = () => {
    const monthlyBudget = user?.monthlyInvestmentBudget || 0;
    const totalInvested = monthlyBudget * 12;
    const totalValue = totalInvested * 1.1401; // 14.01% gain
    const totalGain = totalValue - totalInvested;
    const gainPercentage = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

    // Add actual holdings values
    const holdingsValue = allHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const holdingsGain = allHoldings.reduce((sum, h) => sum + h.gain, 0);

    return {
      totalValue: (totalValue + holdingsValue).toFixed(2),
      totalInvested: totalInvested.toFixed(2),
      totalGain: (totalGain + holdingsGain).toFixed(2),
      gainPercentage,
      totalAssets: allHoldings.length,
    };
  };

  const stats = calculatePortfolioStats();

  const filteredHoldings = allHoldings.filter(holding => {
    const matchesFilter = activeFilter === 'all' || holding.type.toLowerCase() === activeFilter;
    const matchesSearch = holding.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         holding.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DarkLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Portfolio</h1>
            <p style={styles.subtitle}>Manage and track all your investments</p>
          </div>
          <button style={styles.addButton} onClick={() => setShowAddModal(true)}>
            <span style={styles.addIcon}>+</span> Add Asset
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              💰
            </div>
            <div>
              <div style={styles.statLabel}>Total Value</div>
              <div style={styles.statValue}>${stats.totalValue}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              📊
            </div>
            <div>
              <div style={styles.statLabel}>Total Invested</div>
              <div style={styles.statValue}>${stats.totalInvested}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              📈
            </div>
            <div>
              <div style={styles.statLabel}>Total Gain/Loss</div>
              <div style={{...styles.statValue, color: parseFloat(stats.totalGain) >= 0 ? '#10b981' : '#ef4444'}}>
                +${stats.totalGain}
              </div>
              <div style={{fontSize: '14px', color: '#10b981'}}>+{stats.gainPercentage}%</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
              🎯
            </div>
            <div>
              <div style={styles.statLabel}>Total Assets</div>
              <div style={styles.statValue}>{stats.totalAssets}</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div style={styles.searchSection}>
          <div style={styles.searchBar}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterButtons}>
            <button
              style={activeFilter === 'all' ? styles.filterButtonActive : styles.filterButton}
              onClick={() => setActiveFilter('all')}
            >
              All Assets
            </button>
            <button
              style={activeFilter === 'stock' ? styles.filterButtonActive : styles.filterButton}
              onClick={() => setActiveFilter('stock')}
            >
              Stock
            </button>
            <button
              style={activeFilter === 'crypto' ? styles.filterButtonActive : styles.filterButton}
              onClick={() => setActiveFilter('crypto')}
            >
              Crypto
            </button>
            <button
              style={activeFilter === 'etf' ? styles.filterButtonActive : styles.filterButton}
              onClick={() => setActiveFilter('etf')}
            >
              Etf
            </button>
            <button
              style={activeFilter === 'bond' ? styles.filterButtonActive : styles.filterButton}
              onClick={() => setActiveFilter('bond')}
            >
              Bond
            </button>
            <button
              style={activeFilter === 'mutual fund' ? styles.filterButtonActive : styles.filterButton}
              onClick={() => setActiveFilter('mutual fund')}
            >
              Mutual Fund
            </button>
          </div>
        </div>

        {/* Holdings Table */}
        <div style={styles.tableCard}>
          {filteredHoldings.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Symbol</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Current Price</th>
                  <th style={styles.th}>Current Value</th>
                  <th style={styles.th}>Gain/Loss</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHoldings.map((holding, index) => (
                  <tr key={index} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.symbolCell}>
                        <div style={styles.symbolIcon}>
                          {holding.type === 'Stock' ? '📊' : holding.type === 'Crypto' ? '₿' : '📈'}
                        </div>
                        <span style={styles.symbolText}>{holding.symbol}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{holding.name}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.typeBadge,
                        background: holding.type === 'Stock' ? 'rgba(102, 126, 234, 0.2)' :
                                   holding.type === 'Crypto' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: holding.type === 'Stock' ? '#667eea' :
                               holding.type === 'Crypto' ? '#fb923c' : '#22c55e'
                      }}>
                        {holding.type}
                      </span>
                    </td>
                    <td style={styles.td}>{holding.quantity}</td>
                    <td style={styles.td}>${holding.currentPrice.toLocaleString()}</td>
                    <td style={styles.td}>${holding.currentValue.toLocaleString()}</td>
                    <td style={styles.td}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <span style={{color: holding.gain >= 0 ? '#10b981' : '#ef4444', fontWeight: '600'}}>
                          {holding.gain >= 0 ? '+' : ''}${holding.gain.toLocaleString()}
                        </span>
                        <span style={{fontSize: '12px', color: holding.gain >= 0 ? '#10b981' : '#ef4444'}}>
                          {holding.gain >= 0 ? '▲' : '▼'} {Math.abs(holding.gainPercent)}%
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleDeleteAsset(index)}
                        title="Delete asset"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📊</div>
              <div style={styles.emptyTitle}>No assets found</div>
              <div style={styles.emptyText}>Try adjusting your filters or add new assets to your portfolio</div>
              <button style={styles.emptyButton} onClick={() => navigate('/market')}>
                Browse Assets
              </button>
            </div>
          )}
        </div>

        {/* Add Asset Modal */}
        {showAddModal && (
          <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>Add New Asset</h2>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Symbol *</label>
                <input
                  type="text"
                  placeholder="e.g., AAPL, BTC"
                  value={newAsset.symbol}
                  onChange={(e) => setNewAsset({...newAsset, symbol: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Asset Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Apple Inc., Bitcoin"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Asset Type *</label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
                  style={styles.select}
                >
                  <option value="Stock">Stock</option>
                  <option value="Crypto">Crypto</option>
                  <option value="ETF">ETF</option>
                  <option value="Bond">Bond</option>
                  <option value="Mutual Fund">Mutual Fund</option>
                </select>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity *</label>
                  <input
                    type="number"
                    placeholder="0"
                    step="0.0001"
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({...newAsset, quantity: e.target.value})}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Purchase Price *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={newAsset.purchasePrice}
                    onChange={(e) => setNewAsset({...newAsset, purchasePrice: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Current Price (optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty to use purchase price"
                  step="0.01"
                  value={newAsset.currentPrice}
                  onChange={(e) => setNewAsset({...newAsset, currentPrice: e.target.value})}
                  style={styles.input}
                />
                <p style={styles.helperText}>Leave empty to use purchase price</p>
              </div>

              <div style={styles.modalActions}>
                <button
                  style={styles.cancelButton}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  style={styles.saveButton}
                  onClick={handleAddAsset}
                >
                  <span style={styles.addIcon}>+</span> Add Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DarkLayout>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#9ca3af',
  },
  addButton: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'transform 0.2s',
  },
  addIcon: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
  },
  searchSection: {
    marginBottom: '24px',
  },
  searchBar: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  searchIcon: {
    fontSize: '20px',
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '16px',
  },
  filterButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterButton: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '8px 16px',
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '8px',
    padding: '8px 16px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tableCard: {
    background: 'rgba(26, 35, 50, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '16px',
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '600',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  td: {
    padding: '16px',
    color: '#fff',
    fontSize: '14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  tableRow: {
    transition: 'background 0.2s',
    cursor: 'pointer',
  },
  symbolCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  symbolIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'rgba(139, 92, 246, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  symbolText: {
    fontWeight: '600',
    fontSize: '16px',
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  actionButton: {
    background: 'rgba(139, 92, 246, 0.2)',
    border: 'none',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    color: '#8b5cf6',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#9ca3af',
    marginBottom: '24px',
  },
  emptyButton: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '24px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(17, 24, 39, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(17, 24, 39, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  helperText: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '6px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '28px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'rgba(107, 114, 128, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#e5e7eb',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  saveButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.2s',
  },
};

export default PortfolioPage;
