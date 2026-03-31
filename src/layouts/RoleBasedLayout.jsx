// src/layouts/RoleBasedLayout.jsx
import React from 'react';
import { useAuth } from '../pages/Login/useAuth';
import MainLayout from './MainLayout';
import MainLayoutTeacher from './MainLayoutTeacher';
import MainLayoutTA from './MainLayoutTA';
import MainLayoutStudent from './MainLayoutStudent';
import MainLayoutAccountant from './MainLayoutAccountant' ;
import MainLayoutNonStaff from './MainLayoutNonStaff';

const RoleBasedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  console.log('🎭 RoleBasedLayout - User role:', user.role);
  console.log('🎭 RoleBasedLayout - Original role:', user.original_role);

  // Select layout based on normalized user role
  switch (user.role) {
    case 'student':
      console.log('📚 Using Student Layout');
      return <MainLayoutStudent>{children}</MainLayoutStudent>;
    
    case 'teacher':
      console.log('👨‍🏫 Using Teacher Layout');
      return <MainLayoutTeacher>{children}</MainLayoutTeacher>;

    case 'staff':
      console.log('👨‍🏫 Using Teacher Layout');
      return <MainLayoutTeacher>{children}</MainLayoutTeacher>;
    
    case 'teaching_assistant':
      console.log('👨‍🎓 Using Teaching Assistant Layout');
      return <MainLayoutTA>{children}</MainLayoutTA>;
    
    case 'non_teaching_staff':
      console.log('📋 Using Non-Teaching Staff Layout');
      return <MainLayoutNonStaff>{children}</MainLayoutNonStaff>;

    case 'non_staff':
      console.log('📋 Using Non-Teaching Staff Layout');
      return <MainLayoutNonStaff>{children}</MainLayoutNonStaff>;

    case 'accountant':  // ← ADD THIS CASE
      return <MainLayoutAccountant>{children}</MainLayoutAccountant>;
    
    case 'administrator':
      console.log('👔 Using Administrator Layout');
      return <MainLayout>{children}</MainLayout>;
    
    default:
      console.warn('⚠️ Unknown role:', user.role, 'using default layout');
      return <MainLayout>{children}</MainLayout>;
  }
};

export default RoleBasedLayout;