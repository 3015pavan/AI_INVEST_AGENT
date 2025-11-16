import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DarkLayout from '../components/DarkLayout';
import { updateUserProfile } from '../store/authSlice';

function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'Admin',
    riskTolerance: user?.riskTolerance || 'Moderate',
    investmentExperience: user?.investmentExperience || 'Beginner',
    investmentHorizon: user?.investmentHorizon || 'Medium Term (1-5 years)',
    annualIncome: user?.annualIncome || '',
    monthlyInvestmentBudget: user?.monthlyInvestmentBudget || '',
    selectedSectors: user?.selectedSectors || [],
  });

  const sectors = [
    'Technology', 'Healthcare', 'Finance', 'Energy', 
    'Real Estate', 'Consumer Goods', 'Industrials', 
    'Utilities', 'Materials', 'Telecommunications'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const toggleSector = (sector) => {
    setFormData(prev => ({
      ...prev,
      selectedSectors: prev.selectedSectors.includes(sector)
        ? prev.selectedSectors.filter(s => s !== sector)
        : [...prev.selectedSectors, sector]
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Update Redux store with new profile data
      dispatch(updateUserProfile(formData));
      
      // TODO: API call to save profile to backend
      console.log('Saving profile:', formData);
      alert('Profile updated successfully! Your dashboard will now reflect these changes.');
      
      // Navigate to dashboard to see updated values
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    }
  };

  const getInitials = () => {
    const firstInitial = user?.firstName?.[0] || user?.email?.[0] || 'U';
    const lastInitial = user?.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <DarkLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Investment Profile</h1>
            <p style={styles.subtitle}>Customize your investment preferences and risk profile</p>
          </div>
        </div>

        {/* User Info Card */}
        <div style={styles.card}>
          <div style={styles.userInfoSection}>
            <div style={styles.avatarLarge}>
              {getInitials()}
            </div>
            <div style={styles.userDetails}>
              <h2 style={styles.userName}>{formData.firstName} {formData.lastName}</h2>
              <p style={styles.userEmail}>{formData.email}</p>
              <span style={styles.roleBadge}>{formData.role}</span>
            </div>
          </div>
        </div>

        {/* Risk & Experience Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleRow}>
              <span style={styles.cardIcon}>📊</span>
              <h2 style={styles.cardTitle}>Risk & Experience</h2>
            </div>
          </div>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Risk Tolerance</label>
              <select
                name="riskTolerance"
                value={formData.riskTolerance}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Conservative">Conservative</option>
                <option value="Moderate">Moderate</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Investment Experience</label>
              <select
                name="investmentExperience"
                value={formData.investmentExperience}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
              <label style={styles.label}>Investment Horizon</label>
              <select
                name="investmentHorizon"
                value={formData.investmentHorizon}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Short Term (< 1 year)">Short Term (&lt; 1 year)</option>
                <option value="Medium Term (1-5 years)">Medium Term (1-5 years)</option>
                <option value="Long Term (5-10 years)">Long Term (5-10 years)</option>
                <option value="Very Long Term (10+ years)">Very Long Term (10+ years)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Information Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleRow}>
              <span style={styles.cardIcon}>💰</span>
              <h2 style={styles.cardTitle}>Financial Information</h2>
            </div>
          </div>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Annual Income</label>
              <input
                type="number"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                placeholder="0"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Monthly Investment Budget</label>
              <input
                type="number"
                name="monthlyInvestmentBudget"
                value={formData.monthlyInvestmentBudget}
                onChange={handleChange}
                placeholder="0"
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Preferred Investment Sectors */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleRow}>
              <span style={styles.cardIcon}>🎯</span>
              <h2 style={styles.cardTitle}>Preferred Investment Sectors</h2>
            </div>
            <p style={styles.cardSubtitle}>Select sectors you're interested in</p>
          </div>

          <div style={styles.sectorsGrid}>
            {sectors.map(sector => (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                style={{
                  ...styles.sectorButton,
                  ...(formData.selectedSectors.includes(sector) ? styles.sectorButtonActive : {})
                }}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div style={styles.saveButtonContainer}>
          <button onClick={handleSaveProfile} style={styles.saveButton}>
            <span style={styles.saveIcon}>💾</span>
            Save Profile
          </button>
        </div>
      </div>
    </DarkLayout>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  card: {
    background: '#1a2332',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '24px',
    border: '1px solid #242d3d',
  },
  userInfoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  userEmail: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '10px',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#8b5cf6',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
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
    fontSize: '20px',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#d1d5db',
  },
  input: {
    padding: '12px 16px',
    background: '#242d3d',
    border: '1px solid #374151',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '12px 16px',
    background: '#242d3d',
    border: '1px solid #374151',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  sectorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
  },
  sectorButton: {
    padding: '12px 16px',
    background: '#242d3d',
    border: '1px solid #374151',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#d1d5db',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  sectorButtonActive: {
    background: '#8b5cf6',
    borderColor: '#8b5cf6',
    color: '#fff',
  },
  saveButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  },
  saveIcon: {
    fontSize: '18px',
  },
};

export default ProfilePage;
