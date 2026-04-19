import { useState } from 'react';
import { Users, Download, Printer, Filter, Calendar, Briefcase, Award, Clock, X } from 'lucide-react';
import '../../../styles/staff-reports.css';

function StaffReports() {
  const [reportType, setReportType] = useState('directory');
  const [showPreview, setShowPreview] = useState(false);

  const reportTypes = [
    { id: 'directory', name: 'Staff Directory', description: 'All staff with contact info, role, department' },
    { id: 'workload', name: 'Teacher Workload', description: 'Teachers with period count, class count' },
    { id: 'leave', name: 'Upcoming Leave', description: 'Staff on leave or leave requests pending' },
    { id: 'birthdays', name: 'Staff Birthdays', description: 'Birthdays this month' },
    { id: 'qualifications', name: 'Qualifications Summary', description: 'Teachers grouped by qualification level' }
  ];

  const staffData = [
    { name: 'Mr. John Doe', role: 'Teacher', department: 'Science', phone: '+233 20 123 4567', email: 'john@school.edu', qualification: "Master's", workload: 24, classes: 4 },
    { name: 'Mrs. Jane Smith', role: 'Teacher', department: 'Languages', phone: '+233 20 123 4568', email: 'jane@school.edu', qualification: "Master's", workload: 28, classes: 5 },
    { name: 'Dr. James Wilson', role: 'Admin', department: 'Administration', phone: '+233 20 123 4569', email: 'james@school.edu', qualification: 'PhD', workload: 18, classes: 3 }
  ];

  const leaveData = [
    { name: 'Mrs. Jane Smith', type: 'Annual Leave', startDate: '2024-04-01', endDate: '2024-04-14', status: 'Approved' },
    { name: 'Mr. Michael Brown', type: 'Sick Leave', startDate: '2024-03-25', endDate: '2024-03-28', status: 'Pending' }
  ];

  const exportPDF = () => alert('Exporting to PDF...');
  const exportExcel = () => alert('Exporting to Excel...');

  const getReportTitle = () => reportTypes.find(r => r.id === reportType)?.name || 'Staff Report';

  return (
    <div className="staff-reports-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Staff Reports</h1>
        <p style={{ color: 'var(--secondary)' }}>Generate staff-related reports</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}><button className="button button-secondary" onClick={exportExcel}><Download size={16} /> Excel</button>
        <button className="button button-secondary" onClick={exportPDF}><Printer size={16} /> PDF</button></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Report Type</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          {reportTypes.map(rt => (
            <label key={rt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', background: reportType === rt.id ? 'var(--primary)' : 'transparent', color: reportType === rt.id ? 'white' : 'inherit', cursor: 'pointer' }}>
              <input type="radio" name="reportType" value={rt.id} checked={reportType === rt.id} onChange={(e) => setReportType(e.target.value)} style={{ display: 'none' }} />
              <div><strong>{rt.name}</strong><div style={{ fontSize: '0.75rem' }}>{rt.description}</div></div>
            </label>
          ))}
        </div>
        <button className="button" onClick={() => setShowPreview(true)}>Generate Report</button>
      </div>

      {showPreview && (
        <div className="card">
          <h3>{getReportTitle()}</h3>
          <div className="table-container">
            {reportType === 'directory' && (
              <table className="academic-years-table">
                <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Phone</th><th>Email</th><th>Qualification</th></tr></thead>
                <tbody>{staffData.map(s => (<tr key={s.name}><td><strong>{s.name}</strong></td><td>{s.role}</td><td>{s.department}</td><td>{s.phone}</td><td>{s.email}</td><td>{s.qualification}</td></tr>))}</tbody>
              </table>
            )}
            {reportType === 'workload' && (
              <table className="academic-years-table">
                <thead><tr><th>Teacher</th><th>Total Periods/Week</th><th>Number of Classes</th><th>Workload</th></tr></thead>
                <tbody>{staffData.filter(s => s.role === 'Teacher').map(s => (<tr key={s.name}><td><strong>{s.name}</strong></td><td>{s.workload}</td><td>{s.classes}</td>
                <td><div className="workload-indicator"><div className="workload-fill" style={{ width: `${(s.workload / 30) * 100}%`, background: s.workload > 25 ? '#ef4444' : '#10b981' }}></div></div></td></tr>))}</tbody>
              </table>
            )}
            {reportType === 'leave' && (
              <table className="academic-years-table">
                <thead><tr><th>Staff Name</th><th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Status</th></tr></thead>
                <tbody>{leaveData.map(l => (<tr key={l.name}><td><strong>{l.name}</strong></td><td>{l.type}</td><td>{l.startDate}</td><td>{l.endDate}</td><td><span className={`status-badge ${l.status === 'Approved' ? 'status-active' : 'status-inactive'}`}>{l.status}</span></td></tr>))}</tbody>
              </table>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button className="button button-secondary" onClick={() => setShowPreview(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffReports;