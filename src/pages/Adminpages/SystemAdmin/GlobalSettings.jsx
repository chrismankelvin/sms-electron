import { useState } from 'react';
import { Settings, Globe, Shield, Mail, Smartphone, Bell, Plug, Database, Save, X } from 'lucide-react';
import '../../../styles/global-settings.css';

function GlobalSettings() {
  const [settings, setSettings] = useState({
    general: { dateFormat: 'DD/MM/YYYY', timezone: 'Africa/Accra', language: 'English' },
    security: { sessionTimeout: 30, passwordExpiry: 90, twoFactorRequired: true },
    email: { smtpServer: 'smtp.gmail.com', port: '587', encryption: 'TLS', fromEmail: 'noreply@school.edu', fromName: 'School System' },
    sms: { provider: 'Twilio', apiKey: '••••••••', senderId: 'SchoolSMS' },
    notifications: { quietHoursStart: '21:00', quietHoursEnd: '07:00' },
    features: { parentPortal: true, enableSMS: true, enablePush: true, enableFeeModule: false },
    integrations: { paymentGateway: 'Paystack', lmsUrl: 'https://lms.school.edu' }
  });

  const handleChange = (category, field, value) => {
    setSettings(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
  };

  const handleSave = () => {
    alert('Settings saved. Some settings may require restart.');
  };

  return (
    <div className="global-settings-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Settings size={28} style={{ display: 'inline', marginRight: '12px' }} />Global Settings</h1>
        <p style={{ color: 'var(--secondary)' }}>System-wide configuration</p></div>
        <button className="button" onClick={handleSave}><Save size={16} /> Save All Settings</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="settings-section"><div className="settings-title"><Globe size={18} /> General</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div><label>Date Format</label><select className="form-select" value={settings.general.dateFormat} onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></div>
          <div><label>Timezone</label><select className="form-select" value={settings.general.timezone} onChange={(e) => handleChange('general', 'timezone', e.target.value)}><option>Africa/Accra</option><option>Africa/Lagos</option><option>Africa/Nairobi</option></select></div>
          <div><label>Default Language</label><select className="form-select" value={settings.general.language} onChange={(e) => handleChange('general', 'language', e.target.value)}><option>English</option><option>French</option><option>Arabic</option></select></div>
        </div>
      </div>

      <div className="settings-section"><div className="settings-title"><Shield size={18} /> Security</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div><label>Session Timeout (minutes)</label><input type="number" className="form-input" value={settings.security.sessionTimeout} onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))} /></div>
          <div><label>Password Expiry (days)</label><input type="number" className="form-input" value={settings.security.passwordExpiry} onChange={(e) => handleChange('security', 'passwordExpiry', parseInt(e.target.value))} /></div>
          <div><label><input type="checkbox" checked={settings.security.twoFactorRequired} onChange={(e) => handleChange('security', 'twoFactorRequired', e.target.checked)} /> 2FA Required for Admins</label></div>
        </div>
      </div>

      <div className="settings-section"><div className="settings-title"><Mail size={18} /> Email Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div><label>SMTP Server</label><input type="text" className="form-input" value={settings.email.smtpServer} onChange={(e) => handleChange('email', 'smtpServer', e.target.value)} /></div>
          <div><label>Port</label><input type="text" className="form-input" value={settings.email.port} onChange={(e) => handleChange('email', 'port', e.target.value)} /></div>
          <div><label>Encryption</label><select className="form-select" value={settings.email.encryption} onChange={(e) => handleChange('email', 'encryption', e.target.value)}><option>TLS</option><option>SSL</option><option>None</option></select></div>
          <div><label>From Email</label><input type="email" className="form-input" value={settings.email.fromEmail} onChange={(e) => handleChange('email', 'fromEmail', e.target.value)} /></div>
          <div><label>From Name</label><input type="text" className="form-input" value={settings.email.fromName} onChange={(e) => handleChange('email', 'fromName', e.target.value)} /></div>
        </div>
      </div>

      <div className="settings-section"><div className="settings-title"><Smartphone size={18} /> SMS Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div><label>Provider</label><select className="form-select" value={settings.sms.provider} onChange={(e) => handleChange('sms', 'provider', e.target.value)}><option>Twilio</option><option>AfricasTalking</option><option>Nexmo</option></select></div>
          <div><label>API Key</label><input type="password" className="form-input" value={settings.sms.apiKey} onChange={(e) => handleChange('sms', 'apiKey', e.target.value)} /></div>
          <div><label>Sender ID</label><input type="text" className="form-input" value={settings.sms.senderId} onChange={(e) => handleChange('sms', 'senderId', e.target.value)} /></div>
        </div>
      </div>

      <div className="settings-section"><div className="settings-title"><Bell size={18} /> Notifications</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div><label>Quiet Hours Start</label><input type="time" className="form-input" value={settings.notifications.quietHoursStart} onChange={(e) => handleChange('notifications', 'quietHoursStart', e.target.value)} /></div>
          <div><label>Quiet Hours End</label><input type="time" className="form-input" value={settings.notifications.quietHoursEnd} onChange={(e) => handleChange('notifications', 'quietHoursEnd', e.target.value)} /></div>
        </div>
      </div>

      <div className="settings-section"><div className="settings-title"><Plug size={18} /> Features & Integrations</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div><label><input type="checkbox" checked={settings.features.parentPortal} onChange={(e) => handleChange('features', 'parentPortal', e.target.checked)} /> Enable Parent Portal</label></div>
          <div><label><input type="checkbox" checked={settings.features.enableSMS} onChange={(e) => handleChange('features', 'enableSMS', e.target.checked)} /> Enable SMS</label></div>
          <div><label><input type="checkbox" checked={settings.features.enablePush} onChange={(e) => handleChange('features', 'enablePush', e.target.checked)} /> Enable Push Notifications</label></div>
          <div><label><input type="checkbox" checked={settings.features.enableFeeModule} onChange={(e) => handleChange('features', 'enableFeeModule', e.target.checked)} /> Enable Fee Module</label></div>
        </div>
      </div>
    </div>
  );
}

export default GlobalSettings;