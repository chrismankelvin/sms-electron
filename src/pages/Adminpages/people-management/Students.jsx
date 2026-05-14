import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Upload, Download, Search, Filter, Eye, Edit, 
  Repeat, UserX, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  BookOpen, UserCheck, TrendingUp, DollarSign, Clock, Phone, Mail,
  MapPin, Heart, AlertCircle, UserPlus, FileText, Printer, Loader,
  GraduationCap, Calendar, Shield
} from 'lucide-react';
import '../../../styles/students.css';
import { getStudents } from '../../../services/api.service';

function Students() {
  const navigate = useNavigate();
  
  // State
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ 
    class: '', 
    status: '', 
    gender: '',
    section: '',
    academicYear: ''
  });
  const [editingStudent, setEditingStudent] = useState(null);
  
  // Filter options (populated from data)
  const [filterOptions, setFilterOptions] = useState({
    classes: [],
    sections: [],
    statuses: ['active', 'suspended', 'graduated', 'withdrawn', 'transferred'],
    genders: ['male', 'female', 'other'],
    academicYears: []
  });

  const [formData, setFormData] = useState({
    studentNumber: '', name: '', class: '', section: '', status: 'active',
    parentName: '', phone: '', enrolledDate: '', gender: '', dob: '', address: '',
    healthConditions: '', emergencyContact: ''
  });

  // Fetch students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Apply filters whenever students, searchTerm, or filters change
  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, filters]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStudents();
      
      console.log('API Response:', response);
      
      // Handle different response structures
      let studentsData = [];
      
      if (response && response.success && response.students) {
        studentsData = response.students;
      } else if (Array.isArray(response)) {
        studentsData = response;
      } else if (response && response.students && Array.isArray(response.students)) {
        studentsData = response.students;
      } else {
        studentsData = [];
      }
      
      // Transform API data to match component structure
      const formattedStudents = studentsData.map(student => {
        // Get person details if nested
        const person = student.person_details || student.person || {};
        
        return {
          id: student.id,
          studentNumber: student.student_number || `STU-${student.id}`,
          unique_id: student.unique_id,
          
          // Person details
          first_name: person.first_name || student.first_name,
          last_name: person.last_name || student.last_name,
          other_names: person.other_names || student.other_names,
          name: `${person.first_name || student.first_name || ''} ${person.last_name || student.last_name || ''}`.trim(),
          gender: (person.gender || student.gender || '').toLowerCase(),
          dob: person.date_of_birth || student.date_of_birth || student.dob,
          phone: person.phone || student.phone,
          email: person.email || student.email,
          address: person.address || student.address,
          city: person.city,
          state: person.state,
          country: person.country,
          emergencyContactName: person.emergency_contact_name || student.emergency_contact_name,
          emergencyContactPhone: person.emergency_contact_phone || student.emergency_contact_phone,
          photo_url: person.photo_url || student.photo_url,
          national_id: person.national_id,
          health_id: person.health_id,
          
          // Student specific details
          class: student.class_name || student.class || student.class_id?.name || 'Not Assigned',
          class_id: student.class_id,
          section: student.section_name || student.section || student.section_id?.name || '',
          section_id: student.section_id,
          academic_year: student.academic_year?.name || student.academic_year_name || '',
          academic_year_id: student.academic_year_id,
          status: student.status || 'active',
          parent1_name: student.parent1_name,
          parent1_phone: student.parent1_phone,
          parent1_email: student.parent1_email,
          parent2_name: student.parent2_name,
          parent2_phone: student.parent2_phone,
          parent2_email: student.parent2_email,
          guardian_name: student.guardian_name,
          guardian_phone: student.guardian_phone,
          guardian_email: student.guardian_email,
          parentName: student.parent1_name || student.guardian_name || 'N/A',
          health_condition: student.health_condition,
          healthConditions: student.health_condition || 'None',
          former_school: student.former_school,
          enrolledDate: student.enrolled_at?.split('T')[0] || student.enrolled_date || student.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          created_at: student.created_at,
          updated_at: student.updated_at
        };
      });
      
      setStudents(formattedStudents);
      
      // Extract filter options from data
      extractFilterOptions(formattedStudents);
      
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students. Please check your connection and try again.');
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = (studentsData) => {
    // Extract unique classes
    const classes = [...new Set(studentsData.map(s => s.class).filter(Boolean))].sort();
    
    // Extract unique sections
    const sections = [...new Set(studentsData.map(s => s.section).filter(Boolean))].sort();
    
    // Extract unique academic years
    const academicYears = [...new Set(studentsData.map(s => s.academic_year).filter(Boolean))].sort();
    
    setFilterOptions(prev => ({
      ...prev,
      classes,
      sections,
      academicYears
    }));
  };

  const applyFilters = () => {
    let filtered = [...students];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.name?.toLowerCase().includes(term) ||
        student.studentNumber?.toLowerCase().includes(term) ||
        student.parentName?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term) ||
        student.phone?.includes(term)
      );
    }
    
    // Apply class filter
    if (filters.class) {
      filtered = filtered.filter(student => student.class === filters.class);
    }
    
    // Apply section filter
    if (filters.section) {
      filtered = filtered.filter(student => student.section === filters.section);
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(student => student.status?.toLowerCase() === filters.status.toLowerCase());
    }
    
    // Apply gender filter
    if (filters.gender) {
      filtered = filtered.filter(student => student.gender?.toLowerCase() === filters.gender.toLowerCase());
    }
    
    // Apply academic year filter
    if (filters.academicYear) {
      filtered = filtered.filter(student => student.academic_year === filters.academicYear);
    }
    
    setFilteredStudents(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      class: '',
      status: '',
      gender: '',
      section: '',
      academicYear: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditStudent = () => {
    if (!formData.name || !formData.class) {
      alert('Please fill in required fields');
      return;
    }

    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s));
    } else {
      const newStudent = { 
        id: Date.now(), 
        ...formData, 
        studentNumber: formData.studentNumber || `2024-${String(students.length + 1).padStart(3, '0')}`,
        status: formData.status || 'active'
      };
      setStudents(prev => [...prev, newStudent]);
    }
    setShowModal(false);
    setEditingStudent(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      studentNumber: '', name: '', class: '', section: '', status: 'active',
      parentName: '', phone: '', enrolledDate: '', gender: '', dob: '', address: '',
      healthConditions: '', emergencyContact: ''
    });
  };

  const handleTransfer = (student) => {
    const newClass = prompt('Enter new class:', student.class);
    if (newClass) {
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, class: newClass } : s));
      alert(`Student transferred to ${newClass}`);
    }
  };

  const handleWithdraw = (student) => {
    if (window.confirm(`Withdraw ${student.name}?`)) {
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'withdrawn' } : s));
      alert(`Student ${student.name} has been withdrawn.`);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'active': 'status-active',
      'suspended': 'status-suspended',
      'graduated': 'status-graduated',
      'withdrawn': 'status-withdrawn',
      'transferred': 'status-transferred'
    };
    return statusMap[status?.toLowerCase()] || 'status-active';
  };

  const getStatusLabel = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active';
  };

  const getGenderLabel = (gender) => {
    const genderMap = {
      'male': 'Male',
      'female': 'Female',
      'other': 'Other'
    };
    return genderMap[gender?.toLowerCase()] || 'Not specified';
  };

  // Mock data for detail view
  const getAcademicHistory = (studentId) => [
    { year: '2023-2024', class: 'JHS 1 Science', promoted: true, date: '2024-08-10' },
    { year: '2022-2023', class: 'Primary 6', promoted: true, date: '2023-07-15' }
  ];

  const getResults = (studentId) => [
    { term: 'Term 1', year: '2024', mathematics: 'A', english: 'B+', science: 'A-', average: '85%' },
    { term: 'Term 2', year: '2024', mathematics: 'B+', english: 'A-', science: 'B', average: '82%' }
  ];

  const getAttendance = (studentId) => [
    { date: '2024-03-01', status: 'present' }, { date: '2024-03-02', status: 'present' }, 
    { date: '2024-03-03', status: 'absent' }, { date: '2024-03-04', status: 'late' }, 
    { date: '2024-03-05', status: 'present' }
  ];

  const getTimetable = (studentId) => [
    { time: '8:00-9:00', monday: 'Math', tuesday: 'English', wednesday: 'Science', thursday: 'Math', friday: 'Social' },
    { time: '9:00-10:00', monday: 'English', tuesday: 'Science', wednesday: 'Math', thursday: 'English', friday: 'Science' }
  ];

  const getFeeStatus = (studentId) => ({ total: 2500, paid: 2000, due: 500, lastPayment: '2024-02-15', status: 'Partial' });

  if (loading) {
    return (
      <div className="students-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="students-container">
        <div className="error-container">
          <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <p>{error}</p>
          <button className="button" onClick={loadStudents} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="students-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Students
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            View, search, filter, and manage all students 
            {filteredStudents.length > 0 && ` (${filteredStudents.length} of ${students.length} total)`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="button button-secondary" onClick={() => setShowBulkImport(true)}>
            <Upload size={16} /> Bulk Import
          </button>
          <button className="button button-secondary" onClick={loadStudents}>
            <Download size={16} /> Refresh
          </button>
          <button className="button" onClick={() => navigate("/registration/students")}>
            <Plus size={16} /> Register Student
          </button>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Search and Filters */}
      <div className="search-filters">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '2rem' }} 
              placeholder="Search by name, student number, email, or phone..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <select 
            className="form-select" 
            style={{ width: '150px' }} 
            value={filters.class} 
            onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
          >
            <option value="">All Classes</option>
            {filterOptions.classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select 
            className="form-select" 
            style={{ width: '130px' }} 
            value={filters.section} 
            onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
          >
            <option value="">All Sections</option>
            {filterOptions.sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <select 
            className="form-select" 
            style={{ width: '130px' }} 
            value={filters.status} 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            {filterOptions.statuses.map(s => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="filter-chips">
            <span className="filter-label">Gender:</span>
            <span className={`filter-chip ${!filters.gender ? 'active' : ''}`} onClick={() => setFilters(prev => ({ ...prev, gender: '' }))}>
              All
            </span>
            {filterOptions.genders.map(g => (
              <span 
                key={g} 
                className={`filter-chip ${filters.gender === g ? 'active' : ''}`} 
                onClick={() => setFilters(prev => ({ ...prev, gender: g }))}
              >
                {getGenderLabel(g)}
              </span>
            ))}
          </div>
          
          {filterOptions.academicYears.length > 0 && (
            <select 
              className="form-select" 
              style={{ width: '150px' }} 
              value={filters.academicYear} 
              onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
            >
              <option value="">All Years</option>
              {filterOptions.academicYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          
          {(searchTerm || filters.class || filters.section || filters.status || filters.gender || filters.academicYear) && (
            <button className="button button-secondary" onClick={clearAllFilters} style={{ padding: '0.5rem 1rem' }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="stat-card">
          <div className="stat-value">{filteredStudents.length}</div>
          <div className="stat-label">Showing Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{students.filter(s => s.status === 'active').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filterOptions.classes.length}</div>
          <div className="stat-label">Classes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filterOptions.sections.length}</div>
          <div className="stat-label">Sections</div>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No students found matching your criteria</p>
            {(searchTerm || filters.class || filters.section || filters.status || filters.gender || filters.academicYear) && (
              <button className="button button-secondary" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <table className="academic-years-table">
            <thead>
              <tr>
                <th>Student #</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Status</th>
                <th>Parent/Guardian</th>
                <th>Phone</th>
                <th>Enrolled Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.studentNumber}</td>
                  <td>
                    <div className="student-avatar">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        student.name?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{student.name}</strong>
                    {student.email && <div style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{student.email}</div>}
                  </td>
                  <td>{student.class}</td>
                  <td>{student.section || '-'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(student.status)}`}>
                      {getStatusLabel(student.status)}
                    </span>
                  </td>
                  <td>{student.parentName}</td>
                  <td>{student.phone || student.parent1_phone || '-'}</td>
                  <td>{student.enrolledDate ? new Date(student.enrolledDate).toLocaleDateString() : '-'}</td>
                  <td className="action-buttons">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => { setSelectedStudent(student); setShowDetailModal(true); }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => { setEditingStudent(student); setFormData(student); setShowModal(true); }}
                      title="Edit Student"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn set-current-btn" 
                      onClick={() => handleTransfer(student)}
                      title="Transfer Student"
                    >
                      <Repeat size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleWithdraw(student)}
                      title="Withdraw Student"
                    >
                      <UserX size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Detail Modal - Keep existing implementation */}
      {showDetailModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedStudent.name}</h2>
              <X className="modal-close" size={20} onClick={() => setShowDetailModal(false)} />
            </div>
            <div className="detail-tabs">
              {['profile', 'academic', 'enrollment', 'results', 'attendance', 'timetable', 'fee'].map(tab => (
                <div key={tab} className={`detail-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>
            <div className="modal-body">
              {activeTab === 'profile' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div><strong>Student Number:</strong> {selectedStudent.studentNumber}</div>
                    <div><strong>Unique ID:</strong> {selectedStudent.unique_id || '-'}</div>
                    <div><strong>Name:</strong> {selectedStudent.name}</div>
                    <div><strong>Gender:</strong> {getGenderLabel(selectedStudent.gender)}</div>
                    <div><strong>Date of Birth:</strong> {selectedStudent.dob || '-'}</div>
                    <div><strong>Class:</strong> {selectedStudent.class}</div>
                    <div><strong>Section:</strong> {selectedStudent.section || '-'}</div>
                    <div><strong>Status:</strong> {getStatusLabel(selectedStudent.status)}</div>
                    <div><strong>Enrolled:</strong> {selectedStudent.enrolledDate}</div>
                    <div><strong>Academic Year:</strong> {selectedStudent.academic_year || '-'}</div>
                    <div><strong>Parent/Guardian:</strong> {selectedStudent.parentName}</div>
                    <div><strong>Phone:</strong> {selectedStudent.phone || selectedStudent.parent1_phone || '-'}</div>
                    <div><strong>Email:</strong> {selectedStudent.email || selectedStudent.parent1_email || '-'}</div>
                    <div><strong>Address:</strong> {selectedStudent.address || '-'}</div>
                    <div><strong>Emergency Contact:</strong> {selectedStudent.emergencyContactName || selectedStudent.guardian_name || '-'}</div>
                    <div><strong>Emergency Phone:</strong> {selectedStudent.emergencyContactPhone || selectedStudent.guardian_phone || '-'}</div>
                    <div><strong>Health Conditions:</strong> {selectedStudent.healthConditions || 'None'}</div>
                    <div><strong>Former School:</strong> {selectedStudent.former_school || '-'}</div>
                  </div>
                </div>
              )}
              {activeTab === 'academic' && (
                <div>
                  <h3>Academic History</h3>
                  {getAcademicHistory(selectedStudent.id).map((h, i) => (
                    <div key={i} className="student-item">
                      <span>{h.year}: {h.class}</span>
                      <span className="status-badge status-active">{h.promoted ? 'Promoted' : 'Retained'}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'enrollment' && (
                <div>
                  <h3>Current Enrollment</h3>
                  <p><strong>Class:</strong> {selectedStudent.class}</p>
                  <p><strong>Section:</strong> {selectedStudent.section || 'Not assigned'}</p>
                  <p><strong>Academic Year:</strong> {selectedStudent.academic_year || 'Current Year'}</p>
                  <p><strong>Enrolled Date:</strong> {selectedStudent.enrolledDate}</p>
                  <p><strong>Status:</strong> {getStatusLabel(selectedStudent.status)}</p>
                </div>
              )}
              {activeTab === 'results' && (
                <div>
                  <table className="academic-years-table">
                    <thead><tr><th>Term</th><th>Year</th><th>Math</th><th>English</th><th>Science</th><th>Average</th></tr></thead>
                    <tbody>
                      {getResults(selectedStudent.id).map((r, i) => (
                        <tr key={i}>
                          <td>{r.term}</td><td>{r.year}</td><td>{r.mathematics}</td><td>{r.english}</td><td>{r.science}</td><td>{r.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'attendance' && (
                <div>
                  <div className="attendance-calendar">
                    {getAttendance(selectedStudent.id).map((a, i) => (
                      <div key={i} className={`calendar-day ${a.status}`}>
                        <span>{new Date(a.date).getDate()}</span>
                        <small>{a.status}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'timetable' && (
                <div>
                  <table className="academic-years-table">
                    <thead><tr><th>Time</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th></tr></thead>
                    <tbody>
                      {getTimetable(selectedStudent.id).map((t, i) => (
                        <tr key={i}>
                          <td>{t.time}</td><td>{t.monday}</td><td>{t.tuesday}</td><td>{t.wednesday}</td><td>{t.thursday}</td><td>{t.friday}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'fee' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div><strong>Total Fees:</strong> ${getFeeStatus(selectedStudent.id).total}</div>
                    <div><strong>Paid:</strong> ${getFeeStatus(selectedStudent.id).paid}</div>
                    <div><strong>Due:</strong> ${getFeeStatus(selectedStudent.id).due}</div>
                    <div><strong>Status:</strong> {getFeeStatus(selectedStudent.id).status}</div>
                    <div><strong>Last Payment:</strong> {getFeeStatus(selectedStudent.id).lastPayment}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Modal - Register/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingStudent(null); }}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStudent ? 'Edit Student' : 'Register New Student'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingStudent(null); }} />
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Full Name *</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Gender</label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleInputChange}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group"><label>Date of Birth</label><input type="date" name="dob" className="form-input" value={formData.dob} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Class *</label>
                <select name="class" className="form-select" value={formData.class} onChange={handleInputChange}>
                  <option value="">Select</option>
                  {filterOptions.classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Section</label>
                <select name="section" className="form-select" value={formData.section} onChange={handleInputChange}>
                  <option value="">Select</option>
                  {filterOptions.sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Parent/Guardian Name</label><input type="text" name="parentName" className="form-input" value={formData.parentName} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Phone</label><input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Email</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Address</label><textarea name="address" className="form-textarea" value={formData.address} onChange={handleInputChange} rows="2"></textarea></div>
              <div className="form-group"><label>Health Conditions</label><textarea name="healthConditions" className="form-textarea" value={formData.healthConditions} onChange={handleInputChange} rows="2" placeholder="Any allergies or medical conditions?"></textarea></div>
              <div className="form-group"><label>Emergency Contact</label><input type="text" name="emergencyContact" className="form-input" value={formData.emergencyContact} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Enrolled Date</label><input type="date" name="enrolledDate" className="form-input" value={formData.enrolledDate} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Status</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                  {filterOptions.statuses.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => { setShowModal(false); setEditingStudent(null); }}>Cancel</button>
              <button className="button" onClick={handleAddEditStudent}>{editingStudent ? 'Save Changes' : 'Register Student'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="modal-overlay" onClick={() => setShowBulkImport(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Bulk Import Students</h2><X className="modal-close" size={20} onClick={() => setShowBulkImport(false)} /></div>
            <div className="modal-body">
              <div className="bulk-import-area">
                <Upload size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Click or drag CSV file here</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Format: First Name, Last Name, Class, Section, Parent Name, Phone, Email, Gender, DOB</p>
                <button className="button button-secondary" style={{ marginTop: '1rem' }}><Download size={16} /> Download Template</button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button" onClick={() => setShowBulkImport(false)}>Cancel</button>
              <button className="button">Upload & Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;