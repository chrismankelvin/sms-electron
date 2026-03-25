export const PERMISSIONS = {
  // Admin
  MANAGE_USERS: "manage_users",
  VIEW_REPORTS: "view_reports",

  // Staff
  MANAGE_STUDENTS: "manage_students",
  TAKE_ATTENDANCE: "take_attendance",

  // Student
  VIEW_OWN_DATA: "view_own_data"
};

// 🔥 Role → Permissions mapping
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.TAKE_ATTENDANCE
  ],

  ADMIN: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS
  ],

  STAFF: [
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.TAKE_ATTENDANCE
  ],

  STUDENT: [
    PERMISSIONS.VIEW_OWN_DATA
  ]
};