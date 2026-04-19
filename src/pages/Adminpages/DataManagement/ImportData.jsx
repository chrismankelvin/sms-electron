import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Eye, X, ArrowRight, FileText } from 'lucide-react';
import '../../../styles/import-data.css';

function ImportData() {
  const [step, setStep] = useState(1);
  const [importType, setImportType] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [importResult, setImportResult] = useState(null);

  const importTypes = [
    { id: 'students', name: 'Students', description: 'Import student records with parent information' },
    { id: 'staff', name: 'Staff', description: 'Import teaching and non-teaching staff' },
    { id: 'subjects', name: 'Subjects', description: 'Import subject master list' },
    { id: 'classes', name: 'Classes', description: 'Import class structures' },
    { id: 'scores', name: 'Scores', description: 'Import assessment results' }
  ];

  const templateColumns = {
    students: ['Student Number', 'First Name', 'Last Name', 'Date of Birth', 'Gender', 'Class', 'Parent Name', 'Parent Phone', 'Parent Email', 'Address'],
    staff: ['Staff Number', 'First Name', 'Last Name', 'Role', 'Department', 'Qualification', 'Hired Date', 'Email', 'Phone'],
    subjects: ['Subject Name', 'Subject Code', 'Type', 'Category', 'Description'],
    classes: ['Class Name', 'Class Code', 'Level', 'Programme', 'Capacity', 'Form Master'],
    scores: ['Student Number', 'Assessment Name', 'Score', 'Absent', 'Remarks']
  };

  const previewData = [
    { 'Student Number': 'STU001', 'First Name': 'John', 'Last Name': 'Doe', 'Class': 'JHS 1A', 'Parent Name': 'Mr. Doe' },
    { 'Student Number': 'STU002', 'First Name': 'Jane', 'Last Name': 'Smith', 'Class': 'JHS 1A', 'Parent Name': 'Mrs. Smith' }
  ];

  const handleTypeSelect = () => {
    if (!importType) {
      alert('Please select an import type');
      return;
    }
    setStep(2);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setPreview(previewData);
    setStep(3);
  };

  const handleValidate = () => {
    setImportResult({ success: true, total: 245, successCount: 240, errorCount: 5, errors: ['Row 12: Invalid class name', 'Row 45: Missing parent phone'] });
    setStep(4);
  };

  const handleExecuteImport = () => {
    alert(`Successfully imported ${importResult?.successCount} records!`);
    setStep(5);
  };

  const downloadTemplate = () => {
    alert(`Downloading ${importType} template...`);
  };

  return (
    <div className="import-data-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Upload size={28} style={{ display: 'inline', marginRight: '12px' }} />Import Data</h1>
        <p style={{ color: 'var(--secondary)' }}>Bulk import data from CSV/Excel files</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1. Select Type</div>
        <ArrowRight size={16} />
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2. Upload File</div>
        <ArrowRight size={16} />
        <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>3. Map Columns</div>
        <ArrowRight size={16} />
        <div className={`step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>4. Validate</div>
        <ArrowRight size={16} />
        <div className={`step ${step >= 5 ? 'active' : ''} ${step > 5 ? 'completed' : ''}`}>5. Import</div>
      </div>

      {step === 1 && (
        <div className="import-step">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Select Import Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {importTypes.map(type => (
              <label key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `2px solid ${importType === type.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '0.5rem', cursor: 'pointer', background: importType === type.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                <input type="radio" name="importType" value={type.id} checked={importType === type.id} onChange={(e) => setImportType(e.target.value)} style={{ display: 'none' }} />
                <div><strong>{type.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{type.description}</div></div>
              </label>
            ))}
          </div>
          <button className="button" onClick={handleTypeSelect}>Next: Upload File</button>
        </div>
      )}

      {step === 2 && (
        <div className="import-step">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Download Template & Upload File</h3>
          <button className="button button-secondary" onClick={downloadTemplate} style={{ marginBottom: '1rem' }}><Download size={16} /> Download {importType} Template</button>
          <div className="bulk-import-area" style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '0.5rem', cursor: 'pointer' }} onClick={() => document.getElementById('fileInput').click()}>
            <FileSpreadsheet size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Click or drag CSV/Excel file here</p>
            <input type="file" id="fileInput" style={{ display: 'none' }} accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="import-step">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Map Columns</h3>
          <div className="column-mapping">
            {templateColumns[importType]?.map(col => (
              <div key={col} className="form-group"><label>{col}</label><select className="form-select"><option value={col}>{col}</option><option value="">Skip</option></select></div>
            ))}
          </div>
          <div className="preview-table"><table className="academic-years-table"><thead><tr>{Object.keys(previewData[0] || {}).map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{previewData.map((row, i) => (<tr key={i}>{Object.values(row).map((v, j) => <td key={j}>{v}</td>)}</tr>))}</tbody></table></div>
          <button className="button" onClick={handleValidate} style={{ marginTop: '1rem' }}>Next: Validate</button>
        </div>
      )}

      {step === 4 && importResult && (
        <div className="import-step">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Validation Results</h3>
          <div className="import-summary">
            <div><CheckCircle size={16} color="#10b981" /> Valid records: {importResult.successCount}</div>
            <div><AlertCircle size={16} color="#ef4444" /> Errors: {importResult.errorCount}</div>
            {importResult.errors.map((err, i) => (<div key={i} className="error-row">⚠ {err}</div>))}
          </div>
          <button className="button" onClick={handleExecuteImport} style={{ marginTop: '1rem' }}>Execute Import</button>
        </div>
      )}

      {step === 5 && (
        <div className="import-step" style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h3>Import Complete!</h3>
          <p>{importResult?.successCount} records imported successfully</p>
          <button className="button" onClick={() => { setStep(1); setImportType(''); setFile(null); }}>Start New Import</button>
        </div>
      )}
    </div>
  );
}

export default ImportData;