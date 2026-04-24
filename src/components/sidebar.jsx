// // src/components/Sidebar.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { 
//   Home, Users, BookOpen, Calendar, Settings, UserCircle, LogOut,
//   ChevronLeft, ChevronRight, GraduationCap, FileText, BarChart3,
//   HelpCircle, ChevronDown, Eye, RefreshCw, Users2, Layout,
//   UserCheck, School,Clock , BookCopy, BarChart, MessageSquare, Award,
//   FileSpreadsheet, Briefcase, Sparkles, TrendingUp, Layers,
//   Gift, Target, Zap, Shield, Cloud, Star,UserCog, Heart
// } from 'lucide-react';
// import '../styles/Sidebar.css';

// const Sidebar = ({ isCollapsed, toggleSidebar }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [expandedMenus, setExpandedMenus] = useState({});
//   const [hoveredItem, setHoveredItem] = useState(null);
//   const [activeTheme, setActiveTheme] = useState('default');

//   const toggleSubMenu = (menuLabel) => {
//     if (isCollapsed) return;
//     setExpandedMenus(prev => ({
//       ...prev,
//       [menuLabel]: !prev[menuLabel]
//     }));
//   };

//   const isActive = (path) => {
//     return location.pathname === path || location.pathname.startsWith(path + '/');
//   };

//   const handleNavigation = (path) => {
//     navigate(path);
//   };

//   const menuItems = [
//     {
//       icon: Home,
//       label: 'Dashboard',
//       path: '/dashboard',
//       subItems: null,
//       gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
//     },
//     {
//       icon: Eye,
//       label: 'View',
//       path: '/view',
//       subItems: [
//         { icon: Users, label: 'Teacher', path: '/view/teachers' },
//         { icon: School, label: 'Student', path: '/view/students' },
//         { icon: Briefcase, label: 'Temporary Staff', path: '/view/temporary-staff' },
//         { icon: Users2, label: 'Non Staff', path: '/view/non-staff' },
//         { icon: BookOpen, label: 'Course', path: '/view/courses' },
//         { icon: BookCopy, label: 'Subjects', path: '/view/subjects' }
//       ],
//       gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)'
//     },
//     { 
//       icon: Layout, 
//       label: 'Class Management', 
//       path: '/class-management',
//       subItems: [
//         { icon: Layout, label: 'Course Layout', path: '/class-management/course-layout' },
//         { icon: Users, label: 'Class List', path: '/class-management/class-list' },
//         { icon: UserCheck, label: 'Promotion', path: '/class-management/promotion' },
//         { icon: Users2, label: 'Assign Class', path: '/class-management/assign-class' }
//       ],
//       gradient: 'linear-gradient(135deg, #8b5cf6, #ec489a)'
//     },
//     {
//       icon: FileText,
//       label: 'Registration',
//       path: '/registration',
//       subItems: [
//         { icon: Users, label: 'Teacher', path: '/registration/teachers' },
//         { icon: School, label: 'Student', path: '/registration/students' },
//         { icon: UserCog, label: 'Administrator', path: '/registration/administrators' },
//         { icon: Briefcase, label: 'Non Staff', path: '/registration/non-staff' },
//         { icon: School, label: 'Teaching Assistant', path: '/registration/teaching-assistants' },
//         { icon: FileSpreadsheet, label: 'Accountant', path: '/registration/accountant' },
//         { icon: BookOpen, label: 'Course', path: '/registration/courses' },
//         { icon: Layout, label: 'Class', path: '/registration/classes' },
//         { icon: BookCopy, label: 'Subject', path: '/registration/subjects' },
//         { icon: FileSpreadsheet, label: 'Records', path: '/registration/records' }
//       ],
//       gradient: 'linear-gradient(135deg, #10b981, #3b82f6)'
//     },
//     { 
//       icon: Calendar, 
//       label: 'Schedule', 
//       path: '/schedule',
//       subItems: [
//         { icon: Clock, label: 'Semester', path: '/schedule/semester' },
//         { icon: Calendar, label: 'Year', path: '/schedule/year' }
//       ],
//       gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)'
//     },
//     { 
//       icon: RefreshCw, 
//       label: 'Migrations', 
//       path: '/migrations',
//       subItems: [
//         { icon: School, label: 'Student', path: '/migrations/students' },
//         { icon: Users, label: 'Teacher', path: '/migrations/teachers' },
//         { icon: Layout, label: 'Class', path: '/migrations/classes' },
//         { icon: Calendar, label: 'Batch', path: '/migrations/batches' }
//       ],
//       gradient: 'linear-gradient(135deg, #ef4444, #f59e0b)'
//     },
//     {
//       icon: School,
//       label: 'Miscellaneous',
//       path: '/miscellaneous',
//       subItems: [
//         { icon: UserCheck, label: 'Teacher Attendance', path: '/miscellaneous/teacher-attendance' },
//         { icon: MessageSquare, label: 'Reception/Chats', path: '/miscellaneous/reception' },
//         { icon: MessageSquare, label: 'Notifications', path: '/miscellaneous/notifications' },
//         { icon: MessageSquare, label: 'Announcements', path: '/miscellaneous/announcements' },
//         { icon: Award, label: 'Results', path: '/miscellaneous/results' },
//         { icon: FileText, label: 'Transcript', path: '/miscellaneous/transcripts' }
//       ],
//       gradient: 'linear-gradient(135deg, #8b5cf6, #ec489a)'
//     },
//     {
//       icon: BarChart,
//       label: 'Statistics',
//       path: '/statistics',
//       subItems: [
//         { icon: Users, label: 'Staff', path: '/statistics/staff' },
//         { icon: Briefcase, label: 'Non Staff', path: '/statistics/non-staff' },
//         { icon: Users, label: 'Temporary Staff', path: '/statistics/temporary-staff' },
//         { icon: School, label: 'Students', path: '/statistics/students' },
//         { icon: BookOpen, label: 'Course/Subjects', path: '/statistics/courses-subjects' },
//         { icon: MessageSquare, label: 'Suggestion', path: '/statistics/suggestions' }
//       ],
//       gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)'
//     }
//   ];

//   const bottomButtons = [
//     { icon: UserCircle, label: 'Profile', path: '/profile', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
//     { icon: Settings, label: 'Settings', path: '/settings', gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)' },
//     { icon: HelpCircle, label: 'Help', path: '/help', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
//     { icon: LogOut, label: 'Logout', path: '/logout', isLogout: true, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' }
//   ];

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/login');
//   };


// useEffect(() => {
//   const handleClickOutside = (e) => {
//     const sidebar = document.querySelector('.modern-sidebar');

//     if (!sidebar) return;

//     if (!sidebar.contains(e.target) && !isCollapsed) {
//       toggleSidebar(); // collapse it
//     }
//   };

//   document.addEventListener('mousedown', handleClickOutside);

//   return () => {
//     document.removeEventListener('mousedown', handleClickOutside);
//   };
// }, [isCollapsed, toggleSidebar]);


//   return (
//     <aside className={`modern-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
//       {/* Sidebar Header with Brand */}
//       <div className="sidebar-header">
//         <div className="brand-container">
//           <div className="brand-icon">
//             <Sparkles size={isCollapsed ? 24 : 28} />
//           </div>
//           {!isCollapsed && (
//             <div className="brand-text">
//               <span className="brand-name">EduManage</span>
//               <span className="brand-tagline">Smart School System</span>
//             </div>
//           )}
//         </div>
       
//       </div>
//        <button 
//           className="toggle-btn-floating" 
//           onClick={toggleSidebar}
//           aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//         >
//           {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
//         </button>

//       {/* User Profile Section */}
//       {/* {!isCollapsed && (
//         <div className="user-profile-section">
//           <div className="user-avatar">
//             <img 
//               src="https://ui-avatars.com/api/?background=3b82f6&color=fff&bold=true&size=40&name=Admin" 
//               alt="User" 
//               className="avatar-image"
//             />
//             <div className="online-status"></div>
//           </div>
//           <div className="user-info">
//             <h4 className="user-name">John Doe</h4>
//             <p className="user-role">Administrator</p>
//           </div>
//         </div>
//       )} */}

//       {/* Main Navigation */}
//       <nav className="modern-sidebar-nav">
//         <ul className="modern-nav-list">
//           {menuItems.map((item, index) => (
//             <li key={index} className="modern-nav-item">
//               <div 
//                 className={`modern-nav-link ${isActive(item.path) ? 'active' : ''} ${expandedMenus[item.label] ? 'expanded' : ''}`}
//                 data-label={item.label}
//                 onMouseEnter={() => setHoveredItem(item.label)}
//                 onMouseLeave={() => setHoveredItem(null)}
//               onClick={() => {
//   // If collapsed → expand first
//   if (isCollapsed) {
//     toggleSidebar();
//     return;
//   }

//   // Normal behavior
//   if (item.subItems) {
//     toggleSubMenu(item.label);
//   } else {
//     handleNavigation(item.path);
//   }
// }}  
//               >
//                 <div className="nav-icon-container">
//                   <item.icon size={20} className="nav-icon-modern" />
//                   {isActive(item.path) && <div className="icon-glow"></div>}
//                 </div>
                
//                 {!isCollapsed && (
//                   <>
//                     <span className="nav-label-modern">{item.label}</span>
//                     {item.subItems && (
//                       <div className={`nav-chevron-modern ${expandedMenus[item.label] ? 'rotated' : ''}`}>
//                         <ChevronDown size={16} />
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>

//               {/* Submenu */}
//               {!isCollapsed && item.subItems && expandedMenus[item.label] && (
//                 <div className="submenu-modern-container">
//                   <ul className="submenu-modern">
//                     {item.subItems.map((subItem, subIndex) => (
//                       <li key={subIndex} className="submenu-modern-item">
//                         <div 
//                           className={`submenu-modern-link ${isActive(subItem.path) ? 'active' : ''}`}
//                           onClick={() => handleNavigation(subItem.path)}
//                         >
//                           <div className="submenu-icon-modern">
//                             <subItem.icon size={16} />
//                           </div>
//                           <span className="submenu-label-modern">{subItem.label}</span>
//                           {isActive(subItem.path) && <div className="active-dot"></div>}
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* Bottom Actions */}
//       <div className="sidebar-footer">
//         <div className="footer-actions">
//           {/* {bottomButtons.map((item, index) => (
//             <div
//               key={index}
//               className={`footer-action-btn ${item.isLogout ? 'logout-action' : ''} ${isActive(item.path) ? 'active' : ''}`}
//               onClick={() => item.isLogout ? handleLogout() : handleNavigation(item.path)}
//             >
//               <item.icon size={20} />
//               {!isCollapsed && <span>{item.label}</span>}
//             </div>
//           ))} */}
//         </div>
        
//         {!isCollapsed && (
//           <div className="sidebar-footer-note">
//             <Heart size={12} />
//             <span>v2.0.0</span>
//           </div>
//         )}
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;









// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  // Dashboard & Core
  Home, Layout, Settings, UserCircle, LogOut, HelpCircle, ChevronLeft, 
  ChevronRight, ChevronDown, Heart, Sparkles,
  
  // People Management
  Users, UserPlus, UserCheck, UserCog, Users2, Briefcase, GraduationCap, Shield,
  
  // Academic Structure
  School, BookOpen, BookCopy, Layers, TrendingUp, Target, Award,
  
  // Class & Timetable
  Calendar, Clock, Table, DoorOpen, Repeat,Upload,
  
  // Assessment & Results
  FileText, BarChart3, BarChart, FileSpreadsheet, Printer, Download,
  Trophy, ClipboardList,
  
  // Attendance
  CheckCircle, XCircle, Clock as ClockIcon,
  
  // Communication
  MessageSquare, Bell, Mail, Send,
  
  // Progression
  ArrowRightCircle, History, TrendingDown,
  
  // System
  Database, Cloud, Lock, Activity, RefreshCw, Eye,
  Gift, Zap, Shield as ShieldIcon
  
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    // ==================== SECTION 1: DASHBOARD ====================
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
      subItems: null,
      section: 'main'
    },

    // ==================== SECTION 2: SCHOOL SETUP ====================
    {
      icon: School,
      label: 'School Setup',
      path: '/school-setup',
      subItems: [
        { icon: UserCheck, label: 'School Profile', path: '/school-setup/profile' },
        { icon: Calendar, label: 'Academic Years', path: '/school-setup/academic-years' },
        { icon: Clock, label: 'Terms', path: '/school-setup/terms' },
        { icon: Layers, label: 'Levels (JHS/SHS)', path: '/school-setup/levels' },
        { icon: Target, label: 'Programmes', path: '/school-setup/programmes' },
        { icon: Award, label: 'Grade Boundaries', path: '/school-setup/grade-boundaries' },
        { icon: ClipboardList, label: 'Assessment Types', path: '/school-setup/assessment-types' }
      ],
      section: 'setup'
    },

    // ==================== SECTION 3: ACADEMIC STRUCTURE ====================
    {
      icon: BookOpen,
      label: 'Academic Structure',
      path: '/academic',
      subItems: [
        { icon: Layout, label: 'Classes', path: '/academic/classes' },
        { icon: Users2, label: 'Sections', path: '/academic/sections' },
        { icon: BookCopy, label: 'Subjects', path: '/academic/subjects' },
        { icon: TrendingUp, label: 'Level Core Subjects', path: '/academic/level-core-subjects' },
        { icon: Target, label: 'Programme Subjects', path: '/academic/programme-subjects' },
        { icon: UserCheck, label: 'Teacher Qualifications', path: '/academic/teacher-qualifications' }
      ],
      section: 'academic'
    },

    // ==================== SECTION 4: PEOPLE MANAGEMENT ====================
    {
      icon: Users,
      label: 'People Management',
      path: '/people',
      subItems: [
        { icon: GraduationCap, label: 'Students', path: '/people/students' },
        { icon: UserCheck, label: 'Staff (Teachers)', path: '/people/staff' },
             { icon: Users2, label: 'Administrator', path: '/people/administrator' },
        { icon: Briefcase, label: 'Teaching Assistants', path: '/people/teaching-assistants' },
        { icon: Users2, label: 'Non-Staff', path: '/people/non-staff' },
        { icon: UserCheck, label: 'Parents/Guardians', path: '/people/parents' },
        { icon: UserCircle, label: 'Person Directory', path: '/people/directory' }
      ],
      section: 'people'
    },

    // ==================== SECTION 5: CLASS & TIMETABLE ====================
    {
      icon: Calendar,
      label: 'Timetable',
      path: '/timetable',
      subItems: [
        { icon: Clock, label: 'Time Slots', path: '/timetable/time-slots' },
        { icon: Calendar, label: 'Week Days', path: '/timetable/week-days' },
        { icon: DoorOpen, label: 'Rooms', path: '/timetable/rooms' },
        { icon: Table, label: 'Timetable Builder', path: '/timetable/builder' },
        { icon: Eye, label: 'View Timetable', path: '/timetable/view' },
        { icon: Repeat, label: 'Copy from Previous', path: '/timetable/copy' }
      ],
      section: 'timetable'
    },

    // ==================== SECTION 6: TEACHER ASSIGNMENT ====================
    {
      icon: UserCheck,
      label: 'Teacher Assignment',
      path: '/teacher-assignments',
      subItems: [
        { icon: BookOpen, label: 'Assign Subjects', path: '/teacher-assignments/subjects' },
        { icon: Layout, label: 'Assign Form Masters', path: '/teacher-assignments/form-masters' },
        { icon: BarChart3, label: 'Workload Analysis', path: '/teacher-assignments/workload' }
      ],
      section: 'teaching' 
    },

    // ==================== SECTION 7: ASSESSMENT & RESULTS ====================
    {
      icon: FileText,
      label: 'Assessment & Results',
      path: '/assessment',
      subItems: [
        { icon: ClipboardList, label: 'Manage Assessments', path: '/assessment/assessments' },
        { icon: FileSpreadsheet, label: 'Enter Scores', path: '/assessment/score-entry' },
        { icon: Upload, label: 'Bulk Score Import', path: '/assessment/bulk-import' },
        { icon: BarChart3, label: 'Process Results', path: '/assessment/process-results' },
        { icon: Award, label: 'Subject Results', path: '/assessment/subject-results' },
        { icon: Trophy, label: 'Term Results', path: '/assessment/term-results' },
        { icon: Printer, label: 'Report Cards', path: '/assessment/report-cards' },
        { icon: Download, label: 'Transcripts', path: '/assessment/transcripts' },
        { icon: BarChart, label: 'Grade Analysis', path: '/assessment/grade-analysis' }
      ],
      section: 'assessment'
    },

    // ==================== SECTION 8: ATTENDANCE ====================
    {
      icon: CheckCircle,
      label: 'Attendance',
      path: '/attendance',
      subItems: [
        { icon: Users, label: 'Mark Attendance', path: '/attendance/mark' },
        { icon: BarChart3, label: 'Attendance Reports', path: '/attendance/reports' },
        { icon: TrendingDown, label: 'Absenteeism Alerts', path: '/attendance/alerts' },
        { icon: Calendar, label: 'Holiday Setup', path: '/attendance/holidays' }
      ],
      section: 'attendance'
    },

    // ==================== SECTION 9: STUDENT PROGRESSION ====================
    {
      icon: TrendingUp,
      label: 'Progression',
      path: '/progression',
      subItems: [
        { icon: ArrowRightCircle, label: 'Promotion Rules', path: '/progression/rules' },
        { icon: Users, label: 'Batch Promotion', path: '/progression/batch-promotion' },
        { icon: UserCheck, label: 'Manual Promotion', path: '/progression/manual' },
        { icon: GraduationCap, label: 'Graduation', path: '/progression/graduation' },
        { icon: History, label: 'Student History', path: '/progression/student-history' },
        { icon: Repeat, label: 'Class Transfers', path: '/progression/transfers' }
      ],
      section: 'progression'
    },

    // ==================== SECTION 10: COMMUNICATION ====================
    {
      icon: MessageSquare,
      label: 'Communication',
      path: '/communication',
      subItems: [
        { icon: Bell, label: 'Send Notification', path: '/communication/send' },
        { icon: Mail, label: 'Email Queue', path: '/communication/email-queue' },
        { icon: Send, label: 'SMS Queue', path: '/communication/sms-queue' },
        { icon: FileText, label: 'Templates', path: '/communication/templates' },
        { icon: UserCircle, label: 'User Preferences', path: '/communication/preferences' },
        { icon: History, label: 'Notification History', path: '/communication/history' }
      ],
      section: 'communication'
    },

    // ==================== SECTION 11: REPORTS & STATISTICS ====================
    {
      icon: BarChart3,
      label: 'Reports & Analytics',
      path: '/reports',
      subItems: [
        { icon: Users, label: 'Student Reports', path: '/reports/students' },
        { icon: UserCheck, label: 'Staff Reports', path: '/reports/staff' },
        { icon: BookOpen, label: 'Academic Reports', path: '/reports/academic' },
        { icon: BarChart, label: 'Performance Analytics', path: '/reports/performance' },
        { icon: TrendingUp, label: 'Enrollment Trends', path: '/reports/enrollment' },
        { icon: Download, label: 'Export Center', path: '/reports/export' }
      ],
      section: 'reports'
    },

    // ==================== SECTION 12: DATA MANAGEMENT ====================
    {
      icon: Database,
      label: 'Data Management',
      path: '/data',
      subItems: [
        { icon: Upload, label: 'Import Data', path: '/data/import' },
        { icon: Download, label: 'Export Data', path: '/data/export' },
        { icon: RefreshCw, label: 'Migrations', path: '/data/migrations' },
        { icon: Database, label: 'Backup & Restore', path: '/data/backup' },
        { icon: Activity, label: 'Audit Logs', path: '/data/audit-logs' }
      ],
      section: 'data'
    },

    // ==================== SECTION 13: SYSTEM ADMINISTRATION ====================
    {
      icon: Settings,
      label: 'System Admin',
      path: '/system',
      subItems: [
        { icon: ShieldIcon, label: 'User Management', path: '/system/users' },
        // { icon: Lock, label: 'Roles & Permissions', path: '/system/roles' },
        { icon: Activity, label: 'System Logs', path: '/system/logs' },
        // { icon: Cloud, label: 'License Management', path: '/system/license' },
        // { icon: Settings, label: 'Global Settings', path: '/system/settings' },
        { icon: RefreshCw, label: 'System Health', path: '/system/health' }
      ],
      section: 'system'
    }
  ];

  // Bottom menu items (always visible)
  const bottomMenuItems = [
    // { icon: UserCircle, label: 'My Profile', path: '/profile' },
    // { icon: Settings, label: 'Preferences', path: '/preferences' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
    // { icon: LogOut, label: 'Logout', path: '/logout', isLogout: true }
  ];

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
            <Sparkles size={isCollapsed ? 24 : 28} />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-name">SchoolManager</span>
              <span className="brand-tagline">Complete School System</span>
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
        <div className="footer-actions">
          {bottomMenuItems.map((item, index) => (
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
            <span>v1.0.0 | School Manager</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;