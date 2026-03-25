// src/components/Registration/RegistrationForms.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, GraduationCap, Users, Briefcase, UserCog,
  ArrowLeft, Save, CheckCircle, XCircle
} from 'lucide-react';
import StudentRegistration from './StudentRegistration';
import TeacherRegistration from './TeacherRegistration';
import TeachingAssistantRegistration from './TeachingAssistantRegistration';
import NonStaffRegistration from './NonStaffRegistration';
import AdministratorRegistration from './AdministratorRegistration';
import '../../../styles/RegistrationForms.css';

const RegistrationForms = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const tabs = [
    { id: 'student', label: 'Student', icon: GraduationCap, color: '#3b82f6' },
    { id: 'teacher', label: 'Teacher', icon: Users, color: '#10b981' },
    { id: 'administrator', label: 'Administrator', icon: UserCog, color: '#8b5cf6' },
    { id: 'teaching-assistant', label: 'Teaching Assistant', icon: UserPlus, color: '#f59e0b' },
    { id: 'non-staff', label: 'Non-Teaching Staff', icon: Briefcase, color: '#ef4444' }
  ];

  const handleSuccess = (type, data) => {
    setSuccessMessage(`${type} registered successfully! ID: ${data.id || 'generated'}`);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleError = (error) => {
    console.error('Registration error:', error);
    alert('Registration failed. Please check the form and try again.');
  };

  return (
    <div className="registration-container">
      {/* Header */}
      <div className="registration-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>Registration Forms</h1>
        <p>Register new members to the school management system</p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="success-toast">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="registration-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ '--tab-color': tab.color }}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="registration-content">
        {activeTab === 'student' && (
          <StudentRegistration 
            onSuccess={(data) => handleSuccess('Student', data)}
            onError={handleError}
          />
        )}
        {activeTab === 'teacher' && (
          <TeacherRegistration 
            onSuccess={(data) => handleSuccess('Teacher', data)}
            onError={handleError}
          />
        )}
        {activeTab === 'administrator' && (
          <AdministratorRegistration 
            onSuccess={(data) => handleSuccess('Administrator', data)}
            onError={handleError}
          />
        )}
        {activeTab === 'teaching-assistant' && (
          <TeachingAssistantRegistration 
            onSuccess={(data) => handleSuccess('Teaching Assistant', data)}
            onError={handleError}
          />
        )}
        {activeTab === 'non-staff' && (
          <NonStaffRegistration 
            onSuccess={(data) => handleSuccess('Non-Teaching Staff', data)}
            onError={handleError}
          />
        )}
      </div>
    </div>
  );
};

export default RegistrationForms;