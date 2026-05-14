// services/importService.js

const API_BASE_URL = 'http://localhost:8000/api/import';

export const importService = {
  // Get sample data for preview
  async getSampleData(importType) {
    const response = await fetch(`${API_BASE_URL}/sample/${importType}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Download template
  async downloadTemplate(importType) {
    const response = await fetch(`${API_BASE_URL}/template/${importType}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return { success: true };
  },

  // Preview file
  async previewFile(importType, file, skipRows = 0) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('skip_rows', skipRows);
    
    const response = await fetch(`${API_BASE_URL}/preview/${importType}`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Suggest column mapping
  async suggestMapping(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/suggest-mapping`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Validate import
  async validateImport(importType, file, columnMapping, skipRows = 0) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('column_mapping', JSON.stringify(columnMapping));
    formData.append('skip_rows', skipRows);
    
    const response = await fetch(`${API_BASE_URL}/validate/${importType}`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Execute import
  async executeImport(importType, file, columnMapping, skipRows = 0, skipErrors = false) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('column_mapping', JSON.stringify(columnMapping));
    formData.append('skip_rows', skipRows);
    formData.append('skip_errors', skipErrors);
    
    const response = await fetch(`${API_BASE_URL}/execute/${importType}`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

// Helper function for import types
export const importTypes = [
  { id: 'students', name: 'Students', description: 'Import student records with parent information' },
  { id: 'staff', name: 'Staff', description: 'Import teaching and non-teaching staff' },
  { id: 'subjects', name: 'Subjects', description: 'Import subject master list' },
  { id: 'classes', name: 'Classes', description: 'Import class structures' },
  { id: 'scores', name: 'Scores', description: 'Import assessment results' }
];

// Template columns for each import type
export const templateColumns = {
  students: ['Student Number', 'First Name', 'Last Name', 'Date of Birth', 'Gender', 'Class', 'Parent Name', 'Parent Phone', 'Parent Email', 'Address'],
  staff: ['Staff Number', 'First Name', 'Last Name', 'Role', 'Department', 'Qualification', 'Hired Date', 'Email', 'Phone'],
  subjects: ['Subject Name', 'Subject Code', 'Type', 'Category', 'Description'],
  classes: ['Class Name', 'Class Code', 'Level', 'Programme', 'Capacity', 'Form Master'],
  scores: ['Student Number', 'Assessment Name', 'Score', 'Absent', 'Remarks']
};

// Column mapping suggestions
export const getColumnSuggestions = (targetField) => {
  const suggestions = {
    'first_name': ['First Name', 'FirstName', 'Fname', 'First', 'Given Name'],
    'last_name': ['Last Name', 'LastName', 'Lname', 'Last', 'Surname', 'Family Name'],
    'student_number': ['Student Number', 'Student ID', 'Admission Number', 'StudentNo', 'Reg Number'],
    'staff_number': ['Staff Number', 'Employee Number', 'Staff ID', 'StaffNo', 'Emp No'],
    'email': ['Email', 'E-mail', 'Email Address', 'Mail'],
    'phone': ['Phone', 'Telephone', 'Mobile', 'Contact Number'],
    'class': ['Class', 'Class Name', 'Class Name', 'Section'],
    'subject_name': ['Subject', 'Subject Name', 'Course', 'Course Name'],
    'subject_code': ['Code', 'Subject Code', 'Course Code']
  };
  return suggestions[targetField] || [];
};