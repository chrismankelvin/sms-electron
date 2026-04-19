import { useState } from 'react';
import { Search, Users, UserCheck, Heart, UserPlus, Mail, Phone, Eye, MessageSquare, Filter, X } from 'lucide-react';
import '../../../styles/person-directory.css';

function PersonDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const directoryData = [
    { id: 1, name: 'Alice Johnson', type: 'Student', contact: '+233 20 123 4567', email: 'alice@school.edu', class: 'JHS 1 Science', status: 'Active' },
    { id: 2, name: 'Bob Smith', type: 'Student', contact: '+233 20 123 4568', email: 'bob@school.edu', class: 'JHS 1 Science', status: 'Active' },
    { id: 3, name: 'Mr. John Doe', type: 'Staff', contact: '+233 20 123 4569', email: 'john.doe@school.edu', role: 'Teacher', department: 'Science' },
    { id: 4, name: 'Mrs. Jane Smith', type: 'Staff', contact: '+233 20 123 4570', email: 'jane.smith@school.edu', role: 'Teacher', department: 'Languages' },
    { id: 5, name: 'Mr. & Mrs. Johnson', type: 'Parent', contact: '+233 20 123 4571', email: 'johnson@email.com', children: 'Alice Johnson' },
    { id: 6, name: 'Michael Appiah', type: 'TA', contact: '+233 20 123 4572', email: 'michael@school.edu', college: 'University of Education', status: 'Active' }
  ];

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Student': return <Users size={16} />;
      case 'Staff': return <UserCheck size={16} />;
      case 'Parent': return <Heart size={16} />;
      case 'TA': return <UserPlus size={16} />;
      default: return <Users size={16} />;
    }
  };

  const filteredResults = directoryData.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (person.contact && person.contact.includes(searchTerm));
    const matchesType = filterType === 'all' || person.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const handleViewProfile = (person) => {
    setSelectedPerson(person);
  };

  const handleSendMessage = (person) => {
    alert(`Message composer opened for ${person.name}`);
  };

  return (
    <div className="directory-container">
      <div className="global-search">
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Person Directory</h2>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input type="text" className="search-input-large" placeholder="Search by name, email, phone number, or ID..." style={{ paddingLeft: '45px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <Filter size={16} /> <span>Filter by Type:</span>
        <div className="filter-chips" style={{ marginTop: 0 }}>
          <span className={`filter-chip ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>All</span>
          <span className={`filter-chip ${filterType === 'student' ? 'active' : ''}`} onClick={() => setFilterType('student')}>Students</span>
          <span className={`filter-chip ${filterType === 'staff' ? 'active' : ''}`} onClick={() => setFilterType('staff')}>Staff</span>
          <span className={`filter-chip ${filterType === 'parent' ? 'active' : ''}`} onClick={() => setFilterType('parent')}>Parents</span>
          <span className={`filter-chip ${filterType === 'ta' ? 'active' : ''}`} onClick={() => setFilterType('ta')}>TAs</span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <strong>{filteredResults.length} results found</strong>
        </div>
        <div>
          {filteredResults.map(person => (
            <div key={person.id} className="result-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div className="student-avatar" style={{ width: '50px', height: '50px' }}>{person.name.charAt(0)}</div>
                <div><div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{person.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                  {person.type === 'Student' && `${person.class} • ${person.status}`}
                  {person.type === 'Staff' && `${person.role} • ${person.department}`}
                  {person.type === 'Parent' && `Children: ${person.children}`}
                  {person.type === 'TA' && `${person.college} • ${person.status}`}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.25rem' }}><Phone size={12} /> {person.contact} • <Mail size={12} /> {person.email}</div></div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className={`person-type type-${person.type.toLowerCase()}`}>{getTypeIcon(person.type)} {person.type}</span>
                <button className="action-btn edit-btn" onClick={() => handleViewProfile(person)}><Eye size={16} /></button>
                <button className="action-btn archive-btn" onClick={() => handleSendMessage(person)}><MessageSquare size={16} /></button>
              </div>
            </div>
          ))}
          {filteredResults.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>No results found. Try a different search term.</div>}
        </div>
      </div>

      {/* Quick Profile Modal */}
      {selectedPerson && <div className="modal-overlay" onClick={() => setSelectedPerson(null)}><div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{selectedPerson.name}</h2><X className="modal-close" size={20} onClick={() => setSelectedPerson(null)} /></div>
        <div className="modal-body"><div><strong>Type:</strong> {selectedPerson.type}</div><div><strong>Contact:</strong> {selectedPerson.contact}</div><div><strong>Email:</strong> {selectedPerson.email}</div>
        {selectedPerson.type === 'Student' && <><div><strong>Class:</strong> {selectedPerson.class}</div><div><strong>Status:</strong> {selectedPerson.status}</div></>}
        {selectedPerson.type === 'Staff' && <><div><strong>Role:</strong> {selectedPerson.role}</div><div><strong>Department:</strong> {selectedPerson.department}</div></>}</div>
        <div className="modal-footer"><button className="button" onClick={() => setSelectedPerson(null)}>Close</button><button className="button" onClick={() => handleSendMessage(selectedPerson)}><MessageSquare size={16} /> Send Message</button></div>
      </div></div>}
    </div>
  );
}

export default PersonDirectory;