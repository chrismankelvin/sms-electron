// src/components/StudentSidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, BookOpen, Calendar, Settings, UserCircle, LogOut,
  ChevronLeft, ChevronRight, GraduationCap, FileText, BarChart3,
  HelpCircle, ChevronDown, Clock, BookCopy, MessageSquare, Award,
  ClipboardList, CalendarDays, Bell, LayoutDashboard, CreditCard,
  School, Mail, TrendingUp, Star, Heart, Sparkles, DollarSign
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
      path: '/student/dashboard',
      subItems: null
    },
    {
      icon: BookOpen,
      label: 'My Courses',
      path: '/student/courses',
      subItems: [
        { icon: BookCopy, label: 'Enrolled Courses', path: '/student/courses/enrolled' },
        { icon: Calendar, label: 'Course Schedule', path: '/student/courses/schedule' },
        { icon: School, label: 'Course Materials', path: '/student/courses/materials' }
      ]
    },
    {
      icon: ClipboardList,
      label: 'Assignments',
      path: '/student/assignments',
      subItems: [
        { icon: FileText, label: 'Pending Assignments', path: '/student/assignments/pending' },
        { icon: Award, label: 'Submitted Work', path: '/student/assignments/submitted' },
        { icon: BarChart3, label: 'Grades', path: '/student/assignments/grades' }
      ]
    },
    {
      icon: CalendarDays,
      label: 'Attendance',
      path: '/student/attendance',
      subItems: [
        { icon: Clock, label: 'Attendance Record', path: '/student/attendance/record' },
        { icon: BarChart3, label: 'Attendance Report', path: '/student/attendance/report' }
      ]
    },
    {
      icon: BarChart3,
      label: 'Grades',
      path: '/student/grades',
      subItems: [
        { icon: TrendingUp, label: 'Current Grades', path: '/student/grades/current' },
        { icon: Award, label: 'Transcript', path: '/student/grades/transcript' },
        { icon: Star, label: 'Performance Report', path: '/student/grades/report' }
      ]
    },
    {
      icon: Calendar,
      label: 'Timetable',
      path: '/student/timetable',
      subItems: [
        { icon: Calendar, label: 'Weekly Schedule', path: '/student/timetable/weekly' },
        { icon: Clock, label: 'Exam Timetable', path: '/student/timetable/exams' }
      ]
    },
    {
      icon: CreditCard,
      label: 'Fees',
      path: '/student/fees',
      subItems: [
        { icon: DollarSign, label: 'Fee Structure', path: '/student/fees/structure' },
        { icon: FileText, label: 'Payment History', path: '/student/fees/history' },
        { icon: Clock, label: 'Outstanding Balance', path: '/student/fees/balance' }
      ]
    },
    {
      icon: Bell,
      label: 'Communications',
      path: '/student/communications',
      subItems: [
        { icon: Bell, label: 'Announcements', path: '/student/communications/announcements' },
        { icon: MessageSquare, label: 'Messages', path: '/student/communications/messages' },
        { icon: Mail, label: 'Notifications', path: '/student/communications/notifications' }
      ]
    }
  ];

  const bottomButtons = [
    { icon: UserCircle, label: 'Profile', path: '/student/profile' },
    { icon: Settings, label: 'Settings', path: '/student/settings' },
    { icon: HelpCircle, label: 'Help', path: '/student/help' },
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
      {/* Sidebar Header with Brand */}
      <div className="sidebar-header">
        <div className="brand-container">
          <div className="brand-icon">
            <GraduationCap size={isCollapsed ? 24 : 28} />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-name">Student Portal</span>
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
      {/* <div className="sidebar-footer">
        <div className="footer-actions">
          {bottomButtons.map((item, index) => (
            <div
              key={index}
              className={`footer-action-btn ${item.isLogout ? 'logout-action' : ''} ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => item.isLogout ? handleLogout() : handleNavigation(item.path)}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </div>
          ))}
        </div>
        
        {!isCollapsed && (
          <div className="sidebar-footer-note">
            <Heart size={12} />
            <span>Student Portal v1.0</span>
          </div>
        )}
      </div> */}
    </aside>
  );
};

export default Sidebar;