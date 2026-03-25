

// src/layouts/MainLayout.jsx
import Navbar from "../components/navbar.jsx";
import Sidebar from "../components/SidebarTA.jsx";
import { useState } from "react";

function MainLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app">
      <Navbar toggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <div className="content-wrapper">
        <Sidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;