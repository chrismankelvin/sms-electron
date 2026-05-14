// import { useState } from 'react';
// import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Eye, X, ArrowRight, FileText } from 'lucide-react';
// import '../../../styles/import-data.css';

// function ImportData() {
//   const [step, setStep] = useState(1);
//   const [importType, setImportType] = useState('');
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState([]);
//   const [columnMapping, setColumnMapping] = useState({});
//   const [importResult, setImportResult] = useState(null);

//   const importTypes = [
//     { id: 'students', name: 'Students', description: 'Import student records with parent information' },
//     { id: 'staff', name: 'Staff', description: 'Import teaching and non-teaching staff' },
//     { id: 'subjects', name: 'Subjects', description: 'Import subject master list' },
//     { id: 'classes', name: 'Classes', description: 'Import class structures' },
//     { id: 'scores', name: 'Scores', description: 'Import assessment results' }
//   ];

//   const templateColumns = {
//     students: ['Student Number', 'First Name', 'Last Name', 'Date of Birth', 'Gender', 'Class', 'Parent Name', 'Parent Phone', 'Parent Email', 'Address'],
//     staff: ['Staff Number', 'First Name', 'Last Name', 'Role', 'Department', 'Qualification', 'Hired Date', 'Email', 'Phone'],
//     subjects: ['Subject Name', 'Subject Code', 'Type', 'Category', 'Description'],
//     classes: ['Class Name', 'Class Code', 'Level', 'Programme', 'Capacity', 'Form Master'],
//     scores: ['Student Number', 'Assessment Name', 'Score', 'Absent', 'Remarks']
//   };

//   const previewData = [
//     { 'Student Number': 'STU001', 'First Name': 'John', 'Last Name': 'Doe', 'Class': 'JHS 1A', 'Parent Name': 'Mr. Doe' },
//     { 'Student Number': 'STU002', 'First Name': 'Jane', 'Last Name': 'Smith', 'Class': 'JHS 1A', 'Parent Name': 'Mrs. Smith' }
//   ];

//   const handleTypeSelect = () => {
//     if (!importType) {
//       alert('Please select an import type');
//       return;
//     }
//     setStep(2);
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     setFile(file);
//     setPreview(previewData);
//     setStep(3);
//   };

//   const handleValidate = () => {
//     setImportResult({ success: true, total: 245, successCount: 240, errorCount: 5, errors: ['Row 12: Invalid class name', 'Row 45: Missing parent phone'] });
//     setStep(4);
//   };

//   const handleExecuteImport = () => {
//     alert(`Successfully imported ${importResult?.successCount} records!`);
//     setStep(5);
//   };

//   const downloadTemplate = () => {
//     alert(`Downloading ${importType} template...`);
//   };

//   return (
//     <div className="import-data-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Upload size={28} style={{ display: 'inline', marginRight: '12px' }} />Import Data</h1>
//         <p style={{ color: 'var(--secondary)' }}>Bulk import data from CSV/Excel files</p></div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="step-indicator">
//         <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1. Select Type</div>
//         <ArrowRight size={16} />
//         <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2. Upload File</div>
//         <ArrowRight size={16} />
//         <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>3. Map Columns</div>
//         <ArrowRight size={16} />
//         <div className={`step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>4. Validate</div>
//         <ArrowRight size={16} />
//         <div className={`step ${step >= 5 ? 'active' : ''} ${step > 5 ? 'completed' : ''}`}>5. Import</div>
//       </div>

//       {step === 1 && (
//         <div className="import-step">
//           <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Select Import Type</h3>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
//             {importTypes.map(type => (
//               <label key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `2px solid ${importType === type.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '0.5rem', cursor: 'pointer', background: importType === type.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
//                 <input type="radio" name="importType" value={type.id} checked={importType === type.id} onChange={(e) => setImportType(e.target.value)} style={{ display: 'none' }} />
//                 <div><strong>{type.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{type.description}</div></div>
//               </label>
//             ))}
//           </div>
//           <button className="button" onClick={handleTypeSelect}>Next: Upload File</button>
//         </div>
//       )}

//       {step === 2 && (
//         <div className="import-step">
//           <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Download Template & Upload File</h3>
//           <button className="button button-secondary" onClick={downloadTemplate} style={{ marginBottom: '1rem' }}><Download size={16} /> Download {importType} Template</button>
//           <div className="bulk-import-area" style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '0.5rem', cursor: 'pointer' }} onClick={() => document.getElementById('fileInput').click()}>
//             <FileSpreadsheet size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
//             <p>Click or drag CSV/Excel file here</p>
//             <input type="file" id="fileInput" style={{ display: 'none' }} accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
//           </div>
//         </div>
//       )}

//       {step === 3 && (
//         <div className="import-step">
//           <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Map Columns</h3>
//           <div className="column-mapping">
//             {templateColumns[importType]?.map(col => (
//               <div key={col} className="form-group"><label>{col}</label><select className="form-select"><option value={col}>{col}</option><option value="">Skip</option></select></div>
//             ))}
//           </div>
//           <div className="preview-table"><table className="academic-years-table"><thead><tr>{Object.keys(previewData[0] || {}).map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{previewData.map((row, i) => (<tr key={i}>{Object.values(row).map((v, j) => <td key={j}>{v}</td>)}</tr>))}</tbody></table></div>
//           <button className="button" onClick={handleValidate} style={{ marginTop: '1rem' }}>Next: Validate</button>
//         </div>
//       )}

//       {step === 4 && importResult && (
//         <div className="import-step">
//           <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Validation Results</h3>
//           <div className="import-summary">
//             <div><CheckCircle size={16} color="#10b981" /> Valid records: {importResult.successCount}</div>
//             <div><AlertCircle size={16} color="#ef4444" /> Errors: {importResult.errorCount}</div>
//             {importResult.errors.map((err, i) => (<div key={i} className="error-row">⚠ {err}</div>))}
//           </div>
//           <button className="button" onClick={handleExecuteImport} style={{ marginTop: '1rem' }}>Execute Import</button>
//         </div>
//       )}

//       {step === 5 && (
//         <div className="import-step" style={{ textAlign: 'center' }}>
//           <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
//           <h3>Import Complete!</h3>
//           <p>{importResult?.successCount} records imported successfully</p>
//           <button className="button" onClick={() => { setStep(1); setImportType(''); setFile(null); }}>Start New Import</button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ImportData;


// // src/components/Data/ImportData.jsx

// import { useState, useRef } from 'react';
// import { 
//   Upload, 
//   Download, 
//   FileSpreadsheet, 
//   CheckCircle, 
//   AlertCircle, 
//   Eye, 
//   X, 
//   ArrowRight, 
//   FileText,
//   Loader,
//   RefreshCw
// } from 'lucide-react';
// import '../../../styles/import-data.css';
// import { importService, importTypes, templateColumns } from '../../../services/importService';

// function ImportData() {
//   const [step, setStep] = useState(1);
//   const [importType, setImportType] = useState('');
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState([]);
//   const [headers, setHeaders] = useState([]);
//   const [columnMapping, setColumnMapping] = useState({});
//   const [suggestedMapping, setSuggestedMapping] = useState({});
//   const [importResult, setImportResult] = useState(null);
//   const [validationResult, setValidationResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [skipErrors, setSkipErrors] = useState(false);
//   const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
//   const fileInputRef = useRef(null);

//   const showAlert = (message, type = 'success') => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => {
//       setAlert({ show: false, message: '', type: 'success' });
//     }, 3000);
//   };

//   const handleTypeSelect = async () => {
//     if (!importType) {
//       showAlert('Please select an import type', 'error');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       // Get sample data for preview
//       const sampleData = await importService.getSampleData(importType);
//       setPreview(sampleData.sample_data || []);
//       setHeaders(sampleData.headers || []);
//       setStep(2);
//     } catch (error) {
//       showAlert('Failed to load template: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileUpload = async (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;
    
//     setFile(selectedFile);
//     setUploadProgress(25);
    
//     try {
//       setLoading(true);
      
//       // Preview the file
//       const previewData = await importService.previewFile(importType, selectedFile);
//       setPreview(previewData.preview);
//       setHeaders(previewData.headers);
//       setUploadProgress(50);
      
//       // Get suggested column mapping
//       const mappingData = await importService.suggestMapping(selectedFile);
//       setSuggestedMapping(mappingData.suggested_mapping);
      
//       // Initialize column mapping with suggestions
//       const initialMapping = {};
//       templateColumns[importType].forEach(col => {
//         const targetKey = col.toLowerCase().replace(/ /g, '_');
//         initialMapping[targetKey] = mappingData.suggested_mapping[targetKey] || '';
//       });
//       setColumnMapping(initialMapping);
      
//       setUploadProgress(100);
//       setStep(3);
//     } catch (error) {
//       showAlert('Failed to process file: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//       setUploadProgress(0);
//     }
//   };

//   const handleMappingChange = (targetField, sourceField) => {
//     setColumnMapping(prev => ({
//       ...prev,
//       [targetField]: sourceField
//     }));
//   };

//   const handleValidate = async () => {
//     if (!file) {
//       showAlert('No file selected', 'error');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       const result = await importService.validateImport(
//         importType, 
//         file, 
//         columnMapping
//       );
//       setValidationResult(result);
//       setStep(4);
//     } catch (error) {
//       showAlert('Validation failed: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExecuteImport = async () => {
//     if (!file) {
//       showAlert('No file selected', 'error');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       const result = await importService.executeImport(
//         importType, 
//         file, 
//         columnMapping,
//         0,
//         skipErrors
//       );
//       setImportResult(result);
//       setStep(5);
//       showAlert(`Successfully imported ${result.success_count} records!`, 'success');
//     } catch (error) {
//       showAlert('Import failed: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownloadTemplate = async () => {
//     try {
//       setLoading(true);
//       await importService.downloadTemplate(importType);
//       showAlert('Template downloaded successfully!', 'success');
//     } catch (error) {
//       showAlert('Failed to download template: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetImport = () => {
//     setStep(1);
//     setImportType('');
//     setFile(null);
//     setPreview([]);
//     setHeaders([]);
//     setColumnMapping({});
//     setSuggestedMapping({});
//     setImportResult(null);
//     setValidationResult(null);
//     setSkipErrors(false);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const getRequiredFields = () => {
//     const required = {
//       students: ['First Name', 'Last Name', 'Student Number'],
//       staff: ['First Name', 'Last Name', 'Staff Number'],
//       subjects: ['Subject Name', 'Subject Code'],
//       classes: ['Class Name', 'Class Code'],
//       scores: ['Student Number', 'Assessment Name', 'Score']
//     };
//     return required[importType] || [];
//   };

//   return (
//     <div className="import-data-container">
//       {/* Alert Messages */}
//       {alert.show && (
//         <div className={`alert-${alert.type}`}>
//           <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//             {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//             {alert.message}
//           </span>
//           <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
//             <X size={18} />
//           </span>
//         </div>
//       )}

//       <div className="import-header">
//         <div className="header-title">
//           <h1>
//             <Upload size={28} />
//             Import Data
//           </h1>
//           <p>Bulk import data from CSV/Excel files</p>
//         </div>
//       </div>
//       <hr className="divider" />

//       {/* Step Indicator */}
//       <div className="step-indicator">
//         <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
//           <span className="step-number">1</span>
//           <span className="step-label">Select Type</span>
//         </div>
//         <div className="step-arrow"><ArrowRight size={16} /></div>
//         <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
//           <span className="step-number">2</span>
//           <span className="step-label">Upload File</span>
//         </div>
//         <div className="step-arrow"><ArrowRight size={16} /></div>
//         <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
//           <span className="step-number">3</span>
//           <span className="step-label">Map Columns</span>
//         </div>
//         <div className="step-arrow"><ArrowRight size={16} /></div>
//         <div className={`step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
//           <span className="step-number">4</span>
//           <span className="step-label">Validate</span>
//         </div>
//         <div className="step-arrow"><ArrowRight size={16} /></div>
//         <div className={`step ${step >= 5 ? 'active' : ''} ${step > 5 ? 'completed' : ''}`}>
//           <span className="step-number">5</span>
//           <span className="step-label">Import</span>
//         </div>
//       </div>

//       {/* Step 1: Select Type */}
//       {step === 1 && (
//         <div className="import-step">
//           <h3 className="step-title">Select Import Type</h3>
//           <div className="import-types-grid">
//             {importTypes.map(type => (
//               <label 
//                 key={type.id} 
//                 className={`import-type-card ${importType === type.id ? 'selected' : ''}`}
//               >
//                 <input
//                   type="radio"
//                   name="importType"
//                   value={type.id}
//                   checked={importType === type.id}
//                   onChange={(e) => setImportType(e.target.value)}
//                   style={{ display: 'none' }}
//                 />
//                 <div className="import-type-content">
//                   <div className="import-type-icon">
//                     <FileSpreadsheet size={24} />
//                   </div>
//                   <div className="import-type-info">
//                     <strong>{type.name}</strong>
//                     <div className="import-type-description">{type.description}</div>
//                   </div>
//                 </div>
//               </label>
//             ))}
//           </div>
//           <button 
//             className="btn-primary" 
//             onClick={handleTypeSelect}
//             disabled={!importType || loading}
//           >
//             {loading ? <Loader size={16} className="spinner" /> : 'Next: Upload File'}
//           </button>
//         </div>
//       )}

//       {/* Step 2: Upload File */}
//       {step === 2 && (
//         <div className="import-step">
//           <h3 className="step-title">Download Template & Upload File</h3>
          
//           <div className="template-section">
//             <button 
//               className="btn-secondary" 
//               onClick={handleDownloadTemplate}
//               disabled={loading}
//             >
//               <Download size={16} /> Download {importTypes.find(t => t.id === importType)?.name} Template
//             </button>
//             <div className="template-note">
//               <AlertCircle size={14} />
//               <span>Required fields: {getRequiredFields().join(', ')}</span>
//             </div>
//           </div>

//           <div 
//             className="upload-area"
//             onClick={() => fileInputRef.current?.click()}
//             onDragOver={(e) => e.preventDefault()}
//             onDrop={(e) => {
//               e.preventDefault();
//               const droppedFile = e.dataTransfer.files[0];
//               if (droppedFile) {
//                 const fakeEvent = { target: { files: [droppedFile] } };
//                 handleFileUpload(fakeEvent);
//               }
//             }}
//           >
//             <FileSpreadsheet size={48} className="upload-icon" />
//             <p>Click or drag CSV/Excel file here</p>
//             <p className="upload-hint">Supported formats: .csv, .xlsx, .xls</p>
//             {file && <p className="uploaded-file">Selected: {file.name}</p>}
//             <input
//               ref={fileInputRef}
//               type="file"
//               style={{ display: 'none' }}
//               accept=".csv,.xlsx,.xls"
//               onChange={handleFileUpload}
//             />
//           </div>

//           {uploadProgress > 0 && uploadProgress < 100 && (
//             <div className="upload-progress">
//               <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
//               <span>{uploadProgress}%</span>
//             </div>
//           )}

//           {preview.length > 0 && (
//             <div className="preview-section">
//               <h4>Sample Preview</h4>
//               <div className="preview-table-container">
//                 <table className="preview-table">
//                   <thead>
//                     <tr>
//                       {headers.slice(0, 6).map(header => (
//                         <th key={header}>{header}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {preview.slice(0, 3).map((row, idx) => (
//                       <tr key={idx}>
//                         {Object.values(row).slice(0, 6).map((value, colIdx) => (
//                           <td key={colIdx}>{String(value)}</td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Step 3: Map Columns */}
//       {step === 3 && (
//         <div className="import-step">
//           <h3 className="step-title">Map Columns</h3>
          
//           <div className="mapping-grid">
//             {templateColumns[importType]?.map(col => {
//               const targetKey = col.toLowerCase().replace(/ /g, '_');
//               return (
//                 <div key={col} className="mapping-item">
//                   <label className="mapping-label">
//                     {col}
//                     {getRequiredFields().includes(col) && <span className="required">*</span>}
//                   </label>
//                   <select 
//                     className="form-select"
//                     value={columnMapping[targetKey] || ''}
//                     onChange={(e) => handleMappingChange(targetKey, e.target.value)}
//                   >
//                     <option value="">-- Select Column --</option>
//                     <option value="skip">Skip this column</option>
//                     {headers.map(header => (
//                       <option key={header} value={header}>
//                         {header} {suggestedMapping[targetKey] === header ? ' (suggested)' : ''}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="preview-section">
//             <h4>Data Preview</h4>
//             <div className="preview-table-container">
//               <table className="preview-table">
//                 <thead>
//                   <tr>
//                     {templateColumns[importType]?.slice(0, 6).map(col => (
//                       <th key={col}>{col}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {preview.slice(0, 5).map((row, idx) => (
//                     <tr key={idx}>
//                       {templateColumns[importType]?.slice(0, 6).map(col => {
//                         const targetKey = col.toLowerCase().replace(/ /g, '_');
//                         const sourceCol = columnMapping[targetKey];
//                         return (
//                           <td key={col}>
//                             {sourceCol && sourceCol !== 'skip' ? row[sourceCol] || '-' : '-'}
//                           </td>
//                         );
//                       })}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <button className="btn-primary" onClick={handleValidate} disabled={loading}>
//             {loading ? <Loader size={16} className="spinner" /> : 'Next: Validate'}
//           </button>
//         </div>
//       )}

//       {/* Step 4: Validate */}
//       {step === 4 && validationResult && (
//         <div className="import-step">
//           <h3 className="step-title">Validation Results</h3>
          
//           <div className="validation-summary">
//             <div className="summary-card success">
//               <CheckCircle size={24} />
//               <div>
//                 <div className="summary-value">{validationResult.valid_count}</div>
//                 <div className="summary-label">Valid Records</div>
//               </div>
//             </div>
//             <div className="summary-card error">
//               <AlertCircle size={24} />
//               <div>
//                 <div className="summary-value">{validationResult.error_count}</div>
//                 <div className="summary-label">Errors Found</div>
//               </div>
//             </div>
//             <div className="summary-card info">
//               <FileText size={24} />
//               <div>
//                 <div className="summary-value">{validationResult.total_records}</div>
//                 <div className="summary-label">Total Records</div>
//               </div>
//             </div>
//           </div>

//           {validationResult.errors && validationResult.errors.length > 0 && (
//             <div className="validation-errors">
//               <h4>Error Details</h4>
//               <div className="errors-list">
//                 {validationResult.errors.slice(0, 20).map((err, idx) => (
//                   <div key={idx} className="error-item">
//                     <AlertCircle size={14} />
//                     <span>Row {err.row}: {err.error}</span>
//                   </div>
//                 ))}
//                 {validationResult.errors.length > 20 && (
//                   <div className="error-more">
//                     + {validationResult.errors.length - 20} more errors
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           <div className="validation-options">
//             <label className="checkbox-label">
//               <input
//                 type="checkbox"
//                 checked={skipErrors}
//                 onChange={(e) => setSkipErrors(e.target.checked)}
//               />
//               <span>Skip records with errors and continue import</span>
//             </label>
//           </div>

//           {validationResult.valid_count > 0 && (
//             <button className="btn-primary" onClick={handleExecuteImport} disabled={loading}>
//               {loading ? <Loader size={16} className="spinner" /> : `Import ${validationResult.valid_count} Records`}
//             </button>
//           )}
//         </div>
//       )}

//       {/* Step 5: Import Complete */}
//       {step === 5 && importResult && (
//         <div className="import-step complete">
//           <div className="success-icon">
//             <CheckCircle size={64} color="#10b981" />
//           </div>
//           <h3 className="success-title">Import Complete!</h3>
          
//           <div className="import-stats">
//             <div className="stat-item">
//               <div className="stat-value">{importResult.success_count}</div>
//               <div className="stat-label">Records Imported</div>
//             </div>
//             <div className="stat-item">
//               <div className="stat-value">{importResult.error_count}</div>
//               <div className="stat-label">Failed Records</div>
//             </div>
//             <div className="stat-item">
//               <div className="stat-value">{importResult.total_records}</div>
//               <div className="stat-label">Total Processed</div>
//             </div>
//           </div>

//           {importResult.errors && importResult.errors.length > 0 && (
//             <div className="import-errors">
//               <h4>Import Errors</h4>
//               <div className="errors-list">
//                 {importResult.errors.slice(0, 10).map((err, idx) => (
//                   <div key={idx} className="error-item">
//                     <AlertCircle size={14} />
//                     <span>Row {err.row}: {err.error}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="action-buttons">
//             <button className="btn-secondary" onClick={resetImport}>
//               Start New Import
//             </button>
//             <button className="btn-primary" onClick={() => window.location.reload()}>
//               <RefreshCw size={16} /> Refresh Page
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ImportData;





// src/components/Data/ImportData.jsx

import { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ArrowRight, 
  FileText,
  Loader,
  RefreshCw,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import '../../../styles/import-data.css';
import { importService } from '../../../services/importService';

function ImportData() {
  const [step, setStep] = useState(1);
  const [importType, setImportType] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [suggestedMapping, setSuggestedMapping] = useState({});
  const [importResult, setImportResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [skipErrors, setSkipErrors] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
  const fileInputRef = useRef(null);

  // Import types configuration
  const importTypes = [
    { id: 'students', name: 'Students', description: 'Import student records with parent information', icon: Users },
    { id: 'staff', name: 'Staff', description: 'Import teaching and non-teaching staff', icon: Users },
    { id: 'subjects', name: 'Subjects', description: 'Import subject master list', icon: BookOpen },
    { id: 'classes', name: 'Classes', description: 'Import class structures', icon: GraduationCap }
  ];

  // Template columns for each import type
  const templateColumns = {
    students: ['Student Number', 'First Name', 'Last Name', 'Other Names', 'Date of Birth', 'Gender', 'Email', 'Phone', 'Address', 'Parent Name', 'Parent Phone', 'Parent Email'],
    staff: ['Staff Number', 'First Name', 'Last Name', 'Other Names', 'Role', 'Department', 'Qualification', 'Hired Date', 'Email', 'Phone'],
    subjects: ['Subject Name', 'Subject Code', 'Type', 'Category', 'Description'],
    classes: ['Class Name', 'Class Code', 'Level', 'Programme', 'Capacity', 'Description']
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleTypeSelect = () => {
    if (!importType) {
      showAlert('Please select an import type', 'error');
      return;
    }
    setStep(2);
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setUploadProgress(25);
    
    try {
      setLoading(true);
      
      // Preview the file
      const previewData = await importService.previewFile(importType, selectedFile);
      setPreview(previewData.preview);
      setHeaders(previewData.headers);
      setUploadProgress(50);
      
      // Get suggested column mapping
      const mappingData = await importService.suggestMapping(selectedFile);
      setSuggestedMapping(mappingData.suggested_mapping);
      
      // Initialize column mapping with suggestions
      const initialMapping = {};
      templateColumns[importType].forEach(col => {
        const targetKey = col.toLowerCase().replace(/ /g, '_');
        initialMapping[targetKey] = mappingData.suggested_mapping[targetKey] || '';
      });
      setColumnMapping(initialMapping);
      
      setUploadProgress(100);
      setStep(3);
    } catch (error) {
      showAlert('Failed to process file: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleMappingChange = (targetField, sourceField) => {
    setColumnMapping(prev => ({
      ...prev,
      [targetField]: sourceField
    }));
  };

  const handleValidate = async () => {
    if (!file) {
      showAlert('No file selected', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const result = await importService.validateImport(
        importType, 
        file, 
        columnMapping
      );
      setValidationResult(result);
      setStep(4);
    } catch (error) {
      showAlert('Validation failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!file) {
      showAlert('No file selected', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const result = await importService.executeImport(
        importType, 
        file, 
        columnMapping,
        0,
        skipErrors
      );
      setImportResult(result);
      setStep(5);
      if (result.success_count > 0) {
        showAlert(`Successfully imported ${result.success_count} records!`, 'success');
      }
    } catch (error) {
      showAlert('Import failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      await importService.downloadTemplate(importType);
      showAlert('Template downloaded successfully!', 'success');
    } catch (error) {
      showAlert('Failed to download template: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setStep(1);
    setImportType('');
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setColumnMapping({});
    setSuggestedMapping({});
    setImportResult(null);
    setValidationResult(null);
    setSkipErrors(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRequiredFields = () => {
    const required = {
      students: ['First Name', 'Last Name'],
      staff: ['First Name', 'Last Name'],
      subjects: ['Subject Name', 'Subject Code'],
      classes: ['Class Name', 'Class Code']
    };
    return required[importType] || [];
  };

  return (
    <div className="import-data-container">
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert-${alert.type}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {alert.message}
          </span>
          <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
            <X size={18} />
          </span>
        </div>
      )}

      <div className="import-header">
        <div className="header-title">
          <h1>
            <Upload size={28} />
            Import Data
          </h1>
          <p>Bulk import data from CSV/Excel files</p>
        </div>
      </div>
      <hr className="divider" />

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Select Type</span>
        </div>
        <div className="step-arrow"><ArrowRight size={16} /></div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Upload File</span>
        </div>
        <div className="step-arrow"><ArrowRight size={16} /></div>
        <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Map Columns</span>
        </div>
        <div className="step-arrow"><ArrowRight size={16} /></div>
        <div className={`step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
          <span className="step-number">4</span>
          <span className="step-label">Validate</span>
        </div>
        <div className="step-arrow"><ArrowRight size={16} /></div>
        <div className={`step ${step >= 5 ? 'active' : ''} ${step > 5 ? 'completed' : ''}`}>
          <span className="step-number">5</span>
          <span className="step-label">Import</span>
        </div>
      </div>

      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="import-step">
          <h3 className="step-title">Select Import Type</h3>
          <div className="import-types-grid">
            {importTypes.map(type => {
              const Icon = type.icon;
              return (
                <label 
                  key={type.id} 
                  className={`import-type-card ${importType === type.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="importType"
                    value={type.id}
                    checked={importType === type.id}
                    onChange={(e) => setImportType(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div className="import-type-content">
                    <div className="import-type-icon">
                      <Icon size={24} />
                    </div>
                    <div className="import-type-info">
                      <strong>{type.name}</strong>
                      <div className="import-type-description">{type.description}</div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          <button 
            className="btn-primary" 
            onClick={handleTypeSelect}
            disabled={!importType || loading}
          >
            {loading ? <Loader size={16} className="spinner" /> : 'Next: Upload File'}
          </button>
        </div>
      )}

      {/* Step 2: Upload File */}
      {step === 2 && (
        <div className="import-step">
          <h3 className="step-title">Download Template & Upload File</h3>
          
          <div className="template-section">
            <button 
              className="btn-secondary" 
              onClick={handleDownloadTemplate}
              disabled={loading}
            >
              <Download size={16} /> Download {importTypes.find(t => t.id === importType)?.name} Template
            </button>
            <div className="template-note">
              <AlertCircle size={14} />
              <span>Required fields: {getRequiredFields().join(', ')}</span>
            </div>
          </div>

          <div 
            className="upload-area"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) {
                const fakeEvent = { target: { files: [droppedFile] } };
                handleFileUpload(fakeEvent);
              }
            }}
          >
            <FileSpreadsheet size={48} className="upload-icon" />
            <p>Click or drag CSV/Excel file here</p>
            <p className="upload-hint">Supported formats: .csv, .xlsx, .xls</p>
            {file && <p className="uploaded-file">Selected: {file.name}</p>}
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
            />
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
              <span>{uploadProgress}%</span>
            </div>
          )}

          {preview.length > 0 && (
            <div className="preview-section">
              <h4>Sample Preview</h4>
              <div className="preview-table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      {headers.slice(0, 6).map(header => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 3).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).slice(0, 6).map((value, colIdx) => (
                          <td key={colIdx}>{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Map Columns */}
      {step === 3 && (
        <div className="import-step">
          <h3 className="step-title">Map Columns</h3>
          
          <div className="mapping-grid">
            {templateColumns[importType]?.map(col => {
              const targetKey = col.toLowerCase().replace(/ /g, '_');
              return (
                <div key={col} className="mapping-item">
                  <label className="mapping-label">
                    {col}
                    {getRequiredFields().includes(col) && <span className="required">*</span>}
                  </label>
                  <select 
                    className="form-select"
                    value={columnMapping[targetKey] || ''}
                    onChange={(e) => handleMappingChange(targetKey, e.target.value)}
                  >
                    <option value="">-- Select Column --</option>
                    <option value="skip">Skip this column</option>
                    {headers.map(header => (
                      <option key={header} value={header}>
                        {header} {suggestedMapping[targetKey] === header ? ' (suggested)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <div className="preview-section">
            <h4>Data Preview (Mapped)</h4>
            <div className="preview-table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    {templateColumns[importType]?.slice(0, 6).map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      {templateColumns[importType]?.slice(0, 6).map(col => {
                        const targetKey = col.toLowerCase().replace(/ /g, '_');
                        const sourceCol = columnMapping[targetKey];
                        return (
                          <td key={col}>
                            {sourceCol && sourceCol !== 'skip' ? row[sourceCol] || '-' : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button className="btn-primary" onClick={handleValidate} disabled={loading}>
            {loading ? <Loader size={16} className="spinner" /> : 'Next: Validate'}
          </button>
        </div>
      )}

      {/* Step 4: Validate */}
      {step === 4 && validationResult && (
        <div className="import-step">
          <h3 className="step-title">Validation Results</h3>
          
          <div className="validation-summary">
            <div className="summary-card success">
              <CheckCircle size={24} />
              <div>
                <div className="summary-value">{validationResult.valid_count}</div>
                <div className="summary-label">Valid Records</div>
              </div>
            </div>
            <div className="summary-card error">
              <AlertCircle size={24} />
              <div>
                <div className="summary-value">{validationResult.error_count}</div>
                <div className="summary-label">Errors Found</div>
              </div>
            </div>
            <div className="summary-card info">
              <FileText size={24} />
              <div>
                <div className="summary-value">{validationResult.total_records}</div>
                <div className="summary-label">Total Records</div>
              </div>
            </div>
          </div>

          {validationResult.errors && validationResult.errors.length > 0 && (
            <div className="validation-errors">
              <h4>Error Details</h4>
              <div className="errors-list">
                {validationResult.errors.slice(0, 20).map((err, idx) => (
                  <div key={idx} className="error-item">
                    <AlertCircle size={14} />
                    <span>Row {err.row}: {err.error}</span>
                  </div>
                ))}
                {validationResult.errors.length > 20 && (
                  <div className="error-more">
                    + {validationResult.errors.length - 20} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="validation-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={skipErrors}
                onChange={(e) => setSkipErrors(e.target.checked)}
              />
              <span>Skip records with errors and continue import</span>
            </label>
          </div>

          {validationResult.valid_count > 0 && (
            <button className="btn-primary" onClick={handleExecuteImport} disabled={loading}>
              {loading ? <Loader size={16} className="spinner" /> : `Import ${validationResult.valid_count} Records`}
            </button>
          )}
        </div>
      )}

      {/* Step 5: Import Complete */}
      {step === 5 && importResult && (
        <div className="import-step complete">
          <div className="success-icon">
            <CheckCircle size={64} color="#10b981" />
          </div>
          <h3 className="success-title">Import Complete!</h3>
          
          <div className="import-stats">
            <div className="stat-item">
              <div className="stat-value">{importResult.success_count}</div>
              <div className="stat-label">Records Imported</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{importResult.error_count}</div>
              <div className="stat-label">Failed Records</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{importResult.total_records}</div>
              <div className="stat-label">Total Processed</div>
            </div>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="import-errors">
              <h4>Import Errors</h4>
              <div className="errors-list">
                {importResult.errors.slice(0, 10).map((err, idx) => (
                  <div key={idx} className="error-item">
                    <AlertCircle size={14} />
                    <span>Row {err.row}: {err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button className="btn-secondary" onClick={resetImport}>
              Start New Import
            </button>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} /> Refresh Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportData;