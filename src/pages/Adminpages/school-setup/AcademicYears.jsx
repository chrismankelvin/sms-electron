import { useState } from 'react';
import {
  Calendar,
  Plus,
  Copy,
  Edit,
  Archive,
  Star,
  Trash2,
  X,
  Check,
  AlertCircle,
  ChevronRight,
  FileText,
  BookOpen,
  Users,
  Clock
} from 'lucide-react';
import '../../../styles/academic-years.css';

function AcademicYears() {
  const [academicYears, setAcademicYears] = useState([
    {
      id: 1,
      yearLabel: '2022-2023',
      startDate: '2022-08-15',
      endDate: '2023-06-10',
      status: 'Archived',
      isCurrent: false
    },
    {
      id: 2,
      yearLabel: '2023-2024',
      startDate: '2023-08-14',
      endDate: '2024-06-08',
      status: 'Inactive',
      isCurrent: false
    },
    {
      id: 3,
      yearLabel: '2024-2025',
      startDate: '2024-08-12',
      endDate: '2025-06-06',
      status: 'Active',
      isCurrent: true
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [formData, setFormData] = useState({
    yearLabel: '',
    startDate: '',
    endDate: '',
    status: 'Active'
  });
  const [cloneOptions, setCloneOptions] = useState({
    classes: true,
    subjects: true,
    assignments: true,
    fees: false,
    exams: false
  });

  const statusOptions = ['Active', 'Inactive', 'Archived'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloneOptionChange = (option) => {
    setCloneOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleAddYear = () => {
    if (!formData.yearLabel || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newYear = {
      id: Date.now(),
      ...formData,
      isCurrent: false
    };

    setAcademicYears(prev => [...prev, newYear]);
    setShowAddModal(false);
    setFormData({
      yearLabel: '',
      startDate: '',
      endDate: '',
      status: 'Active'
    });
  };

  const handleEditYear = () => {
    if (!selectedYear) return;

    setAcademicYears(prev => prev.map(year =>
      year.id === selectedYear.id
        ? { ...year, ...formData }
        : year
    ));
    setShowEditModal(false);
    setSelectedYear(null);
    setFormData({
      yearLabel: '',
      startDate: '',
      endDate: '',
      status: 'Active'
    });
  };

  const handleSetAsCurrent = (year) => {
    setAcademicYears(prev => prev.map(y => ({
      ...y,
      isCurrent: y.id === year.id,
      status: y.id === year.id ? 'Active' : y.status === 'Active' ? 'Inactive' : y.status
    })));
  };

  const handleArchiveYear = (year) => {
    if (year.isCurrent) {
      alert('Cannot archive the current academic year. Please set another year as current first.');
      return;
    }
    
    setAcademicYears(prev => prev.map(y =>
      y.id === year.id
        ? { ...y, status: 'Archived' }
        : y
    ));
  };

  const handleDeleteYear = (year) => {
    if (year.isCurrent) {
      alert('Cannot delete the current academic year. Please set another year as current first.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${year.yearLabel}? This action cannot be undone.`)) {
      setAcademicYears(prev => prev.filter(y => y.id !== year.id));
    }
  };

  const handleCloneFromPrevious = () => {
    const previousYear = academicYears.find(y => y.isCurrent);
    if (!previousYear) {
      alert('No active academic year found to clone from.');
      return;
    }

    const newYearLabel = `${parseInt(previousYear.yearLabel.split('-')[0]) + 1}-${parseInt(previousYear.yearLabel.split('-')[1]) + 1}`;
    
    setFormData({
      yearLabel: newYearLabel,
      startDate: '',
      endDate: '',
      status: 'Active'
    });
    
    setShowCloneModal(true);
  };

  const confirmClone = () => {
    if (!formData.yearLabel || !formData.startDate || !formData.endDate) {
      alert('Please fill in year details');
      return;
    }

    const newYear = {
      id: Date.now(),
      ...formData,
      isCurrent: false
    };

    setAcademicYears(prev => [...prev, newYear]);
    setShowCloneModal(false);
    setFormData({
      yearLabel: '',
      startDate: '',
      endDate: '',
      status: 'Active'
    });
    setCloneOptions({
      classes: true,
      subjects: true,
      assignments: true,
      fees: false,
      exams: false
    });
    
    // Here you would actually clone the data from previous year
    console.log('Cloning with options:', cloneOptions);
  };

  const openEditModal = (year) => {
    setSelectedYear(year);
    setFormData({
      yearLabel: year.yearLabel,
      startDate: year.startDate,
      endDate: year.endDate,
      status: year.status
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'Archived': return 'status-archived';
      default: return 'status-inactive';
    }
  };

  return (
    <div className="academic-years-container">
      {/* Page Header */}
      <div className="header-actions">
        <div className="page-title-section">
          <h1>
            <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Academic Years
          </h1>
          <p>Define school calendar years and manage academic sessions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="button clone-btn" onClick={handleCloneFromPrevious}>
            <Copy size={16} />
            Clone from Previous Year
          </button>
          <button className="button" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add Academic Year
          </button>
        </div>
      </div>

      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Academic Years Table */}
      <div className="table-container">
        <table className="academic-years-table">
          <thead>
            <tr>
              <th>Year Label</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Is Current?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {academicYears.length > 0 ? (
              academicYears.map(year => (
                <tr key={year.id}>
                  <td>
                    <strong>{year.yearLabel}</strong>
                  </td>
                  <td>{new Date(year.startDate).toLocaleDateString()}</td>
                  <td>{new Date(year.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(year.status)}`}>
                      {year.status === 'Active' && <Check size={12} />}
                      {year.status === 'Archived' && <Archive size={12} />}
                      {year.status}
                    </span>
                  </td>
                  <td>
                    {year.isCurrent ? (
                      <span className="current-badge">
                        <Star size={12} />
                        Current
                      </span>
                    ) : (
                      <span className="not-current">No</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => openEditModal(year)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      {!year.isCurrent && year.status !== 'Archived' && (
                        <button
                          className="action-btn archive-btn"
                          onClick={() => handleArchiveYear(year)}
                          title="Archive"
                        >
                          <Archive size={16} />
                        </button>
                      )}
                      {!year.isCurrent && (
                        <button
                          className="action-btn set-current-btn"
                          onClick={() => handleSetAsCurrent(year)}
                          title="Set as Current"
                        >
                          <Star size={16} />
                        </button>
                      )}
                      {!year.isCurrent && year.status === 'Archived' && (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteYear(year)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <Calendar size={48} />
                    <p>No academic years defined yet</p>
                    <button className="button" onClick={() => setShowAddModal(true)}>
                      <Plus size={16} />
                      Add Your First Academic Year
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Year Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Academic Year</h2>
              <X className="modal-close" size={20} onClick={() => setShowAddModal(false)} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Year Label <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="yearLabel"
                  className="form-input"
                  value={formData.yearLabel}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024-2025"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Start Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  End Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="button" onClick={handleAddYear}>
                Add Year
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Year Modal */}
      {showEditModal && selectedYear && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Academic Year</h2>
              <X className="modal-close" size={20} onClick={() => setShowEditModal(false)} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Year Label <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="yearLabel"
                  className="form-input"
                  value={formData.yearLabel}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Start Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  End Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="button" onClick={handleEditYear}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone from Previous Year Modal */}
      {showCloneModal && (
        <div className="modal-overlay" onClick={() => setShowCloneModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Clone from Previous Year</h2>
              <X className="modal-close" size={20} onClick={() => setShowCloneModal(false)} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  New Year Label <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="yearLabel"
                  className="form-input"
                  value={formData.yearLabel}
                  onChange={handleInputChange}
                  placeholder="e.g., 2025-2026"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Start Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  End Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-section-title" style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
                <Copy size={16} />
                What to clone from previous year?
              </div>
              
              <div className="clone-options">
                <div className={`clone-option ${cloneOptions.classes ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    id="clone-classes"
                    checked={cloneOptions.classes}
                    onChange={() => handleCloneOptionChange('classes')}
                  />
                  <label htmlFor="clone-classes">
                    Classes & Sections
                    <div className="clone-option-description">Copy all class structures and section divisions</div>
                  </label>
                </div>
                
                <div className={`clone-option ${cloneOptions.subjects ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    id="clone-subjects"
                    checked={cloneOptions.subjects}
                    onChange={() => handleCloneOptionChange('subjects')}
                  />
                  <label htmlFor="clone-subjects">
                    Subjects & Syllabus
                    <div className="clone-option-description">Copy subject allocations and syllabus structure</div>
                  </label>
                </div>
                
                <div className={`clone-option ${cloneOptions.assignments ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    id="clone-assignments"
                    checked={cloneOptions.assignments}
                    onChange={() => handleCloneOptionChange('assignments')}
                  />
                  <label htmlFor="clone-assignments">
                    Assignments & Exams
                    <div className="clone-option-description">Copy assignment templates and exam schedules</div>
                  </label>
                </div>
                
                <div className={`clone-option ${cloneOptions.fees ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    id="clone-fees"
                    checked={cloneOptions.fees}
                    onChange={() => handleCloneOptionChange('fees')}
                  />
                  <label htmlFor="clone-fees">
                    Fee Structures
                    <div className="clone-option-description">Copy fee categories and amounts (optional)</div>
                  </label>
                </div>
                
                <div className={`clone-option ${cloneOptions.exams ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    id="clone-exams"
                    checked={cloneOptions.exams}
                    onChange={() => handleCloneOptionChange('exams')}
                  />
                  <label htmlFor="clone-exams">
                    Exam Templates
                    <div className="clone-option-description">Copy exam patterns and grading scales (optional)</div>
                  </label>
                </div>
              </div>
              
              <div className="alert-info" style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'start',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ marginTop: '2px' }} />
                <span>Student and staff data will not be cloned. Only structure and templates will be copied.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => setShowCloneModal(false)}>
                Cancel
              </button>
              <button className="button clone-btn" onClick={confirmClone}>
                <Copy size={16} />
                Clone & Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcademicYears;