// src/pages/Unauthorized.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <ShieldAlert size={64} className="text-danger mb-4" />
        <h1 className="display-4">403</h1>
        <h2 className="mb-3">Access Denied</h2>
        <p className="text-muted mb-4">
          You don't have permission to access this page.
        </p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;