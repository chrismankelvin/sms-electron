// import { useState } from 'react';
// import { Users, Plus, Eye, Edit, UserX, Key, Calendar, BookOpen, Clock, Award, Mail, Phone, MapPin, X } from 'lucide-react';
// import '../../../styles/staff.css';
// import { useNavigate } from 'react-router-dom';
// import { getstaff } from '../../../services/api.service';


// function Staff() {
//   const [staff, setStaff] = useState([
//     { id: 1, staffNumber: 'TCH-001', name: 'Mr. John Doe', role: 'Teacher', department: 'Science', status: 'Active', qualification: "Master's in Mathematics", specialization: 'Mathematics', hiredDate: '2015-08-15' },
//     { id: 2, staffNumber: 'TCH-002', name: 'Mrs. Jane Smith', role: 'Teacher', department: 'Languages', status: 'Active', qualification: "Master's in English", specialization: 'English', hiredDate: '2016-09-10' },
//     { id: 3, staffNumber: 'ADM-001', name: 'Dr. James Wilson', role: 'Admin', department: 'Administration', status: 'Active', qualification: 'PhD in Education', specialization: 'School Leadership', hiredDate: '2010-01-20' },
//     { id: 4, staffNumber: 'TCH-003', name: 'Ms. Sarah Johnson', role: 'Teacher', department: 'Science', status: 'On Leave', qualification: "Bachelor's in Biology", specialization: 'Biology', hiredDate: '2019-08-20' }
//   ]);

//   const navigate =useNavigate();
//    const handleNavigation = (path) => {
//     navigate(path);
//   };
//   const [showModal, setShowModal] = useState(false);
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [selectedStaff, setSelectedStaff] = useState(null);
//   const [activeTab, setActiveTab] = useState('profile');
//   const [editingStaff, setEditingStaff] = useState(null);
//   const [formData, setFormData] = useState({ staffNumber: '', name: '', role: '', department: '', status: 'Active', qualification: '', specialization: '', hiredDate: '' });

//   const roles = ['Admin', 'Teacher', 'TA', 'Accountant', 'Librarian', 'Guidance'];
//   const departments = ['Science', 'Languages', 'Mathematics', 'Social Studies', 'Administration', 'Finance'];
//   const statuses = ['Active', 'Suspended', 'Terminated', 'On Leave'];

//   const qualifications = [
//     { subject: 'Mathematics', level: "Master's", certifiedSince: '2015' },
//     { subject: 'Physics', level: "Bachelor's", certifiedSince: '2015' }
//   ];

//   const assignments = [
//     { subject: 'Mathematics', class: 'JHS 1 Science', periodsPerWeek: 6 },
//     { subject: 'Mathematics', class: 'JHS 2 Science', periodsPerWeek: 6 }
//   ];

//   const timetable = [
//     { time: '8:00-9:00', monday: 'Math - JHS1', tuesday: 'Math - JHS2', wednesday: 'Free', thursday: 'Math - JHS1', friday: 'Math - JHS2' }
//   ];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddEditStaff = () => {
//     if (!formData.name || !formData.role) { alert('Please fill in required fields'); return; }
//     if (editingStaff) { setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s)); }
//     else { const newStaff = { id: Date.now(), ...formData, staffNumber: `STAFF-${String(staff.length + 1).padStart(3, '0')}` }; setStaff(prev => [...prev, newStaff]); }
//     setShowModal(false); setEditingStaff(null); setFormData({ staffNumber: '', name: '', role: '', department: '', status: 'Active', qualification: '', specialization: '', hiredDate: '' });
//   };

//   const handleTerminate = (staffMember) => {
//     if (window.confirm(`Terminate ${staffMember.name}?`)) { setStaff(prev => prev.map(s => s.id === staffMember.id ? { ...s, status: 'Terminated' } : s)); }
//   };

//   const handleResetPassword = (staffMember) => {
//     alert(`Password reset link sent to ${staffMember.name}'s email`);
//   };

//   const filteredStaff = staff;

//   return (
//     <div className="staff-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Staff (Teachers)</h1>
//         <p style={{ color: 'var(--secondary)' }}>Manage teaching and administrative staff</p></div>
//         <button className="button" onClick={() => handleNavigation("/registration/teachers")}><Plus size={16} /> Add Staff</button>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="table-container"><table className="academic-years-table"><thead><tr><th>Staff #</th><th>Name</th><th>Role</th><th>Department</th><th>Status</th><th>Qualification</th><th>Specialization</th><th>Hired Date</th><th>Actions</th></tr></thead>
//       <tbody>{filteredStaff.map(s => (<tr key={s.id}><td>{s.staffNumber}</td><td><strong>{s.name}</strong></td><td>{s.role}</td><td>{s.department}</td><td><span className={`status-badge status-${s.status.toLowerCase().replace(' ', '-')}`}>{s.status}</span></td><td>{s.qualification}</td><td>{s.specialization}</td><td>{new Date(s.hiredDate).toLocaleDateString()}</td>
//       <td className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setSelectedStaff(s); setShowDetailModal(true); }}><Eye size={16} /></button>
//       <button className="action-btn edit-btn" onClick={() => { setEditingStaff(s); setFormData(s); setShowModal(true); }}><Edit size={16} /></button>
//       <button className="action-btn delete-btn" onClick={() => handleTerminate(s)}><UserX size={16} /></button>
//       <button className="action-btn set-current-btn" onClick={() => handleResetPassword(s)}><Key size={16} /></button></td></tr>))}</tbody></table></div>

//       {/* Detail Modal */}
//       {showDetailModal && selectedStaff && <div className="modal-overlay" onClick={() => setShowDetailModal(false)}><div className="modal-container" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
//         <div className="modal-header"><h2>{selectedStaff.name}</h2><X className="modal-close" size={20} onClick={() => setShowDetailModal(false)} /></div>
//         <div className="detail-tabs">{['profile', 'employment', 'qualifications', 'assignments', 'timetable', 'workload'].map(tab => (<div key={tab} className={`detail-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</div>))}</div>
//         <div className="modal-body">{activeTab === 'profile' && (<div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}><div><strong>Staff #:</strong> {selectedStaff.staffNumber}</div><div><strong>Name:</strong> {selectedStaff.name}</div><div><strong>Role:</strong> {selectedStaff.role}</div><div><strong>Department:</strong> {selectedStaff.department}</div><div><strong>Status:</strong> {selectedStaff.status}</div><div><strong>Qualification:</strong> {selectedStaff.qualification}</div><div><strong>Specialization:</strong> {selectedStaff.specialization}</div><div><strong>Hired:</strong> {selectedStaff.hiredDate}</div></div></div>)}
//         {activeTab === 'qualifications' && (<div>{qualifications.map((q, i) => (<div key={i} className="student-item"><span><strong>{q.subject}</strong> - {q.level}</span><span>Certified: {q.certifiedSince}</span></div>))}</div>)}
//         {activeTab === 'assignments' && (<div>{assignments.map((a, i) => (<div key={i} className="student-item"><span>{a.subject} - {a.class}</span><span>{a.periodsPerWeek} periods/week</span></div>))}</div>)}
//         {activeTab === 'timetable' && (<div><table className="academic-years-table"><thead><tr><th>Time</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th></tr></thead><tbody>{timetable.map((t, i) => (<tr key={i}><td>{t.time}</td><td>{t.monday}</td><td>{t.tuesday}</td><td>{t.wednesday}</td><td>{t.thursday}</td><td>{t.friday}</td></tr>))}</tbody></table></div>)}
//         {activeTab === 'workload' && (<div><div><strong>Total Periods/Week:</strong> 24</div><div className="workload-bar" style={{ marginTop: '0.5rem' }}><div className="workload-fill" style={{ width: '60%' }}></div></div><div>60% of max capacity (40 periods)</div></div>)}</div>
//       </div></div>}

//       {/* Staff Modal */}
//       {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingStaff(null); }}><div className="modal-container" onClick={e => e.stopPropagation()}>
//         <div className="modal-header"><h2>{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingStaff(null); }} /></div>
//         <div className="modal-body"><div className="form-group"><label>Full Name *</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} /></div>
//         <div className="form-group"><label>Role *</label><select name="role" className="form-select" value={formData.role} onChange={handleInputChange}><option value="">Select</option>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
//         <div className="form-group"><label>Department</label><select name="department" className="form-select" value={formData.department} onChange={handleInputChange}><option value="">Select</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
//         <div className="form-group"><label>Qualification</label><input type="text" name="qualification" className="form-input" value={formData.qualification} onChange={handleInputChange} /></div>
//         <div className="form-group"><label>Specialization</label><input type="text" name="specialization" className="form-input" value={formData.specialization} onChange={handleInputChange} /></div>
//         <div className="form-group"><label>Hired Date</label><input type="date" name="hiredDate" className="form-input" value={formData.hiredDate} onChange={handleInputChange} /></div>
//         <div className="form-group"><label>Status</label><select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div></div>
//         <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingStaff(null); }}>Cancel</button><button className="button" onClick={handleAddEditStaff}>{editingStaff ? 'Save' : 'Add'}</button></div>
//       </div></div>}
//     </div>
//   );
// }

// export default Staff;









import { useState, useEffect } from 'react';
import { Users, Plus, Eye, Edit, UserX, Key, Calendar, BookOpen, Clock, Award, Mail, Phone, MapPin, X, Loader, AlertCircle } from 'lucide-react';
import '../../../styles/staff.css';
import { useNavigate } from 'react-router-dom';
import { getstaff } from '../../../services/api.service';

function Staff() {
  const navigate = useNavigate();
  
  // State
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: '', department: '', status: '' });
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ 
    staffNumber: '', name: '', role: '', department: '', status: 'Active', 
    qualification: '', specialization: '', hiredDate: '', email: '', phone: '', address: '' 
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    roles: ['Admin', 'Teacher', 'TA', 'Accountant', 'Librarian', 'Guidance'],
    departments: [],
    statuses: ['Active', 'Suspended', 'Terminated', 'On Leave']
  });

  // Fetch staff on component mount
  useEffect(() => {
    loadStaff();
  }, []);

  // Apply filters whenever staff, searchTerm, or filters change
  useEffect(() => {
    applyFilters();
  }, [staff, searchTerm, filters]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getstaff();
      
      console.log('Staff API Response:', response);
      
      // Handle different response structures
      let staffData = [];
      
      if (response && response.success && response.data) {
        staffData = response.data;
      } else if (Array.isArray(response)) {
        staffData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        staffData = response.data;
      } else {
        staffData = [];
      }
      
      // Transform API data to match component structure
      const formattedStaff = staffData.map(staffMember => {
        // Get person details if nested
        const person = staffMember.person_details || staffMember.person || {};
        
        return {
          id: staffMember.id,
          staffNumber: staffMember.staff_number || staffMember.staffNumber || `STAFF-${staffMember.id}`,
          unique_id: staffMember.unique_id,
          user_id: staffMember.user_id,
          
          // Person details
          first_name: person.first_name || staffMember.first_name,
          last_name: person.last_name || staffMember.last_name,
          other_names: person.other_names || staffMember.other_names,
          name: `${person.first_name || staffMember.first_name || ''} ${person.last_name || staffMember.last_name || ''}`.trim(),
          email: person.email || staffMember.email,
          phone: person.phone || staffMember.phone,
          address: person.address || staffMember.address,
          city: person.city,
          state: person.state,
          country: person.country,
          photo_url: person.photo_url || staffMember.photo_url,
          
          // Staff specific details
          role: staffMember.role ? staffMember.role.charAt(0).toUpperCase() + staffMember.role.slice(1) : 'Teacher',
          department: staffMember.department || 'Not Assigned',
          status: staffMember.status ? staffMember.status.charAt(0).toUpperCase() + staffMember.status.slice(1) : 'Active',
          qualification: staffMember.qualification || 'Not specified',
          specialization: staffMember.specialization || 'Not specified',
          hiredDate: staffMember.hired_at || staffMember.hiredDate || staffMember.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          marital_status: staffMember.marital_status,
          spouse_name: staffMember.spouse_name,
          spouse_phone: staffMember.spouse_phone,
          place_of_birth: staffMember.place_of_birth,
          created_at: staffMember.created_at,
          updated_at: staffMember.updated_at
        };
      });
      
      setStaff(formattedStaff);
      
      // Extract filter options from data
      extractFilterOptions(formattedStaff);
      
    } catch (err) {
      console.error('Error loading staff:', err);
      setError('Failed to load staff. Please check your connection and try again.');
      setStaff([]);
      setFilteredStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = (staffData) => {
    // Extract unique departments
    const departments = [...new Set(staffData.map(s => s.department).filter(Boolean))].sort();
    
    setFilterOptions(prev => ({
      ...prev,
      departments
    }));
  };

  const applyFilters = () => {
    let filtered = [...staff];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(staffMember => 
        staffMember.name?.toLowerCase().includes(term) ||
        staffMember.staffNumber?.toLowerCase().includes(term) ||
        staffMember.email?.toLowerCase().includes(term) ||
        staffMember.phone?.includes(term) ||
        staffMember.role?.toLowerCase().includes(term) ||
        staffMember.department?.toLowerCase().includes(term)
      );
    }
    
    // Apply role filter
    if (filters.role) {
      filtered = filtered.filter(staffMember => 
        staffMember.role?.toLowerCase() === filters.role.toLowerCase()
      );
    }
    
    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(staffMember => 
        staffMember.department === filters.department
      );
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(staffMember => 
        staffMember.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }
    
    setFilteredStaff(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({ role: '', department: '', status: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditStaff = () => {
    if (!formData.name || !formData.role) {
      alert('Please fill in required fields');
      return;
    }
    
    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s));
      alert('Staff member updated successfully!');
    } else {
      const newStaff = { 
        id: Date.now(), 
        ...formData, 
        staffNumber: formData.staffNumber || `STAFF-${String(staff.length + 1).padStart(3, '0')}` 
      };
      setStaff(prev => [...prev, newStaff]);
      alert('Staff member added successfully!');
    }
    setShowModal(false);
    setEditingStaff(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      staffNumber: '', name: '', role: '', department: '', status: 'Active', 
      qualification: '', specialization: '', hiredDate: '', email: '', phone: '', address: '' 
    });
  };

  const handleTerminate = (staffMember) => {
    if (window.confirm(`Terminate ${staffMember.name}? This action will mark them as terminated.`)) {
      setStaff(prev => prev.map(s => s.id === staffMember.id ? { ...s, status: 'Terminated' } : s));
      alert(`${staffMember.name} has been terminated.`);
    }
  };

  const handleResetPassword = (staffMember) => {
    alert(`Password reset link has been sent to ${staffMember.name}'s email (${staffMember.email || 'registered email'})`);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'active': 'status-active',
      'suspended': 'status-suspended',
      'terminated': 'status-terminated',
      'on leave': 'status-on-leave'
    };
    return statusMap[status?.toLowerCase()] || 'status-active';
  };

  // Mock data for detail view (these would come from API in real implementation)
  const getQualifications = (staffId) => [
    { subject: 'Mathematics', level: "Master's", certifiedSince: '2015' },
    { subject: 'Physics', level: "Bachelor's", certifiedSince: '2015' }
  ];

  const getAssignments = (staffId) => [
    { subject: 'Mathematics', class: 'JHS 1 Science', periodsPerWeek: 6 },
    { subject: 'Mathematics', class: 'JHS 2 Science', periodsPerWeek: 6 }
  ];

  const getTimetable = (staffId) => [
    { time: '8:00-9:00', monday: 'Math - JHS1', tuesday: 'Math - JHS2', wednesday: 'Free', thursday: 'Math - JHS1', friday: 'Math - JHS2' },
    { time: '9:00-10:00', monday: 'Science - JHS1', tuesday: 'Science - JHS2', wednesday: 'Meeting', thursday: 'Science - JHS1', friday: 'Science - JHS2' }
  ];

  if (loading) {
    return (
      <div className="staff-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading staff members...</p>
        </div>
      </div>
    );
  }

  if (error && staff.length === 0) {
    return (
      <div className="staff-container">
        <div className="error-container">
          <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <p>{error}</p>
          <button className="button" onClick={loadStaff} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Staff (Teachers & Administration)
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            Manage teaching and administrative staff
            {filteredStaff.length > 0 && ` (${filteredStaff.length} of ${staff.length} total)`}
          </p>
        </div>
        <button className="button" onClick={() => navigate("/registration/teachers")}>
          <Plus size={16} /> Add Staff
        </button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Search and Filters */}
      <div className="search-filters" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '2rem' }} 
              placeholder="Search by name, staff number, email, role, or department..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <select 
            className="form-select" 
            style={{ width: '150px' }} 
            value={filters.role} 
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          >
            <option value="">All Roles</option>
            {filterOptions.roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          
          <select 
            className="form-select" 
            style={{ width: '150px' }} 
            value={filters.department} 
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
          >
            <option value="">All Departments</option>
            {filterOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          
          <select 
            className="form-select" 
            style={{ width: '130px' }} 
            value={filters.status} 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          {(searchTerm || filters.role || filters.department || filters.status) && (
            <button className="button button-secondary" onClick={clearAllFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="stat-card">
          <div className="stat-value">{filteredStaff.length}</div>
          <div className="stat-label">Showing Staff</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{staff.filter(s => s.status === 'Active').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filterOptions.departments.length}</div>
          <div className="stat-label">Departments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{staff.filter(s => s.role === 'Teacher').length}</div>
          <div className="stat-label">Teachers</div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="table-container">
        {filteredStaff.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No staff members found matching your criteria</p>
            {(searchTerm || filters.role || filters.department || filters.status) && (
              <button className="button button-secondary" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <table className="academic-years-table">
            <thead>
              <tr>
                <th>Staff #</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Qualification</th>
                <th>Specialization</th>
                <th>Hired Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(s => (
                <tr key={s.id}>
                  <td>{s.staffNumber}</td>
                  <td>
                    <strong>{s.name}</strong>
                    {s.email && <div style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{s.email}</div>}
                  </td>
                  <td>{s.role}</td>
                  <td>{s.department}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>{s.qualification}</td>
                  <td>{s.specialization}</td>
                  <td>{s.hiredDate ? new Date(s.hiredDate).toLocaleDateString() : '-'}</td>
                  <td className="action-buttons">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => { setSelectedStaff(s); setShowDetailModal(true); }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => { setEditingStaff(s); setFormData(s); setShowModal(true); }}
                      title="Edit Staff"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleTerminate(s)}
                      title="Terminate Staff"
                    >
                      <UserX size={16} />
                    </button>
                    <button 
                      className="action-btn set-current-btn" 
                      onClick={() => handleResetPassword(s)}
                      title="Reset Password"
                    >
                      <Key size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedStaff.name}</h2>
              <X className="modal-close" size={20} onClick={() => setShowDetailModal(false)} />
            </div>
            <div className="detail-tabs">
              {['profile', 'employment', 'qualifications', 'assignments', 'timetable', 'workload'].map(tab => (
                <div 
                  key={tab} 
                  className={`detail-tab ${activeTab === tab ? 'active' : ''}`} 
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>
            <div className="modal-body">
              {activeTab === 'profile' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    <div><strong>Staff #:</strong> {selectedStaff.staffNumber}</div>
                    <div><strong>Name:</strong> {selectedStaff.name}</div>
                    <div><strong>Role:</strong> {selectedStaff.role}</div>
                    <div><strong>Department:</strong> {selectedStaff.department}</div>
                    <div><strong>Status:</strong> {selectedStaff.status}</div>
                    <div><strong>Qualification:</strong> {selectedStaff.qualification}</div>
                    <div><strong>Specialization:</strong> {selectedStaff.specialization}</div>
                    <div><strong>Hired Date:</strong> {selectedStaff.hiredDate}</div>
                    <div><strong>Email:</strong> {selectedStaff.email || 'Not provided'}</div>
                    <div><strong>Phone:</strong> {selectedStaff.phone || 'Not provided'}</div>
                    <div><strong>Address:</strong> {selectedStaff.address || 'Not provided'}</div>
                    <div><strong>Marital Status:</strong> {selectedStaff.marital_status || 'Not specified'}</div>
                  </div>
                </div>
              )}
              {activeTab === 'employment' && (
                <div>
                  <h3>Employment Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    <div><strong>Staff Number:</strong> {selectedStaff.staffNumber}</div>
                    <div><strong>Role:</strong> {selectedStaff.role}</div>
                    <div><strong>Department:</strong> {selectedStaff.department}</div>
                    <div><strong>Status:</strong> {selectedStaff.status}</div>
                    <div><strong>Hired Date:</strong> {selectedStaff.hiredDate}</div>
                    <div><strong>Years of Service:</strong> {
                      selectedStaff.hiredDate ? 
                      Math.floor((new Date() - new Date(selectedStaff.hiredDate)) / (1000 * 60 * 60 * 24 * 365)) : 
                      'N/A'
                    } years</div>
                  </div>
                </div>
              )}
              {activeTab === 'qualifications' && (
                <div>
                  <h3>Professional Qualifications</h3>
                  {getQualifications(selectedStaff.id).map((q, i) => (
                    <div key={i} className="student-item">
                      <span><strong>{q.subject}</strong> - {q.level}</span>
                      <span>Certified: {q.certifiedSince}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'assignments' && (
                <div>
                  <h3>Teaching Assignments</h3>
                  {getAssignments(selectedStaff.id).map((a, i) => (
                    <div key={i} className="student-item">
                      <span>{a.subject} - {a.class}</span>
                      <span>{a.periodsPerWeek} periods/week</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'timetable' && (
                <div>
                  <table className="academic-years-table">
                    <thead>
                      <tr><th>Time</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th></tr>
                    </thead>
                    <tbody>
                      {getTimetable(selectedStaff.id).map((t, i) => (
                        <tr key={i}>
                          <td>{t.time}</td>
                          <td>{t.monday}</td>
                          <td>{t.tuesday}</td>
                          <td>{t.wednesday}</td>
                          <td>{t.thursday}</td>
                          <td>{t.friday}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'workload' && (
                <div>
                  <div><strong>Total Periods/Week:</strong> 24</div>
                  <div className="workload-bar" style={{ marginTop: '0.5rem' }}>
                    <div className="workload-fill" style={{ width: '60%' }}></div>
                  </div>
                  <div>60% of max capacity (40 periods)</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal - Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingStaff(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingStaff(null); }} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>
                  <option value="">Select</option>
                  {filterOptions.roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select name="department" className="form-select" value={formData.department} onChange={handleInputChange}>
                  <option value="">Select</option>
                  {filterOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Qualification</label>
                <input type="text" name="qualification" className="form-input" value={formData.qualification} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <input type="text" name="specialization" className="form-input" value={formData.specialization} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="address" className="form-textarea" value={formData.address} onChange={handleInputChange} rows="2" />
              </div>
              <div className="form-group">
                <label>Hired Date</label>
                <input type="date" name="hiredDate" className="form-input" value={formData.hiredDate} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                  {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => { setShowModal(false); setEditingStaff(null); }}>
                Cancel
              </button>
              <button className="button" onClick={handleAddEditStaff}>
                {editingStaff ? 'Save Changes' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;