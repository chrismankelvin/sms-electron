// src/components/Sidebar/AccountantSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  Receipt,
  TrendingUp,
  CreditCard,
  Calendar
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: "/accountant/dashboard", icon: Home, label: "Dashboard" },
    { path: "/accountant/fees", icon: DollarSign, label: "Fee Management" },
    { path: "/accountant/payments", icon: CreditCard, label: "Payments" },
    { path: "/accountant/invoices", icon: Receipt, label: "Invoices" },
    { path: "/accountant/expenses", icon: TrendingUp, label: "Expenses" },
    { path: "/accountant/reports", icon: FileText, label: "Financial Reports" },
    { path: "/accountant/statistics", icon: BarChart3, label: "Statistics" },
    { path: "/accountant/students", icon: Users, label: "Student Accounts" },
    { path: "/accountant/schedule", icon: Calendar, label: "Payment Schedule" },
    { path: "/accountant/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="sidebar bg-dark text-white" style={{ width: "260px", minHeight: "100vh" }}>
      <div className="sidebar-header p-3">
        <h4>Accountant Portal</h4>
        <small className="text-muted">Finance Management</small>
      </div>
      <nav className="nav flex-column mt-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center gap-2 px-3 py-2 ${isActive ? 'active bg-primary' : ''}`
            }
            style={{ transition: 'all 0.3s' }}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;