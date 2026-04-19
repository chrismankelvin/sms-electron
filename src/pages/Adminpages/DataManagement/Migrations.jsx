import { useState } from 'react';
import { ArrowRight, Database, Users, BookOpen, GraduationCap, AlertTriangle, CheckCircle, X } from 'lucide-react';
import '../../../styles/migrations.css';

function Migrations() {
  const [migrationType, setMigrationType] = useState('');
  const [sourceYear, setSourceYear] = useState('2023-2024');
  const [destYear, setDestYear] = useState('2024-2025');
  const [showPreview, setShowPreview] = useState(false);

  const migrationTypes = [
    { id: 'students', name: 'Students', description: 'Move all active students to next academic year', icon: Users },
    { id: 'classes', name: 'Classes', description: 'Create next year\'s classes based on current', icon: BookOpen },
    { id: 'promotions', name: 'Promotions', description: 'Apply promotion rules to all students', icon: GraduationCap },
    { id: 'subjects', name: 'Subjects', description: 'Copy subject assignments to new year', icon: Database }
  ];

  const previewData = {
    students: { total: 245, toBeMigrated: 238, toBeArchived: 7, graduating: 42 },
    classes: { total: 42, toBeCreated: 42, toBeArchived: 42 },
    promotions: { promoted: 210, repeated: 28, graduated: 7 },
    subjects: { assignments: 156, toBeCopied: 156 }
  };

  const currentPreview = previewData[migrationType];

  const handlePreview = () => {
    if (!migrationType) { alert('Please select migration type'); return; }
    setShowPreview(true);
  };

  const handleExecute = () => {
    if (window.confirm(`Execute ${migrationType} migration from ${sourceYear} to ${destYear}? This action cannot be undone.`)) {
      alert(`Migration executed successfully!`);
    }
  };

  const MigrationIcon = migrationTypes.find(m => m.id === migrationType)?.icon || Database;

  return (
    <div className="migrations-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Database size={28} style={{ display: 'inline', marginRight: '12px' }} />Data Migrations</h1>
        <p style={{ color: 'var(--secondary)' }}>Move data between academic years</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="migration-card">
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Migration Type</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {migrationTypes.map(type => (
            <label key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `2px solid ${migrationType === type.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="migrationType" value={type.id} checked={migrationType === type.id} onChange={(e) => setMigrationType(e.target.value)} style={{ display: 'none' }} />
              <type.icon size={24} />
              <div><strong>{type.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{type.description}</div></div>
            </label>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <select className="form-select" value={sourceYear} onChange={(e) => setSourceYear(e.target.value)}><option>2022-2023</option><option>2023-2024</option></select>
          <ArrowRight size={24} />
          <select className="form-select" value={destYear} onChange={(e) => setDestYear(e.target.value)}><option>2023-2024</option><option>2024-2025</option></select>
        </div>

        <button className="button button-secondary" onClick={handlePreview}>Preview Changes</button>
      </div>

      {showPreview && currentPreview && (
        <div className="migration-card">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Preview Changes</h3>
          <div className="preview-box">
            <div><strong>Source:</strong> {sourceYear}</div>
            <div><strong>Destination:</strong> {destYear}</div>
            <div><strong>Migration Type:</strong> {migrationType}</div>
            <hr style={{ margin: '0.5rem 0' }} />
            {migrationType === 'students' && (<><div>Total active students: {currentPreview.total}</div><div>Will be migrated to {destYear}: {currentPreview.toBeMigrated}</div><div>Will be archived (graduated/withdrawn): {currentPreview.toBeArchived}</div><div>Graduating students: {currentPreview.graduating}</div></>)}
            {migrationType === 'classes' && (<><div>Current classes: {currentPreview.total}</div><div>Will be created: {currentPreview.toBeCreated}</div><div>Will be archived: {currentPreview.toBeArchived}</div></>)}
            {migrationType === 'promotions' && (<><div>Will be promoted: {currentPreview.promoted}</div><div>Will repeat current level: {currentPreview.repeated}</div><div>Will graduate: {currentPreview.graduated}</div></>)}
          </div>
          <div className="alert-info" style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> Warning: This action cannot be undone. Please ensure you have a backup before proceeding.
          </div>
          <button className="button" onClick={handleExecute} style={{ marginTop: '1rem' }}>Execute Migration</button>
        </div>
      )}
    </div>
  );
}

export default Migrations;