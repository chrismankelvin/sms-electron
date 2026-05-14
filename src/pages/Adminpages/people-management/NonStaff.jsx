// import { useState } from 'react';
// import { Users, Plus, Eye, Edit, UserX, Calendar, Briefcase, X } from 'lucide-react';
// import '../../../styles/non-staff.css';
// import { useNavigate } from 'react-router-dom';
// import { getNonstaff } from '../../../services/api.service';


// function NonStaff() {
//   const [nonStaff, setNonStaff] = useState([
//     { id: 1, nonStaffNumber: 'NS-001', name: 'Robert Adjei', role: 'Accountant', department: 'Finance', designation: 'Senior Accountant', hiredDate: '2018-03-10', status: 'Active', nextOfKin: 'Mrs. Adjei - 0244123456' },
//     { id: 2, nonStaffNumber: 'NS-002', name: 'Grace Mensah', role: 'Librarian', department: 'Library', designation: 'Head Librarian', hiredDate: '2019-08-15', status: 'Active', nextOfKin: 'Mr. Mensah - 0244123457' }
//   ]);

//   const navigate =useNavigate();
//    const handleNavigation = (path) => {
//     navigate(path);
//   };
//   const [showModal, setShowModal] = useState(false);
//   const [editingNonStaff, setEditingNonStaff] = useState(null);
//   const [formData, setFormData] = useState({ nonStaffNumber: '', name: '', role: '', department: '', designation: '', hiredDate: '', status: 'Active', nextOfKin: '' });

//   const roles = ['Accountant', 'Librarian', 'Administrative Assistant', 'Cleaner', 'Security', 'Driver', 'Cafeteria Staff'];
//   const departments = ['Finance', 'Library', 'Administration', 'Facilities', 'Security', 'Catering'];
//   const statuses = ['Active', 'Terminated', 'Resigned'];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddEditNonStaff = () => {
//     if (!formData.name || !formData.role) { 
//       alert('Please fill in required fields'); 
//       return; 
//     }
//     if (editingNonStaff) { 
//       setNonStaff(prev => prev.map(n => n.id === editingNonStaff.id ? { ...n, ...formData } : n)); 
//     } else { 
//       const newNonStaff = { id: Date.now(), ...formData, nonStaffNumber: `NS-${String(nonStaff.length + 1).padStart(3, '0')}` }; 
//       setNonStaff(prev => [...prev, newNonStaff]); 
//     }
//     setShowModal(false); 
//     setEditingNonStaff(null); 
//     setFormData({ nonStaffNumber: '', name: '', role: '', department: '', designation: '', hiredDate: '', status: 'Active', nextOfKin: '' });
//   };

//   const handleTerminate = (ns) => {
//     if (window.confirm(`Terminate ${ns.name}?`)) { 
//       setNonStaff(prev => prev.map(n => n.id === ns.id ? { ...n, status: 'Terminated' } : n)); 
//     }
//   };

//   return (
//     <div className="non-staff-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
//             Non-Staff
//           </h1>
//           <p style={{ color: 'var(--secondary)' }}>Manage non-teaching staff (accountants, librarians, administrative, etc.)</p>
//         </div>
//         <button className="button" onClick={() => handleNavigation("/registration/non-staff")}>
//           <Plus size={16} /> Add Staff
//         </button>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="table-container">
//         <table className="academic-years-table">
//           <thead>
//             <tr>
//               <th>Non-Staff #</th>
//               <th>Name</th>
//               <th>Role</th>
//               <th>Department</th>
//               <th>Designation</th>
//               <th>Hired Date</th>
//               <th>Status</th>
//               <th>Next of Kin</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {nonStaff.map(ns => (
//               <tr key={ns.id}>
//                 <td>{ns.nonStaffNumber}</td>
//                 <td><strong>{ns.name}</strong></td>
//                 <td><span className="role-badge">{ns.role}</span></td>
//                 <td>{ns.department}</td>
//                 <td>{ns.designation}</td>
//                 <td>{new Date(ns.hiredDate).toLocaleDateString()}</td>
//                 <td>
//                   <span className={`status-badge status-${ns.status.toLowerCase()}`}>{ns.status}</span>
//                 </td>
//                 <td>{ns.nextOfKin}</td>
//                 <td className="action-buttons">
//                   <button className="action-btn edit-btn" onClick={() => { setEditingNonStaff(ns); setFormData(ns); setShowModal(true); }}>
//                     <Edit size={16} />
//                   </button>
//                   {ns.status === 'Active' && (
//                     <button className="action-btn delete-btn" onClick={() => handleTerminate(ns)}>
//                       <UserX size={16} />
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {showModal && (
//         <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingNonStaff(null); }}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>{editingNonStaff ? 'Edit Staff' : 'Add Non-Staff'}</h2>
//               <X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingNonStaff(null); }} />
//             </div>
//             <div className="modal-body">
//               <div className="form-group">
//                 <label>Full Name *</label>
//                 <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} />
//               </div>
//               <div className="form-group">
//                 <label>Role *</label>
//                 <select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>
//                   <option value="">Select</option>
//                   {roles.map(r => <option key={r} value={r}>{r}</option>)}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Department</label>
//                 <select name="department" className="form-select" value={formData.department} onChange={handleInputChange}>
//                   <option value="">Select</option>
//                   {departments.map(d => <option key={d} value={d}>{d}</option>)}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Designation</label>
//                 <input type="text" name="designation" className="form-input" value={formData.designation} onChange={handleInputChange} />
//               </div>
//               <div className="form-group">
//                 <label>Hired Date</label>
//                 <input type="date" name="hiredDate" className="form-input" value={formData.hiredDate} onChange={handleInputChange} />
//               </div>
//               <div className="form-group">
//                 <label>Next of Kin Contact</label>
//                 <input type="text" name="nextOfKin" className="form-input" value={formData.nextOfKin} onChange={handleInputChange} />
//               </div>
//               <div className="form-group">
//                 <label>Status</label>
//                 <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
//                   {statuses.map(s => <option key={s} value={s}>{s}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button className="button button-secondary" onClick={() => { setShowModal(false); setEditingNonStaff(null); }}>
//                 Cancel
//               </button>
//               <button className="button" onClick={handleAddEditNonStaff}>
//                 {editingNonStaff ? 'Save' : 'Add'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default NonStaff;






import { useState, useEffect } from 'react';
import { Users, Plus, Eye, Edit, UserX, Calendar, Briefcase, X, Loader, AlertCircle, Search } from 'lucide-react';
import '../../../styles/non-staff.css';
import { useNavigate } from 'react-router-dom';
import { getNonstaff } from '../../../services/api.service';

function NonStaff() {
  const navigate = useNavigate();
  
  // State
  const [nonStaff, setNonStaff] = useState([]);
  const [filteredNonStaff, setFilteredNonStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: '', department: '', status: '' });
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNonStaff, setSelectedNonStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editingNonStaff, setEditingNonStaff] = useState(null);
  const [formData, setFormData] = useState({ 
    nonStaffNumber: '', name: '', role: '', department: '', designation: '', 
    hiredDate: '', status: 'Active', nextOfKin: '', email: '', phone: '', address: '' 
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    roles: ['Accountant', 'Librarian', 'Administrative Assistant', 'Cleaner', 'Security', 'Driver', 'Cafeteria Staff'],
    departments: [],
    statuses: ['Active', 'Terminated', 'Resigned']
  });

  // Fetch non-staff on component mount
  useEffect(() => {
    loadNonStaff();
  }, []);

  // Apply filters whenever nonStaff, searchTerm, or filters change
  useEffect(() => {
    applyFilters();
  }, [nonStaff, searchTerm, filters]);

  const loadNonStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNonstaff();
      
      console.log('Non-Staff API Response:', response);
      
      // Handle different response structures
      let nonStaffData = [];
      
      if (response && response.success && response.data) {
        nonStaffData = response.data;
      } else if (Array.isArray(response)) {
        nonStaffData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        nonStaffData = response.data;
      } else {
        nonStaffData = [];
      }
      
      // Transform API data to match component structure
      const formattedNonStaff = nonStaffData.map(member => {
        // Get person details if nested
        const person = member.person_details || member.person || {};
        
        return {
          id: member.id,
          nonStaffNumber: member.non_staff_number || member.nonStaffNumber || member.staff_number || `NS-${member.id}`,
          unique_id: member.unique_id,
          user_id: member.user_id,
          
          // Person details
          first_name: person.first_name || member.first_name,
          last_name: person.last_name || member.last_name,
          other_names: person.other_names || member.other_names,
          name: `${person.first_name || member.first_name || ''} ${person.last_name || member.last_name || ''}`.trim(),
          email: person.email || member.email,
          phone: person.phone || member.phone,
          address: person.address || member.address,
          city: person.city,
          state: person.state,
          country: person.country,
          photo_url: person.photo_url || member.photo_url,
          
          // Non-staff specific details
          role: member.role || member.position || 'Staff',
          department: member.department || 'General',
          designation: member.designation || member.title || member.role,
          status: member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1) : 'Active',
          hiredDate: member.hired_at || member.hiredDate || member.start_date || member.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          nextOfKin: member.next_of_kin || member.nextOfKin || member.emergency_contact || 'Not provided',
          nextOfKinName: member.next_of_kin_name,
          nextOfKinPhone: member.next_of_kin_phone,
          nextOfKinRelation: member.next_of_kin_relation,
          
          // Additional fields
          qualification: member.qualification,
          specialization: member.specialization,
          contract_type: member.contract_type,
          salary_grade: member.salary_grade,
          created_at: member.created_at,
          updated_at: member.updated_at
        };
      });
      
      setNonStaff(formattedNonStaff);
      
      // Extract filter options from data
      extractFilterOptions(formattedNonStaff);
      
    } catch (err) {
      console.error('Error loading non-staff:', err);
      setError('Failed to load non-staff members. Please check your connection and try again.');
      setNonStaff([]);
      setFilteredNonStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = (nonStaffData) => {
    // Extract unique departments
    const departments = [...new Set(nonStaffData.map(s => s.department).filter(Boolean))].sort();
    
    // Extract unique roles
    const roles = [...new Set(nonStaffData.map(s => s.role).filter(Boolean))].sort();
    
    setFilterOptions(prev => ({
      ...prev,
      departments,
      roles: roles.length > 0 ? roles : prev.roles
    }));
  };

  const applyFilters = () => {
    let filtered = [...nonStaff];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.name?.toLowerCase().includes(term) ||
        member.nonStaffNumber?.toLowerCase().includes(term) ||
        member.email?.toLowerCase().includes(term) ||
        member.phone?.includes(term) ||
        member.role?.toLowerCase().includes(term) ||
        member.department?.toLowerCase().includes(term) ||
        member.designation?.toLowerCase().includes(term)
      );
    }
    
    // Apply role filter
    if (filters.role) {
      filtered = filtered.filter(member => 
        member.role?.toLowerCase() === filters.role.toLowerCase()
      );
    }
    
    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(member => 
        member.department === filters.department
      );
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(member => 
        member.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }
    
    setFilteredNonStaff(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({ role: '', department: '', status: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditNonStaff = () => {
    if (!formData.name || !formData.role) { 
      alert('Please fill in required fields'); 
      return; 
    }
    
    if (editingNonStaff) { 
      setNonStaff(prev => prev.map(n => n.id === editingNonStaff.id ? { ...n, ...formData } : n));
      alert('Non-staff member updated successfully!');
    } else { 
      const newNonStaff = { 
        id: Date.now(), 
        ...formData, 
        nonStaffNumber: formData.nonStaffNumber || `NS-${String(nonStaff.length + 1).padStart(3, '0')}` 
      }; 
      setNonStaff(prev => [...prev, newNonStaff]);
      alert('Non-staff member added successfully!');
    }
    setShowModal(false); 
    setEditingNonStaff(null); 
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      nonStaffNumber: '', name: '', role: '', department: '', designation: '', 
      hiredDate: '', status: 'Active', nextOfKin: '', email: '', phone: '', address: '' 
    });
  };

  const handleTerminate = (member) => {
    if (window.confirm(`Terminate ${member.name}? This will mark them as terminated.`)) { 
      setNonStaff(prev => prev.map(n => n.id === member.id ? { ...n, status: 'Terminated' } : n));
      alert(`${member.name} has been terminated.`);
    }
  };

  const handleReactivate = (member) => {
    if (window.confirm(`Reactivate ${member.name}?`)) {
      setNonStaff(prev => prev.map(n => n.id === member.id ? { ...n, status: 'Active' } : n));
      alert(`${member.name} has been reactivated.`);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'active': 'status-active',
      'terminated': 'status-terminated',
      'resigned': 'status-resigned'
    };
    return statusMap[status?.toLowerCase()] || 'status-active';
  };

  // Mock data for detail view
  const getEmploymentHistory = (staffId) => [
    { year: '2023-2024', role: 'Accountant', department: 'Finance', status: 'Active' },
    { year: '2022-2023', role: 'Junior Accountant', department: 'Finance', status: 'Completed' }
  ];

  const getDocuments = (staffId) => [
    { name: 'Employment Contract', date: '2023-01-15', status: 'Signed' },
    { name: 'ID Copy', date: '2023-01-10', status: 'Verified' }
  ];

  if (loading) {
    return (
      <div className="non-staff-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading non-staff members...</p>
        </div>
      </div>
    );
  }

  if (error && nonStaff.length === 0) {
    return (
      <div className="non-staff-container">
        <div className="error-container">
          <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <p>{error}</p>
          <button className="button" onClick={loadNonStaff} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="non-staff-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Non-Staff
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            Manage non-teaching staff (accountants, librarians, administrative, etc.)
            {filteredNonStaff.length > 0 && ` (${filteredNonStaff.length} of ${nonStaff.length} total)`}
          </p>
        </div>
        <button className="button" onClick={() => navigate("/registration/non-staff")}>
          <Plus size={16} /> Add Staff
        </button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Search and Filters */}
      <div className="search-filters" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '2rem' }} 
              placeholder="Search by name, staff number, role, department..." 
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
          <div className="stat-value">{filteredNonStaff.length}</div>
          <div className="stat-label">Showing Staff</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{nonStaff.filter(s => s.status === 'Active').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filterOptions.departments.length}</div>
          <div className="stat-label">Departments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filterOptions.roles.length}</div>
          <div className="stat-label">Roles</div>
        </div>
      </div>

      {/* Non-Staff Table */}
      <div className="table-container">
        {filteredNonStaff.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No non-staff members found matching your criteria</p>
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
                <th>Non-Staff #</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Hired Date</th>
                <th>Status</th>
                <th>Next of Kin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNonStaff.map(ns => (
                <tr key={ns.id}>
                  <td>{ns.nonStaffNumber}</td>
                  <td>
                    <strong>{ns.name}</strong>
                    {ns.email && <div style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{ns.email}</div>}
                  </td>
                  <td><span className="role-badge">{ns.role}</span></td>
                  <td>{ns.department}</td>
                  <td>{ns.designation}</td>
                  <td>{ns.hiredDate ? new Date(ns.hiredDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(ns.status)}`}>
                      {ns.status}
                    </span>
                  </td>
                  <td>{ns.nextOfKin}</td>
                  <td className="action-buttons">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => { setSelectedNonStaff(ns); setShowDetailModal(true); }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => { setEditingNonStaff(ns); setFormData(ns); setShowModal(true); }}
                      title="Edit Staff"
                    >
                      <Edit size={16} />
                    </button>
                    {ns.status === 'Active' && (
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleTerminate(ns)}
                        title="Terminate Staff"
                      >
                        <UserX size={16} />
                      </button>
                    )}
                    {ns.status === 'Terminated' && (
                      <button 
                        className="action-btn set-current-btn" 
                        onClick={() => handleReactivate(ns)}
                        title="Reactivate Staff"
                      >
                        <Briefcase size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedNonStaff && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedNonStaff.name}</h2>
              <X className="modal-close" size={20} onClick={() => setShowDetailModal(false)} />
            </div>
            <div className="detail-tabs">
              {['profile', 'employment', 'documents', 'emergency'].map(tab => (
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
                    <div><strong>Staff #:</strong> {selectedNonStaff.nonStaffNumber}</div>
                    <div><strong>Name:</strong> {selectedNonStaff.name}</div>
                    <div><strong>Role:</strong> {selectedNonStaff.role}</div>
                    <div><strong>Department:</strong> {selectedNonStaff.department}</div>
                    <div><strong>Designation:</strong> {selectedNonStaff.designation}</div>
                    <div><strong>Status:</strong> {selectedNonStaff.status}</div>
                    <div><strong>Hired Date:</strong> {selectedNonStaff.hiredDate}</div>
                    <div><strong>Email:</strong> {selectedNonStaff.email || 'Not provided'}</div>
                    <div><strong>Phone:</strong> {selectedNonStaff.phone || 'Not provided'}</div>
                    <div><strong>Address:</strong> {selectedNonStaff.address || 'Not provided'}</div>
                    <div><strong>Qualification:</strong> {selectedNonStaff.qualification || 'Not specified'}</div>
                    <div><strong>Contract Type:</strong> {selectedNonStaff.contract_type || 'Permanent'}</div>
                  </div>
                </div>
              )}
              {activeTab === 'employment' && (
                <div>
                  <h3>Employment History</h3>
                  {getEmploymentHistory(selectedNonStaff.id).map((h, i) => (
                    <div key={i} className="student-item">
                      <span>{h.year}: {h.role} - {h.department}</span>
                      <span className="status-badge status-active">{h.status}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '1rem' }}>
                    <h3>Current Information</h3>
                    <div><strong>Years of Service:</strong> {
                      selectedNonStaff.hiredDate ? 
                      Math.floor((new Date() - new Date(selectedNonStaff.hiredDate)) / (1000 * 60 * 60 * 24 * 365)) : 
                      'N/A'
                    } years</div>
                    <div><strong>Salary Grade:</strong> {selectedNonStaff.salary_grade || 'Not specified'}</div>
                  </div>
                </div>
              )}
              {activeTab === 'documents' && (
                <div>
                  <h3>Documents</h3>
                  {getDocuments(selectedNonStaff.id).map((doc, i) => (
                    <div key={i} className="student-item">
                      <span>{doc.name}</span>
                      <span>Date: {doc.date}</span>
                      <span className="status-badge status-active">{doc.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'emergency' && (
                <div>
                  <h3>Emergency Contact</h3>
                  <div><strong>Next of Kin:</strong> {selectedNonStaff.nextOfKin}</div>
                  <div><strong>Name:</strong> {selectedNonStaff.nextOfKinName || 'Not specified'}</div>
                  <div><strong>Phone:</strong> {selectedNonStaff.nextOfKinPhone || 'Not specified'}</div>
                  <div><strong>Relation:</strong> {selectedNonStaff.nextOfKinRelation || 'Not specified'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Non-Staff Modal - Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingNonStaff(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingNonStaff ? 'Edit Staff' : 'Add Non-Staff'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingNonStaff(null); }} />
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
                <label>Designation</label>
                <input type="text" name="designation" className="form-input" value={formData.designation} onChange={handleInputChange} />
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
                <label>Next of Kin Contact</label>
                <input type="text" name="nextOfKin" className="form-input" value={formData.nextOfKin} onChange={handleInputChange} />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>Format: Name - Phone number</small>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                  {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => { setShowModal(false); setEditingNonStaff(null); }}>
                Cancel
              </button>
              <button className="button" onClick={handleAddEditNonStaff}>
                {editingNonStaff ? 'Save Changes' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NonStaff;