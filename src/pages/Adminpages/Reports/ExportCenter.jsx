import { useState } from 'react';
import { Database, Download, Calendar, Clock, Mail, FileSpreadsheet, FileText, FileJson, X, Plus } from 'lucide-react';
import '../../../styles/export-center.css';

function ExportCenter() {
  const [selectedExport, setSelectedExport] = useState(null);
  const [scheduleConfig, setScheduleConfig] = useState({ enabled: false, frequency: 'weekly', email: '', format: 'CSV' });

  const exportOptions = [
    { id: 'students', name: 'All Students', formats: ['CSV', 'Excel', 'PDF'], schedules: ['One-time', 'Daily', 'Weekly'] },
    { id: 'staff', name: 'All Staff', formats: ['CSV', 'Excel'], schedules: ['One-time', 'Weekly'] },
    { id: 'results', name: 'Results', formats: ['CSV', 'Excel'], schedules: ['One-time', 'Termly'] },
    { id: 'attendance', name: 'Attendance', formats: ['CSV', 'Excel'], schedules: ['One-time', 'Weekly'] },
    { id: 'timetable', name: 'Timetable', formats: ['PDF', 'Excel'], schedules: ['One-time'] },
    { id: 'backup', name: 'Complete Backup', formats: ['SQL', 'JSON'], schedules: ['One-time', 'Daily'] }
  ];

  const handleExport = (option) => {
    if (scheduleConfig.enabled) {
      alert(`Scheduled ${option.name} export configured for ${scheduleConfig.frequency} to ${scheduleConfig.email}`);
    } else {
      alert(`Exporting ${option.name} as ${scheduleConfig.format}...`);
    }
  };

  return (
    <div className="export-center-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Database size={28} style={{ display: 'inline', marginRight: '12px' }} />Export Center</h1>
        <p style={{ color: 'var(--secondary)' }}>Centralized data export with scheduling options</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
        {exportOptions.map(option => (
          <div key={option.id} className="export-option-card">
            <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{option.name}</h3>
            <div style={{ marginBottom: '0.5rem' }}><strong>Formats:</strong> {option.formats.join(', ')}</div>
            <div style={{ marginBottom: '1rem' }}><strong>Available:</strong> {option.schedules.join(', ')}</div>
            
            <select className="form-select" style={{ marginBottom: '0.5rem' }} value={scheduleConfig.format} onChange={(e) => setScheduleConfig(prev => ({ ...prev, format: e.target.value }))}>
              {option.formats.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="checkbox" checked={scheduleConfig.enabled} onChange={(e) => setScheduleConfig(prev => ({ ...prev, enabled: e.target.checked }))} />
              Schedule recurring export
            </label>
            
            {scheduleConfig.enabled && (
              <div className="schedule-config">
                <select className="form-select" style={{ marginBottom: '0.5rem' }} value={scheduleConfig.frequency} onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value }))}>
                  {option.schedules.filter(s => s !== 'One-time').map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="email" className="form-input" placeholder="Email for export" value={scheduleConfig.email} onChange={(e) => setScheduleConfig(prev => ({ ...prev, email: e.target.value }))} />
              </div>
            )}
            
            <button className="button" onClick={() => handleExport(option)} style={{ marginTop: '1rem', width: '100%' }}>
              <Download size={16} /> {scheduleConfig.enabled ? 'Schedule Export' : 'Export Now'}
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1rem', background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)', color: 'white' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Scheduled Exports Summary</h3>
        <p>No active scheduled exports. Configure recurring exports above.</p>
      </div>
    </div>
  );
}

export default ExportCenter;