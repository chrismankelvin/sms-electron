import { useState } from 'react';
import { Key, Shield, CheckCircle, XCircle, Laptop, AlertTriangle, X, Plus } from 'lucide-react';
import '../../../styles/license-management.css';

function LicenseManagement() {
  const [activationCode, setActivationCode] = useState('');
  const [license, setLicense] = useState({
    type: 'PROFESSIONAL',
    devices: 5,
    validUntil: '2025-03-20',
    daysRemaining: 365,
    status: 'Active'
  });

  const devices = [
    { id: 'ABC-123', name: 'Main Server', status: 'Active', lastCheck: '2024-03-20' },
    { id: 'DEF-456', name: 'Admin Laptop', status: 'Active', lastCheck: '2024-03-19' },
    { id: 'GHI-789', name: 'Teacher Workstation', status: 'Inactive', lastCheck: '2024-03-10' }
  ];

  const handleActivate = () => {
    if (!activationCode) { alert('Please enter activation code'); return; }
    alert(`License activated with code: ${activationCode}`);
    setLicense({ ...license, status: 'Active', validUntil: '2026-03-20', daysRemaining: 730 });
    setActivationCode('');
  };

  const handleDeactivate = (deviceId) => {
    if (window.confirm(`Deactivate device ${deviceId}? This will free up a license slot.`)) {
      alert(`Device ${deviceId} deactivated`);
    }
  };

  return (
    <div className="license-management-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Key size={28} style={{ display: 'inline', marginRight: '12px' }} />License Management</h1>
        <p style={{ color: 'var(--secondary)' }}>Manage software license and devices</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="license-card"><Shield size={48} style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{license.type}</h2>
        <div>Licensed Devices: {license.devices}</div>
        <div>Valid Until: {license.validUntil}</div>
        <div>Days Remaining: {license.daysRemaining}</div>
        <div style={{ marginTop: '0.5rem' }}><span className="status-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{license.status}</span></div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>License Activation</h3>
        <div style={{ display: 'flex', gap: '1rem' }}><input type="text" className="form-input" placeholder="Enter activation code" style={{ flex: 1 }} value={activationCode} onChange={(e) => setActivationCode(e.target.value)} />
        <button className="button" onClick={handleActivate}>Activate License</button></div>
      </div>

      <div className="card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Device Management</h3>
        {devices.map(device => (<div key={device.id} className="device-card"><div><strong>{device.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>ID: {device.id} • Last Check: {device.lastCheck}</div></div>
        <div><span className={`status-badge ${device.status === 'Active' ? 'status-active' : 'status-inactive'}`}>{device.status}</span>
        {device.status === 'Active' && <button className="button button-danger" style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }} onClick={() => handleDeactivate(device.id)}>Deactivate</button>}</div></div>))}
      </div>
    </div>
  );
}

export default LicenseManagement;