import { useState } from 'react';
import { useSelector } from 'react-redux';
import DarkLayout from '../components/DarkLayout';

function GoalsPage() {
  const { user } = useSelector((state) => state.auth);
  
  // Calculate default goals based on user profile
  const getDefaultGoals = () => {
    const monthlyBudget = parseFloat(user?.monthlyInvestmentBudget || 0);
    const annualIncome = parseFloat(user?.annualIncome || 0);
    const emergencyFundTarget = (annualIncome / 12) * 6; // 6 months expenses
    
    const baseGoals = [];
    
    // Only add goals if user has income data
    if (annualIncome > 0) {
      baseGoals.push({
        id: 1,
        name: 'Retirement Fund',
        targetAmount: annualIncome * 10, // 10x annual income
        currentAmount: monthlyBudget * 12, // 1 year of contributions
        targetDate: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'retirement',
        priority: 'high',
        monthlyContribution: monthlyBudget * 0.5,
      });
      
      if (emergencyFundTarget > 0) {
        baseGoals.push({
          id: 2,
          name: 'Emergency Fund',
          targetAmount: emergencyFundTarget,
          currentAmount: emergencyFundTarget * 0.4,
          targetDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'savings',
          priority: 'high',
          monthlyContribution: monthlyBudget * 0.3,
        });
      }
      
      baseGoals.push({
        id: 3,
        name: 'Investment Growth',
        targetAmount: annualIncome * 2,
        currentAmount: monthlyBudget * 6,
        targetDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'investment',
        priority: 'medium',
        monthlyContribution: monthlyBudget * 0.2,
      });
    }
    
    return baseGoals;
  };
  
  const [goals, setGoals] = useState(getDefaultGoals());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'savings',
    priority: 'medium',
    monthlyContribution: '',
  });

  const calculateProgress = (current, target) => {
    return ((current / target) * 100).toFixed(1);
  };

  const calculateMonthsRemaining = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const months = Math.max(0, Math.round((target - now) / (1000 * 60 * 60 * 24 * 30)));
    return months;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      retirement: '🏖️',
      home: '🏠',
      savings: '💰',
      education: '🎓',
      travel: '✈️',
      investment: '📈',
      other: '🎯',
    };
    return icons[category] || '🎯';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    };
    return colors[priority] || '#9ca3af';
  };

  const handleCreateGoal = () => {
    const goal = {
      id: goals.length + 1,
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount || 0),
      monthlyContribution: parseFloat(newGoal.monthlyContribution || 0),
    };
    setGoals([...goals, goal]);
    setShowCreateModal(false);
    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      category: 'savings',
      priority: 'medium',
      monthlyContribution: '',
    });
  };

  return (
    <DarkLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Financial Goals</h1>
            <p style={styles.subtitle}>Track and manage your investment goals</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={styles.createButton}>
            <span style={styles.buttonIcon}>➕</span>
            Create Goal
          </button>
        </div>

        {/* Goals Summary Cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>🎯</div>
            <div style={styles.summaryContent}>
              <div style={styles.summaryLabel}>Total Goals</div>
              <div style={styles.summaryValue}>{goals.length}</div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>💵</div>
            <div style={styles.summaryContent}>
              <div style={styles.summaryLabel}>Total Target</div>
              <div style={styles.summaryValue}>
                ${goals.reduce((sum, g) => sum + g.targetAmount, 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>📊</div>
            <div style={styles.summaryContent}>
              <div style={styles.summaryLabel}>Total Saved</div>
              <div style={styles.summaryValue}>
                ${goals.reduce((sum, g) => sum + g.currentAmount, 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>💰</div>
            <div style={styles.summaryContent}>
              <div style={styles.summaryLabel}>Monthly Contribution</div>
              <div style={styles.summaryValue}>
                ${goals.reduce((sum, g) => sum + g.monthlyContribution, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Goals List */}
        <div style={styles.goalsGrid}>
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
            
            return (
              <div key={goal.id} style={styles.goalCard}>
                <div style={styles.goalHeader}>
                  <div style={styles.goalTitleRow}>
                    <span style={styles.goalIcon}>{getCategoryIcon(goal.category)}</span>
                    <h3 style={styles.goalName}>{goal.name}</h3>
                  </div>
                  <span
                    style={{
                      ...styles.priorityBadge,
                      background: getPriorityColor(goal.priority),
                    }}
                  >
                    {goal.priority}
                  </span>
                </div>

                <div style={styles.goalProgress}>
                  <div style={styles.progressHeader}>
                    <span style={styles.progressLabel}>Progress</span>
                    <span style={styles.progressPercent}>{progress}%</span>
                  </div>
                  <div style={styles.progressBarContainer}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${Math.min(progress, 100)}%`,
                      }}
                    />
                  </div>
                  <div style={styles.progressAmounts}>
                    <span style={styles.currentAmount}>
                      ${goal.currentAmount.toLocaleString()}
                    </span>
                    <span style={styles.targetAmount}>
                      ${goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={styles.goalDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>📅 Target Date</span>
                    <span style={styles.detailValue}>
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>⏱️ Time Remaining</span>
                    <span style={styles.detailValue}>{monthsRemaining} months</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>💳 Monthly Contribution</span>
                    <span style={styles.detailValue}>
                      ${goal.monthlyContribution.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={styles.goalActions}>
                  <button style={styles.actionButton}>Edit</button>
                  <button style={styles.actionButtonOutline}>View Details</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Goal Modal */}
        {showCreateModal && (
          <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Create New Goal</h2>
                <button
                  style={styles.closeButton}
                  onClick={() => setShowCreateModal(false)}
                >
                  ✕
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Goal Name</label>
                  <input
                    type="text"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    placeholder="e.g., Retirement Fund"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Target Amount</label>
                    <input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, targetAmount: e.target.value })
                      }
                      placeholder="0"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Current Amount</label>
                    <input
                      type="number"
                      value={newGoal.currentAmount}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, currentAmount: e.target.value })
                      }
                      placeholder="0"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Target Date</label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, targetDate: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Monthly Contribution</label>
                    <input
                      type="number"
                      value={newGoal.monthlyContribution}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, monthlyContribution: e.target.value })
                      }
                      placeholder="0"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category</label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                      style={styles.select}
                    >
                      <option value="savings">Savings</option>
                      <option value="retirement">Retirement</option>
                      <option value="home">Home</option>
                      <option value="education">Education</option>
                      <option value="travel">Travel</option>
                      <option value="investment">Investment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Priority</label>
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                      style={styles.select}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  style={styles.cancelButton}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button style={styles.submitButton} onClick={handleCreateGoal}>
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        )}
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
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'flex-start',
    marginBottom: isMobile ? '20px' : '30px',
    gap: isMobile ? '16px' : '0',
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
  createButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: isMobile ? '10px 20px' : '12px 24px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none',
    borderRadius: isMobile ? '8px' : '10px',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
    minHeight: '44px',
    width: isMobile ? '100%' : 'auto',
  },
  buttonIcon: {
    fontSize: isMobile ? '14px' : '16px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: isMobile ? '12px' : '20px',
    marginBottom: isMobile ? '20px' : '30px',
  },
  summaryCard: {
    background: '#1a2332',
    borderRadius: isMobile ? '10px' : '12px',
    padding: isMobile ? '20px' : '24px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '12px' : '16px',
    border: '1px solid #242d3d',
  },
  summaryIcon: {
    fontSize: isMobile ? '30px' : '36px',
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: isMobile ? '12px' : '13px',
    color: '#9ca3af',
    marginBottom: '4px',
  },
  summaryValue: {
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: '700',
    color: '#fff',
  },
  goalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px',
  },
  goalCard: {
    background: '#1a2332',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #242d3d',
  },
  goalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  goalTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  goalIcon: {
    fontSize: '24px',
  },
  goalName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  priorityBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  goalProgress: {
    marginBottom: '20px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  progressLabel: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  progressPercent: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#8b5cf6',
  },
  progressBarContainer: {
    height: '8px',
    background: '#242d3d',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressAmounts: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  currentAmount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#10b981',
  },
  targetAmount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#9ca3af',
  },
  goalDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    background: '#242d3d',
    borderRadius: '8px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  goalActions: {
    display: 'flex',
    gap: '12px',
  },
  actionButton: {
    flex: 1,
    padding: '10px',
    background: '#8b5cf6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
  },
  actionButtonOutline: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: '1px solid #374151',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#d1d5db',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1a2332',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid #242d3d',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #242d3d',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
  },
  modalBody: {
    padding: '24px',
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
    fontSize: '13px',
    fontWeight: '500',
    color: '#d1d5db',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#242d3d',
    border: '1px solid #374151',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    background: '#242d3d',
    border: '1px solid #374151',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
    cursor: 'pointer',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid #242d3d',
  },
  cancelButton: {
    padding: '12px 24px',
    background: 'transparent',
    border: '1px solid #374151',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#d1d5db',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default GoalsPage;
