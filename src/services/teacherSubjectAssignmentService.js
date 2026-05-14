// services/teacherSubjectAssignmentService.js

const API_BASE_URL = 'http://localhost:8000/api/teacher-subject-assignments';

export const teacherSubjectAssignmentService = {
  // Get all assignments with optional filters
  async getAll(filters = {}) {
    let url = `${API_BASE_URL}/`;
    const params = [];
    if (filters.staff_id) params.push(`staff_id=${filters.staff_id}`);
    if (filters.class_id) params.push(`class_id=${filters.class_id}`);
    if (filters.subject_id) params.push(`subject_id=${filters.subject_id}`);
    if (filters.academic_year_id) params.push(`academic_year_id=${filters.academic_year_id}`);
    if (filters.is_active !== undefined) params.push(`is_active=${filters.is_active}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get assignment by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get teacher conflicts
  async getTeacherConflicts(staffId, academicYearId) {
    const response = await fetch(`${API_BASE_URL}/teacher/${staffId}/conflicts?academic_year_id=${academicYearId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Create assignment
  async create(assignmentData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update assignment
  async update(id, assignmentData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Delete assignment
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Bulk create assignments
  async bulkCreate(assignments) {
    const response = await fetch(`${API_BASE_URL}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignments)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};