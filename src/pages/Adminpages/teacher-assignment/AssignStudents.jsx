// src/components/Academics/AssignStudents.jsx

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  X, 
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import '../../../styles/assign-students.css';
import { getStudents } from '../../../services/api.service';
import { classService } from '../../../services/classService';
import { academicYearService } from '../../../services/academicYearService';

// API Service Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Section API Service
const sectionService = {
  async getSectionsByClass(classId, academicYearId) {
    let url = `${API_BASE_URL}/sections/by-class/${classId}`;
    if (academicYearId) {
      url += `?academic_year_id=${academicYearId}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

// Student Assignment API Service
const assignmentService = {
  // Assign a single student
  async assignStudent(studentId, classId, sectionId) {
    const response = await fetch(`${API_BASE_URL}/student-assignments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        class_id: classId,
        section_id: sectionId
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Bulk assign students
  async bulkAssignStudents(assignments) {
    const response = await fetch(`${API_BASE_URL}/student-assignments/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignments: assignments
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get a single student's current assignment
  async getStudentAssignment(studentId) {
    const response = await fetch(`${API_BASE_URL}/student-assignments/student/${studentId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get all student assignments with filters
  async getAllAssignments(academicYearId = null, classId = null, sectionId = null) {
    let url = `${API_BASE_URL}/student-assignments/`;
    const params = [];
    if (academicYearId) params.push(`academic_year_id=${academicYearId}`);
    if (classId) params.push(`class_id=${classId}`);
    if (sectionId) params.push(`section_id=${sectionId}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Remove a student's assignment
  async removeAssignment(studentId) {
    const response = await fetch(`${API_BASE_URL}/student-assignments/${studentId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  }
};

function AssignStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [assignments, setAssignments] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load sections when class or academic year changes
  useEffect(() => {
    if (selectedClass && selectedAcademicYear) {
      loadSections();
    }
  }, [selectedClass, selectedAcademicYear]);

  // Reload assignments when filters change
  useEffect(() => {
    if (selectedAcademicYear && students.length > 0) {
      loadCurrentAssignments();
    }
  }, [selectedAcademicYear, selectedClass, selectedSection]);

  // Filter students when search term changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, students]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      let studentsData = [];
      let classesData = [];
      let yearsData = [];
      
      // Fetch students
      try {
        const studentsResponse = await getStudents();
        console.log('Students response:', studentsResponse);
        
        if (studentsResponse && studentsResponse.success && studentsResponse.students) {
          studentsData = studentsResponse.students;
        } else if (Array.isArray(studentsResponse)) {
          studentsData = studentsResponse;
        } else {
          studentsData = [];
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        studentsData = [];
      }
      
      // Fetch classes
      try {
        const classesResponse = await classService.getAll();
        console.log('Classes response:', classesResponse);
        
        if (classesResponse && classesResponse.success && classesResponse.data) {
          classesData = classesResponse.data;
        } else if (Array.isArray(classesResponse)) {
          classesData = classesResponse;
        } else {
          classesData = [];
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        classesData = [];
      }
      
      // Fetch academic years
      try {
        const yearsResponse = await academicYearService.getAll();
        console.log('Academic years response:', yearsResponse);
        
        if (yearsResponse && yearsResponse.success && yearsResponse.data) {
          yearsData = yearsResponse.data;
        } else if (Array.isArray(yearsResponse)) {
          yearsData = yearsResponse;
        } else {
          yearsData = [];
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
        yearsData = [];
      }
      
      // Format students data
      const formattedStudents = studentsData.map(student => ({
        id: student.id,
        studentNumber: student.student_number || `STU-${student.id}`,
        first_name: student.first_name,
        last_name: student.last_name,
        name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown',
        email: student.email || '',
        phone: student.phone || '',
        academic_year_id: student.academic_year_id
      }));
      
      setStudents(formattedStudents);
      setFilteredStudents(formattedStudents);
      
      // Format classes data
      const formattedClasses = classesData.map(cls => ({
        id: cls.id,
        class_name: cls.class_name || cls.name,
        class_code: cls.class_code
      }));
      
      setClasses(formattedClasses);
      
      // Format academic years
      const formattedYears = yearsData.map(year => ({
        id: year.id,
        year_label: year.year_label || year.name,
        is_current: year.is_current || false
      }));
      
      setAcademicYears(formattedYears);
      
      // Set default academic year to current
      const currentYear = formattedYears.find(y => y.is_current);
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id.toString());
      } else if (formattedYears.length > 0) {
        setSelectedAcademicYear(formattedYears[0].id.toString());
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('Failed to load data: ' + error.message, 'error');
      setStudents([]);
      setFilteredStudents([]);
      setClasses([]);
      setAcademicYears([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    if (!selectedClass || !selectedAcademicYear) return;
    
    try {
      const sectionsData = await sectionService.getSectionsByClass(
        parseInt(selectedClass), 
        parseInt(selectedAcademicYear)
      );
      
      setSections(sectionsData);
      setSelectedSection('');
      
    } catch (error) {
      console.error('Error loading sections:', error);
      setSections([]);
    }
  };

  // const loadCurrentAssignments = async () => {
  //   if (!selectedAcademicYear) return;
    
  //   try {
  //     const allAssignments = await assignmentService.getAllAssignments(
  //       parseInt(selectedAcademicYear),
  //       selectedClass ? parseInt(selectedClass) : null,
  //       selectedSection ? parseInt(selectedSection) : null
  //     );
      
  //     // Create a map of student_id to assignment
  //     const assignmentMap = {};
  //     allAssignments.forEach(assignment => {
  //       assignmentMap[assignment.student_id] = {
  //         class_id: assignment.class_id ? assignment.class_id.toString() : '',
  //         section_id: assignment.section_id ? assignment.section_id.toString() : '',
  //         section_name: assignment.section_name || '',
  //         class_name: assignment.class_name || '',
  //         student_id: assignment.student_id,
  //         student_name: assignment.student_name,
  //         student_number: assignment.student_number,
  //         is_assigned: !!assignment.class_id
  //       };
  //     });
      
  //     // Update assignments for all students
  //     const updatedAssignments = {};
  //     students.forEach(student => {
  //       if (assignmentMap[student.id]) {
  //         updatedAssignments[student.id] = assignmentMap[student.id];
  //       } else {
  //         updatedAssignments[student.id] = {
  //           class_id: '',
  //           section_id: '',
  //           section_name: '',
  //           class_name: '',
  //           student_id: student.id,
  //           student_name: student.name,
  //           student_number: student.studentNumber,
  //           is_assigned: false
  //         };
  //       }
  //     });
      
  //     setAssignments(updatedAssignments);
      
  //   } catch (error) {
  //     console.error('Error loading assignments:', error);
  //     // Don't show error to user, just set empty assignments
  //     const emptyAssignments = {};
  //     students.forEach(student => {
  //       emptyAssignments[student.id] = {
  //         class_id: '',
  //         section_id: '',
  //         section_name: '',
  //         class_name: '',
  //         student_id: student.id,
  //         student_name: student.name,
  //         student_number: student.studentNumber,
  //         is_assigned: false
  //       };
  //     });
  //     setAssignments(emptyAssignments);
  //   }
  // };

const loadCurrentAssignments = async () => {
  // Don't filter by academic_year_id - students have their own
  try {
    // Pass null for academic_year_id to get ALL students regardless of their year
    const allAssignments = await assignmentService.getAllAssignments(
      null,  // Don't filter by academic year
      selectedClass ? parseInt(selectedClass) : null,
      selectedSection ? parseInt(selectedSection) : null
    );
    
    console.log('All assignments loaded:', allAssignments);
    console.log('Number of assignments:', allAssignments.length);
    
    // Create a map of student_id to assignment
    const assignmentMap = {};
    allAssignments.forEach(assignment => {
      assignmentMap[assignment.student_id] = {
        class_id: assignment.class_id ? assignment.class_id.toString() : '',
        section_id: assignment.section_id ? assignment.section_id.toString() : '',
        section_name: assignment.section_name || '',
        class_name: assignment.class_name || '',
        student_id: assignment.student_id,
        student_name: assignment.student_name,
        student_number: assignment.student_number,
        is_assigned: !!assignment.class_id
      };
    });
    
    // Update assignments for all students
    const updatedAssignments = {};
    students.forEach(student => {
      if (assignmentMap[student.id]) {
        updatedAssignments[student.id] = assignmentMap[student.id];
      } else {
        updatedAssignments[student.id] = {
          class_id: '',
          section_id: '',
          section_name: '',
          class_name: '',
          student_id: student.id,
          student_name: student.name,
          student_number: student.studentNumber,
          is_assigned: false
        };
      }
    });
    
    setAssignments(updatedAssignments);
    console.log('Updated assignments state:', updatedAssignments);
    
  } catch (error) {
    console.error('Error loading assignments:', error);
    // Set empty assignments
    const emptyAssignments = {};
    students.forEach(student => {
      emptyAssignments[student.id] = {
        class_id: '',
        section_id: '',
        section_name: '',
        class_name: '',
        student_id: student.id,
        student_name: student.name,
        student_number: student.studentNumber,
        is_assigned: false
      };
    });
    setAssignments(emptyAssignments);
  }
};


  const applyFilters = () => {
    let filtered = [...students];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        (student.name && student.name.toLowerCase().includes(term)) ||
        (student.studentNumber && student.studentNumber.toLowerCase().includes(term)) ||
        (student.email && student.email.toLowerCase().includes(term))
      );
    }
    
    setFilteredStudents(filtered);
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleClassChange = (studentId, classId) => {
    setAssignments(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        class_id: classId,
        section_id: '',
        section_name: ''
      }
    }));
  };

  const handleSectionChange = (studentId, sectionId, sectionName) => {
    setAssignments(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        section_id: sectionId,
        section_name: sectionName
      }
    }));
  };

  const handleBulkAssignByClass = () => {
    if (!selectedClass || !selectedSection) {
      showAlert('Please select both a class and a section for bulk assignment', 'error');
      return;
    }
    
    if (filteredStudents.length === 0) {
      showAlert('No students to assign', 'error');
      return;
    }
    
    const selectedSectionObj = sections.find(s => s.id.toString() === selectedSection);
    
    setShowConfirmModal(true);
    setPendingAssignment({
      type: 'bulk',
      class_id: parseInt(selectedClass),
      section_id: parseInt(selectedSection),
      section_name: selectedSectionObj?.section_name || selectedSection,
      student_ids: filteredStudents.map(s => s.id)
    });
  };

  const handleBulkAssignSelected = () => {
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const selectedStudentIds = Array.from(checkboxes).map(cb => parseInt(cb.getAttribute('data-student-id')));
    
    if (selectedStudentIds.length === 0) {
      showAlert('Please select at least one student', 'error');
      return;
    }
    
    if (!selectedClass || !selectedSection) {
      showAlert('Please select both a class and a section', 'error');
      return;
    }
    
    const selectedSectionObj = sections.find(s => s.id.toString() === selectedSection);
    
    setShowConfirmModal(true);
    setPendingAssignment({
      type: 'selected',
      class_id: parseInt(selectedClass),
      section_id: parseInt(selectedSection),
      section_name: selectedSectionObj?.section_name || selectedSection,
      student_ids: selectedStudentIds
    });
  };

  const confirmAssignment = async () => {
    try {
      setSaving(true);
      
      const assignmentsList = pendingAssignment.student_ids.map(studentId => ({
        student_id: studentId,
        class_id: pendingAssignment.class_id,
        section_id: pendingAssignment.section_id
      }));
      
      // Call bulk assign API
      const result = await assignmentService.bulkAssignStudents(assignmentsList);
      
      // Update local state to reflect assignments
      pendingAssignment.student_ids.forEach(studentId => {
        setAssignments(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            class_id: pendingAssignment.class_id.toString(),
            section_id: pendingAssignment.section_id.toString(),
            section_name: pendingAssignment.section_name,
            is_assigned: true
          }
        }));
      });
      
      showAlert(`Successfully assigned ${pendingAssignment.student_ids.length} student(s) to ${pendingAssignment.section_name}`, 'success');
      setShowConfirmModal(false);
      setPendingAssignment(null);
      
    } catch (error) {
      showAlert('Failed to assign students: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleIndividualAssign = async (studentId) => {
    const assignment = assignments[studentId];
    if (!assignment.class_id || !assignment.section_id) {
      showAlert('Please select both class and section', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      await assignmentService.assignStudent(
        studentId,
        parseInt(assignment.class_id),
        parseInt(assignment.section_id)
      );
      
      setAssignments(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          is_assigned: true
        }
      }));
      
      showAlert(`${assignment.student_name} assigned successfully`, 'success');
      
    } catch (error) {
      showAlert('Failed to assign student: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedSection('');
  };

  const getClassName = (classId) => {
    if (!classId) return 'Select Class';
    const classItem = classes.find(c => c.id === classId);
    return classItem ? classItem.class_name : 'Select Class';
  };

  const getCurrentAssignmentDisplay = (studentId) => {
    const assignment = assignments[studentId];
    if (assignment?.is_assigned && assignment.class_id) {
      const className = getClassName(parseInt(assignment.class_id));
      return `${className} - ${assignment.section_name || 'No Section'}`;
    }
    return 'Not Assigned';
  };

  const handleSelectAll = (e) => {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = e.target.checked;
    });
  };

  if (loading) {
    return (
      <div className="assign-students-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assign-students-container">
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
      <div className="assign-header">
        <div className="header-title">
          <h1>
            <UserPlus size={28} />
            Assign Students to Classes
          </h1>
          <p>Assign students to classes and sections for the academic year</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => {
            loadCurrentAssignments();
          }} disabled={saving}>
            <RefreshCw size={16} className={saving ? 'spinner' : ''} />
            Refresh
          </button>
        </div>
      </div>
      <hr className="divider" />

      {/* Filters and Bulk Actions */}
      <div className="filters-section">
        <div className="filters-bar">
          <div className="filter-group">
            <label>Academic Year</label>
            <select 
              className="form-select"
              value={selectedAcademicYear}
              onChange={(e) => {
                setSelectedAcademicYear(e.target.value);
              }}
              disabled={saving}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.year_label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Class</label>
            <select 
              className="form-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={saving}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Section</label>
            <select 
              className="form-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={saving || !selectedClass || sections.length === 0}
            >
              <option value="">Select Section</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.section_name} ({section.current_enrollment || 0}/{section.capacity || 40})
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group search-group">
            <label>Search Student</label>
            <div className="search-input-wrapper">
              <Search size={16} />
              <input 
                type="text"
                placeholder="Search by name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </div>
        
        <div className="bulk-actions">
          <button 
            className="btn-primary"
            onClick={handleBulkAssignByClass}
            disabled={saving || !selectedClass || !selectedSection || filteredStudents.length === 0}
          >
            <Users size={16} />
            Bulk Assign All ({filteredStudents.length} students)
          </button>
          <button 
            className="btn-secondary"
            onClick={handleBulkAssignSelected}
            disabled={saving || !selectedClass || !selectedSection}
          >
            <CheckCircle size={16} />
            Assign Selected
          </button>
          <button 
            className="btn-secondary"
            onClick={clearFilters}
            disabled={saving}
          >
            <X size={16} />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No students found</p>
            {searchTerm && (
              <button className="btn-secondary" onClick={clearFilters}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <table className="assignments-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    id="select-all" 
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Student #</th>
                <th>Student Name</th>
                <th>Current Assignment</th>
                <th>Assign to Class</th>
                <th>Section</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const currentAssignment = assignments[student.id];
                const isCurrentlyAssigned = currentAssignment?.is_assigned && currentAssignment?.class_id;
                
                return (
                  <tr key={student.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        data-student-id={student.id}
                        className="student-checkbox"
                      />
                    </td>
                    <td>{student.studentNumber}</td>
                    <td>
                      <strong>{student.name}</strong>
                      {student.email && <div className="student-email">{student.email}</div>}
                    </td>
                    <td>
                      {isCurrentlyAssigned ? (
                        <span className="current-assignment-badge">
                          {getCurrentAssignmentDisplay(student.id)}
                        </span>
                      ) : (
                        <span className="not-assigned-badge">Not Assigned</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="form-select-sm"
                        value={currentAssignment?.class_id || ''}
                        onChange={(e) => handleClassChange(student.id, e.target.value)}
                        disabled={saving}
                      >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.class_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-select-sm"
                        value={currentAssignment?.section_id || ''}
                        onChange={(e) => {
                          const selectedSectionObj = sections.find(s => s.id.toString() === e.target.value);
                          handleSectionChange(student.id, e.target.value, selectedSectionObj?.section_name || '');
                        }}
                        disabled={saving || !currentAssignment?.class_id}
                      >
                        <option value="">Select Section</option>
                        {sections
                          .filter(s => s.class_id === parseInt(currentAssignment?.class_id || '0'))
                          .map(section => (
                            <option key={section.id} value={section.id}>
                              {section.section_name} ({section.current_enrollment || 0}/{section.capacity || 40})
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn-save-individual"
                        onClick={() => handleIndividualAssign(student.id)}
                        disabled={saving || !currentAssignment?.class_id || !currentAssignment?.section_id}
                      >
                        <Save size={14} />
                        {isCurrentlyAssigned ? 'Update' : 'Assign'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingAssignment && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Assignment</h2>
              <X className="modal-close" size={20} onClick={() => setShowConfirmModal(false)} />
            </div>
            <div className="modal-body">
              <div className="confirmation-content">
                <AlertCircle size={48} className="warning-icon" />
                <p>You are about to assign <strong>{pendingAssignment.student_ids.length}</strong> student(s) to:</p>
                <div className="assignment-details">
                  <div><strong>Class:</strong> {getClassName(pendingAssignment.class_id)}</div>
                  <div><strong>Section:</strong> {pendingAssignment.section_name}</div>
                  <div><strong>Academic Year:</strong> {academicYears.find(y => y.id.toString() === selectedAcademicYear)?.year_label || 'Selected Year'}</div>
                </div>
                <p className="warning-text">This will replace any existing assignments for these students. Do you want to continue?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={confirmAssignment} disabled={saving}>
                {saving ? <Loader size={16} className="spinner" /> : <CheckCircle size={16} />}
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignStudents;