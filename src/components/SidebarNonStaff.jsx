// src/components/NonStaffSidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, Settings, UserCircle, LogOut,
  ChevronLeft, ChevronRight, GraduationCap, FileText, BarChart3,
  HelpCircle, ChevronDown, Clock, MessageSquare, Award,
  CalendarDays, Bell, LayoutDashboard, CreditCard, Users,
  Mail, Heart, Sparkles, DollarSign, Briefcase, FolderOpen,
  Truck, Package, Building2, ClipboardList, Printer, Download,
  PieChart, AlertCircle, CheckCircle, XCircle, RefreshCw,
  Shield, Lock, Database, Archive, FileSpreadsheet
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
      path: '/nonstaff/dashboard',
      subItems: null
    },
    {
      icon: DollarSign,
      label: 'Finance',
      path: '/nonstaff/finance',
      subItems: [
        { icon: CreditCard, label: 'Fee Collection', path: '/nonstaff/finance/fee-collection' },
        { icon: FileText, label: 'Payment History', path: '/nonstaff/finance/payment-history' },
        { icon: FolderOpen, label: 'Expense Tracking', path: '/nonstaff/finance/expenses' },
        { icon: BarChart3, label: 'Financial Reports', path: '/nonstaff/finance/reports' },
        { icon: Download, label: 'Budget Management', path: '/nonstaff/finance/budget' }
      ]
    },
    {
      icon: Users,
      label: 'HR & Personnel',
      path: '/nonstaff/hr',
      subItems: [
        { icon: Users, label: 'Staff Directory', path: '/nonstaff/hr/staff-directory' },
        { icon: Briefcase, label: 'Payroll', path: '/nonstaff/hr/payroll' },
        { icon: Calendar, label: 'Leave Management', path: '/nonstaff/hr/leave' },
        { icon: Clock, label: 'Attendance Records', path: '/nonstaff/hr/attendance' },
        { icon: Award, label: 'Performance Reviews', path: '/nonstaff/hr/reviews' }
      ]
    },
    {
      icon: Building2,
      label: 'Facilities',
      path: '/nonstaff/facilities',
      subItems: [
        { icon: Truck, label: 'Asset Management', path: '/nonstaff/facilities/assets' },
        { icon: Package, label: 'Inventory', path: '/nonstaff/facilities/inventory' },
        { icon: ClipboardList, label: 'Maintenance Requests', path: '/nonstaff/facilities/maintenance' },
        { icon: Calendar, label: 'Room Booking', path: '/nonstaff/facilities/bookings' },
        { icon: Building2, label: 'Vendor Management', path: '/nonstaff/facilities/vendors' }
      ]
    },
    {
      icon: Database,
      label: 'Records Management',
      path: '/nonstaff/records',
      subItems: [
        { icon: FileSpreadsheet, label: 'Student Records', path: '/nonstaff/records/students' },
        { icon: FolderOpen, label: 'Staff Records', path: '/nonstaff/records/staff' },
        { icon: Archive, label: 'Archived Records', path: '/nonstaff/records/archived' },
        { icon: Printer, label: 'Document Management', path: '/nonstaff/records/documents' },
        { icon: Download, label: 'Reports Export', path: '/nonstaff/records/exports' }
      ]
    },
    {
      icon: PieChart,
      label: 'Reports & Analytics',
      path: '/nonstaff/reports',
      subItems: [
        { icon: BarChart3, label: 'Financial Reports', path: '/nonstaff/reports/financial' },
        { icon: Users, label: 'Staff Reports', path: '/nonstaff/reports/staff' },
        { icon: Building2, label: 'Facility Reports', path: '/nonstaff/reports/facilities' },
        { icon: PieChart, label: 'Performance Metrics', path: '/nonstaff/reports/metrics' },
        { icon: FileText, label: 'Custom Reports', path: '/nonstaff/reports/custom' }
      ]
    },
    {
      icon: Shield,
      label: 'Administration',
      path: '/nonstaff/admin',
      subItems: [
        { icon: Lock, label: 'Access Control', path: '/nonstaff/admin/access' },
        { icon: RefreshCw, label: 'System Backups', path: '/nonstaff/admin/backups' },
        { icon: Database, label: 'Data Management', path: '/nonstaff/admin/data' },
        { icon: AlertCircle, label: 'Audit Logs', path: '/nonstaff/admin/audit' },
        { icon: Settings, label: 'System Settings', path: '/nonstaff/admin/settings' }
      ]
    },
    {
      icon: Bell,
      label: 'Communications',
      path: '/nonstaff/communications',
      subItems: [
        { icon: Bell, label: 'Announcements', path: '/nonstaff/communications/announcements' },
        { icon: MessageSquare, label: 'Internal Messages', path: '/nonstaff/communications/messages' },
        { icon: Mail, label: 'Email Notifications', path: '/nonstaff/communications/email' },
        { icon: AlertCircle, label: 'Alerts', path: '/nonstaff/communications/alerts' }
      ]
    }
  ];

  const bottomButtons = [
    { icon: UserCircle, label: 'Profile', path: '/nonstaff/profile' },
    { icon: Settings, label: 'Settings', path: '/nonstaff/settings' },
    { icon: HelpCircle, label: 'Help', path: '/nonstaff/help' },
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
            <Briefcase size={isCollapsed ? 24 : 28} />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-name">Staff Portal</span>
              <span className="brand-tagline">Non-Teaching Staff</span>
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
            <span>Staff Portal v1.0</span>
          </div>
        )}
      </div> */}
    </aside>
  );
};

export default Sidebar;