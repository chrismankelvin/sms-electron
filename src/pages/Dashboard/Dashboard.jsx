import { useState } from 'react';
import {
  Users,
  School,
  BookOpen,
  Calendar,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  XCircle,
  UserPlus,
  Bell,
  Edit3,
  Check,
  X,
  Database,
  HardDrive,
  Calendar as CalendarIcon,
  GraduationCap,
  BarChart3,
  Eye,
  UserCheck,
  UserX,
  Clock as ClockIcon
} from 'lucide-react';
import '../../styles/dashboard.css';

function Dashboard() {
  // Hardcoded data - you can edit these later
  const kpiData = {
    totalStudents: 1247,
    totalStaff: 86,
    totalClasses: 42,
    activeYear: "2024-2025",
    currentTerm: "Term 2",
    avgAttendance: 94.2
  };

  const recentActivities = [
    { id: 1, action: "John Doe enrolled in Grade 10", time: "2 minutes ago", user: "Admin", icon: UserPlus },
    { id: 2, action: "Math exam scores entered for Grade 8", time: "15 minutes ago", user: "Mrs. Smith", icon: Edit3 },
    { id: 3, action: "Promotion requests approved for Grade 6", time: "1 hour ago", user: "Principal", icon: CheckCircle },
    { id: 4, action: "New teacher assigned to Physics", time: "3 hours ago", user: "HR Dept", icon: Users },
    { id: 5, action: "Library books overdue notice sent", time: "5 hours ago", user: "System", icon: Bell },
    { id: 6, action: "Parent-teacher meeting scheduled", time: "1 day ago", user: "Admin", icon: Calendar },
    { id: 7, action: "Fee payment received for 50 students", time: "1 day ago", user: "Accounts", icon: TrendingUp },
    { id: 8, action: "Sports day registrations opened", time: "2 days ago", user: "Sports Dept", icon: Activity },
    { id: 9, action: "New course added: Computer Science", time: "2 days ago", user: "Academic Head", icon: BookOpen },
    { id: 10, action: "Student transfer approved", time: "3 days ago", user: "Admin", icon: UserCheck }
  ];

  const alerts = [
    { id: 1, type: "warning", message: "School license expires in 45 days", priority: "High", icon: AlertTriangle },
    { id: 2, type: "info", message: "Pending promotions: 24 students", priority: "Medium", icon: Info },
    { id: 3, type: "danger", message: "Grade 8A class has 48 students (capacity: 40)", priority: "High", icon: XCircle },
    { id: 4, type: "warning", message: "Mr. Johnson missing Math subject assignment", priority: "High", icon: AlertTriangle },
    { id: 5, type: "info", message: "Annual sports meet registration deadline approaching", priority: "Low", icon: Info }
  ];

  const pendingApprovals = [
    { id: 1, type: "Promotion Request", student: "Alice Johnson", from: "Grade 8", to: "Grade 9", date: "2024-01-15" },
    { id: 2, type: "Grade Change", student: "Michael Brown", subject: "Mathematics", from: "C", to: "B", date: "2024-01-14" },
    { id: 3, type: "Leave Request", teacher: "Sarah Wilson", days: "3", reason: "Medical", date: "2024-01-13" },
    { id: 4, type: "Promotion Request", student: "Emma Davis", from: "Grade 7", to: "Grade 8", date: "2024-01-12" },
    { id: 5, type: "Leave Request", teacher: "Robert Taylor", days: "5", reason: "Vacation", date: "2024-01-11" }
  ];

  const timetableSnapshot = [
    { time: "8:00 AM - 9:00 AM", subject: "Mathematics", teacher: "Mrs. Smith", class: "Grade 10A", room: "101" },
    { time: "9:00 AM - 10:00 AM", subject: "Physics", teacher: "Dr. Jones", class: "Grade 10A", room: "Lab 2" },
    { time: "10:00 AM - 10:30 AM", subject: "Break", teacher: "-", class: "-", room: "-" },
    { time: "10:30 AM - 11:30 AM", subject: "English", teacher: "Ms. Williams", class: "Grade 10A", room: "103" },
    { time: "11:30 AM - 12:30 PM", subject: "Chemistry", teacher: "Dr. Brown", class: "Grade 10A", room: "Lab 1" }
  ];

  const attendanceSummary = {
    present: 1120,
    absent: 87,
    late: 40,
    total: 1247,
    attendanceRate: 89.8
  };

  const upcomingEvents = [
    { id: 1, title: "Mid-Term Examinations", date: "2024-02-15", type: "Exam", daysLeft: 30 },
    { id: 2, title: "Parent-Teacher Meeting", date: "2024-02-05", type: "Meeting", daysLeft: 20 },
    { id: 3, title: "Independence Day Celebration", date: "2024-01-26", type: "Holiday", daysLeft: 10 },
    { id: 4, title: "Science Fair", date: "2024-02-20", type: "Event", daysLeft: 35 },
    { id: 5, title: "Annual Sports Day", date: "2024-03-01", type: "Sports", daysLeft: 45 }
  ];

  const performanceChart = {
    labels: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
    data: [85, 156, 203, 178, 142, 98, 45, 22]
  };

  const systemHealth = {
    dbSize: "2.4 GB",
    lastBackup: "2024-01-15 02:00 AM",
    licenseExpiry: "2024-03-15",
    daysLeft: 59,
    serverStatus: "Healthy",
    lastSync: "Just now"
  };

  const quickActions = [
    { name: "Mark Attendance", icon: UserCheck, color: "#3b82f6" },
    { name: "Enter Scores", icon: Edit3, color: "#10b981" },
    { name: "Send Notification", icon: Bell, color: "#f59e0b" },
    { name: "Register Student", icon: UserPlus, color: "#8b5cf6" }
  ];

  const maxChartValue = Math.max(...performanceChart.data);

  return (
    <div >
      {/* Page Header */}
      <div className="mb-4">
        <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--secondary)" }}>School Health Metrics Overview</p>
        <hr style={{ margin: "1rem 0", borderColor: "var(--border)" }} />
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-kpi-grid">
        <div className="card kpi-card students">
          <div className="kpi-label">
            <Users size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Total Students
          </div>
          <div className="kpi-value">{kpiData.totalStudents}</div>
        </div>
        
        <div className="card kpi-card staff">
          <div className="kpi-label">
            <Users size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Total Staff
          </div>
          <div className="kpi-value">{kpiData.totalStaff}</div>
        </div>
        
        <div className="card kpi-card classes">
          <div className="kpi-label">
            <BookOpen size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Total Classes
          </div>
          <div className="kpi-value">{kpiData.totalClasses}</div>
        </div>
        
        <div className="card kpi-card year">
          <div className="kpi-label">
            <Calendar size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Active Year
          </div>
          <div className="kpi-value" style={{ fontSize: "1.25rem" }}>{kpiData.activeYear}</div>
          <div className="kpi-subvalue">{kpiData.currentTerm}</div>
        </div>
        
        <div className="card kpi-card attendance">
          <div className="kpi-label">
            <TrendingUp size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Avg Attendance
          </div>
          <div className="kpi-value">{kpiData.avgAttendance}%</div>
        </div>
        
        <div className="card kpi-card health">
          <div className="kpi-label">
            <Activity size={16} style={{ display: 'inline', marginRight: '4px' }} />
            System Health
          </div>
          <div className="kpi-value" style={{ fontSize: "1.25rem", color: "#10b981" }}>
            <CheckCircle size={20} style={{ display: 'inline', marginRight: '4px' }} />
            Operational
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-grid">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              className="quick-action-btn"
              style={{ backgroundColor: action.color }}
            >
              <Icon size={18} />
              <span>{action.name}</span>
            </button>
          );
        })}
      </div>

      {/* Row 1: Timetable, Attendance, System Health */}
      <div className="dashboard-row">
        {/* Timetable Snapshot */}
        <div className="card">
          <h2 className="section-header">
            <Clock size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Today's Schedule
          </h2>
          <div>
            {timetableSnapshot.map((item, idx) => (
              <div key={idx} className="timetable-item">
                <div className="timetable-time">{item.time}</div>
                <div className="timetable-subject">{item.subject}</div>
                <div className="timetable-details">{item.teacher} • Room {item.room}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="card">
          <h2 className="section-header">
            <UserCheck size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Today's Attendance
          </h2>
          <div className="attendance-rate">
            <div className="attendance-percentage">{attendanceSummary.attendanceRate}%</div>
            <div className="attendance-label">Attendance Rate</div>
          </div>
          <div className="attendance-stats">
            <div>
              <div className="attendance-stat-value present">{attendanceSummary.present}</div>
              <div className="attendance-stat-label">Present</div>
            </div>
            <div>
              <div className="attendance-stat-value absent">{attendanceSummary.absent}</div>
              <div className="attendance-stat-label">Absent</div>
            </div>
            <div>
              <div className="attendance-stat-value late">{attendanceSummary.late}</div>
              <div className="attendance-stat-label">Late</div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="card">
          <h2 className="section-header">
            <Database size={20} style={{ display: 'inline', marginRight: '8px' }} />
            System Health
          </h2>
          <div>
            <div className="health-item">
              <span className="health-label">Database Size:</span>
              <span className="health-value">{systemHealth.dbSize}</span>
            </div>
            <div className="health-item">
              <span className="health-label">Last Backup:</span>
              <span className="health-value">{systemHealth.lastBackup}</span>
            </div>
            <div className="health-item">
              <span className="health-label">License Expiry:</span>
              <span className="health-value warning">
                {systemHealth.licenseExpiry} ({systemHealth.daysLeft} days)
              </span>
            </div>
            <div className="health-item">
              <span className="health-label">Server Status:</span>
              <span className="health-value success">{systemHealth.serverStatus}</span>
            </div>
          </div>
          <div className="license-progress">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: "65%" }}></div>
            </div>
            <div className="progress-text">License Usage: 65%</div>
          </div>
        </div>
      </div>

      {/* Row 2: Performance Chart & Upcoming Events */}
      <div className="dashboard-row">
        {/* Performance Chart */}
        <div className="card">
          <h2 className="section-header">
            <BarChart3 size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Grade Distribution
          </h2>
          <div>
            {performanceChart.labels.map((label, idx) => {
              const percentage = (performanceChart.data[idx] / maxChartValue) * 100;
              return (
                <div key={idx} className="chart-item">
                  <div className="chart-header">
                    <span>{label}</span>
                    <span>{performanceChart.data[idx]} students</span>
                  </div>
                  <div className="chart-bar-bg">
                    <div className="chart-bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h2 className="section-header">
            <CalendarIcon size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Upcoming Events
          </h2>
          <div>
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-item">
                <div>
                  <div className="event-title">{event.title}</div>
                  <div className="event-meta">{event.type} • {event.date}</div>
                </div>
                <div className="event-days">{event.daysLeft} days</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & Alerts */}
      <div className="dashboard-row">
        {/* Recent Activity Feed */}
        <div className="card">
          <h2 className="section-header">
            <Activity size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Recent Activity
          </h2>
          <div className="scrollable-list">
            {recentActivities.map(activity => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="activity-item">
                  <div style={{ marginRight: '12px', marginTop: '2px' }}>
                    <Icon size={16} color="var(--primary)" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-user">by {activity.user}</div>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="card">
          <h2 className="section-header">
            <Bell size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Alerts & Notifications
          </h2>
          <div className="scrollable-list">
            {alerts.map(alert => {
              const Icon = alert.icon;
              return (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                    <Icon size={16} color={
                      alert.type === 'danger' ? '#ef4444' : 
                      alert.type === 'warning' ? '#f59e0b' : '#3b82f6'
                    } />
                    <div style={{ flex: 1 }}>
                      <div className="alert-message">{alert.message}</div>
                      <div className="alert-priority">Priority: {alert.priority}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="card">
        <h2 className="section-header">
          <ClockIcon size={20} style={{ display: 'inline', marginRight: '8px' }} />
          Pending Approvals
        </h2>
        <div className="approvals-table-container">
          <table className="approvals-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Details</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map(approval => (
                <tr key={approval.id}>
                  <td>{approval.type}</td>
                  <td>
                    {approval.type === "Promotion Request" && 
                      `${approval.student}: ${approval.from} → ${approval.to}`}
                    {approval.type === "Grade Change" && 
                      `${approval.student} - ${approval.subject}: ${approval.from} → ${approval.to}`}
                    {approval.type === "Leave Request" && 
                      `${approval.teacher} (${approval.days} days) - ${approval.reason}`}
                  </td>
                  <td>{approval.date}</td>
                  <td className="approval-actions">
                    <button className="button approve-btn">
                      <Check size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Approve
                    </button>
                    <button className="button reject-btn">
                      <X size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;