import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileJson, Filter, X } from 'lucide-react';
import '../../../styles/export-data.css';

function ExportData() {
  const [filters, setFilters] = useState({});
  const [format, setFormat] = useState('CSV');

  const exportOptions = [
    { id: 'students', name: 'All Students', description: 'Export complete student records' },
    { id: 'staff', name: 'All Staff', description: 'Export staff directory' },
    { id: 'subjects', name: 'Subjects', description: 'Export subject master list' },
    { id: 'classes', name: 'Classes', description: 'Export class structures' },
    { id: 'results', name: 'Results', description: 'Export assessment results' },
    { id: 'attendance', name: 'Attendance', description: 'Export attendance records' }
  ];

  const handleExport = (option) => {
    alert(`Exporting ${option.name} as ${format}...`);
  };

  return (
    <div className="export-data-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Download size={28} style={{ display: 'inline', marginRight: '12px' }} />Export Data</h1>
        <p style={{ color: 'var(--secondary)' }}>Manual data export to various formats</p></div>
        <div><select className="form-select" value={format} onChange={(e) => setFormat(e.target.value)} style={{ width: '120px' }}><option>CSV</option><option>Excel</option><option>PDF</option><option>JSON</option></select></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {exportOptions.map(option => (
          <div key={option.id} className="export-option">
            <div><strong>{option.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{option.description}</div></div>
            <button className="button button-secondary" onClick={() => handleExport(option)}><Download size={16} /> Export {format}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExportData;