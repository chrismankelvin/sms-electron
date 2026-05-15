// // src/components/Academics/ReportCards.jsx

// import { useState, useEffect } from 'react';
// import { 
//   FileText, Printer, Download, Send, Eye, Users, X, CheckCircle, 
//   Loader, RefreshCw, AlertCircle, ChevronLeft, ChevronRight 
// } from 'lucide-react';
// import '../../../styles/report-cards.css';

// const API_BASE_URL = 'http://localhost:8000/api';

// const reportCardService = {
//   async getOptions() {
//     const response = await fetch(`${API_BASE_URL}/report-cards/options`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async getStudentsForClass(classId) {
//     const response = await fetch(`${API_BASE_URL}/report-cards/students?class_id=${classId}`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async generateReportCard(studentId, termId, classId, template) {
//     const response = await fetch(`${API_BASE_URL}/report-cards/generate?student_id=${studentId}&term_id=${termId}&class_id=${classId}&template=${template}`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async generateAllReportCards(termId, classId, template) {
//     const response = await fetch(`${API_BASE_URL}/report-cards/generate-all`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         term_id: termId,
//         class_id: classId,
//         template: template
//       })
//     });
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   }
// };

// function ReportCards() {
//   const [terms, setTerms] = useState([]);
//   const [years, setYears] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [selectedYear, setSelectedYear] = useState('');
//   const [selectedTerm, setSelectedTerm] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');
//   const [selectedStudentId, setSelectedStudentId] = useState('');
//   const [selectedTemplate, setSelectedTemplate] = useState('standard');
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [generating, setGenerating] = useState(false);
//   const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

//   const templates = [
//     { value: 'standard', label: 'Standard' },
//     { value: 'detailed', label: 'Detailed' },
//     { value: 'simple', label: 'Simple' }
//   ];

//   // Load options on mount
//   useEffect(() => {
//     loadOptions();
//   }, []);

//   // Load students when class changes
//   useEffect(() => {
//     if (selectedClass) {
//       loadStudents();
//     }
//   }, [selectedClass]);

//   const loadOptions = async () => {
//     try {
//       setLoading(true);
//       const data = await reportCardService.getOptions();
//       setTerms(data.terms);
//       setYears(data.academic_years);
//       setClasses(data.classes);
      
//       // Set default selections
//       if (data.terms.length > 0) setSelectedTerm(data.terms[0].id.toString());
//       if (data.academic_years.length > 0) setSelectedYear(data.academic_years[0].id.toString());
//       if (data.classes.length > 0) setSelectedClass(data.classes[0].id.toString());
//     } catch (error) {
//       showAlert('Failed to load options: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadStudents = async () => {
//     try {
//       const data = await reportCardService.getStudentsForClass(parseInt(selectedClass));
//       setStudents(data);
//       if (data.length > 0) {
//         setSelectedStudentId(data[0].id.toString());
//       }
//     } catch (error) {
//       console.error('Error loading students:', error);
//       setStudents([]);
//     }
//   };

//   const showAlert = (message, type = 'success') => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => {
//       setAlert({ show: false, message: '', type: 'success' });
//     }, 3000);
//   };

//   const handleGenerateReport = async () => {
//     if (!selectedStudentId || !selectedTerm || !selectedClass) {
//       showAlert('Please select all required fields', 'error');
//       return;
//     }

//     try {
//       setGenerating(true);
//       const data = await reportCardService.generateReportCard(
//         parseInt(selectedStudentId),
//         parseInt(selectedTerm),
//         parseInt(selectedClass),
//         selectedTemplate
//       );
//       setReportData(data);
//       showAlert('Report card generated successfully!', 'success');
//     } catch (error) {
//       showAlert('Failed to generate report: ' + error.message, 'error');
//       setReportData(null);
//     } finally {
//       setGenerating(false);
//     }
//   };

//   const handleGenerateAll = async () => {
//     if (!selectedTerm || !selectedClass) {
//       showAlert('Please select term and class', 'error');
//       return;
//     }

//     try {
//       setGenerating(true);
//       const result = await reportCardService.generateAllReportCards(
//         parseInt(selectedTerm),
//         parseInt(selectedClass),
//         selectedTemplate
//       );
//       showAlert(`Generated ${result.length} report cards!`, 'success');
//     } catch (error) {
//       showAlert('Failed to generate report cards: ' + error.message, 'error');
//     } finally {
//       setGenerating(false);
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleDownload = () => {
//     // Create HTML content for download
//     const printContent = document.querySelector('.report-card-preview').cloneNode(true);
//     const originalTitle = document.title;
//     document.title = `Report_Card_${reportData?.student?.name}_${reportData?.term?.name}`;
    
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Report Card - ${reportData?.student?.name}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             .report-card-preview { max-width: 800px; margin: 0 auto; }
//             .report-header { text-align: center; margin-bottom: 20px; }
//             .report-subject-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
//             .report-subject-table th, .report-subject-table td { 
//               border: 1px solid #ddd; 
//               padding: 8px; 
//               text-align: left; 
//             }
//             .report-subject-table th { background: #f5f5f5; }
//             .signature-line { display: flex; justify-content: space-between; margin-top: 30px; }
//           </style>
//         </head>
//         <body>${printContent.outerHTML}</body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//     printWindow.close();
    
//     document.title = originalTitle;
//   };

//   const handleSendEmail = () => {
//     if (!reportData?.student?.email) {
//       showAlert('No email address found for this student', 'error');
//       return;
//     }
//     // In a real implementation, this would call an email API
//     showAlert(`Report card sent to ${reportData.student.email}`, 'success');
//   };

//   const getGradeBadgeClass = (grade) => {
//     const gradeMap = {
//       'A': 'grade-a', 'A+': 'grade-a', 'A-': 'grade-a',
//       'B+': 'grade-b-plus', 'B': 'grade-b', 'B-': 'grade-b',
//       'C+': 'grade-c-plus', 'C': 'grade-c', 'C-': 'grade-c',
//       'D+': 'grade-d-plus', 'D': 'grade-d', 'D-': 'grade-d',
//       'E': 'grade-e', 'F': 'grade-f'
//     };
//     return gradeMap[grade] || 'grade-default';
//   };

//   if (loading && !reportData) {
//     return (
//       <div className="report-cards-container">
//         <div className="loading-container">
//           <Loader size={48} className="spinner" />
//           <p>Loading report card options...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="report-cards-container">
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

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             <FileText size={28} style={{ display: 'inline', marginRight: '12px' }} />
//             Report Cards
//           </h1>
//           <p style={{ color: 'var(--secondary)' }}>Generate and print individual student report cards</p>
//         </div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       {/* Generator Controls */}
//       <div className="card generator-card">
//         <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Report Card Generator</h3>
//         <div className="generator-grid">
//           <div className="form-group">
//             <label>Academic Year</label>
//             <select 
//               className="form-select" 
//               value={selectedYear} 
//               onChange={(e) => setSelectedYear(e.target.value)}
//               disabled={generating}
//             >
//               {years.map(year => (
//                 <option key={year.id} value={year.id}>{year.label}</option>
//               ))}
//             </select>
//           </div>
          
//           <div className="form-group">
//             <label>Term</label>
//             <select 
//               className="form-select" 
//               value={selectedTerm} 
//               onChange={(e) => setSelectedTerm(e.target.value)}
//               disabled={generating}
//             >
//               {terms.map(term => (
//                 <option key={term.id} value={term.id}>{term.name}</option>
//               ))}
//             </select>
//           </div>
          
//           <div className="form-group">
//             <label>Class</label>
//             <select 
//               className="form-select" 
//               value={selectedClass} 
//               onChange={(e) => setSelectedClass(e.target.value)}
//               disabled={generating}
//             >
//               {classes.map(cls => (
//                 <option key={cls.id} value={cls.id}>{cls.name}</option>
//               ))}
//             </select>
//           </div>
          
//           <div className="form-group">
//             <label>Student</label>
//             <select 
//               className="form-select" 
//               value={selectedStudentId} 
//               onChange={(e) => setSelectedStudentId(e.target.value)}
//               disabled={generating || students.length === 0}
//             >
//               <option value="">Select Student</option>
//               {students.map(student => (
//                 <option key={student.id} value={student.id}>{student.name}</option>
//               ))}
//             </select>
//           </div>
          
//           <div className="form-group">
//             <label>Template</label>
//             <select 
//               className="form-select" 
//               value={selectedTemplate} 
//               onChange={(e) => setSelectedTemplate(e.target.value)}
//               disabled={generating}
//             >
//               {templates.map(t => (
//                 <option key={t.value} value={t.value}>{t.label}</option>
//               ))}
//             </select>
//           </div>
//         </div>
        
//         <div className="generator-actions">
//           <button 
//             className="button" 
//             onClick={handleGenerateReport} 
//             disabled={generating || !selectedStudentId}
//           >
//             {generating ? <Loader size={16} className="spinner" /> : <Eye size={16} />}
//             Generate Report Card
//           </button>
//           <button 
//             className="button button-secondary" 
//             onClick={handleGenerateAll} 
//             disabled={generating}
//           >
//             <Users size={16} /> Generate All ({students.length})
//           </button>
//           {reportData && (
//             <>
//               <button className="button button-secondary" onClick={handleDownload}>
//                 <Download size={16} /> Download
//               </button>
//               <button className="button button-secondary" onClick={handlePrint}>
//                 <Printer size={16} /> Print
//               </button>
//               <button className="button button-secondary" onClick={handleSendEmail}>
//                 <Send size={16} /> Send to Email
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Report Card Preview */}
//       {reportData && (
//         <div className="report-card-preview">
//           <div className="report-header">
//             <h2>Springfield International School</h2>
//             <p>Excellence in Education</p>
//             <h3>Report Card - {reportData.term?.name} {years.find(y => y.id.toString() === selectedYear)?.label}</h3>
//           </div>
          
//           <div className="report-student-info">
//             <div className="info-row">
//               <div><strong>Student Name:</strong> {reportData.student?.name}</div>
//               <div><strong>Student Number:</strong> {reportData.student?.student_number}</div>
//             </div>
//             <div className="info-row">
//               <div><strong>Class:</strong> {reportData.class?.name}</div>
//               <div><strong>Section:</strong> {reportData.class?.section || 'N/A'}</div>
//             </div>
//           </div>
          
//           <table className="report-subject-table">
//             <thead>
//               <tr>
//                 <th>Subject</th>
//                 <th>Score (%)</th>
//                 <th>Grade</th>
//                 <th>Grade Point</th>
//                 <th>Remark</th>
//               </tr>
//             </thead>
//             <tbody>
//               {reportData.subjects?.map((subject, idx) => (
//                 <tr key={idx}>
//                   <td><strong>{subject.subject_name}</strong></td>
//                   <td>{subject.score}%</td>
//                   <td>
//                     <span className={`grade-badge ${getGradeBadgeClass(subject.grade)}`}>
//                       {subject.grade}
//                     </span>
//                   </td>
//                   <td>{subject.grade_point}</td>
//                   <td>{subject.remark}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
          
//           <div className="report-summary">
//             <div className="summary-stats">
//               <div><strong>Average Score:</strong> {reportData.summary?.average_score}%</div>
//               <div><strong>Total Score:</strong> {reportData.summary?.total_score} / {reportData.summary?.max_possible}</div>
//               <div><strong>Position in Class:</strong> {reportData.summary?.position_in_class} out of {reportData.class?.total_students}</div>
//               <div><strong>Overall Grade:</strong> 
//                 <span className={`grade-badge ${getGradeBadgeClass(reportData.summary?.overall_grade)}`}>
//                   {reportData.summary?.overall_grade}
//                 </span>
//               </div>
//               <div><strong>Grade Point Average:</strong> {reportData.summary?.grade_point}</div>
//               <div><strong>Subjects Passed:</strong> {reportData.summary?.subjects_passed}</div>
//               <div><strong>Subjects Failed:</strong> {reportData.summary?.subjects_failed}</div>
//             </div>
//           </div>
          
//           <div className="signature-line">
//             <div>Teacher's Signature: _________________</div>
//             <div>Principal's Signature: _________________</div>
//           </div>
          
//           <div className="report-footer">
//             <small>Generated on: {new Date(reportData.generated_at).toLocaleString()}</small>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ReportCards;










// src/components/Academics/ReportCards.jsx

import { useState, useEffect } from 'react';
import { 
  FileText, Printer, Download, Send, Eye, Users, X, CheckCircle, 
  Loader, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, BookOpen 
} from 'lucide-react';
import '../../../styles/report-cards.css';

const API_BASE_URL = 'http://localhost:8000/api';

const classSubjectService = {
  async getSubjectsForClass(classId, academicYearId) {
    const response = await fetch(`${API_BASE_URL}/class-subjects/class/${classId}?academic_year_id=${academicYearId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

const reportCardService = {
  async getOptions() {
    const response = await fetch(`${API_BASE_URL}/report-cards/options`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getStudentsForClass(classId) {
    const response = await fetch(`${API_BASE_URL}/report-cards/students?class_id=${classId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async generateReportCard(studentId, termId, classId, template) {
    const response = await fetch(`${API_BASE_URL}/report-cards/generate?student_id=${studentId}&term_id=${termId}&class_id=${classId}&template=${template}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async generateAllReportCards(termId, classId, template) {
    const response = await fetch(`${API_BASE_URL}/report-cards/generate-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        term_id: termId,
        class_id: classId,
        template: template
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function ReportCards() {
  const [terms, setTerms] = useState([]);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const templates = [
    { value: 'standard', label: 'Standard' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'simple', label: 'Simple' }
  ];

  // Load options on mount
  useEffect(() => {
    loadOptions();
  }, []);

  // Load students when class changes
  useEffect(() => {
    if (selectedClass) {
      loadStudents();
      loadClassSubjects();
    } else {
      setStudents([]);
      setClassSubjects([]);
    }
  }, [selectedClass, selectedYear]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const data = await reportCardService.getOptions();
      setTerms(data.terms);
      setYears(data.academic_years);
      setClasses(data.classes);
      
      // Set default selections
      if (data.terms.length > 0) setSelectedTerm(data.terms[0].id.toString());
      if (data.academic_years.length > 0) setSelectedYear(data.academic_years[0].id.toString());
      if (data.classes.length > 0) setSelectedClass(data.classes[0].id.toString());
    } catch (error) {
      showAlert('Failed to load options: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await reportCardService.getStudentsForClass(parseInt(selectedClass));
      setStudents(data);
      if (data.length > 0) {
        setSelectedStudentId(data[0].id.toString());
      } else {
        setSelectedStudentId('');
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
      setSelectedStudentId('');
    }
  };

  const loadClassSubjects = async () => {
    if (!selectedClass || !selectedYear) return;
    
    try {
      const data = await classSubjectService.getSubjectsForClass(
        parseInt(selectedClass),
        parseInt(selectedYear)
      );
      setClassSubjects(data.subjects || []);
    } catch (error) {
      console.error('Error loading class subjects:', error);
      setClassSubjects([]);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleGenerateReport = async () => {
    if (!selectedStudentId || !selectedTerm || !selectedClass) {
      showAlert('Please select all required fields', 'error');
      return;
    }

    try {
      setGenerating(true);
      const data = await reportCardService.generateReportCard(
        parseInt(selectedStudentId),
        parseInt(selectedTerm),
        parseInt(selectedClass),
        selectedTemplate
      );
      setReportData(data);
      showAlert('Report card generated successfully!', 'success');
    } catch (error) {
      showAlert('Failed to generate report: ' + error.message, 'error');
      setReportData(null);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!selectedTerm || !selectedClass) {
      showAlert('Please select term and class', 'error');
      return;
    }

    try {
      setGenerating(true);
      const result = await reportCardService.generateAllReportCards(
        parseInt(selectedTerm),
        parseInt(selectedClass),
        selectedTemplate
      );
      showAlert(`Generated ${result.length} report cards!`, 'success');
    } catch (error) {
      showAlert('Failed to generate report cards: ' + error.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create HTML content for download
    const printContent = document.querySelector('.report-card-preview').cloneNode(true);
    const originalTitle = document.title;
    document.title = `Report_Card_${reportData?.student?.name}_${reportData?.term?.name}`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Report Card - ${reportData?.student?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .report-card-preview { max-width: 800px; margin: 0 auto; }
            .report-header { text-align: center; margin-bottom: 20px; }
            .report-subject-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .report-subject-table th, .report-subject-table td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            .report-subject-table th { background: #f5f5f5; }
            .signature-line { display: flex; justify-content: space-between; margin-top: 30px; }
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

  const handleSendEmail = () => {
    if (!reportData?.student?.email) {
      showAlert('No email address found for this student', 'error');
      return;
    }
    // In a real implementation, this would call an email API
    showAlert(`Report card sent to ${reportData.student.email}`, 'success');
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

  if (loading && !reportData) {
    return (
      <div className="report-cards-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading report card options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-cards-container">
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
            Report Cards
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Generate and print individual student report cards</p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Generator Controls */}
      <div className="card generator-card">
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Report Card Generator</h3>
        <div className="generator-grid">
          <div className="form-group">
            <label>Academic Year</label>
            <select 
              className="form-select" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={generating}
            >
              {years.map(year => (
                <option key={year.id} value={year.id}>{year.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Term</label>
            <select 
              className="form-select" 
              value={selectedTerm} 
              onChange={(e) => setSelectedTerm(e.target.value)}
              disabled={generating}
            >
              {terms.map(term => (
                <option key={term.id} value={term.id}>{term.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Class</label>
            <select 
              className="form-select" 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={generating}
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Student</label>
            <select 
              className="form-select" 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={generating || students.length === 0}
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Template</label>
            <select 
              className="form-select" 
              value={selectedTemplate} 
              onChange={(e) => setSelectedTemplate(e.target.value)}
              disabled={generating}
            >
              {templates.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Class Subjects Summary */}
        {selectedClass && classSubjects.length > 0 && (
          <div className="class-subjects-summary">
            <div className="summary-header">
              <BookOpen size={16} />
              <span>Subjects offered in {classes.find(c => c.id.toString() === selectedClass)?.name}:</span>
            </div>
            <div className="subjects-list">
              {classSubjects.map(subj => (
                <span key={subj.subject_id} className="subject-badge">
                  {subj.subject_name}
                  {subj.is_required && <span className="required-badge">Required</span>}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="generator-actions">
          <button 
            className="button" 
            onClick={handleGenerateReport} 
            disabled={generating || !selectedStudentId}
          >
            {generating ? <Loader size={16} className="spinner" /> : <Eye size={16} />}
            Generate Report Card
          </button>
          <button 
            className="button button-secondary" 
            onClick={handleGenerateAll} 
            disabled={generating}
          >
            <Users size={16} /> Generate All ({students.length})
          </button>
          {reportData && (
            <>
              <button className="button button-secondary" onClick={handleDownload}>
                <Download size={16} /> Download
              </button>
              <button className="button button-secondary" onClick={handlePrint}>
                <Printer size={16} /> Print
              </button>
              <button className="button button-secondary" onClick={handleSendEmail}>
                <Send size={16} /> Send to Email
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Card Preview */}
      {reportData && (
        <div className="report-card-preview">
          <div className="report-header">
            <h2>Springfield International School</h2>
            <p>Excellence in Education</p>
            <h3>Report Card - {reportData.term?.name} {years.find(y => y.id.toString() === selectedYear)?.label}</h3>
          </div>
          
          <div className="report-student-info">
            <div className="info-row">
              <div><strong>Student Name:</strong> {reportData.student?.name}</div>
              <div><strong>Student Number:</strong> {reportData.student?.student_number}</div>
            </div>
            <div className="info-row">
              <div><strong>Class:</strong> {reportData.class?.name}</div>
              <div><strong>Section:</strong> {reportData.class?.section || 'N/A'}</div>
            </div>
          </div>
          
          <table className="report-subject-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Score (%)</th>
                <th>Grade</th>
                <th>Grade Point</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {reportData.subjects?.map((subject, idx) => (
                <tr key={idx}>
                  <td><strong>{subject.subject_name}</strong></td>
                  <td>{subject.score}%</td>
                  <td>
                    <span className={`grade-badge ${getGradeBadgeClass(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  </td>
                  <td>{subject.grade_point}</td>
                  <td>{subject.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="report-summary">
            <div className="summary-stats">
              <div><strong>Average Score:</strong> {reportData.summary?.average_score}%</div>
              <div><strong>Total Score:</strong> {reportData.summary?.total_score} / {reportData.summary?.max_possible}</div>
              <div><strong>Position in Class:</strong> {reportData.summary?.position_in_class} out of {reportData.class?.total_students}</div>
              <div><strong>Overall Grade:</strong> 
                <span className={`grade-badge ${getGradeBadgeClass(reportData.summary?.overall_grade)}`}>
                  {reportData.summary?.overall_grade}
                </span>
              </div>
              <div><strong>Grade Point Average:</strong> {reportData.summary?.grade_point}</div>
              <div><strong>Subjects Passed:</strong> {reportData.summary?.subjects_passed}</div>
              <div><strong>Subjects Failed:</strong> {reportData.summary?.subjects_failed}</div>
            </div>
          </div>
          
          <div className="signature-line">
            <div>Teacher's Signature: _________________</div>
            <div>Principal's Signature: _________________</div>
          </div>
          
          <div className="report-footer">
            <small>Generated on: {new Date(reportData.generated_at).toLocaleString()}</small>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportCards;