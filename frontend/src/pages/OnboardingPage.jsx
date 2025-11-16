import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import NavBar from '../components/NavBar';
import { updateUserProfile } from '../store/authSlice';

function OnboardingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Income
    annualIncome: '',
    monthlyIncome: '',
    incomeSource: 'salary',
    
    // Step 2: Investment Interests
    interestedDomains: [],
    primaryGoal: '',
    
    // Step 3: Risk & Timeline
    riskTolerance: 'moderate',
    investmentHorizon: '5-10years',
    investmentAmount: '',
    
    // Step 4: Account Sync
    bankConnected: false,
    bankName: '',
  });

  const investmentDomains = [
    { id: 'stocks', name: 'Stocks & ETFs', icon: '📈', desc: 'Equity investments' },
    { id: 'crypto', name: 'Cryptocurrency', icon: '₿', desc: 'Digital assets' },
    { id: 'realestate', name: 'Real Estate', icon: '🏠', desc: 'Property investments' },
    { id: 'bonds', name: 'Bonds & Fixed Income', icon: '💰', desc: 'Safe returns' },
    { id: 'commodities', name: 'Commodities', icon: '🥇', desc: 'Gold, Oil, etc.' },
    { id: 'startups', name: 'Startups', icon: '🚀', desc: 'High-risk ventures' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'annualIncome') {
      setFormData(prev => ({
        ...prev,
        annualIncome: value,
        monthlyIncome: value ? (parseFloat(value) / 12).toFixed(2) : '',
      }));
    }
  };

  const toggleDomain = (domainId) => {
    setFormData(prev => ({
      ...prev,
      interestedDomains: prev.interestedDomains.includes(domainId)
        ? prev.interestedDomains.filter(id => id !== domainId)
        : [...prev.interestedDomains, domainId]
    }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    // Save onboarding data to Redux user profile
    const profileData = {
      annualIncome: formData.annualIncome,
      monthlyInvestmentBudget: formData.investmentAmount,
      investmentGoal: formData.primaryGoal,
      riskTolerance: formData.riskTolerance.charAt(0).toUpperCase() + formData.riskTolerance.slice(1),
      investmentHorizon: formData.investmentHorizon,
      selectedSectors: formData.interestedDomains,
    };
    
    dispatch(updateUserProfile(profileData));
    console.log('Onboarding data saved to profile:', profileData);
    
    // Navigate to investment plan
    navigate('/investment-plan', { 
      state: {
        income: formData.annualIncome,
        goal: formData.primaryGoal,
        risk: formData.riskTolerance,
        horizon: formData.investmentHorizon,
        domains: formData.interestedDomains,
        investmentAmount: formData.investmentAmount,
      }
    });
  };

  const connectBank = (bankName) => {
    setFormData(prev => ({
      ...prev,
      bankConnected: true,
      bankName,
    }));
    // In real app, integrate with Plaid or similar service
  };

  const canProceed = () => {
    switch(step) {
      case 1: return formData.annualIncome && formData.incomeSource;
      case 2: return formData.interestedDomains.length > 0 && formData.primaryGoal;
      case 3: return formData.investmentAmount;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div style={styles.page}>
      <NavBar onLogout={handleLogout} user={user} />
      
      <div style={styles.container}>
        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${(step / 4) * 100}%`}} />
          </div>
          <div style={styles.progressText}>Step {step} of 4</div>
        </div>

        <div style={styles.card}>
          {/* Step 1: Income Information */}
          {step === 1 && (
            <div style={styles.stepContent}>
              <div style={styles.stepHeader}>
                <div style={styles.stepIcon}>💰</div>
                <h2 style={styles.stepTitle}>Let's start with your income</h2>
                <p style={styles.stepDesc}>This helps us understand your investment capacity</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Annual Income ($)</label>
                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  placeholder="e.g., 75,000"
                  style={styles.input}
                />
                {formData.monthlyIncome && (
                  <p style={styles.hint}>≈ ${parseFloat(formData.monthlyIncome).toLocaleString()}/month</p>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Primary Income Source</label>
                <div style={styles.optionGrid}>
                  {['salary', 'business', 'freelance', 'investments', 'other'].map(source => (
                    <button
                      key={source}
                      onClick={() => setFormData(prev => ({ ...prev, incomeSource: source }))}
                      style={{
                        ...styles.optionButton,
                        ...(formData.incomeSource === source ? styles.optionButtonActive : {})
                      }}
                    >
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Investment Interests */}
          {step === 2 && (
            <div style={styles.stepContent}>
              <div style={styles.stepHeader}>
                <div style={styles.stepIcon}>🎯</div>
                <h2 style={styles.stepTitle}>What interests you?</h2>
                <p style={styles.stepDesc}>Select all investment types you'd like to explore</p>
              </div>

              <div style={styles.domainGrid}>
                {investmentDomains.map(domain => (
                  <div
                    key={domain.id}
                    onClick={() => toggleDomain(domain.id)}
                    style={{
                      ...styles.domainCard,
                      ...(formData.interestedDomains.includes(domain.id) ? styles.domainCardActive : {})
                    }}
                  >
                    <div style={styles.domainIcon}>{domain.icon}</div>
                    <h3 style={styles.domainName}>{domain.name}</h3>
                    <p style={styles.domainDesc}>{domain.desc}</p>
                    {formData.interestedDomains.includes(domain.id) && (
                      <div style={styles.checkmark}>✓</div>
                    )}
                  </div>
                ))}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Primary Investment Goal</label>
                <select
                  name="primaryGoal"
                  value={formData.primaryGoal}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select your main goal</option>
                  <option value="wealth-building">Build Long-term Wealth</option>
                  <option value="retirement">Retirement Planning</option>
                  <option value="passive-income">Generate Passive Income</option>
                  <option value="short-term">Short-term Gains</option>
                  <option value="preservation">Preserve Capital</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Risk & Investment Amount */}
          {step === 3 && (
            <div style={styles.stepContent}>
              <div style={styles.stepHeader}>
                <div style={styles.stepIcon}>⚖️</div>
                <h2 style={styles.stepTitle}>Investment preferences</h2>
                <p style={styles.stepDesc}>Help us tailor recommendations to your comfort level</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>How much do you want to invest monthly?</label>
                <input
                  type="number"
                  name="investmentAmount"
                  value={formData.investmentAmount}
                  onChange={handleChange}
                  placeholder="e.g., 1,000"
                  style={styles.input}
                />
                {formData.annualIncome && formData.investmentAmount && (
                  <p style={styles.hint}>
                    {((formData.investmentAmount / formData.monthlyIncome) * 100).toFixed(1)}% of monthly income
                    {(formData.investmentAmount / formData.monthlyIncome) < 0.10 && ' - Consider increasing!'}
                    {(formData.investmentAmount / formData.monthlyIncome) > 0.30 && ' - Make sure to keep emergency fund!'}
                  </p>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Risk Tolerance</label>
                <div style={styles.riskGrid}>
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, riskTolerance: 'conservative' }))}
                    style={{
                      ...styles.riskCard,
                      ...(formData.riskTolerance === 'conservative' ? styles.riskCardActive : {})
                    }}
                  >
                    <div style={styles.riskIcon}>🛡️</div>
                    <h4 style={styles.riskTitle}>Conservative</h4>
                    <p style={styles.riskDesc}>Low risk, stable returns</p>
                  </div>
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, riskTolerance: 'moderate' }))}
                    style={{
                      ...styles.riskCard,
                      ...(formData.riskTolerance === 'moderate' ? styles.riskCardActive : {})
                    }}
                  >
                    <div style={styles.riskIcon}>⚖️</div>
                    <h4 style={styles.riskTitle}>Moderate</h4>
                    <p style={styles.riskDesc}>Balanced approach</p>
                  </div>
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, riskTolerance: 'aggressive' }))}
                    style={{
                      ...styles.riskCard,
                      ...(formData.riskTolerance === 'aggressive' ? styles.riskCardActive : {})
                    }}
                  >
                    <div style={styles.riskIcon}>🚀</div>
                    <h4 style={styles.riskTitle}>Aggressive</h4>
                    <p style={styles.riskDesc}>High risk, high reward</p>
                  </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Investment Timeline</label>
                <select
                  name="investmentHorizon"
                  value={formData.investmentHorizon}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="1-2years">1-2 Years (Short-term)</option>
                  <option value="3-5years">3-5 Years (Medium-term)</option>
                  <option value="5-10years">5-10 Years (Long-term)</option>
                  <option value="10+years">10+ Years (Retirement)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Bank Account Sync */}
          {step === 4 && (
            <div style={styles.stepContent}>
              <div style={styles.stepHeader}>
                <div style={styles.stepIcon}>🔗</div>
                <h2 style={styles.stepTitle}>Connect your bank account</h2>
                <p style={styles.stepDesc}>Securely sync your account for easy funding and tracking</p>
              </div>

              {!formData.bankConnected ? (
                <>
                  <div style={styles.bankBenefits}>
                    <div style={styles.benefitItem}>
                      <span style={styles.benefitIcon}>⚡</span>
                      <span>Instant fund transfers</span>
                    </div>
                    <div style={styles.benefitItem}>
                      <span style={styles.benefitIcon}>📊</span>
                      <span>Real-time balance tracking</span>
                    </div>
                    <div style={styles.benefitItem}>
                      <span style={styles.benefitIcon}>🔒</span>
                      <span>Bank-level security</span>
                    </div>
                    <div style={styles.benefitItem}>
                      <span style={styles.benefitIcon}>🤖</span>
                      <span>Auto-investment setup</span>
                    </div>
                  </div>

                  <div style={styles.bankGrid}>
                    {['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Other Banks'].map(bank => (
                      <button
                        key={bank}
                        onClick={() => connectBank(bank)}
                        style={styles.bankButton}
                      >
                        <div style={styles.bankIcon}>🏦</div>
                        <span>{bank}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setFormData(prev => ({ ...prev, bankConnected: true, bankName: 'Manual' }))}
                    style={styles.skipButton}
                  >
                    Skip for now
                  </button>
                </>
              ) : (
                <div style={styles.successBox}>
                  <div style={styles.successIcon}>✅</div>
                  <h3 style={styles.successTitle}>
                    {formData.bankName === 'Manual' ? 'Setup Complete!' : `${formData.bankName} Connected!`}
                  </h3>
                  <p style={styles.successDesc}>
                    {formData.bankName === 'Manual' 
                      ? 'You can connect your bank account later in settings'
                      : 'Your account is securely linked and ready to fund investments'}
                  </p>
                  
                  <div style={styles.summaryBox}>
                    <h4 style={styles.summaryTitle}>Your Investment Profile</h4>
                    <div style={styles.summaryGrid}>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Monthly Investment:</span>
                        <span style={styles.summaryValue}>${parseFloat(formData.investmentAmount).toLocaleString()}</span>
                      </div>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Interested in:</span>
                        <span style={styles.summaryValue}>{formData.interestedDomains.length} domains</span>
                      </div>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Risk Level:</span>
                        <span style={styles.summaryValue}>{formData.riskTolerance}</span>
                      </div>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Timeline:</span>
                        <span style={styles.summaryValue}>{formData.investmentHorizon}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={styles.buttonGroup}>
            {step > 1 && (
              <button onClick={handleBack} style={styles.backBtn}>
                ← Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                style={{
                  ...styles.nextBtn,
                  ...(canProceed() ? {} : styles.btnDisabled)
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                style={styles.finishBtn}
              >
                🚀 Get My Investment Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  progressContainer: {
    marginBottom: '30px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
    transition: 'width 0.3s ease',
  },
  progressText: {
    textAlign: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '50px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  stepContent: {
    minHeight: '450px',
  },
  stepHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  stepIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  stepTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  stepDesc: {
    fontSize: '16px',
    color: '#666',
  },
  formGroup: {
    marginBottom: '30px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
  },
  input: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border 0.2s',
  },
  select: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '16px',
    outline: 'none',
    background: 'white',
    cursor: 'pointer',
  },
  hint: {
    fontSize: '14px',
    color: '#667eea',
    marginTop: '8px',
    fontWeight: '500',
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
  },
  optionButton: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    background: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionButtonActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea',
  },
  domainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  domainCard: {
    padding: '20px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  domainCardActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderColor: '#667eea',
  },
  domainIcon: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  domainName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '5px',
  },
  domainDesc: {
    fontSize: '12px',
    opacity: 0.8,
  },
  checkmark: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    background: 'white',
    color: '#667eea',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  riskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
  },
  riskCard: {
    padding: '25px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  riskCardActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderColor: '#667eea',
  },
  riskIcon: {
    fontSize: '36px',
    marginBottom: '10px',
  },
  riskTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  riskDesc: {
    fontSize: '13px',
    opacity: 0.8,
  },
  bankBenefits: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: '#f0f9ff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  benefitIcon: {
    fontSize: '24px',
  },
  bankGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  bankButton: {
    padding: '20px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '500',
  },
  bankIcon: {
    fontSize: '32px',
  },
  skipButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer',
  },
  successBox: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  successIcon: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: '10px',
  },
  successDesc: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
  },
  summaryBox: {
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '25px',
    marginTop: '20px',
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  summaryGrid: {
    display: 'grid',
    gap: '15px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'white',
    borderRadius: '8px',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '600',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '40px',
  },
  backBtn: {
    padding: '15px 30px',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    cursor: 'pointer',
  },
  nextBtn: {
    padding: '15px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  finishBtn: {
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
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default OnboardingPage;
