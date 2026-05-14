// src/components/Data/ExportData.jsx

import { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileJson, 
  Filter, 
  X,
  Users,
  UserCheck,
  BookOpen,
  GraduationCap,
  Award,
  Calendar,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import '../../../styles/export-data.css';
import { exportService } from '../../../services/exportService';

function ExportData() {
  const [format, setFormat] = useState('csv');
  const [selectedExport, setSelectedExport] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const exportOptions = [
    { 
      id: 'students', 
      name: 'All Students', 
      description: 'Export complete student records with parent information',
      icon: Users,
      availableFilters: ['academic_year_id', 'class_id', 'section_id', 'status']
    },
    { 
      id: 'staff', 
      name: 'All Staff', 
      description: 'Export staff directory with qualifications and contact details',
      icon: UserCheck,
      availableFilters: ['role', 'department', 'status']
    },
    { 
      id: 'subjects', 
      name: 'Subjects', 
      description: 'Export subject master list with codes and categories',
      icon: BookOpen,
      availableFilters: ['type', 'category']
    },
    { 
      id: 'classes', 
      name: 'Classes', 
      description: 'Export class structures with capacity and form masters',
      icon: GraduationCap,
      availableFilters: ['academic_year_id', 'level_id', 'is_active']
    },
    { 
      id: 'results', 
      name: 'Results', 
      description: 'Export assessment results and academic performance',
      icon: Award,
      availableFilters: ['academic_year_id', 'term_id', 'class_id', 'subject_id']
    },
    { 
      id: 'attendance', 
      name: 'Attendance', 
      description: 'Export attendance records for students',
      icon: Calendar,
      availableFilters: ['academic_year_id', 'term_id', 'class_id', 'date_range']
    }
  ];

  const formatIcons = {
    csv: FileSpreadsheet,
    excel: FileSpreadsheet,
    pdf: FileText,
    json: FileJson
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleExport = async (option) => {
    try {
      setLoading(true);
      await exportService.exportData(option.id, format, filters);
      showAlert(`Exporting ${option.name} as ${format.toUpperCase()}...`, 'success');
    } catch (error) {
      showAlert('Export failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setShowFilters(false);
  };

  const getFilterLabel = (filterKey) => {
    const labels = {
      academic_year_id: 'Academic Year',
      class_id: 'Class',
      section_id: 'Section',
      status: 'Status',
      role: 'Role',
      department: 'Department',
      type: 'Subject Type',
      category: 'Category',
      level_id: 'Level',
      is_active: 'Active Status',
      term_id: 'Term',
      subject_id: 'Subject',
      date_range: 'Date Range'
    };
    return labels[filterKey] || filterKey;
  };

  const FormatIcon = formatIcons[format] || FileSpreadsheet;

  return (
    <div className="export-data-container">
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

      <div className="export-header">
        <div className="header-title">
          <h1>
            <Download size={28} />
            Export Data
          </h1>
          <p>Manual data export to various formats</p>
        </div>
        <div className="format-selector">
          <FormatIcon size={16} />
          <select 
            className="form-select" 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
            disabled={loading}
          >
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>
      <hr className="divider" />

      {/* Export Options */}
      <div className="export-options-list">
        {exportOptions.map(option => {
          const Icon = option.icon;
          return (
            <div key={option.id} className="export-option-card">
              <div className="export-option-info">
                <div className="export-option-icon">
                  <Icon size={24} />
                </div>
                <div className="export-option-details">
                  <strong>{option.name}</strong>
                  <div className="export-option-description">{option.description}</div>
                  {selectedExport === option.id && showFilters && (
                    <div className="filter-panel">
                      <div className="filter-header">
                        <Filter size={14} />
                        <span>Filters</span>
                      </div>
                      <div className="filter-fields">
                        {option.availableFilters.map(filterKey => (
                          <div key={filterKey} className="filter-field">
                            <label>{getFilterLabel(filterKey)}</label>
                            <input 
                              type="text" 
                              className="filter-input"
                              placeholder={`Enter ${getFilterLabel(filterKey).toLowerCase()}...`}
                              onChange={(e) => setFilters(prev => ({ ...prev, [filterKey]: e.target.value }))}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="filter-actions">
                        <button className="btn-small btn-secondary" onClick={clearFilters}>
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="export-option-actions">
                {option.availableFilters.length > 0 && (
                  <button 
                    className="btn-icon" 
                    onClick={() => {
                      setSelectedExport(option.id);
                      setShowFilters(prev => prev !== option.id ? option.id : null);
                    }}
                    disabled={loading}
                  >
                    <Filter size={16} />
                  </button>
                )}
                <button 
                  className="btn-primary" 
                  onClick={() => handleExport(option)}
                  disabled={loading}
                >
                  {loading ? <Loader size={16} className="spinner" /> : <Download size={16} />}
                  {loading ? 'Exporting...' : `Export ${format.toUpperCase()}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Info */}
      <div className="export-info">
        <div className="info-icon">
          <FileText size={20} />
        </div>
        <div className="info-content">
          <strong>About Exports</strong>
          <p>
            Exports are processed in the background. For large datasets, you will receive a 
            notification when your export is ready to download. All exports include a timestamp 
            and can be filtered before generation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExportData;