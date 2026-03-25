// src/components/TeacherSidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Users, BookOpen, Calendar, Settings, UserCircle, LogOut,
  ChevronLeft, ChevronRight, GraduationCap, FileText, BarChart3,
  HelpCircle, ChevronDown, Clock, BookCopy, MessageSquare, Award,TrendingUp,
  ClipboardList, UserCheck, CalendarDays, Bell, LayoutDashboard,
  NotebookPen, School, Mail, Megaphone, CreditCard
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);

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
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/teacher/dashboard',
      subItems: null
    },
    {
      icon: Users,
      label: 'My Classes',
      path: '/teacher/classes',
      subItems: [
        { icon: School, label: 'View Classes', path: '/teacher/classes/view' },
        { icon: Users, label: 'Class Roster', path: '/teacher/classes/roster' },
        { icon: ClipboardList, label: 'Subject Registration', path: '/teacher/classes/subjects' }
      ]
    },
    {
      icon: CalendarDays,
      label: 'Attendance',
      path: '/teacher/attendance',
      subItems: [
        { icon: UserCheck, label: 'Take Attendance', path: '/teacher/attendance/take' },
        { icon: BarChart3, label: 'Attendance Reports', path: '/teacher/attendance/reports' }
      ]
    },
    {
      icon: NotebookPen,
      label: 'Assignments',
      path: '/teacher/assignments',
      subItems: [
        { icon: FileText, label: 'Create Assignment', path: '/teacher/assignments/create' },
        { icon: BookOpen, label: 'Grade Assignments', path: '/teacher/assignments/grade' },
        { icon: Award, label: 'View Submissions', path: '/teacher/assignments/submissions' }
      ]
    },
    {
      icon: BarChart3,
      label: 'Grade Management',
      path: '/teacher/grades',
      subItems: [
        { icon: ClipboardList, label: 'Enter Grades', path: '/teacher/grades/enter' },
        { icon: BarChart3, label: 'Grade Reports', path: '/teacher/grades/reports' },
        { icon: TrendingUp, label: 'Student Performance', path: '/teacher/grades/performance' }
      ]
    },
    {
      icon: Calendar,
      label: 'Schedule',
      path: '/teacher/schedule',
      subItems: [
        { icon: Calendar, label: 'Timetable', path: '/teacher/schedule/timetable' },
        { icon: Clock, label: 'Exam Schedule', path: '/teacher/schedule/exams' }
      ]
    },
    {
      icon: Megaphone,
      label: 'Communications',
      path: '/teacher/communications',
      subItems: [
        { icon: Bell, label: 'Announcements', path: '/teacher/communications/announcements' },
        { icon: MessageSquare, label: 'Messages', path: '/teacher/communications/messages' },
        { icon: Mail, label: 'Parent Notifications', path: '/teacher/communications/parents' }
      ]
    },
    {
      icon: CreditCard,
      label: 'Welfare',
      path: '/teacher/welfare',
      subItems: [
        { icon: Clock, label: 'Welfare Payment', path: '/teacher/welfare/payment' },
        { icon: School, label: 'ID Card Request', path: '/teacher/welfare/id-card' }
      ]
    }
  ];

  const bottomButtons = [
    { icon: UserCircle, label: 'Profile', path: '/teacher/profile' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help', path: '/teacher/help' },
    { icon: LogOut, label: 'Logout', path: '/logout', isLogout: true }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const sidebar = document.querySelector('.modern-sidebar');
      if (!sidebar) return;
      if (!sidebar.contains(e.target) && !isCollapsed) {
        toggleSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCollapsed, toggleSidebar]);

  return (
    <aside className={`modern-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="brand-container">
          <div className="brand-icon">
            <GraduationCap size={isCollapsed ? 24 : 28} />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-name">Teacher Portal</span>
              <span className="brand-tagline">EduManage</span>
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
                  if (isCollapsed) {
                    toggleSidebar();
                    return;
                  }
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
        {!isCollapsed && (
          <div className="sidebar-footer-note">
            <span>Teacher Portal v1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;