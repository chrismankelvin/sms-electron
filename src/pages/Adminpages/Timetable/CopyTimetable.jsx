import { useState } from 'react';
import { Copy, Calendar, AlertCircle, CheckCircle, Eye, X } from 'lucide-react';
import '../../../styles/copy-timetable.css';

function CopyTimetable() {
  const [sourceYear, setSourceYear] = useState('2023-2024');
  const [sourceTerm, setSourceTerm] = useState('Term 3');
  const [destYear, setDestYear] = useState('2024-2025');
  const [destTerm, setDestTerm] = useState('Term 1');
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [copyAllClasses, setCopyAllClasses] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const previewData = [
    { class: 'JHS 1 Science', sourceTeacher: 'Mr. John Doe', destTeacher: 'Mr. John Doe', action: 'Copy' },
    { class: 'JHS 2 Science', sourceTeacher: 'Mrs. Jane Smith', destTeacher: 'Mrs. Jane Smith', action: 'Copy' },
    { class: 'SHS 1 Science', sourceTeacher: 'Dr. James Wilson', destTeacher: 'Already exists', action: 'Skip/Overwrite' }
  ];

  const handleExecuteCopy = () => {
    alert(`Timetable copied from ${sourceYear} ${sourceTerm} to ${destYear} ${destTerm}\nOverwrite: ${overwriteExisting}\nCopy All Classes: ${copyAllClasses}`);
  };

  return (
    <div className="copy-timetable-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Copy size={28} style={{ display: 'inline', marginRight: '12px' }} />Copy from Previous</h1>
        <p style={{ color: 'var(--secondary)' }}>Clone last year's timetable to save setup time</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div><h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Source</h3>
            <select className="form-select" style={{ marginBottom: '0.5rem' }} value={sourceYear} onChange={(e) => setSourceYear(e.target.value)}><option>2022-2023</option><option>2023-2024</option></select>
            <select className="form-select" value={sourceTerm} onChange={(e) => setSourceTerm(e.target.value)}><option>Term 1</option><option>Term 2</option><option>Term 3</option></select>
          </div>
          <div><h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Destination</h3>
            <select className="form-select" style={{ marginBottom: '0.5rem' }} value={destYear} onChange={(e) => setDestYear(e.target.value)}><option>2024-2025</option><option>2025-2026</option></select>
            <select className="form-select" value={destTerm} onChange={(e) => setDestTerm(e.target.value)}><option>Term 1</option><option>Term 2</option><option>Term 3</option></select>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}><input type="checkbox" checked={copyAllClasses} onChange={(e) => setCopyAllClasses(e.target.checked)} /> Copy all classes</label>
          <label><input type="checkbox" checked={overwriteExisting} onChange={(e) => setOverwriteExisting(e.target.checked)} /> Overwrite existing timetable data</label>
        </div>

        <button className="button button-secondary" onClick={() => setShowPreview(!showPreview)} style={{ marginRight: '1rem' }}><Eye size={16} /> Preview Changes</button>
        <button className="button" onClick={handleExecuteCopy}><Copy size={16} /> Execute Copy</button>

        {showPreview && (
          <div className="preview-changes">
            <h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Preview of Changes</h3>
            <div className="table-container"><table className="academic-years-table"><thead><tr><th>Class</th><th>Source Teacher</th><th>Destination Teacher</th><th>Action</th></tr></thead>
            <tbody>{previewData.map((item, i) => (<tr key={i}><td>{item.class}</td><td>{item.sourceTeacher}</td><td>{item.destTeacher}</td><td><span className={`status-badge ${item.action === 'Copy' ? 'status-active' : 'status-inactive'}`}>{item.action}</span></td></tr>))}</tbody></table></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CopyTimetable;