// services/classService.js

const API_BASE_URL = 'http://localhost:8000/api/classes';

export const classService = {
  // Get all classes with optional filters
  async getAll(academicYearId = null, levelId = null, isActive = null) {
    let url = `${API_BASE_URL}/`;
    const params = [];
    if (academicYearId) params.push(`academic_year_id=${academicYearId}`);
    if (levelId) params.push(`level_id=${levelId}`);
    if (isActive !== null) params.push(`is_active=${isActive}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get class by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Generate class code
  async generateCode(className, levelId) {
    const response = await fetch(`${API_BASE_URL}/code/generate?class_name=${encodeURIComponent(className)}&level_id=${levelId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get students in a class
  async getStudents(classId) {
    const response = await fetch(`${API_BASE_URL}/${classId}/students`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Create class
  async create(classData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update class
  async update(id, classData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Delete class
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  // Get class statistics
  async getStatistics(classId) {
    const response = await fetch(`${API_BASE_URL}/${classId}/statistics`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get class timetable
  async getTimetable(classId, academicYearId = null, termId = null) {
    let url = `${API_BASE_URL}/${classId}/timetable`;
    const params = [];
    if (academicYearId) params.push(`academic_year_id=${academicYearId}`);
    if (termId) params.push(`term_id=${termId}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get class subjects
  async getSubjects(classId, academicYearId = null) {
    let url = `${API_BASE_URL}/${classId}/subjects`;
    if (academicYearId) url += `?academic_year_id=${academicYearId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get class teachers
  async getTeachers(classId, academicYearId = null) {
    let url = `${API_BASE_URL}/${classId}/teachers`;
    if (academicYearId) url += `?academic_year_id=${academicYearId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update class capacity
  async updateCapacity(id, capacity) {
    const response = await fetch(`${API_BASE_URL}/${id}/capacity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capacity })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Update class status (active/inactive)
  async updateStatus(id, isActive) {
    const response = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Assign form master
  async assignFormMaster(id, staffId) {
    const response = await fetch(`${API_BASE_URL}/${id}/form-master`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form_master_id: staffId })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Get all class levels
  async getLevels() {
    const response = await fetch(`${API_BASE_URL}/levels`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get all class programmes
  async getProgrammes() {
    const response = await fetch(`${API_BASE_URL}/programmes`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Bulk create classes
  async bulkCreate(classesData) {
    const response = await fetch(`${API_BASE_URL}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classes: classesData })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Export classes to CSV
  async exportToCSV(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/export?${queryParams}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classes_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return { success: true };
  },

  // Get class enrollment history
  async getEnrollmentHistory(classId) {
    const response = await fetch(`${API_BASE_URL}/${classId}/enrollment-history`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get class performance analytics
  async getPerformanceAnalytics(classId, academicYearId = null, termId = null) {
    let url = `${API_BASE_URL}/${classId}/performance`;
    const params = [];
    if (academicYearId) params.push(`academic_year_id=${academicYearId}`);
    if (termId) params.push(`term_id=${termId}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get class attendance summary
  async getAttendanceSummary(classId, academicYearId = null, termId = null) {
    let url = `${API_BASE_URL}/${classId}/attendance`;
    const params = [];
    if (academicYearId) params.push(`academic_year_id=${academicYearId}`);
    if (termId) params.push(`term_id=${termId}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

// Helper function to map frontend form data to backend expected format
export const mapClassFormData = (formData) => {
  return {
    class_name: formData.class_name,
    class_code: formData.class_code,
    level_id: parseInt(formData.level_id),
    programme_id: formData.programme_id ? parseInt(formData.programme_id) : null,
    academic_year_id: parseInt(formData.academic_year_id),
    form_master_id: formData.form_master_id ? parseInt(formData.form_master_id) : null,
    description: formData.description || '',
    capacity: parseInt(formData.capacity),
    is_active: formData.is_active
  };
};

// Helper function to get class display name with code
export const getClassDisplayName = (classItem) => {
  if (classItem.class_code) {
    return `${classItem.class_name} (${classItem.class_code})`;
  }
  return classItem.class_name;
};

// Helper function to get capacity status
export const getCapacityStatus = (currentEnrollment, capacity) => {
  const percentage = (currentEnrollment / capacity) * 100;
  if (percentage >= 90) return 'danger';
  if (percentage >= 75) return 'warning';
  return 'normal';
};

// Helper function to get capacity percentage
export const getCapacityPercentage = (currentEnrollment, capacity) => {
  if (!capacity || capacity === 0) return 0;
  return Math.round((currentEnrollment / capacity) * 100);
};

// Helper function to group classes by level
export const groupClassesByLevel = (classes) => {
  const grouped = {};
  classes.forEach(cls => {
    if (!grouped[cls.level_id]) {
      grouped[cls.level_id] = [];
    }
    grouped[cls.level_id].push(cls);
  });
  return grouped;
};

// Helper function to get class options for dropdown
export const getClassOptions = (classes) => {
  return classes.map(cls => ({
    value: cls.id,
    label: getClassDisplayName(cls),
    level_id: cls.level_id,
    academic_year_id: cls.academic_year_id
  }));
};