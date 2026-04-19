import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Eye, X } from 'lucide-react';
import '../../../styles/bulk-import.css';

function BulkImport() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const templateData = [
    { studentNumber: 'STU001', assessmentName: 'Term 1 Examination', score: 85, absent: false, remarks: 'Good work' },
    { studentNumber: 'STU002', assessmentName: 'Term 1 Examination', score: 72, absent: false, remarks: '' },
    { studentNumber: 'STU003', assessmentName: 'Week 3 Quiz', score: 18, absent: false, remarks: 'Excellent' }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setPreview(templateData);
    setShowPreview(true);
  };

  const handleValidate = () => {
    const errors = [];
    if (preview.length === 0) errors.push('No data to validate');
    setImportResult({ success: true, total: preview.length, errors: errors, successCount: preview.length });
  };

  const handleExecuteImport = () => {
    alert(`Successfully imported ${preview.length} records!`);
    setImportResult(null);
    setFile(null);
    setShowPreview(false);
  };

  const downloadTemplate = () => {
    alert('Downloading template...');
  };

  return (
    <div className="bulk-import-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Upload size={28} style={{ display: 'inline', marginRight: '12px' }} />Bulk Score Import</h1>
        <p style={{ color: 'var(--secondary)' }}>Upload scores via Excel/CSV for multiple assessments at once</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card">
        <div className="bulk-import-area" style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '0.5rem', cursor: 'pointer' }} onClick={() => document.getElementById('fileInput').click()}>
          <Upload size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Click or drag CSV/Excel file here</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Format: Student Number, Assessment Name, Score, Absent, Remarks</p>
          <input type="file" id="fileInput" style={{ display: 'none' }} accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
        </div>
        <button className="button button-secondary" onClick={downloadTemplate} style={{ marginTop: '1rem' }}><Download size={16} /> Download Template</button>
      </div>

      {showPreview && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Preview Data</h3>
          <div className="preview-table"><table className="academic-years-table"><thead><tr><th>Student Number</th><th>Assessment Name</th><th>Score</th><th>Absent</th><th>Remarks</th></tr></thead>
          <tbody>{preview.map((row, i) => (<tr key={i}><td>{row.studentNumber}</td>
          <td>{row.assessmentName}</td>
          <td>{row.score}</td>
          <td><input type="checkbox" checked={row.absent} readOnly /></td>
          <td>{row.remarks}</td></tr>))}</tbody></table></div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}><button className="button button-secondary" onClick={handleValidate}><CheckCircle size={16} /> Validate</button>
          <button className="button" onClick={handleExecuteImport} disabled={!importResult || importResult.errors.length > 0}><Upload size={16} /> Execute Import</button></div>
        </div>
      )}

      {importResult && (<div className={importResult.errors.length === 0 ? 'import-success' : 'import-error'} style={{ marginTop: '1rem' }}>
        <strong>Import Report:</strong> {importResult.successCount} of {importResult.total} records imported successfully
        {importResult.errors.length > 0 && (<div style={{ marginTop: '0.5rem' }}>{importResult.errors.map((e, i) => (<div key={i}>⚠ {e}</div>))}</div>)}
      </div>)}
    </div>
  );
}

export default BulkImport;