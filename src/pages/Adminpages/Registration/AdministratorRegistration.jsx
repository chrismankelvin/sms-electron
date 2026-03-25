// src/components/Registration/AdministratorRegistration.jsx
import React from 'react';
import TeacherRegistration from './TeacherRegistration';

const AdministratorRegistration = ({ onSuccess, onError }) => {
  return (
    <TeacherRegistration 
      onSuccess={onSuccess}
      onError={onError}
      role="admin"
    />
  );
};

export default AdministratorRegistration;