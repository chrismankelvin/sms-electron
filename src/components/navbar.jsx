// // src/components/Navbar.jsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Search, 
//   Bell, 
//   Sun, 
//   Moon, 
//   Menu,
//   X,
//   User,
//   Settings,
//   LogOut,
//   ChevronDown
// } from 'lucide-react';
// import '../../src/styles/Navbar.css';

// const Navbar = ({ sidebarCollapsed, toggleSidebar, isMobile, toggleMobileSidebar }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [notifications, setNotifications] = useState(3);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [showNotifications, setShowNotifications] = useState(false);

//   // Check for saved theme preference
//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme === 'dark') {
//       setIsDarkMode(true);
//       document.body.classList.add('dark-mode');
//     }
//   }, []);

//   const toggleTheme = () => {
//     const newDarkMode = !isDarkMode;
//     setIsDarkMode(newDarkMode);
//     if (newDarkMode) {
//       document.body.classList.add('dark-mode');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       document.body.classList.remove('dark-mode');
//       localStorage.setItem('theme', 'light');
//     }
//   };

//   const handleNotificationClick = () => {
//     setShowNotifications(!showNotifications);
//     if (showUserMenu) setShowUserMenu(false);
//   };

//   const handleUserMenuClick = () => {
//     setShowUserMenu(!showUserMenu);
//     if (showNotifications) setShowNotifications(false);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     window.location.href = '/login';
//   };

//   const handleMarkAllRead = () => {
//     setNotifications(0);
//     setShowNotifications(false);
//   };

//   const notificationsList = [
//     { id: 1, title: 'New student registration', time: '5 min ago', read: false },
//     { id: 2, title: 'Teacher attendance updated', time: '1 hour ago', read: false },
//     { id: 3, title: 'Exam schedule published', time: '3 hours ago', read: false },
//   ];

//   return (
//     <nav className="modern-navbar">
//       {/* Left section */}
//       <div className="navbar-left">
      
//         {/* <button 
//           className="navbar-toggle-btn"
//           onClick={isMobile ? toggleMobileSidebar : toggleSidebar}
//           aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//         >
//           <Menu size={22} />
//         </button> */}

     
//         {/* <div className="navbar-logo">
//           <div className="logo-icon-wrapper">
//             <div className="logo-gradient"></div>
//             <svg className="logo-svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
//               <path d="M16 4L4 12L16 20L28 12L16 4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
//               <path d="M4 20L16 28L28 20" stroke="currentColor" strokeWidth="1.5" fill="none"/>
//               <path d="M4 16L16 24L28 16" stroke="currentColor" strokeWidth="1.5" fill="none"/>
//             </svg>
//           </div>
//           <div className="logo-text">
//             <span className="logo-main">EduManage</span>
//             <span className="logo-sub">Smart School System</span>
//           </div>
//         </div> */}
//       </div>

//       {/* Right section */}
//       <div className="navbar-right">
//         {/* Search Bar */}
//         <div className="search-wrapper">
//           <Search className="search-icon" size={20} />
//           <input 
//             type="text" 
//             className="search-input-modern"
//             placeholder="Search anything..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           {searchQuery && (
//             <button 
//               className="search-clear"
//               onClick={() => setSearchQuery('')}
//             >
//               <X size={16} />
//             </button>
//           )}
//         </div>

//         {/* Notifications Dropdown */}
//         <div className="notification-dropdown-container">
//           <button 
//             className={`notification-btn ${showNotifications ? 'active' : ''}`}
//             onClick={handleNotificationClick}
//           >
//             <Bell size={22} />
//             {notifications > 0 && (
//               <span className="notification-badge-modern">{notifications}</span>
//             )}
//           </button>

//           {showNotifications && (
//         <div className="notifications-dropdown">
//   <div className="dropdown-header-modern">
//     <div>
//       <h3>Notifications</h3>
//       <span className="notif-sub">You have {notifications} new</span>
//     </div>

//     <button className="mark-all-read" onClick={handleMarkAllRead}>
//       Clear
//     </button>
//   </div>

//   <div className="notifications-list">
//     {notificationsList.map(notif => (
//       <div key={notif.id} className={`notification-card ${!notif.read ? 'unread' : ''}`}>
//         <div className="notif-icon"></div>

//         <div className="notif-body">
//           <p className="notif-title">{notif.title}</p>
//           <span className="notif-time">{notif.time}</span>
//         </div>
//       </div>
//     ))}
//   </div>

//   <div className="dropdown-footer-modern">
//     <button>View all notifications</button>
//   </div>
// </div>
//           )}
//         </div>

//         {/* Theme Toggle */}
//         <button 
//           className="theme-toggle-modern" 
//           onClick={toggleTheme}
//           aria-label="Toggle theme"
//         >
//           {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
//         </button>

//         {/* User Menu Dropdown */}
//         <div className="user-menu-container">
//           <button 
//             className={`user-menu-btn ${showUserMenu ? 'active' : ''}`}
//             onClick={handleUserMenuClick}
//           >
//             <div className="user-avatar-small">
//               <img 
//                 src="https://ui-avatars.com/api/?background=3b82f6&color=fff&bold=true&size=32&name=John+Doe" 
//                 alt="User"
//               />
//             </div>
//             <span className="user-name-nav">John Doe</span>
//             <ChevronDown size={16} className={`user-chevron ${showUserMenu ? 'rotated' : ''}`} />
//           </button>

//           {showUserMenu && (
//          <div className="user-dropdown-modern">
//   <div className="user-card">
//     <img 
//       src="https://ui-avatars.com/api/?background=3b82f6&color=fff&bold=true&size=60&name=John+Doe"
//       alt="User"
//     />

//     <div className="user-card-info">
//       <h4>John Doe</h4>
//       <p>Administrator</p>
//       <span>john.doe@school.com</span>
//     </div>
//   </div>

//   <div className="user-actions">
//     <button onClick={() => navigate('/profile')}>
//       <User size={18} /> Profile
//     </button>

//     <button onClick={() => navigate('/settings')}>
//       <Settings size={18} /> Settings
//     </button>

//     <button className="logout" onClick={handleLogout}>
//       <LogOut size={18} /> Logout
//     </button>
//   </div>
// </div>
//           )}
//         </div>
//       </div>

//       {/* Overlay for mobile when dropdowns are open */}
//       {(showNotifications || showUserMenu) && (
//         <div className="dropdown-overlay" onClick={() => {
//           setShowNotifications(false);
//           setShowUserMenu(false);
//         }}></div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../pages/Login/useAuth';

import { useNavigate } from 'react-router-dom';
import '../../src/styles/Navbar.css';

const Navbar = ({ sidebarCollapsed, toggleSidebar, isMobile, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Format role for display
  const formatRole = (role) => {
    if (!role) return '';
    
    const roleMap = {
      'student': 'Student',
      'teacher': 'Teacher',
      'teaching_assistant': 'Teaching Assistant',
      'non_teaching_staff': 'Non-Teaching Staff',
      'administrator': 'Administrator'
    };
    
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.username) {
      return user.username;
    }
    return 'User';
  };

  // Get user email
  const getUserEmail = () => {
    return user?.email || `${user?.username}@school.com`;
  };

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMarkAllRead = () => {
    setNotifications(0);
    setShowNotifications(false);
  };

  const notificationsList = [
    { id: 1, title: 'New student registration', time: '5 min ago', read: false },
    { id: 2, title: 'Teacher attendance updated', time: '1 hour ago', read: false },
    { id: 3, title: 'Exam schedule published', time: '3 hours ago', read: false },
  ];

  // Don't render navbar if not authenticated
  if (!isAuthenticated) return null;

  return (
    <nav className="modern-navbar">
      {/* Left section */}
      <div className="navbar-left">
        {/* You can uncomment this if you want the toggle button */}
        {/* <button 
          className="navbar-toggle-btn"
          onClick={isMobile ? toggleMobileSidebar : toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={22} />
        </button> */}
      </div>

      {/* Right section */}
      <div className="navbar-right">
        {/* Search Bar */}
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input-modern"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="search-clear"
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="notification-dropdown-container">
          <button 
            className={`notification-btn ${showNotifications ? 'active' : ''}`}
            onClick={handleNotificationClick}
          >
            <Bell size={22} />
            {notifications > 0 && (
              <span className="notification-badge-modern">{notifications}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="dropdown-header-modern">
                <div>
                  <h3>Notifications</h3>
                  <span className="notif-sub">You have {notifications} new</span>
                </div>
                <button className="mark-all-read" onClick={handleMarkAllRead}>
                  Clear
                </button>
              </div>

              <div className="notifications-list">
                {notificationsList.map(notif => (
                  <div key={notif.id} className={`notification-card ${!notif.read ? 'unread' : ''}`}>
                    <div className="notif-icon"></div>
                    <div className="notif-body">
                      <p className="notif-title">{notif.title}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dropdown-footer-modern">
                <button>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          className="theme-toggle-modern" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Menu Dropdown */}
        <div className="user-menu-container">
          <button 
            className={`user-menu-btn ${showUserMenu ? 'active' : ''}`}
            onClick={handleUserMenuClick}
          >
            <div className="user-avatar-small">
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt={getUserDisplayName()}
                />
              ) : (
                <div className="avatar-initials" style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {getUserInitials()}
                </div>
              )}
            </div>
            <span className="user-name-nav">{getUserDisplayName()}</span>
            <ChevronDown size={16} className={`user-chevron ${showUserMenu ? 'rotated' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="user-dropdown-modern">
              <div className="user-card">
                {user?.photo_url ? (
                  <img 
                    src={user.photo_url}
                    alt={getUserDisplayName()}
                  />
                ) : (
                  <div className="avatar-large" style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    {getUserInitials()}
                  </div>
                )}

                <div className="user-card-info">
                  <h4>{getUserDisplayName()}</h4>
                  <p>{formatRole(user?.role)}</p>
                  <span>{getUserEmail()}</span>
                </div>
              </div>

              <div className="user-actions">
                <button onClick={() => navigate('/profile')}>
                  <User size={18} /> Profile
                </button>

                <button onClick={() => navigate('/settings')}>
                  <Settings size={18} /> Settings
                </button>

                <button className="logout" onClick={handleLogout}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile when dropdowns are open */}
      {(showNotifications || showUserMenu) && (
        <div className="dropdown-overlay" onClick={() => {
          setShowNotifications(false);
          setShowUserMenu(false);
        }}></div>
      )}
    </nav>
  );
};

export default Navbar;