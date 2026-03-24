// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Users, BookOpen, Calendar, Settings, UserCircle, LogOut,
  ChevronLeft, ChevronRight, GraduationCap, FileText, BarChart3,
  HelpCircle, ChevronDown, Eye, RefreshCw, Users2, Layout,
  UserCheck, School,Clock , BookCopy, BarChart, MessageSquare, Award,
  FileSpreadsheet, Briefcase, Sparkles, TrendingUp, Layers,
  Gift, Target, Zap, Shield, Cloud, Star,UserCog, Heart
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeTheme, setActiveTheme] = useState('default');

  const toggleSubMenu = (menuLabel) => {
    if (isCollapsed) return;
    setExpandedMenus(prev => ({
      ...prev,
      [menuLabel]: !prev[menuLabel]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
      subItems: null,
      gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
    },
    {
      icon: Eye,
      label: 'View',
      path: '/view',
      subItems: [
        { icon: Users, label: 'Teacher', path: '/view/teachers' },
        { icon: School, label: 'Student', path: '/view/students' },
        { icon: Briefcase, label: 'Temporary Staff', path: '/view/temporary-staff' },
        { icon: Users2, label: 'Non Staff', path: '/view/non-staff' },
        { icon: BookOpen, label: 'Course', path: '/view/courses' },
        { icon: BookCopy, label: 'Subjects', path: '/view/subjects' }
      ],
      gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)'
    },
    { 
      icon: Layout, 
      label: 'Class Management', 
      path: '/class-management',
      subItems: [
        { icon: Layout, label: 'Course Layout', path: '/class-management/course-layout' },
        { icon: Users, label: 'Class List', path: '/class-management/class-list' },
        { icon: UserCheck, label: 'Promotion', path: '/class-management/promotion' },
        { icon: Users2, label: 'Assign Class', path: '/class-management/assign-class' }
      ],
      gradient: 'linear-gradient(135deg, #8b5cf6, #ec489a)'
    },
    {
      icon: FileText,
      label: 'Registration',
      path: '/registration',
      subItems: [
        { icon: Users, label: 'Teacher', path: '/registration/teachers' },
        { icon: School, label: 'Student', path: '/registration/students' },
        { icon: UserCog, label: 'Administrator', path: '/registration/administrators' },
        { icon: Briefcase, label: 'Non Staff', path: '/registration/non-staff' },
        { icon: School, label: 'Teaching Assistant', path: '/registration/teaching-assistants' },
        { icon: BookOpen, label: 'Course', path: '/registration/courses' },
        { icon: Layout, label: 'Class', path: '/registration/classes' },
        { icon: BookCopy, label: 'Subject', path: '/registration/subjects' },
        { icon: FileSpreadsheet, label: 'Records', path: '/registration/records' }
      ],
      gradient: 'linear-gradient(135deg, #10b981, #3b82f6)'
    },
    { 
      icon: Calendar, 
      label: 'Schedule', 
      path: '/schedule',
      subItems: [
        { icon: Clock, label: 'Semester', path: '/schedule/semester' },
        { icon: Calendar, label: 'Year', path: '/schedule/year' }
      ],
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)'
    },
    { 
      icon: RefreshCw, 
      label: 'Migrations', 
      path: '/migrations',
      subItems: [
        { icon: School, label: 'Student', path: '/migrations/students' },
        { icon: Users, label: 'Teacher', path: '/migrations/teachers' },
        { icon: Layout, label: 'Class', path: '/migrations/classes' },
        { icon: Calendar, label: 'Batch', path: '/migrations/batches' }
      ],
      gradient: 'linear-gradient(135deg, #ef4444, #f59e0b)'
    },
    {
      icon: School,
      label: 'Miscellaneous',
      path: '/miscellaneous',
      subItems: [
        { icon: UserCheck, label: 'Teacher Attendance', path: '/miscellaneous/teacher-attendance' },
        { icon: MessageSquare, label: 'Reception/Chats', path: '/miscellaneous/reception' },
        { icon: MessageSquare, label: 'Notifications', path: '/miscellaneous/notifications' },
        { icon: MessageSquare, label: 'Announcements', path: '/miscellaneous/announcements' },
        { icon: Award, label: 'Results', path: '/miscellaneous/results' },
        { icon: FileText, label: 'Transcript', path: '/miscellaneous/transcripts' }
      ],
      gradient: 'linear-gradient(135deg, #8b5cf6, #ec489a)'
    },
    {
      icon: BarChart,
      label: 'Statistics',
      path: '/statistics',
      subItems: [
        { icon: Users, label: 'Staff', path: '/statistics/staff' },
        { icon: Briefcase, label: 'Non Staff', path: '/statistics/non-staff' },
        { icon: Users, label: 'Temporary Staff', path: '/statistics/temporary-staff' },
        { icon: School, label: 'Students', path: '/statistics/students' },
        { icon: BookOpen, label: 'Course/Subjects', path: '/statistics/courses-subjects' },
        { icon: MessageSquare, label: 'Suggestion', path: '/statistics/suggestions' }
      ],
      gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)'
    }
  ];

  const bottomButtons = [
    { icon: UserCircle, label: 'Profile', path: '/profile', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
    { icon: Settings, label: 'Settings', path: '/settings', gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)' },
    { icon: HelpCircle, label: 'Help', path: '/help', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
    { icon: LogOut, label: 'Logout', path: '/logout', isLogout: true, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


useEffect(() => {
  const handleClickOutside = (e) => {
    const sidebar = document.querySelector('.modern-sidebar');

    if (!sidebar) return;

    if (!sidebar.contains(e.target) && !isCollapsed) {
      toggleSidebar(); // collapse it
    }
  };

  document.addEventListener('mousedown', handleClickOutside);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isCollapsed, toggleSidebar]);


  return (
    <aside className={`modern-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header with Brand */}
      <div className="sidebar-header">
        <div className="brand-container">
          <div className="brand-icon">
            <Sparkles size={isCollapsed ? 24 : 28} />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-name">EduManage</span>
              <span className="brand-tagline">Smart School System</span>
            </div>
          )}
        </div>
       
      </div>
       <button 
          className="toggle-btn-floating" 
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

      {/* User Profile Section */}
      {/* {!isCollapsed && (
        <div className="user-profile-section">
          <div className="user-avatar">
            <img 
              src="https://ui-avatars.com/api/?background=3b82f6&color=fff&bold=true&size=40&name=Admin" 
              alt="User" 
              className="avatar-image"
            />
            <div className="online-status"></div>
          </div>
          <div className="user-info">
            <h4 className="user-name">John Doe</h4>
            <p className="user-role">Administrator</p>
          </div>
        </div>
      )} */}

      {/* Main Navigation */}
      <nav className="modern-sidebar-nav">
        <ul className="modern-nav-list">
          {menuItems.map((item, index) => (
            <li key={index} className="modern-nav-item">
              <div 
                className={`modern-nav-link ${isActive(item.path) ? 'active' : ''} ${expandedMenus[item.label] ? 'expanded' : ''}`}
                data-label={item.label}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
  // If collapsed → expand first
  if (isCollapsed) {
    toggleSidebar();
    return;
  }

  // Normal behavior
  if (item.subItems) {
    toggleSubMenu(item.label);
  } else {
    handleNavigation(item.path);
  }
}}  
              >
                <div className="nav-icon-container">
                  <item.icon size={20} className="nav-icon-modern" />
                  {isActive(item.path) && <div className="icon-glow"></div>}
                </div>
                
                {!isCollapsed && (
                  <>
                    <span className="nav-label-modern">{item.label}</span>
                    {item.subItems && (
                      <div className={`nav-chevron-modern ${expandedMenus[item.label] ? 'rotated' : ''}`}>
                        <ChevronDown size={16} />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Submenu */}
              {!isCollapsed && item.subItems && expandedMenus[item.label] && (
                <div className="submenu-modern-container">
                  <ul className="submenu-modern">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex} className="submenu-modern-item">
                        <div 
                          className={`submenu-modern-link ${isActive(subItem.path) ? 'active' : ''}`}
                          onClick={() => handleNavigation(subItem.path)}
                        >
                          <div className="submenu-icon-modern">
                            <subItem.icon size={16} />
                          </div>
                          <span className="submenu-label-modern">{subItem.label}</span>
                          {isActive(subItem.path) && <div className="active-dot"></div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        <div className="footer-actions">
          {/* {bottomButtons.map((item, index) => (
            <div
              key={index}
              className={`footer-action-btn ${item.isLogout ? 'logout-action' : ''} ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => item.isLogout ? handleLogout() : handleNavigation(item.path)}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </div>
          ))} */}
        </div>
        
        {!isCollapsed && (
          <div className="sidebar-footer-note">
            <Heart size={12} />
            <span>v2.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;