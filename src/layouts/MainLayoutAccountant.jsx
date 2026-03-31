// src/layouts/MainLayoutAccountant.jsx
import React from 'react';
import Navbar from '../components/navbar.jsx';
import Sidebar from '../components/SidebarAccountant.jsx';

const MainLayoutAccountant = ({ children }) => {
  return (
    <div className="app-layout d-flex">
      <AccountantSidebar />
      <div className="main-content flex-grow-1">
        <Navbar />
        <div className="content-wrapper p-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayoutAccountant;