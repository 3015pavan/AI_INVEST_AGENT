import { useState } from 'react';
import { useSelector } from 'react-redux';
import DarkLayout from '../components/DarkLayout';

function SettingsPage() {
  const { user } = useSelector((state) => state.auth);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    portfolio: true,
    news: true,
    priceAlerts: false,
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    currency: 'USD',
    language: 'en',
    timezone: 'America/New_York',
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    biometric: false,
  });

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const handlePreferenceChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value,
    });
  };

  const handleSecurityChange = (key) => {
    setSecurity({
      ...security,
      [key]: !security[key],
    });
  };

  return (
    <DarkLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>Manage your account preferences</p>
        </div>

        {/* Notifications Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🔔 Notifications</h2>
          <div style={styles.settingsList}>
            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Email Notifications</div>
                <div style={styles.settingDesc}>Receive updates via email</div>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                  style={styles.checkbox}
                />
                <span style={{...styles.slider, ...(notifications.email ? styles.sliderActive : {})}}></span>
              </label>
            </div>

            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Push Notifications</div>
                <div style={styles.settingDesc}>Get push notifications on your device</div>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                  style={styles.checkbox}
                />
                <span style={{...styles.slider, ...(notifications.push ? styles.sliderActive : {})}}></span>
              </label>
            </div>

            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Portfolio Updates</div>
                <div style={styles.settingDesc}>Daily portfolio performance summaries</div>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.portfolio}
                  onChange={() => handleNotificationChange('portfolio')}
                  style={styles.checkbox}
                />
                <span style={{...styles.slider, ...(notifications.portfolio ? styles.sliderActive : {})}}></span>
              </label>
            </div>

            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Market News</div>
                <div style={styles.settingDesc}>Breaking news and market updates</div>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.news}
                  onChange={() => handleNotificationChange('news')}
                  style={styles.checkbox}
                />
                <span style={{...styles.slider, ...(notifications.news ? styles.sliderActive : {})}}></span>
              </label>
            </div>

            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Price Alerts</div>
                <div style={styles.settingDesc}>Alerts when assets reach target prices</div>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.priceAlerts}
                  onChange={() => handleNotificationChange('priceAlerts')}
                  style={styles.checkbox}
                />
                <span style={{...styles.slider, ...(notifications.priceAlerts ? styles.sliderActive : {})}}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🎨 Preferences</h2>
          <div style={styles.settingsList}>
            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Theme</div>
                <div style={styles.settingDesc}>Choose your interface theme</div>
              </div>
              <select
                name="theme"
                value={preferences.theme}
                onChange={handlePreferenceChange}
                style={styles.select}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Currency</div>
                <div style={styles.settingDesc}>Default display currency</div>
              </div>
              <select
                name="currency"
                value={preferences.currency}
                onChange={handlePreferenceChange}
                style={styles.select}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Language</div>
                <div style={styles.settingDesc}>Interface language</div>
              </div>
              <select
                name="language"
                value={preferences.language}
                onChange={handlePreferenceChange}
                style={styles.select}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Timezone</div>
                <div style={styles.settingDesc}>Your local timezone</div>
              </div>
              <select
                name="timezone"
                value={preferences.timezone}
                onChange={handlePreferenceChange}
                style={styles.select}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🔒 Security</h2>
          <div style={styles.settingsList}>
            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Two-Factor Authentication</div>
                <div style={styles.settingDesc}>Add an extra layer of security</div>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={security.twoFactor}
                  onChange={() => handleSecurityChange('twoFactor')}
                  style={styles.checkbox}
                />
                <span style={{...styles.slider, ...(security.twoFactor ? styles.sliderActive : {})}}></span>
              </label>
            </div>

            <div style={styles.settingItem}>
              <div style={styles.settingInfo}>
                <div style={styles.settingLabel}>Biometric Login</div>
                <div style={styles.settingDesc}>Use fingerprint or face recognition</div>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={security.biometric}
                  onChange={() => handleSecurityChange('biometric')}
                  style={styles.checkbox}
                />
                <span style={{...styles.slider, ...(security.biometric ? styles.sliderActive : {})}}></span>
              </label>
            </div>

            <button style={styles.changePasswordButton}>
              🔑 Change Password
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{...styles.section, ...styles.dangerSection}}>
          <h2 style={styles.dangerTitle}>⚠️ Danger Zone</h2>
          <div style={styles.settingsList}>
            <button style={styles.dangerButton}>
              Delete Account
            </button>
            <p style={styles.dangerDesc}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
        </div>
      </div>
    </DarkLayout>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1000px',
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
  section: {
    background: '#1a2332',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '24px',
    border: '1px solid #242d3d',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '20px',
  },
  settingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#242d3d',
    borderRadius: '8px',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  settingDesc: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '50px',
    height: '24px',
  },
  checkbox: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#374151',
    borderRadius: '24px',
    transition: '0.3s',
  },
  sliderActive: {
    background: '#8b5cf6',
  },
  select: {
    padding: '10px 15px',
    border: '1px solid #374151',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#fff',
    background: '#0f1729',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '180px',
  },
  changePasswordButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    marginTop: '10px',
  },
  dangerSection: {
    borderColor: '#991b1b',
    background: '#7f1d1d',
  },
  dangerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fca5a5',
    marginBottom: '20px',
  },
  dangerButton: {
    padding: '12px 24px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  dangerDesc: {
    fontSize: '13px',
    color: '#fca5a5',
    marginTop: '10px',
    textAlign: 'center',
  },
};

export default SettingsPage;
