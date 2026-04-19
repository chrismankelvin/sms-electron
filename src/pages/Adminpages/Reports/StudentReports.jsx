import { useState } from 'react';
import { Users, Download, Printer, Filter, Calendar, Heart, AlertCircle, X } from 'lucide-react';
import '../../../styles/student-reports.css';

function StudentReports() {
  const [reportType, setReportType] = useState('roster');
  const [filters, setFilters] = useState({ class: '', section: '', status: 'Active', dateRange: '', month: '' });
  const [showPreview, setShowPreview] = useState(false);

  const reportTypes = [
    { id: 'roster', name: 'Student Roster', description: 'List of all students with details' },
    { id: 'enrollment', name: 'Enrollment Summary', description: 'Count by class, gender distribution' },
    { id: 'new', name: 'New Enrollments', description: 'Students enrolled in date range' },
    { id: 'withdrawn', name: 'Withdrawn Students', description: 'Students who left with reasons' },
    { id: 'birthdays', name: 'Birthdays This Month', description: 'Students with birthdays this month' },
    { id: 'health', name: 'Health Conditions', description: 'Students with medical alerts' }
  ];

  const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science'];
  const sections = ['A', 'B', 'C'];
  const statuses = ['Active', 'Suspended', 'Graduated', 'Withdrawn'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const rosterData = [
    { name: 'John Doe', number: 'STU001', class: 'JHS 1 Science', section: 'A', status: 'Active', parent: 'Mr. Doe', phone: '+233 20 123 4567' },
    { name: 'Jane Smith', number: 'STU002', class: 'JHS 1 Science', section: 'A', status: 'Active', parent: 'Mrs. Smith', phone: '+233 20 123 4568' }
  ];

  const exportPDF = () => alert('Exporting to PDF...');
  const exportExcel = () => alert('Exporting to Excel...');

  const getReportTitle = () => reportTypes.find(r => r.id === reportType)?.name || 'Student Report';

  return (
    <div className="student-reports-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Student Reports</h1>
        <p style={{ color: 'var(--secondary)' }}>Generate various student-related reports</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}><button className="button button-secondary" onClick={exportExcel}><Download size={16} /> Excel</button>
        <button className="button button-secondary" onClick={exportPDF}><Printer size={16} /> PDF</button></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card" style={{ marginBottom: '1rem' }}><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Report Type</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          {reportTypes.map(rt => (<label key={rt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', background: reportType === rt.id ? 'var(--primary)' : 'transparent', color: reportType === rt.id ? 'white' : 'inherit', cursor: 'pointer' }}>
            <input type="radio" name="reportType" value={rt.id} checked={reportType === rt.id} onChange={(e) => setReportType(e.target.value)} style={{ display: 'none' }} />
            <div><strong>{rt.name}</strong><div style={{ fontSize: '0.75rem' }}>{rt.description}</div></div>
          </label>))}
        </div>

        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {(reportType === 'roster' || reportType === 'enrollment') && (<><select className="form-select" value={filters.class} onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}><option value="">All Classes</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select className="form-select" value={filters.section} onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}><option value="">All Sections</option>{sections.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <select className="form-select" value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></>)}
          {(reportType === 'new' || reportType === 'withdrawn') && (<><input type="date" className="form-input" placeholder="Start Date" /><input type="date" className="form-input" placeholder="End Date" /></>)}
          {reportType === 'birthdays' && (<select className="form-select" value={filters.month} onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}><option value="">Select Month</option>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>)}
          {reportType === 'health' && (<select className="form-select"><option value="">All Conditions</option><option>Asthma</option><option>Allergy</option><option>Diabetes</option></select>)}
        </div>
        <button className="button" onClick={() => setShowPreview(true)}>Generate Report</button>
      </div>

      {showPreview && (<div className="card"><h3>{getReportTitle()}</h3><div className="table-container"><table className="academic-years-table"><thead><tr><th>Name</th><th>Student #</th><th>Class</th><th>Section</th><th>Status</th><th>Parent</th><th>Phone</th></tr></thead>
      <tbody>{rosterData.map(s => (<tr key={s.number}><td>{s.name}</td>      <td>{s.number}</td>
      <td>{s.class}</td>
      <td>{s.section}</td>
      <td><span className={`status-badge status-${s.status.toLowerCase()}`}>{s.status}</span></td>
      <td>{s.parent}</td>
      <td>{s.phone}</td>
    </tr>))}</tbody>
   </table></div>
   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
     <button className="button button-secondary" onClick={() => setShowPreview(false)}>Close</button>
   </div></div>)}
    </div>
  );
}

export default StudentReports;