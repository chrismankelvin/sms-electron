import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Upload, Download, Search, Filter, Eye, Edit, 
  Repeat, UserX, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  BookOpen, UserCheck, TrendingUp, DollarSign, Clock, Phone, Mail,
  MapPin, Heart, AlertCircle, UserPlus, FileText, Printer
} from 'lucide-react';
import '../../../styles/students.css';
// import 

function Students() {
  const [students, setStudents] = useState([
    { id: 1, studentNumber: '2024-001', name: 'Alice Johnson', class: 'JHS 1 Science', section: 'A', status: 'Active', parentName: 'Mr. & Mrs. Johnson', phone: '+233 20 123 4567', enrolledDate: '2024-01-15', gender: 'Female', dob: '2012-05-10', address: '123 Main St, Accra', healthConditions: 'None', emergencyContact: '+233 24 987 6543' },
    { id: 2, studentNumber: '2024-002', name: 'Bob Smith', class: 'JHS 1 Science', section: 'B', status: 'Active', parentName: 'Mrs. Smith', phone: '+233 20 123 4568', enrolledDate: '2024-01-15', gender: 'Male', dob: '2011-08-22', address: '456 Oak Ave, Accra', healthConditions: 'Asthma', emergencyContact: '+233 24 987 6544' },
    { id: 3, studentNumber: '2024-003', name: 'Charlie Brown', class: 'SHS 1 Science', section: 'A', status: 'Suspended', parentName: 'Mr. Brown', phone: '+233 20 123 4569', enrolledDate: '2024-01-10', gender: 'Male', dob: '2008-03-15', address: '789 Pine Rd, Accra', healthConditions: 'None', emergencyContact: '+233 24 987 6545' },
    { id: 4, studentNumber: '2023-089', name: 'Diana Prince', class: 'JHS 3 Science', section: 'A', status: 'Graduated', parentName: 'Dr. Prince', phone: '+233 20 123 4570', enrolledDate: '2023-01-10', gender: 'Female', dob: '2010-12-01', address: '321 Elm St, Accra', healthConditions: 'None', emergencyContact: '+233 24 987 6546' },
  ]);

   const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ class: '', status: '', gender: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentNumber: '', name: '', class: '', section: '', status: 'Active',
    parentName: '', phone: '', enrolledDate: '', gender: '', dob: '', address: '',
    healthConditions: '', emergencyContact: ''
  });
   const handleNavigation = (path) => {
    navigate(path);
  };

  const classes = ['JHS 1 Science', 'JHS 2 Science', 'JHS 3 Science', 'SHS 1 Science', 'SHS 1 Arts', 'SHS 2 Science'];
  const sections = ['A', 'B', 'C'];
  const statuses = ['Active', 'Suspended', 'Graduated', 'Withdrawn'];
  const genders = ['Male', 'Female'];

  const academicHistory = [
    { year: '2023-2024', class: 'JHS 1 Science', promoted: true, date: '2024-08-10' },
    { year: '2022-2023', class: 'Primary 6', promoted: true, date: '2023-07-15' }
  ];

  const results = [
    { term: 'Term 1', year: '2024', mathematics: 'A', english: 'B+', science: 'A-', average: '85%' },
    { term: 'Term 2', year: '2024', mathematics: 'B+', english: 'A-', science: 'B', average: '82%' }
  ];

  const attendance = [
    { date: '2024-03-01', status: 'present' }, { date: '2024-03-02', status: 'present' }, { date: '2024-03-03', status: 'absent' },
    { date: '2024-03-04', status: 'late' }, { date: '2024-03-05', status: 'present' }
  ];

  const timetable = [
    { time: '8:00-9:00', monday: 'Math', tuesday: 'English', wednesday: 'Science', thursday: 'Math', friday: 'Social' },
    { time: '9:00-10:00', monday: 'English', tuesday: 'Science', wednesday: 'Math', thursday: 'English', friday: 'Science' }
  ];

  const feeStatus = { total: 2500, paid: 2000, due: 500, lastPayment: '2024-02-15', status: 'Partial' };

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
      const newStudent = { id: Date.now(), ...formData, studentNumber: `2024-${String(students.length + 1).padStart(3, '0')}` };
      setStudents(prev => [...prev, newStudent]);
    }
    setShowModal(false);
    setEditingStudent(null);
    setFormData({ studentNumber: '', name: '', class: '', section: '', status: 'Active', parentName: '', phone: '', enrolledDate: '', gender: '', dob: '', address: '', healthConditions: '', emergencyContact: '' });
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
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'Withdrawn' } : s));
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.studentNumber.includes(searchTerm) ||
                         s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filters.class || s.class === filters.class;
    const matchesStatus = !filters.status || s.status === filters.status;
    const matchesGender = !filters.gender || s.gender === filters.gender;
    return matchesSearch && matchesClass && matchesStatus && matchesGender;
  });

  return (
    <div className="students-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Students</h1>
        <p style={{ color: 'var(--secondary)' }}>View, search, filter, and manage all students</p></div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="button button-secondary" onClick={() => setShowBulkImport(true)}><Upload size={16} /> Bulk Import</button>
          <button className="button button-secondary"><Download size={16} /> Export</button>
          <button className="button" onClick={() => handleNavigation("/registration/students")}><Plus size={16} /> Register Student</button>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Search and Filters */}
      <div className="search-filters">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
            <input type="text" className="form-input" style={{ paddingLeft: '2rem' }} placeholder="Search by name, student number, or parent name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: '150px' }} value={filters.class} onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}><option value="">All Classes</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select className="form-select" style={{ width: '130px' }} value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}><option value="">All Status</option>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
        </div>
        <div className="filter-chips">
          <span className={`filter-chip ${!filters.gender ? 'active' : ''}`} onClick={() => setFilters(prev => ({ ...prev, gender: '' }))}>All</span>
          {genders.map(g => <span key={g} className={`filter-chip ${filters.gender === g ? 'active' : ''}`} onClick={() => setFilters(prev => ({ ...prev, gender: g }))}>{g}</span>)}
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="academic-years-table">
          <thead><tr><th>Student #</th><th>Photo</th><th>Name</th><th>Class</th><th>Section</th><th>Status</th><th>Parent/Guardian</th><th>Phone</th><th>Enrolled Date</th><th>Actions</th></tr></thead>
          <tbody>{filteredStudents.map(student => (<tr key={student.id}>
            <td>{student.studentNumber}</td>
            <td><div className="student-avatar">{student.name.charAt(0)}</div></td>
            <td><strong>{student.name}</strong></td>
            <td>{student.class}</td>
            <td>{student.section || '-'}</td>
            <td><span className={`status-badge status-${student.status.toLowerCase()}`}>{student.status}</span></td>
            <td>{student.parentName}</td>
            <td>{student.phone}</td>
            <td>{new Date(student.enrolledDate).toLocaleDateString()}</td>
            <td className="action-buttons">
              <button className="action-btn edit-btn" onClick={() => { setSelectedStudent(student); setShowDetailModal(true); }}><Eye size={16} /></button>
              <button className="action-btn edit-btn" onClick={() => { setEditingStudent(student); setFormData(student); setShowModal(true); }}><Edit size={16} /></button>
              <button className="action-btn set-current-btn" onClick={() => handleTransfer(student)}><Repeat size={16} /></button>
              <button className="action-btn delete-btn" onClick={() => handleWithdraw(student)}><UserX size={16} /></button>
            </td>
          </tr>))}</tbody>
        </table>
      </div>

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
        <div className="modal-container" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>{selectedStudent.name}</h2><X className="modal-close" size={20} onClick={() => setShowDetailModal(false)} /></div>
          <div className="detail-tabs">
            {['profile', 'academic', 'enrollment', 'results', 'attendance', 'timetable', 'fee'].map(tab => (<div key={tab} className={`detail-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</div>))}
          </div>
          <div className="modal-body">
            {activeTab === 'profile' && (<div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div><strong>Student Number:</strong> {selectedStudent.studentNumber}</div><div><strong>Name:</strong> {selectedStudent.name}</div><div><strong>Gender:</strong> {selectedStudent.gender}</div><div><strong>Date of Birth:</strong> {selectedStudent.dob}</div>
              <div><strong>Class:</strong> {selectedStudent.class}</div><div><strong>Section:</strong> {selectedStudent.section || '-'}</div><div><strong>Status:</strong> {selectedStudent.status}</div><div><strong>Enrolled:</strong> {selectedStudent.enrolledDate}</div>
              <div><strong>Parent:</strong> {selectedStudent.parentName}</div><div><strong>Phone:</strong> {selectedStudent.phone}</div><div><strong>Address:</strong> {selectedStudent.address}</div><div><strong>Emergency Contact:</strong> {selectedStudent.emergencyContact}</div>
              <div><strong>Health Conditions:</strong> {selectedStudent.healthConditions || 'None'}</div>
            </div></div>)}
            {activeTab === 'academic' && (<div><h3>Academic History</h3>{academicHistory.map((h, i) => (<div key={i} className="student-item"><span>{h.year}: {h.class}</span><span className="status-badge status-active">{h.promoted ? 'Promoted' : 'Retained'}</span></div>))}</div>)}
            {activeTab === 'enrollment' && (<div><h3>Current Enrollment</h3><p><strong>Class:</strong> {selectedStudent.class}</p><p><strong>Section:</strong> {selectedStudent.section || 'Not assigned'}</p><p><strong>Academic Year:</strong> 2024-2025</p></div>)}
            {activeTab === 'results' && (<div><table className="academic-years-table"><thead><tr><th>Term</th><th>Year</th><th>Math</th><th>English</th><th>Science</th><th>Average</th></tr></thead><tbody>{results.map((r, i) => (<tr key={i}><td>{r.term}</td><td>{r.year}</td><td>{r.mathematics}</td><td>{r.english}</td><td>{r.science}</td><td>{r.average}</td></tr>))}</tbody></table></div>)}
            {activeTab === 'attendance' && (<div><div className="attendance-calendar">{attendance.map((a, i) => (<div key={i} className={`calendar-day ${a.status}`}><span>{new Date(a.date).getDate()}</span><small>{a.status}</small></div>))}</div></div>)}
            {activeTab === 'timetable' && (<div><table className="academic-years-table"><thead><tr><th>Time</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th></tr></thead><tbody>{timetable.map((t, i) => (<tr key={i}><td>{t.time}</td><td>{t.monday}</td><td>{t.tuesday}</td><td>{t.wednesday}</td><td>{t.thursday}</td><td>{t.friday}</td></tr>))}</tbody></table></div>)}
            {activeTab === 'fee' && (<div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}><div><strong>Total Fees:</strong> ${feeStatus.total}</div><div><strong>Paid:</strong> ${feeStatus.paid}</div><div><strong>Due:</strong> ${feeStatus.due}</div><div><strong>Status:</strong> {feeStatus.status}</div><div><strong>Last Payment:</strong> {feeStatus.lastPayment}</div></div></div>)}
          </div>
        </div>
      </div>}

      {/* Student Modal */}
      {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingStudent(null); }}>
        <div className="modal-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>{editingStudent ? 'Edit Student' : 'Register New Student'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingStudent(null); }} /></div>
          <div className="modal-body"><div className="form-group"><label>Full Name *</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} /></div>
          <div className="form-group"><label>Gender</label><select name="gender" className="form-select" value={formData.gender} onChange={handleInputChange}><option value="">Select</option>{genders.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
          <div className="form-group"><label>Date of Birth</label><input type="date" name="dob" className="form-input" value={formData.dob} onChange={handleInputChange} /></div>
          <div className="form-group"><label>Class *</label><select name="class" className="form-select" value={formData.class} onChange={handleInputChange}><option value="">Select</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="form-group"><label>Section</label><select name="section" className="form-select" value={formData.section} onChange={handleInputChange}><option value="">Select</option>{sections.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="form-group"><label>Parent/Guardian Name</label><input type="text" name="parentName" className="form-input" value={formData.parentName} onChange={handleInputChange} /></div>
          <div className="form-group"><label>Phone</label><input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleInputChange} /></div>
          <div className="form-group"><label>Address</label><textarea name="address" className="form-textarea" value={formData.address} onChange={handleInputChange} rows="2"></textarea></div>
          <div className="form-group"><label>Health Conditions</label><textarea name="healthConditions" className="form-textarea" value={formData.healthConditions} onChange={handleInputChange} rows="2" placeholder="Any allergies or medical conditions?"></textarea></div>
          <div className="form-group"><label>Emergency Contact</label><input type="tel" name="emergencyContact" className="form-input" value={formData.emergencyContact} onChange={handleInputChange} /></div>
          <div className="form-group"><label>Enrolled Date</label><input type="date" name="enrolledDate" className="form-input" value={formData.enrolledDate} onChange={handleInputChange} /></div>
          <div className="form-group"><label>Status</label><select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div></div>
          <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingStudent(null); }}>Cancel</button><button className="button" onClick={handleAddEditStudent}>{editingStudent ? 'Save' : 'Register'}</button></div>
        </div>
      </div>}

      {/* Bulk Import Modal */}
      {showBulkImport && <div className="modal-overlay" onClick={() => setShowBulkImport(false)}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>Bulk Import Students</h2><X className="modal-close" size={20} onClick={() => setShowBulkImport(false)} /></div>
          <div className="modal-body"><div className="bulk-import-area"><Upload size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} /><p>Click or drag CSV file here</p><p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Format: Name, Class, Section, Parent Name, Phone, Email, Gender, DOB</p><button className="button button-secondary" style={{ marginTop: '1rem' }}><Download size={16} /> Download Template</button></div></div>
          <div className="modal-footer"><button className="button" onClick={() => setShowBulkImport(false)}>Cancel</button><button className="button">Upload & Import</button></div>
        </div>
      </div>}
    </div>
  );
}

export default Students;