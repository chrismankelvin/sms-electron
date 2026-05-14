// services/formMasterService.js

const API_BASE_URL = 'http://localhost:8000/api/classes';

export const formMasterService = {
  // Get all form master assignments
  async getAssignments(academicYearId = null) {
    let url = `${API_BASE_URL}/form-masters/assignments`;
    if (academicYearId) url += `?academic_year_id=${academicYearId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get available staff for form master
  async getAvailableFormMasters() {
    const response = await fetch(`${API_BASE_URL}/form-masters/available`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get form master for a specific class
  async getClassFormMaster(classId) {
    const response = await fetch(`${API_BASE_URL}/${classId}/form-master`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Assign form master to a class
  async assignFormMaster(classId, staffId) {
    const response = await fetch(`${API_BASE_URL}/${classId}/form-master`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form_master_id: staffId })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Remove form master from a class
  async removeFormMaster(classId) {
    const response = await fetch(`${API_BASE_URL}/${classId}/form-master`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Bulk assign form masters
  async bulkAssign(assignments) {
    const response = await fetch(`${API_BASE_URL}/form-masters/bulk-assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get available academic years
  async getAcademicYears() {
    const response = await fetch('http://localhost:8000/api/academic-years/');
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get classes by academic year
  async getClassesByAcademicYear(academicYearId) {
    const response = await fetch(`${API_BASE_URL}/?academic_year_id=${academicYearId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

// Helper function to get form master display name
export const getFormMasterDisplayName = (formMaster) => {
  if (!formMaster) return 'Not Assigned';
  return formMaster.name || `${formMaster.first_name} ${formMaster.last_name}`;
};

// Helper function to check if class has form master assigned
export const hasFormMaster = (classItem) => {
  return !!(classItem.form_master_id || classItem.form_master);
};

// Helper function to group assignments by academic year
export const groupAssignmentsByYear = (assignments) => {
  const grouped = {};
  assignments.forEach(assignment => {
    const year = assignment.academic_year_label;
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(assignment);
  });
  return grouped;
};