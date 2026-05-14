// src/components/Academics/ProgrammeSubjects.jsx

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Save, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import '../../../styles/programme-subjects.css';
import { programmeSubjectService } from '../../../services/programmeSubjectService';

function ProgrammeSubjects() {
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [allAvailableSubjects, setAllAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Load programme data when selected programme changes
  useEffect(() => {
    if (selectedProgrammeId) {
      loadProgrammeData(selectedProgrammeId);
    }
  }, [selectedProgrammeId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [programmesData, availableSubjectsData] = await Promise.all([
        programmeSubjectService.getProgrammes(),
        programmeSubjectService.getAvailableSubjects()
      ]);
      
      setProgrammes(programmesData);
      setAllAvailableSubjects(availableSubjectsData);
      
      // Set default selected programme
      if (programmesData.length > 0 && !selectedProgrammeId) {
        setSelectedProgrammeId(programmesData[0].id);
      }
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProgrammeData = async (programmeId) => {
    try {
      const data = await programmeSubjectService.getByProgramme(programmeId);
      
      // Transform assigned subjects
      const assigned = data.assigned_subjects.map(s => ({
        id: s.subject_id,
        name: s.name,
        code: s.code,
        isRequired: s.is_required
      }));
      setAssignedSubjects(assigned);
      
      // Transform available subjects (excluding assigned ones)
      const assignedIds = assigned.map(s => s.id);
      const available = allAvailableSubjects
        .filter(s => !assignedIds.includes(s.id))
        .map(s => ({
          id: s.id,
          name: s.name,
          code: s.code,
          isRequired: false
        }));
      setAvailableSubjects(available);
      
    } catch (error) {
      showAlert('Failed to load programme subjects: ' + error.message, 'error');
      setAssignedSubjects([]);
      setAvailableSubjects(allAvailableSubjects.map(s => ({ ...s, isRequired: false })));
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const moveToAssigned = (subject) => {
    setAvailableSubjects(prev => prev.filter(s => s.id !== subject.id));
    setAssignedSubjects(prev => [...prev, { ...subject, isRequired: false }]);
  };

  const moveToAvailable = (subject) => {
    setAssignedSubjects(prev => prev.filter(s => s.id !== subject.id));
    setAvailableSubjects(prev => [...prev, { ...subject, isRequired: false }]);
  };

  const toggleRequired = (subject) => {
    setAssignedSubjects(prev => 
      prev.map(s => s.id === subject.id ? { ...s, isRequired: !s.isRequired } : s)
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const subjectsToSave = assignedSubjects.map(s => ({
        subject_id: s.id,
        is_required: s.isRequired
      }));
      
      await programmeSubjectService.bulkUpdate(selectedProgrammeId, subjectsToSave);
      showAlert(`Elective subjects for ${programmes.find(p => p.id === selectedProgrammeId)?.name} saved successfully!`, 'success');
      
      // Refresh data to ensure consistency
      await loadProgrammeData(selectedProgrammeId);
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="programme-subjects-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading programme subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="programme-subjects-container">
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <BookOpen size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Programme Subjects
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Assign elective subjects to SHS programmes</p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: '500' }}>Select Programme:</label>
        <select 
          className="filter-select" 
          value={selectedProgrammeId || ''} 
          onChange={(e) => setSelectedProgrammeId(parseInt(e.target.value))}
          disabled={saving}
        >
          {programmes.map(prog => (
            <option key={prog.id} value={prog.id}>{prog.name}</option>
          ))}
        </select>
      </div>

      <div className="dual-list">
        <div className="list-box">
          <div className="list-header">Available Subjects</div>
          <div className="list-items">
            {availableSubjects.length > 0 ? (
              availableSubjects.map(subject => (
                <div key={subject.id} className="list-item">
                  <span>{subject.name}</span>
                  <button 
                    className="move-btn" 
                    onClick={() => moveToAssigned(subject)}
                    disabled={saving}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--secondary)' }}>
                No subjects available
              </div>
            )}
          </div>
        </div>

        <div className="list-box">
          <div className="list-header">
            Assigned Subjects <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>(Click star to mark required)</span>
          </div>
          <div className="list-items">
            {assignedSubjects.length > 0 ? (
              assignedSubjects.map(subject => (
                <div key={subject.id} className="list-item">
                  <div style={{ flex: 1 }}>
                    <span>{subject.name}</span>
                    {subject.isRequired && (
                      <span className="required-badge" style={{ marginLeft: '0.5rem' }}>Required</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="move-btn" 
                      style={{ backgroundColor: '#f59e0b' }} 
                      onClick={() => toggleRequired(subject)}
                      disabled={saving}
                    >
                      <Star size={14} />
                    </button>
                    <button 
                      className="move-btn" 
                      style={{ backgroundColor: '#ef4444' }} 
                      onClick={() => moveToAvailable(subject)}
                      disabled={saving}
                    >
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--secondary)' }}>
                No subjects assigned
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="button save-btn" onClick={handleSave} disabled={saving}>
          {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Programme Subjects'}
        </button>
      </div>
    </div>
  );
}

export default ProgrammeSubjects;