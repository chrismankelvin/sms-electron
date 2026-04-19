import { useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle, Layers, X } from 'lucide-react';
import '../../../styles/promotion-rules.css';

function PromotionRules() {
  const [globalRules, setGlobalRules] = useState({
    minAverage: 60,
    maxFails: 2,
    mustPassCore: true,
    coreSubjects: ['Mathematics', 'English', 'Science']
  });

  const [levelRules, setLevelRules] = useState({
    'JHS 1': { minAverage: 50, maxFails: 3, mustPassCore: true, coreSubjects: ['Mathematics', 'English'] },
    'JHS 2': { minAverage: 50, maxFails: 3, mustPassCore: true, coreSubjects: ['Mathematics', 'English'] },
    'SHS 1': { minAverage: 50, maxFails: 2, mustPassCore: true, coreSubjects: ['Mathematics', 'English', 'Science'] }
  });

  const [overrideEnabled, setOverrideEnabled] = useState({});

  const levels = ['JHS 1', 'JHS 2', 'JHS 3', 'SHS 1', 'SHS 2', 'SHS 3'];
  const allSubjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'French', 'ICT'];

  const handleGlobalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGlobalRules(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : parseInt(value) }));
  };

  const handleLevelRuleChange = (level, field, value) => {
    setLevelRules(prev => ({ ...prev, [level]: { ...prev[level], [field]: value } }));
  };

  const handleSaveRules = () => {
    alert('Promotion rules saved successfully');
    console.log('Global Rules:', globalRules);
    console.log('Level Rules:', levelRules);
  };

  return (
    <div className="promotion-rules-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Settings size={28} style={{ display: 'inline', marginRight: '12px' }} />Promotion Rules</h1>
        <p style={{ color: 'var(--secondary)' }}>Define criteria for automatic promotion</p></div>
        <button className="button" onClick={handleSaveRules}><Save size={16} /> Save Rules</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Global Rules</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div><label>Minimum Average Score to Pass (%)</label><input type="number" name="minAverage" className="form-input" value={globalRules.minAverage} onChange={handleGlobalChange} /></div>
          <div><label>Maximum Failed Subjects Allowed</label><input type="number" name="maxFails" className="form-input" value={globalRules.maxFails} onChange={handleGlobalChange} /></div>
          <div><label><input type="checkbox" name="mustPassCore" checked={globalRules.mustPassCore} onChange={handleGlobalChange} /> Must pass core subjects?</label></div>
        </div>
        {globalRules.mustPassCore && (<div><label>Core Subjects (Required to Pass)</label><div className="core-subject-list">{allSubjects.map(s => (<label key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginRight: '1rem' }}><input type="checkbox" checked={globalRules.coreSubjects.includes(s)} onChange={(e) => { if (e.target.checked) { setGlobalRules(prev => ({ ...prev, coreSubjects: [...prev.coreSubjects, s] })); } else { setGlobalRules(prev => ({ ...prev, coreSubjects: prev.coreSubjects.filter(c => c !== s) })); } }} /> {s}</label>))}</div></div>)}
      </div>

      <div className="card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Level-Specific Rules (Override)</h3>
        {levels.map(level => (<div key={level} className="level-override-card"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}><strong>{level}</strong>
        <label><input type="checkbox" checked={overrideEnabled[level]} onChange={(e) => setOverrideEnabled(prev => ({ ...prev, [level]: e.target.checked }))} /> Enable Override</label></div>
        {overrideEnabled[level] && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div><label>Min Average</label><input type="number" className="form-input" value={levelRules[level]?.minAverage || 50} onChange={(e) => handleLevelRuleChange(level, 'minAverage', parseInt(e.target.value))} /></div>
          <div><label>Max Fails</label><input type="number" className="form-input" value={levelRules[level]?.maxFails || 2} onChange={(e) => handleLevelRuleChange(level, 'maxFails', parseInt(e.target.value))} /></div>
          <div><label><input type="checkbox" checked={levelRules[level]?.mustPassCore} onChange={(e) => handleLevelRuleChange(level, 'mustPassCore', e.target.checked)} /> Must Pass Core</label></div>
        </div>)}</div>))}
      </div>
    </div>
  );
}

export default PromotionRules;