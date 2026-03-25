// src/components/TeachingAssistantSidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, BookOpen, Calendar, Settings, UserCircle, LogOut,
  ChevronLeft, ChevronRight, GraduationCap, FileText, BarChart3,
  HelpCircle, ChevronDown, Clock, BookCopy, MessageSquare, Award,
  ClipboardList, CalendarDays, Bell, LayoutDashboard, School,
  Mail, TrendingUp, Star, Heart, Sparkles, Users, CheckSquare,
  UserCheck, NotebookPen, Eye, PenTool, Clipboard
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
      path: '/ta/dashboard',
      subItems: null
    },
    {
      icon: Users,
      label: 'Assigned Classes',
      path: '/ta/classes',
      subItems: [
        { icon: School, label: 'My Classes', path: '/ta/classes/my-classes' },
        { icon: Users, label: 'Class Roster', path: '/ta/classes/roster' },
        { icon: Clipboard, label: 'Assigned Subjects', path: '/ta/classes/subjects' }
      ]
    },
    {
      icon: NotebookPen,
      label: 'Assignments',
      path: '/ta/assignments',
      subItems: [
        { icon: PenTool, label: 'Create Assignments', path: '/ta/assignments/create' },
        { icon: Eye, label: 'View Submissions', path: '/ta/assignments/submissions' },
        { icon: CheckSquare, label: 'Grade Assignments', path: '/ta/assignments/grade' },
        { icon: Award, label: 'Assignment Results', path: '/ta/assignments/results' }
      ]
    },
    {
      icon: CalendarDays,
      label: 'Attendance',
      path: '/ta/attendance',
      subItems: [
        { icon: UserCheck, label: 'Take Attendance', path: '/ta/attendance/take' },
        { icon: BarChart3, label: 'Attendance Reports', path: '/ta/attendance/reports' },
        { icon: Clock, label: 'Late Arrivals', path: '/ta/attendance/late' }
      ]
    },
    {
      icon: BarChart3,
      label: 'Student Performance',
      path: '/ta/performance',
      subItems: [
        { icon: TrendingUp, label: 'Grade Monitoring', path: '/ta/performance/grades' },
        { icon: Star, label: 'Progress Reports', path: '/ta/performance/progress' },
        { icon: Award, label: 'Student Achievements', path: '/ta/performance/achievements' }
      ]
    },
    {
      icon: Calendar,
      label: 'Schedule',
      path: '/ta/schedule',
      subItems: [
        { icon: Calendar, label: 'Teaching Schedule', path: '/ta/schedule/teaching' },
        { icon: Clock, label: 'Office Hours', path: '/ta/schedule/office-hours' },
        { icon: CalendarDays, label: 'Exam Schedule', path: '/ta/schedule/exams' }
      ]
    },
    {
      icon: FileText,
      label: 'Resources',
      path: '/ta/resources',
      subItems: [
        { icon: BookCopy, label: 'Course Materials', path: '/ta/resources/course-materials' },
        { icon: FileText, label: 'Lesson Plans', path: '/ta/resources/lesson-plans' },
        { icon: School, label: 'Reference Materials', path: '/ta/resources/references' }
      ]
    },
    {
      icon: Bell,
      label: 'Communications',
      path: '/ta/communications',
      subItems: [
        { icon: Bell, label: 'Announcements', path: '/ta/communications/announcements' },
        { icon: MessageSquare, label: 'Messages', path: '/ta/communications/messages' },
        { icon: Mail, label: 'Parent Communication', path: '/ta/communications/parents' }
      ]
    }
  ];

  const bottomButtons = [
    { icon: UserCircle, label: 'Profile', path: '/ta/profile' },
    { icon: Settings, label: 'Settings', path: '/ta/settings' },
    { icon: HelpCircle, label: 'Help', path: '/ta/help' },
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
              <span className="brand-name">Teaching Assistant Portal</span>
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
            <span>Teaching Assistant Portal v1.0</span>
          </div>
        )}
      </div> */}
    </aside>
  );
};

export default Sidebar;