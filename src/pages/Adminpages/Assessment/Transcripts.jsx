// import { useState } from 'react';
// import { FileText, Printer, Download, Search, User, Calendar, Award, X } from 'lucide-react';
// import '../../../styles/transcripts.css';

// function Transcripts() {
//   const [selectedStudent, setSelectedStudent] = useState('John Doe');
//   const [transcriptData, setTranscriptData] = useState(null);

//   const students = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'];

//   const academicHistory = [
//     { year: '2024-2025', term: 'Term 1', subjects: [{ name: 'Mathematics', score: 85, grade: 'A', credits: 3 }, { name: 'English', score: 78, grade: 'B+', credits: 3 }], gpa: 3.8, cumulativeGPA: 3.8 },
//     { year: '2024-2025', term: 'Term 2', subjects: [{ name: 'Mathematics', score: 88, grade: 'A', credits: 3 }, { name: 'English', score: 82, grade: 'A-', credits: 3 }], gpa: 3.9, cumulativeGPA: 3.85 }
//   ];

//   const handleGenerate = () => {
//     setTranscriptData(academicHistory);
//   };

//   const totalCredits = academicHistory.reduce((sum, t) => sum + t.subjects.reduce((s, sub) => s + sub.credits, 0), 0);
//   const finalGPA = academicHistory.reduce((sum, t) => sum + t.gpa, 0) / academicHistory.length;

//   const exportPDF = () => alert('Exporting transcript to PDF...');

//   return (
//     <div className="transcripts-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><FileText size={28} style={{ display: 'inline', marginRight: '12px' }} />Transcripts</h1>
//         <p style={{ color: 'var(--secondary)' }}>Generate cumulative academic history across multiple terms/years</p></div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="card" style={{ marginBottom: '1rem' }}>
//         <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
//           <div className="form-group" style={{ flex: 1 }}><label>Select Student</label><select className="form-select" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>{students.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
//           <button className="button" onClick={handleGenerate}><Search size={16} /> Generate Transcript</button>
//           <button className="button button-secondary" onClick={exportPDF}><Download size={16} /> Export PDF</button>
//         </div>
//       </div>

//       {transcriptData && (<div className="transcript-preview"><div className="transcript-header"><h2>Springfield International School</h2><p>Official Academic Transcript</p></div>
//       <div className="student-info"><p><strong>Student Name:</strong> {selectedStudent}</p><p><strong>Student Number:</strong> STU001</p><p><strong>Date of Birth:</strong> 2010-05-15</p><p><strong>Programme:</strong> General Science</p></div>
//       {transcriptData.map((term, idx) => (<div key={idx} className="term-section"><h3>{term.year} - {term.term}</h3><table className="transcript-table"><thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Credits</th></tr></thead>
//       <tbody>{term.subjects.map((s, i) => (<tr key={i}><td>{s.name}</td><td>{s.score}%</td><td>{s.grade}</td><td>{s.credits}</td></tr>))}
//       <tr className="total-row"><td colSpan="3"><strong>Term GPA:</strong></td><td><strong>{term.gpa}</strong></td></tr></tbody></table></div>))}
//       <div className="summary-section"><p><strong>Total Credits Earned:</strong> {totalCredits}</p><p><strong>Cumulative GPA:</strong> {finalGPA.toFixed(2)}</p><p><strong>Graduation Status:</strong> In Progress - Expected 2026</p></div>
//       <div className="transcript-footer"><p>Issued on: {new Date().toLocaleDateString()}</p><p>Registrar's Signature: _________________</p></div></div>)}
//     </div>
//   );
// }

// export default Transcripts;







// src/components/Academics/Transcripts.jsx

import { useState, useEffect } from 'react';
import { 
  FileText, Printer, Download, Search, User, Calendar, Award, X, 
  Loader, RefreshCw, AlertCircle, CheckCircle, GraduationCap, BookOpen 
} from 'lucide-react';
import '../../../styles/transcripts.css';

const API_BASE_URL = 'http://localhost:8000/api';

const transcriptService = {
  async getStudents() {
    const response = await fetch(`${API_BASE_URL}/transcripts/students`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async generateTranscript(studentId) {
    const response = await fetch(`${API_BASE_URL}/transcripts/generate?student_id=${studentId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function Transcripts() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [transcriptData, setTranscriptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await transcriptService.getStudents();
      setStudents(data);
      if (data.length > 0) {
        setSelectedStudentId(data[0].id.toString());
      }
    } catch (error) {
      showAlert('Failed to load students: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleGenerate = async () => {
    if (!selectedStudentId) {
      showAlert('Please select a student', 'error');
      return;
    }

    try {
      setGenerating(true);
      const data = await transcriptService.generateTranscript(parseInt(selectedStudentId));
      setTranscriptData(data);
      showAlert('Transcript generated successfully!', 'success');
    } catch (error) {
      showAlert('Failed to generate transcript: ' + error.message, 'error');
      setTranscriptData(null);
    } finally {
      setGenerating(false);
    }
  };

  const exportPDF = () => {
    const printContent = document.querySelector('.transcript-preview').cloneNode(true);
    const originalTitle = document.title;
    const student = transcriptData?.student;
    document.title = `Transcript_${student?.name}_${new Date().getFullYear()}`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Transcript - ${student?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .transcript-preview { max-width: 1000px; margin: 0 auto; }
            .transcript-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .student-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
            .term-section { margin-bottom: 25px; }
            .term-section h3 { background: #e0e0e0; padding: 8px; margin-bottom: 10px; }
            .transcript-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .transcript-table th, .transcript-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .transcript-table th { background: #f5f5f5; }
            .total-row { background: #f9f9f9; font-weight: bold; }
            .summary-section { margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
            .transcript-footer { margin-top: 30px; text-align: center; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px; }
            .grade-badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
            .grade-a { background: #d1fae5; color: #065f46; }
            .grade-b-plus, .grade-b { background: #dbeafe; color: #1e40af; }
            .grade-c-plus, .grade-c { background: #fef3c7; color: #92400e; }
            .grade-d-plus, .grade-d, .grade-e { background: #fed7aa; color: #9a3412; }
            .grade-f { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>${printContent.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    document.title = originalTitle;
  };

  const getGradeBadgeClass = (grade) => {
    const gradeMap = {
      'A': 'grade-a', 'A+': 'grade-a', 'A-': 'grade-a',
      'B+': 'grade-b-plus', 'B': 'grade-b', 'B-': 'grade-b',
      'C+': 'grade-c-plus', 'C': 'grade-c', 'C-': 'grade-c',
      'D+': 'grade-d-plus', 'D': 'grade-d', 'D-': 'grade-d',
      'E': 'grade-e', 'F': 'grade-f'
    };
    return gradeMap[grade] || 'grade-default';
  };

  const getGraduationIcon = (status) => {
    if (status.includes('Graduated')) return <CheckCircle size={20} className="text-success" />;
    return <GraduationCap size={20} className="text-warning" />;
  };

  if (loading && !transcriptData) {
    return (
      <div className="transcripts-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transcripts-container">
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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <FileText size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Transcripts
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Generate cumulative academic history across multiple terms/years</p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Generator Controls */}
      <div className="card generator-card">
        <div className="generator-controls">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Select Student</label>
            <select 
              className="form-select" 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={generating}
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.student_number})
                </option>
              ))}
            </select>
          </div>
          <div className="generator-buttons">
            <button 
              className="button" 
              onClick={handleGenerate} 
              disabled={generating || !selectedStudentId}
            >
              {generating ? <Loader size={16} className="spinner" /> : <Search size={16} />}
              Generate Transcript
            </button>
            {transcriptData && (
              <button className="button button-secondary" onClick={exportPDF}>
                <Download size={16} /> Export PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transcript Preview */}
      {transcriptData && (
        <div className="transcript-preview">
          <div className="transcript-header">
            <h2>Springfield International School</h2>
            <p>Official Academic Transcript</p>
          </div>

          <div className="student-info-grid">
            <div className="info-card">
              <User size={16} className="info-icon" />
              <div>
                <div className="info-label">Student Name</div>
                <div className="info-value">{transcriptData.student?.name}</div>
              </div>
            </div>
            <div className="info-card">
              <FileText size={16} className="info-icon" />
              <div>
                <div className="info-label">Student Number</div>
                <div className="info-value">{transcriptData.student?.student_number}</div>
              </div>
            </div>
            <div className="info-card">
              <Calendar size={16} className="info-icon" />
              <div>
                <div className="info-label">Date of Birth</div>
                <div className="info-value">{transcriptData.student?.date_of_birth || 'N/A'}</div>
              </div>
            </div>
            <div className="info-card">
              <BookOpen size={16} className="info-icon" />
              <div>
                <div className="info-label">Programme</div>
                <div className="info-value">{transcriptData.student?.programme}</div>
              </div>
            </div>
          </div>

          {transcriptData.terms?.length === 0 ? (
            <div className="empty-state">
              <Award size={48} />
              <p>No academic records found for this student</p>
              <p className="text-muted">Please ensure results have been processed</p>
            </div>
          ) : (
            <>
              {transcriptData.terms?.map((term, idx) => (
                <div key={idx} className="term-section">
                  <div className="term-header">
                    <h3>{term.academic_year} - {term.term_name}</h3>
                    <div className="term-stats">
                      <span className="term-gpa">GPA: {term.gpa.toFixed(2)}</span>
                      <span className="term-average">Avg: {term.average_score}%</span>
                      <span className={`grade-badge ${getGradeBadgeClass(term.overall_grade)}`}>
                        {term.overall_grade}
                      </span>
                    </div>
                  </div>
                  <table className="transcript-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Score (%)</th>
                        <th>Grade</th>
                        <th>Grade Point</th>
                        <th>Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {term.subjects.map((subject, subIdx) => (
                        <tr key={subIdx}>
                          <td><strong>{subject.subject_name}</strong></td>
                          <td>{subject.score}%</td>
                          <td>
                            <span className={`grade-badge ${getGradeBadgeClass(subject.grade)}`}>
                              {subject.grade}
                            </span>
                          </td>
                          <td>{subject.grade_point}</td>
                          <td>3</td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td colSpan="4"><strong>Term GPA</strong></td>
                        <td><strong>{term.gpa.toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}

              <div className="summary-section">
                <div className="summary-header">
                  <Award size={20} />
                  <h3>Academic Summary</h3>
                </div>
                <div className="summary-grid">
                  <div className="summary-item">
                    <div className="summary-label">Total Terms Completed</div>
                    <div className="summary-value">{transcriptData.summary?.total_terms}</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Total Credits Earned</div>
                    <div className="summary-value">{transcriptData.summary?.total_credits}</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Cumulative GPA</div>
                    <div className="summary-value highlight">{transcriptData.summary?.cumulative_gpa}</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Graduation Status</div>
                    <div className="summary-value status">
                      {getGraduationIcon(transcriptData.summary?.graduation_status)}
                      {transcriptData.summary?.graduation_status}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="transcript-footer">
            <p>Issued on: {new Date().toLocaleDateString()}</p>
            <p>Registrar's Signature: _________________</p>
            <p className="footer-note">This is an official academic transcript. Any alterations will invalidate this document.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transcripts;