// services/staffService.js

const API_BASE_URL = 'http://localhost:8000/api/staff';

export const staffService = {
  // Get all staff members
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.staff || data.data || [];
  },

  // Get staff by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.staff || data.data;
  },

  // Register new staff member
  async register(staffData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Add staff (simplified version)
  async add(staffData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Update staff
  async update(id, staffData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Delete staff (soft delete)
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Search staff
  async search(query) {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.staff || data.data || [];
  },

  // Get staff by role (Teacher/Admin)
  async getByRole(role) {
    const response = await fetch(`${API_BASE_URL}/role/${role}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.staff || data.data || [];
  },

  // Get staff qualifications
  async getQualifications(staffId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/qualifications`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data || [];
  },

  // Add staff qualification
  async addQualification(staffId, qualificationData) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/qualifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qualificationData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Update staff qualification
  async updateQualification(staffId, qualificationId, qualificationData) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/qualifications/${qualificationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qualificationData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Delete staff qualification
  async deleteQualification(staffId, qualificationId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/qualifications/${qualificationId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Get staff assignments (subjects they teach)
  async getAssignments(staffId, academicYearId = null) {
    let url = `${API_BASE_URL}/${staffId}/assignments`;
    if (academicYearId) url += `?academic_year_id=${academicYearId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data || [];
  },

  // Get staff timetable
  async getTimetable(staffId, academicYearId = null, termId = null) {
    let url = `${API_BASE_URL}/${staffId}/timetable`;
    const params = [];
    if (academicYearId) params.push(`academic_year_id=${academicYearId}`);
    if (termId) params.push(`term_id=${termId}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update staff status (active/inactive)
  async updateStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Reset staff password
  async resetPassword(id) {
    const response = await fetch(`${API_BASE_URL}/${id}/reset-password`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Get staff statistics
  async getStatistics() {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Bulk import staff
  async bulkImport(staffList) {
    const response = await fetch(`${API_BASE_URL}/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff: staffList })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Export staff to CSV
  async exportToCSV(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/export?${queryParams}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return { success: true };
  },

  // Get staff profile photo
  async getPhoto(staffId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/photo`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  // Upload staff photo
  async uploadPhoto(staffId, file) {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await fetch(`${API_BASE_URL}/${staffId}/photo`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Delete staff photo
  async deletePhoto(staffId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/photo`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Get staff leave requests
  async getLeaveRequests(staffId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/leave-requests`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data || [];
  },

  // Request leave
  async requestLeave(staffId, leaveData) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/leave-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Get staff attendance
  async getAttendance(staffId, startDate, endDate) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/attendance?start_date=${startDate}&end_date=${endDate}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data || [];
  },

  // Mark attendance
  async markAttendance(staffId, attendanceData) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendanceData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Get staff salary information
  async getSalaryInfo(staffId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/salary`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get staff documents
  async getDocuments(staffId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/documents`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data || [];
  },

  // Upload staff document
  async uploadDocument(staffId, documentData) {
    const formData = new FormData();
    formData.append('document', documentData.file);
    formData.append('title', documentData.title);
    formData.append('type', documentData.type);
    
    const response = await fetch(`${API_BASE_URL}/${staffId}/documents`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Delete staff document
  async deleteDocument(staffId, documentId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/documents/${documentId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Get staff notifications
  async getNotifications(staffId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/notifications`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data || [];
  },

  // Mark notification as read
  async markNotificationRead(staffId, notificationId) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Get current staff profile (for logged-in user)
  async getMyProfile() {
    const response = await fetch(`${API_BASE_URL}/me`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update my profile
  async updateMyProfile(profileData) {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Change password
  async changePassword(staffId, oldPassword, newPassword) {
    const response = await fetch(`${API_BASE_URL}/${staffId}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  }
};

// Helper function to map frontend form data to backend expected format
export const mapStaffFormData = (formData) => {
  return {
    first_name: formData.first_name,
    surname: formData.surname,
    other_names: formData.other_names || '',
    date_of_birth: formData.date_of_birth,
    gender: formData.gender,
    telephone_number_one: formData.telephone_number_one,
    telephone_number_two: formData.telephone_number_two || '',
    email_address: formData.email_address,
    address: formData.address,
    place_of_resident: formData.place_of_resident,
    state: formData.state || '',
    nationality: formData.nationality || 'Ghanaian',
    postal_code: formData.postal_code || '',
    blood_group: formData.blood_group || '',
    emergency_contact_one_name: formData.emergency_contact_one_name,
    emergency_contact_one: formData.emergency_contact_one,
    next_of_kin_name: formData.next_of_kin_name || '',
    next_of_kin_phone: formData.next_of_kin_phone || '',
    national_identification_number: formData.national_identification_number || '',
    health_insurance_number: formData.health_insurance_number || '',
    role: formData.role || 'Teacher',
    department: formData.department || '',
    marital_status: formData.marital_status || '',
    spouse_name: formData.spouse_name || '',
    spouse_phone: formData.spouse_phone || '',
    place_of_birth: formData.place_of_birth || '',
    current_status: formData.current_status || 'active',
    hired_at: formData.hired_at || new Date().toISOString().split('T')[0]
  };
};

// Helper function to get staff display name
export const getStaffDisplayName = (staff) => {
  const title = staff.title ? `${staff.title} ` : '';
  return `${title}${staff.first_name} ${staff.last_name}`;
};

// Helper function to get staff initials
export const getStaffInitials = (staff) => {
  const first = staff.first_name ? staff.first_name.charAt(0) : '';
  const last = staff.last_name ? staff.last_name.charAt(0) : '';
  return `${first}${last}`.toUpperCase();
};