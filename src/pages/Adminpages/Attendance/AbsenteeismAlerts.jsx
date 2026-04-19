import { useState } from 'react';
import { Bell, AlertTriangle, Send, Settings, Eye, CheckCircle, X, Users, Clock } from 'lucide-react';
import '../../../styles/absenteeism-alerts.css';

function AbsenteeismAlerts() {
  const [showRules, setShowRules] = useState(false);
  const [rules, setRules] = useState({
    consecutiveAbsents: 3,
    attendancePercent: 80,
    lateArrivals: 5
  });

  const alerts = [
    { id: 1, student: 'John Doe', class: 'JHS 1A', type: 'consecutive absents', details: 'Missed 5 days (Mar 10-14)', severity: 'critical' },
    { id: 2, student: 'Jane Smith', class: 'JHS 1A', type: 'low attendance', details: 'Attendance below 75% (12/16 days)', severity: 'warning' },
    { id: 3, student: 'Bob Johnson', class: 'SHS 1 Science', type: 'late arrivals', details: 'Late 6 times this term', severity: 'warning' }
  ];

  const handleSendNotification = (alert) => {
    alert(`Notification sent to parent of ${alert.student} regarding ${alert.type}`);
  };

  const handleViewHistory = (alert) => {
    alert(`Viewing attendance history for ${alert.student}`);
  };

  const handleSaveRules = () => {
    alert('Alert rules saved successfully');
    setShowRules(false);
  };

  return (
    <div className="absenteeism-alerts-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Bell size={28} style={{ display: 'inline', marginRight: '12px' }} />Absenteeism Alerts</h1>
        <p style={{ color: 'var(--secondary)' }}>Identify students with concerning attendance patterns</p></div>
        <button className="button" onClick={() => setShowRules(!showRules)}><Settings size={16} /> Configure Rules</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {showRules && (<div className="card" style={{ marginBottom: '1rem' }}><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Alert Rules Configuration</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div><label>Consecutive absent days &gt;</label><input type="number" className="form-input" value={rules.consecutiveAbsents} onChange={(e) => setRules(prev => ({ ...prev, consecutiveAbsents: parseInt(e.target.value) }))} /></div>
        <div><label>Attendance % below</label><input type="number" className="form-input" value={rules.attendancePercent} onChange={(e) => setRules(prev => ({ ...prev, attendancePercent: parseInt(e.target.value) }))} />%</div>
        <div><label>Late arrivals &gt; per term</label><input type="number" className="form-input" value={rules.lateArrivals} onChange={(e) => setRules(prev => ({ ...prev, lateArrivals: parseInt(e.target.value) }))} /></div>
      </div>
      <button className="button" onClick={handleSaveRules} style={{ marginTop: '1rem' }}>Save Rules</button></div>)}

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Student</th><th>Class</th><th>Alert Type</th><th>Details</th><th>Actions</th></tr></thead>
      <tbody>{alerts.map(alert => (<tr key={alert.id} className={`alert-item-${alert.severity}`}><td><strong>{alert.student}</strong></td>
      <td>{alert.class}</td>
      <td><span className={`status-badge status-${alert.severity === 'critical' ? 'withdrawn' : 'warning'}`}>{alert.type}</span></td>
      <td>{alert.details}</td>
      <td className="action-buttons"><button className="action-btn set-current-btn" onClick={() => handleSendNotification(alert)}><Send size={16} /> Notify</button>
      <button className="action-btn edit-btn" onClick={() => handleViewHistory(alert)}><Eye size={16} /> History</button></td></tr>))}</tbody></table></div>
    </div>
  );
}

export default AbsenteeismAlerts;