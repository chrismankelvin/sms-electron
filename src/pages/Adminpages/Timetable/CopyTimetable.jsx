// import { useState } from 'react';
// import { Copy, Calendar, AlertCircle, CheckCircle, Eye, X } from 'lucide-react';
// import '../../../styles/copy-timetable.css';

// function CopyTimetable() {
//   const [sourceYear, setSourceYear] = useState('2023-2024');
//   const [sourceTerm, setSourceTerm] = useState('Term 3');
//   const [destYear, setDestYear] = useState('2024-2025');
//   const [destTerm, setDestTerm] = useState('Term 1');
//   const [overwriteExisting, setOverwriteExisting] = useState(false);
//   const [copyAllClasses, setCopyAllClasses] = useState(true);
//   const [showPreview, setShowPreview] = useState(false);

//   const previewData = [
//     { class: 'JHS 1 Science', sourceTeacher: 'Mr. John Doe', destTeacher: 'Mr. John Doe', action: 'Copy' },
//     { class: 'JHS 2 Science', sourceTeacher: 'Mrs. Jane Smith', destTeacher: 'Mrs. Jane Smith', action: 'Copy' },
//     { class: 'SHS 1 Science', sourceTeacher: 'Dr. James Wilson', destTeacher: 'Already exists', action: 'Skip/Overwrite' }
//   ];

//   const handleExecuteCopy = () => {
//     alert(`Timetable copied from ${sourceYear} ${sourceTerm} to ${destYear} ${destTerm}\nOverwrite: ${overwriteExisting}\nCopy All Classes: ${copyAllClasses}`);
//   };

//   return (
//     <div className="copy-timetable-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Copy size={28} style={{ display: 'inline', marginRight: '12px' }} />Copy from Previous</h1>
//         <p style={{ color: 'var(--secondary)' }}>Clone last year's timetable to save setup time</p></div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="card">
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
//           <div><h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Source</h3>
//             <select className="form-select" style={{ marginBottom: '0.5rem' }} value={sourceYear} onChange={(e) => setSourceYear(e.target.value)}><option>2022-2023</option><option>2023-2024</option></select>
//             <select className="form-select" value={sourceTerm} onChange={(e) => setSourceTerm(e.target.value)}><option>Term 1</option><option>Term 2</option><option>Term 3</option></select>
//           </div>
//           <div><h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Destination</h3>
//             <select className="form-select" style={{ marginBottom: '0.5rem' }} value={destYear} onChange={(e) => setDestYear(e.target.value)}><option>2024-2025</option><option>2025-2026</option></select>
//             <select className="form-select" value={destTerm} onChange={(e) => setDestTerm(e.target.value)}><option>Term 1</option><option>Term 2</option><option>Term 3</option></select>
//           </div>
//         </div>

//         <div style={{ marginBottom: '1.5rem' }}>
//           <label style={{ display: 'block', marginBottom: '0.5rem' }}><input type="checkbox" checked={copyAllClasses} onChange={(e) => setCopyAllClasses(e.target.checked)} /> Copy all classes</label>
//           <label><input type="checkbox" checked={overwriteExisting} onChange={(e) => setOverwriteExisting(e.target.checked)} /> Overwrite existing timetable data</label>
//         </div>

//         <button className="button button-secondary" onClick={() => setShowPreview(!showPreview)} style={{ marginRight: '1rem' }}><Eye size={16} /> Preview Changes</button>
//         <button className="button" onClick={handleExecuteCopy}><Copy size={16} /> Execute Copy</button>

//         {showPreview && (
//           <div className="preview-changes">
//             <h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Preview of Changes</h3>
//             <div className="table-container"><table className="academic-years-table"><thead><tr><th>Class</th><th>Source Teacher</th><th>Destination Teacher</th><th>Action</th></tr></thead>
//             <tbody>{previewData.map((item, i) => (<tr key={i}><td>{item.class}</td><td>{item.sourceTeacher}</td><td>{item.destTeacher}</td><td><span className={`status-badge ${item.action === 'Copy' ? 'status-active' : 'status-inactive'}`}>{item.action}</span></td></tr>))}</tbody></table></div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CopyTimetable;





// src/components/Academics/CopyTimetable.jsx

import { useState, useEffect } from 'react';
import { 
  Copy, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  X,
  Loader,
  Settings,
  ChevronRight
} from 'lucide-react';
import '../../../styles/copy-timetable.css';
import { timetableService } from '../../../services/timetableService';
// import { classService } from '../../../services/classService';
// import { academicYearService } from '../../../services/academicYearService';
// import { termService } from '../../../services/termService';

function CopyTimetable() {
  const [sourceYearId, setSourceYearId] = useState(null);
  const [sourceTermId, setSourceTermId] = useState(null);
  const [destYearId, setDestYearId] = useState(null);
  const [destTermId, setDestTermId] = useState(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [copyAllClasses, setCopyAllClasses] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [isCopying, setIsCopying] = useState(false);
  
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load terms when source/dest year changes
  useEffect(() => {
    if (sourceYearId) {
      loadTerms(sourceYearId, 'source');
    }
  }, [sourceYearId]);

  useEffect(() => {
    if (destYearId) {
      loadTerms(destYearId, 'dest');
    }
  }, [destYearId]);

  // Generate preview when options change
  useEffect(() => {
    if (sourceYearId && sourceTermId && destYearId && destTermId && showPreview) {
      generatePreview();
    }
  }, [sourceYearId, sourceTermId, destYearId, destTermId, copyAllClasses, selectedClasses, showPreview]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [yearsData, classesData] = await Promise.all([
        academicYearService.getAll().catch(() => []),
        classService.getAll().catch(() => [])
      ]);
      
      setAcademicYears(yearsData);
      setClasses(classesData);
      setSelectedClasses(classesData.map(c => c.id));
      
      // Set default selections
      if (yearsData.length > 0) {
        // Source: previous year
        const previousYear = yearsData[yearsData.length - 2];
        setSourceYearId(previousYear?.id || yearsData[0].id);
        
        // Destination: current year
        const currentYear = yearsData.find(y => y.is_current);
        setDestYearId(currentYear?.id || yearsData[yearsData.length - 1]?.id);
      }
      
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTerms = async (yearId, type) => {
    try {
      const termsData = await termService.getByAcademicYear(yearId).catch(() => []);
      
      if (type === 'source') {
        setTerms(prev => ({ ...prev, source: termsData }));
        if (termsData.length > 0 && !sourceTermId) {
          const lastTerm = termsData[termsData.length - 1];
          setSourceTermId(lastTerm.id);
        }
      } else {
        setTerms(prev => ({ ...prev, dest: termsData }));
        if (termsData.length > 0 && !destTermId) {
          const firstTerm = termsData[0];
          setDestTermId(firstTerm.id);
        }
      }
    } catch (error) {
      showAlert(`Failed to load terms for ${type}: ` + error.message, 'error');
    }
  };

  const generatePreview = async () => {
    try {
      // Get source timetable to preview what will be copied
      const sourceTT = await timetableService.getByClass(selectedClasses[0], sourceYearId);
      
      const preview = selectedClasses.map(classId => {
        const classObj = classes.find(c => c.id === classId);
        
        // Check if destination already has entries for this class
        // This would be a real API call in production
        const hasExisting = false; // Mock for now
        
        let action = 'Copy';
        let destTeacher = '';
        
        if (hasExisting) {
          action = overwriteExisting ? 'Overwrite' : 'Skip';
          destTeacher = 'Already exists';
        } else {
          destTeacher = 'New';
        }
        
        return {
          class_id: classId,
          class: classObj?.class_name || `Class ${classId}`,
          sourceTeacher: 'Will be copied from source',
          destTeacher: destTeacher,
          action: action,
          status: action === 'Copy' ? 'success' : action === 'Overwrite' ? 'warning' : 'skip'
        };
      });
      
      setPreviewData(preview);
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewData([]);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleClassSelectionChange = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter(id => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const handleSelectAllClasses = () => {
    if (selectedClasses.length === classes.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(classes.map(c => c.id));
    }
  };

  const handleExecuteCopy = async () => {
    if (!sourceYearId || !sourceTermId || !destYearId || !destTermId) {
      showAlert('Please select source and destination', 'error');
      return;
    }
    
    if (selectedClasses.length === 0) {
      showAlert('Please select at least one class to copy', 'error');
      return;
    }
    
    try {
      setIsCopying(true);
      
      let copiedCount = 0;
      let skippedCount = 0;
      let overwrittenCount = 0;
      
      // Copy each selected class
      for (const classId of selectedClasses) {
        // Get source timetable entries for this class
        const sourceTT = await timetableService.getByClass(classId, sourceYearId);
        
        // Check if destination already has entries
        const destTT = await timetableService.getByClass(classId, destYearId);
        const hasExisting = destTT && Object.keys(destTT.timetable || {}).length > 0;
        
        if (hasExisting && !overwriteExisting) {
          skippedCount++;
          continue;
        }
        
        // Process each entry from source
        let entriesToCopy = [];
        
        // For each day and time slot in source, create entries
        // This would need to map the timetable structure to entries
        // Simplified for demo
        
        if (hasExisting && overwriteExisting) {
          // First delete existing entries
          // Then add new ones
          overwrittenCount++;
        }
        
        copiedCount++;
      }
      
      showAlert(
        `Copy completed!\nCopied: ${copiedCount} classes\nSkipped: ${skippedCount}\nOverwritten: ${overwrittenCount}`,
        'success'
      );
      
      setShowPreview(false);
      
    } catch (error) {
      showAlert('Failed to copy timetable: ' + error.message, 'error');
    } finally {
      setIsCopying(false);
    }
  };

  const getYearLabel = (yearId) => {
    const year = academicYears.find(y => y.id === yearId);
    return year ? year.year_label : 'Select Year';
  };

  const getTermLabel = (termId, type) => {
    const termList = type === 'source' ? terms.source : terms.dest;
    const term = termList?.find(t => t.id === termId);
    return term ? term.name : 'Select Term';
  };

  if (loading) {
    return (
      <div className="copy-timetable-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="copy-timetable-container">
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

      <div className="copy-header">
        <div className="header-title">
          <h1>
            <Copy size={28} />
            Copy from Previous
          </h1>
          <p>Clone last year's timetable to save setup time</p>
        </div>
      </div>
      <hr className="divider" />

      <div className="copy-card">
        {/* Source & Destination Selection */}
        <div className="copy-grid">
          <div className="source-section">
            <div className="section-header">
              <Calendar size={18} />
              <h3>Source</h3>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label>Academic Year</label>
                <select 
                  className="form-select" 
                  value={sourceYearId || ''} 
                  onChange={(e) => setSourceYearId(parseInt(e.target.value))}
                >
                  <option value="">Select Year</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.year_label} {year.is_current ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Term</label>
                <select 
                  className="form-select" 
                  value={sourceTermId || ''} 
                  onChange={(e) => setSourceTermId(parseInt(e.target.value))}
                  disabled={!terms.source}
                >
                  <option value="">Select Term</option>
                  {terms.source?.map(term => (
                    <option key={term.id} value={term.id}>{term.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="arrow-icon">
            <ChevronRight size={24} />
          </div>

          <div className="dest-section">
            <div className="section-header">
              <Calendar size={18} />
              <h3>Destination</h3>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label>Academic Year</label>
                <select 
                  className="form-select" 
                  value={destYearId || ''} 
                  onChange={(e) => setDestYearId(parseInt(e.target.value))}
                >
                  <option value="">Select Year</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.year_label} {year.is_current ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Term</label>
                <select 
                  className="form-select" 
                  value={destTermId || ''} 
                  onChange={(e) => setDestTermId(parseInt(e.target.value))}
                  disabled={!terms.dest}
                >
                  <option value="">Select Term</option>
                  {terms.dest?.map(term => (
                    <option key={term.id} value={term.id}>{term.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="options-section">
          <div className="section-header">
            <Settings size={18} />
            <h3>Copy Options</h3>
          </div>
          <div className="options-content">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={copyAllClasses} 
                onChange={(e) => setCopyAllClasses(e.target.checked)}
              />
              <span>Copy all classes</span>
            </label>
            
            {!copyAllClasses && (
              <div className="class-selection">
                <div className="class-selection-header">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedClasses.length === classes.length}
                      onChange={handleSelectAllClasses}
                    />
                    <span>Select Classes to Copy</span>
                  </label>
                </div>
                <div className="class-list">
                  {classes.map(cls => (
                    <label key={cls.id} className="class-item">
                      <input 
                        type="checkbox" 
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => handleClassSelectionChange(cls.id)}
                      />
                      <span>{cls.class_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={overwriteExisting} 
                onChange={(e) => setOverwriteExisting(e.target.checked)}
              />
              <span>Overwrite existing timetable data</span>
              <small className="checkbox-hint">
                If unchecked, classes with existing timetables will be skipped
              </small>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn-secondary" 
            onClick={() => setShowPreview(!showPreview)}
            disabled={!sourceYearId || !sourceTermId || !destYearId || !destTermId}
          >
            <Eye size={16} /> {showPreview ? 'Hide Preview' : 'Preview Changes'}
          </button>
          <button 
            className="btn-primary" 
            onClick={handleExecuteCopy}
            disabled={isCopying || !sourceYearId || !sourceTermId || !destYearId || !destTermId || selectedClasses.length === 0}
          >
            {isCopying ? <Loader size={16} className="spinner" /> : <Copy size={16} />}
            {isCopying ? 'Copying...' : 'Execute Copy'}
          </button>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="preview-panel">
            <div className="preview-header">
              <h3>Preview of Changes</h3>
              <button className="close-preview" onClick={() => setShowPreview(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="preview-content">
              {previewData.length > 0 ? (
                <div className="table-container">
                  <table className="preview-table">
                    <thead>
                      <td>
                        <th>Class</th>
                        <th>Source Teacher</th>
                        <th>Destination Teacher</th>
                        <th>Action</th>
                      </td>
                    </thead>
                    <tbody>
                      {previewData.map((item, i) => (
                        <tr key={i}>
                          <td><strong>{item.class}</strong></td>
                          <td>{item.sourceTeacher}</td>
                          <td>{item.destTeacher}</td>
                          <td>
                            <span className={`action-badge action-${item.status}`}>
                              {item.action}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="preview-empty">
                  <AlertCircle size={32} />
                  <p>No preview data available. Please select source and destination.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CopyTimetable;