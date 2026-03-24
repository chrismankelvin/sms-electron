// import Navbar from "../components/navbar";
// import { useState } from "react";
// import Sidebar from "../components/sidebar";

// function MainLayout({ children, containerClass = "", showSidebar = true }) {
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   const toggleSidebar = () => {
//     setSidebarCollapsed(!sidebarCollapsed);
//   };

//   return (
//     <div className="app">
//       <Navbar toggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
//       <div className="content-wrapper">
//         {showSidebar && (
//           <Sidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
//         )}
//         <main className={`main-content ${!showSidebar ? 'full-width' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
//           <div className={`container ${containerClass}`}>
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default MainLayout;


// src/layouts/MainLayout.jsx
import Navbar from "../components/navbar.jsx";
import Sidebar from "../components/sidebar.jsx";
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