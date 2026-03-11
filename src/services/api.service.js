// src/services/api.service.js
const API_BASE_URL = 'http://localhost:8000';

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  // ... other methods
};





// ============ HELPER FUNCTIONS ============
export const isElectron = () => {
  return !!(window.electron && window.electron.python);
};

// ============ ACTIVATION ============
// export async function checkActivationStatus() {
//   try {
//     if (!isElectron()) {
//       console.log('Browser mode: mock activation status = false');
//       return false;
//     }
//     const response = await window.electron.activation.status();
//     return response.result?.activated === true;
//   } catch (err) {
//     console.error("checkActivationStatus failed:", err);
//     return false;
//   }
// }
// ============ ACTIVATION ============
// export async function checkActivationStatus() {
//   try {
//     if (!isElectron()) {
//       console.log('Browser mode: mock activation status = false');
//       return { activated: false };
//     }
    
//     // Use the status endpoint
//     const response = await window.electron.activation.getStatus();
//     console.log('Activation status response:', response);
    
//     // Handle different response formats
//     if (response && typeof response === 'object') {
//       // Direct response from getStatus
//       if (response.activated !== undefined) {
//         return response;
//       }
//       // If wrapped in result
//       if (response.result && response.result.activated !== undefined) {
//         return response.result;
//       }
//     }
    
//     return { activated: false };
//   } catch (err) {
//     console.error("checkActivationStatus failed:", err);
//     return { activated: false };
//   }
// }

export async function checkActivationStatus() {
  try {
    if (!isElectron()) {
      console.log('Browser mode: mock activation status = false');
      return { activated: false };
    }
    
    // Use the setup/status endpoint which has all the info
    // const response = await window.electron.backend.fetchData('setup/status', 'GET');
    const response = await window.electron.activation.status();
    console.log('Setup status response:', response);
    
    // Handle different response formats
    if (response && typeof response === 'object') {
      // If response is already the data (most likely)
      if (response.activated !== undefined) {
        return {
          activated: response.activated,
          school_completed: response.school_completed,
          admin_completed: response.admin_completed,
          current_step: response.current_step
        };
      }
      // If response has result wrapper (IPC format)
      if (response.result && response.result.activated !== undefined) {
        return {
          activated: response.result.activated,
          school_completed: response.result.school_completed,
          admin_completed: response.result.admin_completed,
          current_step: response.result.current_step
        };
      }
    }
    
    return { activated: false };
  } catch (err) {
    console.error("checkActivationStatus failed:", err);
    return { activated: false };
  }
}



export async function getDetailedActivationStatus() {
  try {
    if (!isElectron()) {
      return { 
        activated: false,
        school_name: null,
        activation_date: null,
        machine_fingerprint: 'mock-fingerprint-123'
      };
    }
    
    const response = await window.electron.activation.getDetailedStatus();
    return response.result || response;
  } catch (err) {
    console.error("getDetailedActivationStatus failed:", err);
    return { activated: false };
  }
}

export async function activateSystem(code, schoolName) {
  try {
    if (!isElectron()) {
      console.log('Browser mode: mock activation successful');
      return { 
        success: true, 
        message: "Activated (mock)",
        mini_settings_reset: true
      };
    }

    // Send parameters directly (avoid nested payload)
    const response = await window.electron.activation.activate(
      code,
      schoolName
    );

    console.log('Activation response:', response);

    // Handle response
    if (response && response.success !== undefined) {
      return response;
    } 
    
    if (response && response.result) {
      return response.result; 
    }

    return { success: false, message: "Unknown response format" };

  } catch (err) {
    console.error("activateSystem failed:", err);
    return { success: false, message: err.message };
  }
}

export async function validateActivationCode(code, schoolName) {
  try {
    if (!isElectron()) {
      return { valid: code === 'VALID-123', message: "Mock validation" };
    }
    
    const response = await window.electron.activation.validateCode({
      code,
      school_name: schoolName
    });
    
    return response.result || response;
  } catch (err) {
    console.error("validateActivationCode failed:", err);
    return { valid: false, message: err.message };
  }
}

export async function getExpectedCode(schoolName) {
  try {
    if (!isElectron()) {
      return { expected_code: 'MOCK-CODE-123', school_name: schoolName };
    }
    
    const response = await window.electron.activation.getExpectedCode({
      school_name: schoolName
    });
    
    return response.result || response;
  } catch (err) {
    console.error("getExpectedCode failed:", err);
    return null;
  }
}

export async function getMachineFingerprint() {
  try {
    if (!isElectron()) {
      return { machine_fingerprint: 'mock-fingerprint-123' };
    }
    
    const response = await window.electron.activation.getMachineId();
    console.log('Machine fingerprint response:', response);
    
    // Handle different response formats
    if (response && response.machine_fingerprint) {
      return response;
    } else if (response && response.result && response.result.machine_fingerprint) {
      return response.result;
    } else if (response && response.fingerprint) {
      return { machine_fingerprint: response.fingerprint };
    }
    
    return { machine_fingerprint: null };
  } catch (err) {
    console.error("getMachineFingerprint failed:", err);
    return { machine_fingerprint: null };
  }
}

// Keep your existing deactivateSystem and getFingerprint for backward compatibility
export async function deactivateSystem() {
  try {
    if (!isElectron()) {
      return { success: true };
    }
    // Note: You might need to add a deactivate endpoint in FastAPI
    console.warn("Deactivate not implemented in FastAPI");
    return { success: false, message: "Deactivate not available" };
  } catch (err) {
    console.error("deactivateSystem failed:", err);
    return { success: false, message: err.message };
  }
}

// export async function getFingerprint() {
//   // This is an alias for getMachineFingerprint for backward compatibility
//   const result = await getMachineFingerprint();
//   return result.machine_fingerprint;
// }

// export async function activateSystem(code, schoolName = null) {
//   try {
//     if (!isElectron()) {
//       console.log('Browser mode: mock activation successful');
//       return { success: true, message: "Activated (mock)" };
//     }
//     return await window.electron.activation.activate(code, schoolName);
//   } catch (err) {
//     console.error("activateSystem failed:", err);
//     return { success: false, message: err.message };
//   }
// }




// ============ SCHOOL & ADMIN SETUP ============
// In src/services/api.service.js - update setupSchoolAndAdmin function

export async function setupSchoolAndAdmin(formData) {
  try {
    if (!isElectron()) {
      console.log('Browser mode: mock school and admin setup');
      return { 
        success: true, 
        message: "School and admin created successfully (mock)",
        school_id: 123,
        admin_id: 456
      };
    }
    
    console.log('Calling setup school and admin via backend.fetchData...');
    
    // Use the existing backend.fetchData which maps to 'api' type
    const result = await window.electron.backend.fetchData(
      'setup/school-and-admin', 
      'POST',
      formData
    );
    
    console.log('Setup result:', result);
    return result;
  } catch (err) {
    console.error("setupSchoolAndAdmin failed:", err);
    return { success: false, message: err.message };
  }
}




// export async function deactivateSystem() {
//   try {
//     if (!isElectron()) {
//       return { success: true };
//     }
//     return await window.electron.activation.deactivate();
//   } catch (err) {
//     console.error("deactivateSystem failed:", err);
//     return { success: false, message: err.message };
//   }
// }
  
export async function getFingerprint() {
  try {
    if (!isElectron()) {
      return { fingerprint: 'mock-fingerprint-123' };
    }
    return await window.electron.activation.fingerprint();
  } catch (err) {
    console.error("getFingerprint failed:", err);
    return null;
  }
}

// ============ AUTH ============
// export async function login(username, password, role = null) {
//   try {
//     if (!isElectron()) {
//       return { 
//         success: true, 
//         user: { id: 1, username, role: role || 'admin' } 
//       };
//     }
//     return await window.electron.auth.login(username, password, role);
//   } catch (err) {
//     console.error("login failed:", err);
//     return { success: false, message: err.message };
//   }
// }

// ============ AUTH ============
export async function login(username, password, role = null) {
  try {
    if (!isElectron()) {
      return { 
        success: true, 
        user: { id: 1, username, role: role || 'admin' } 
      };
    }
    
    console.log(`Login attempt for ${username} with role ${role}`);
    const result = await window.electron.auth.login(username, password, role);
    console.log('Login result:', result);
    
    // If login successful, store session info
    if (result && result.success) {
      // Store session ID if your backend returns one
      if (result.session_id) {
        localStorage.setItem('session_id', result.session_id);
      }
      // Store user info
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
  } catch (err) {
    console.error("login failed:", err);
    return { success: false, message: err.message };
  }
}

export async function logout() {
  try {
    if (!isElectron()) {
      localStorage.removeItem('session_id');
      localStorage.removeItem('user');
      return { success: true };
    }
    
    const session_id = localStorage.getItem('session_id');
    const result = await window.electron.auth.logout(session_id);
    
    // Clear local storage regardless of result
    localStorage.removeItem('session_id');
    localStorage.removeItem('user');
    
    return result;
  } catch (err) {
    console.error("logout failed:", err);
    localStorage.removeItem('session_id');
    localStorage.removeItem('user');
    return { success: false, message: err.message };
  }
}

// export async function checkSession() {
//   try {
//     if (!isElectron()) {
//       const storedUser = localStorage.getItem('user');
//       return storedUser ? JSON.parse(storedUser) : null;
//     }
    
//     const session_id = localStorage.getItem('session_id');
//     if (!session_id) {
//       return null;
//     }
    
//     const response = await window.electron.auth.session(session_id);
//     const user = response?.user || null;
    
//     // Update stored user if we got one
//     if (user) {
//       localStorage.setItem('user', JSON.stringify(user));
//     } else {
//       localStorage.removeItem('session_id');
//       localStorage.removeItem('user');
//     }
    
//     return user;
//   } catch (err) {
//     console.error("checkSession failed:", err);
//     return null;
//   }
// }

export async function bootstrapSuperAdmin(username, password) {
  try {
    if (!isElectron()) {
      return { success: true };
    }
    
    const result = await window.electron.auth.bootstrap(username, password);
    return result;
  } catch (err) {
    console.error("bootstrapSuperAdmin failed:", err);
    return { success: false, message: err.message };
  }
}



// export async function logout() {
//   try {
//     if (!isElectron()) {
//       return { success: true };
//     }
//     return await window.electron.auth.logout();
//   } catch (err) {
//     console.error("logout failed:", err);
//     return { success: false, message: err.message };
//   }
// }

export async function checkSession() {
  try {
    if (!isElectron()) {
      return { user: null };
    }
    const response = await window.electron.auth.session();
    return response?.user || null;
  } catch (err) {
    console.error("checkSession failed:", err);
    return null;
  }
}

// export async function bootstrapSuperAdmin(username, password) {
//   try {
//     if (!isElectron()) {
//       return { success: true };
//     }
//     return await window.electron.auth.bootstrap(username, password);
//   } catch (err) {
//     console.error("bootstrapSuperAdmin failed:", err);
//     return { success: false, message: err.message };
//   }
// }

// ============ DATABASE ============
// ============ DATABASE ============
export async function initDatabase() {
  try {
    if (!isElectron()) {
      console.log('Browser mode: mock database init');
      return { success: true };
    }
    return await window.electron.db.init();
  } catch (err) {
    console.error("initDatabase failed:", err);
    return { success: false, message: err.message };
  }
}

// export async function getDatabaseStatus() {
//   try {
//     if (!isElectron()) {
//       console.log('Browser mode: mock database status');
//       return { 
//         school_count: 0, 
//         admin_count: 0,
//         school_completed: false,
//         admin_completed: false 
//       };
//     }
    
//     console.log('Getting database status...');
    
//     // Try multiple methods to get database status
    
//     // Method 1: Use the setup status endpoint which we know works
//     try {
//       const setupStatus = await window.electron.backend.fetchData('setup/status', 'GET');
//       console.log('Setup status for database:', setupStatus);
      
//       if (setupStatus) {
//         return {
//           school_count: setupStatus.school_completed ? 1 : 0,
//           admin_count: setupStatus.admin_completed ? 1 : 0,
//           school_completed: setupStatus.school_completed || false,
//           admin_completed: setupStatus.admin_completed || false,
//           initialized: true
//         };
//       }
//     } catch (e) {
//       console.log('Method 1 failed, trying method 2...', e);
//     }
    
//     // Method 2: Use db.status() as fallback
//     // const response = await window.electron.db.status();
//     // console.log('DB status response:', response);
    
//     // Handle different response formats
//     if (response && typeof response === 'object') {
//       // If response has school_count and admin_count directly
//       if (response.school_count !== undefined || response.admin_count !== undefined) {
//         return {
//           school_count: response.school_count || 0,
//           admin_count: response.admin_count || 0,
//           school_completed: response.school_count > 0 || false,
//           admin_completed: response.admin_count > 0 || false,
//           initialized: response.initialized || false
//         };
//       }
      
//       // If response has data nested
//       if (response.data) {
//         return {
//           school_count: response.data.school_count || 0,
//           admin_count: response.data.admin_count || 0,
//           school_completed: response.data.school_count > 0 || false,
//           admin_completed: response.data.admin_count > 0 || false,
//           initialized: response.data.initialized || false
//         };
//       }
//     }
    
//     // Default fallback
//     return { 
//       school_count: 0, 
//       admin_count: 0,
//       school_completed: false,
//       admin_completed: false,
//       initialized: false 
//     };
    
//   } catch (err) {
//     console.error("getDatabaseStatus failed:", err);
//     return { 
//       school_count: 0, 
//       admin_count: 0,
//       school_completed: false,
//       admin_completed: false,
//       initialized: false 
//     };
//   }
// }




// ============ STUDENTS ============

function normalizeDatabaseStatus(response) {
  // Default return structure
  const defaultStatus = {
    school_count: 0,
    admin_count: 0,
    school_completed: false,
    admin_completed: false,
    initialized: false
  };
  
  if (!response || typeof response !== 'object') {
    return defaultStatus;
  }
  
  // Log the response to see what we're getting
  console.log('normalizeDatabaseStatus received:', response);
  
  // Check if this is the setup status response format
  if (response.school_completed !== undefined || response.admin_completed !== undefined) {
    return {
      school_count: response.school_completed ? 1 : 0,
      admin_count: response.admin_completed ? 1 : 0,
      school_completed: response.school_completed || false,
      admin_completed: response.admin_completed || false,
      initialized: response.activated || response.school_completed || response.admin_completed || false,
      current_step: response.current_step,
      activated: response.activated
    };
  }
  
  // Helper to extract values from different response structures
  let schoolCompleted = false;
  let adminCompleted = false;
  let schoolCount = 0;
  let adminCount = 0;
  let initialized = false;
  
  // Check for direct properties
  if (response.school_completed !== undefined) {
    schoolCompleted = response.school_completed;
  }
  
  if (response.admin_completed !== undefined) {
    adminCompleted = response.admin_completed;
  }
  
  if (response.school_count !== undefined) {
    schoolCount = response.school_count;
  }
  
  if (response.admin_count !== undefined) {
    adminCount = response.admin_count;
  }
  
  if (response.initialized !== undefined) {
    initialized = response.initialized;
  }
  
  // Check nested data object
  if (response.data && typeof response.data === 'object') {
    const data = response.data;
    
    if (data.school_completed !== undefined) {
      schoolCompleted = data.school_completed;
    }
    
    if (data.admin_completed !== undefined) {
      adminCompleted = data.admin_completed;
    }
    
    if (data.school_count !== undefined) {
      schoolCount = data.school_count;
    }
    
    if (data.admin_count !== undefined) {
      adminCount = data.admin_count;
    }
    
    if (data.initialized !== undefined) {
      initialized = data.initialized;
    }
  }
  
  // Check result object (common in IPC responses)
  if (response.result && typeof response.result === 'object') {
    const result = response.result;
    
    if (result.school_completed !== undefined) {
      schoolCompleted = result.school_completed;
    }
    
    if (result.admin_completed !== undefined) {
      adminCompleted = result.admin_completed;
    }
    
    if (result.school_count !== undefined) {
      schoolCount = result.school_count;
    }
    
    if (result.admin_count !== undefined) {
      adminCount = result.admin_count;
    }
    
    if (result.initialized !== undefined) {
      initialized = result.initialized;
    }
  }
  
  // If we still don't have school_completed/admin_completed, derive from counts
  if (!schoolCompleted && schoolCount > 0) {
    schoolCompleted = true;
  }
  
  if (!adminCompleted && adminCount > 0) {
    adminCompleted = true;
  }
  
  return {
    school_count: schoolCount,
    admin_count: adminCount,
    school_completed: schoolCompleted,
    admin_completed: adminCompleted,
    initialized: initialized || (schoolCompleted || adminCompleted)
  };
}


export async function getDatabaseStatus() {
  try {
    if (!isElectron()) {
      console.log('Browser mode: mock database status');
      return { 
        school_count: 0, 
        admin_count: 0,
        school_completed: false,
        admin_completed: false,
        initialized: false 
      };
    }
    
    console.log('Getting database status via db.status()...');
    
    let response = null;
    
    try {
      // Use db.status() as the only method
      response = await api.get('/setup/status'); //http method
      console.log('DB status response:', response);
    } catch (e) {
      console.error('db.status() failed:', e);
      response = null;
    } 
    
    // Normalize the response
     return response;
    
  } catch (err) {
    console.error("getDatabaseStatus failed:", err);
    return { 
      school_count: 0, 
      admin_count: 0,
      school_completed: false,
      admin_completed: false,
      initialized: false 
    };
  }
}

// Helper function to normalize database status from various response formats




export async function getStudents() {
  try {
    if (!isElectron()) {
      return { students: [] };
    }
    const response = await window.electron.students.getAll();
    return response.students || [];
  } catch (err) {
    console.error("getStudents failed:", err);
    return [];
  }
}

export async function addStudent(studentData) {
  try {
    if (!isElectron()) {
      return { success: true, id: Date.now() };
    }
    return await window.electron.students.add(studentData);
  } catch (err) {
    console.error("addStudent failed:", err);
    return { success: false, message: err.message };
  }
}

export async function updateStudent(id, studentData) {
  try {
    if (!isElectron()) {
      return { success: true };
    }
    return await window.electron.students.update(id, studentData);
  } catch (err) {
    console.error("updateStudent failed:", err);
    return { success: false, message: err.message };
  }
}

export async function deleteStudent(id) {
  try {
    if (!isElectron()) {
      return { success: true };
    }
    return await window.electron.students.delete(id);
  } catch (err) {
    console.error("deleteStudent failed:", err);
    return { success: false, message: err.message };
  }
}

export async function searchStudents(query) {
  try {
    if (!isElectron()) {
      return { students: [] };
    }
    const response = await window.electron.students.search(query);
    return response.students || [];
  } catch (err) {
    console.error("searchStudents failed:", err);
    return [];
  }
}

// ============ STAFF ============
export async function getStaff() {
  try {
    if (!isElectron()) {
      return { staff: [] };
    }
    const response = await window.electron.staff.getAll();
    return response.staff || [];
  } catch (err) {
    console.error("getStaff failed:", err);
    return [];
  }
}

export async function addStaff(staffData) {
  try {
    if (!isElectron()) {
      return { success: true, id: Date.now() };
    }
    return await window.electron.staff.add(staffData);
  } catch (err) {
    console.error("addStaff failed:", err);
    return { success: false, message: err.message };
  }
}

export async function updateStaff(id, staffData) {
  try {
    if (!isElectron()) {
      return { success: true };
    }
    return await window.electron.staff.update(id, staffData);
  } catch (err) {
    console.error("updateStaff failed:", err);
    return { success: false, message: err.message };
  }
}

export async function deleteStaff(id) {
  try {
    if (!isElectron()) {
      return { success: true };
    }
    return await window.electron.staff.delete(id);
  } catch (err) {
    console.error("deleteStaff failed:", err);
    return { success: false, message: err.message };
  }
}

// ============ DASHBOARD ============
export async function getDashboardStats() {
  try {
    if (!isElectron()) {
      return {
        totalStudents: 0,
        totalStaff: 0,
        recentStudents: [],
        recentStaff: []
      };
    }
    return await window.electron.dashboard.getStats();
  } catch (err) {
    console.error("getDashboardStats failed:", err);
    return {
      totalStudents: 0,
      totalStaff: 0,
      recentStudents: [],
      recentStaff: []
    };
  }
}

// ============ SETTINGS ============
export async function getSettings() {
  try {
    if (!isElectron()) {
      return { settings: {} };
    }
    const response = await window.electron.settings.get();
    return response.settings || {};
  } catch (err) {
    console.error("getSettings failed:", err);
    return {};
  }
}

export async function updateSettings(settings) {
  try {
    if (!isElectron()) {
      return { success: true };
    }
    return await window.electron.settings.update(settings);
  } catch (err) {
    console.error("updateSettings failed:", err);
    return { success: false, message: err.message };
  }
}

// ============ SYSTEM ============
export async function checkHealth() {
  try {
    if (!isElectron()) {
      return { status: 'healthy' };
    }
    return await window.electron.system.health();
  } catch (err) {
    console.error("checkHealth failed:", err);
    return { status: 'unhealthy' };
  }
}

export async function getSystemInfo() {
  try {
    if (!isElectron()) {
      return { platform: 'browser', version: '1.0.0' };
    }
    return await window.electron.system.info();
  } catch (err) {
    console.error("getSystemInfo failed:", err);
    return null;
  }
}

// ============ BACKUP ============
export async function createBackup() {
  try {
    if (!isElectron()) {
      return { success: true, file: 'mock-backup.db' };
    }
    return await window.electron.backup.create();
  } catch (err) {
    console.error("createBackup failed:", err);
    return { success: false, message: err.message };
  }
}

export async function listBackups() {
  try {
    if (!isElectron()) {
      return { backups: [] };
    }
    const response = await window.electron.backup.list();
    return response.backups || [];
  } catch (err) {
    console.error("listBackups failed:", err);
    return [];
  }
}

export async function restoreBackup(fileName) {
  try {
    if (!isElectron()) {
      return { success: true };
    }
    return await window.electron.backup.restore(fileName);
  } catch (err) {
    console.error("restoreBackup failed:", err);
    return { success: false, message: err.message };
  }
}

// ============ GENERIC ============
export async function callPython(type, action, data = {}) {
  try {
    if (!isElectron()) {
      console.log(`Browser mode: mock call to ${type}/${action}`);
      return { success: true };
    }
    return await window.electron.python.invoke(type, action, data);
  } catch (err) {
    console.error(`callPython failed (${type}/${action}):`, err);
    throw err;
  }
}

// ============ NAMED EXPORTS ============
// export {
//   // Helper
//   // isElectron,
  
//   // Activation
//   checkActivationStatus,
//   activateSystem,
//   deactivateSystem,
//   getFingerprint,
  
//   // Auth
//   login,
//   logout,
//   checkSession,
//   bootstrapSuperAdmin,
  
//   // Database
//   initDatabase,
//   getDatabaseStatus,
  
//   // Students
//   getStudents,
//   addStudent,
//   updateStudent,
//   deleteStudent,
//   searchStudents,
  
//   // Staff
//   getStaff,
//   addStaff,
//   updateStaff,
//   deleteStaff,
  
//   // Dashboard
//   getDashboardStats,
  
//   // Settings
//   getSettings,
//   updateSettings,
  
//   // System
//   checkHealth,
//   getSystemInfo,
  
//   // Backup
//   createBackup,
//   listBackups,
//   restoreBackup,
  
//   // Generic
//   callPython
// };

// ============ DEFAULT EXPORT ============
export default {
  // Helper
  isElectron,
  
  // Activation
  checkActivationStatus,
  activateSystem,
  deactivateSystem,
  getFingerprint,
  


    // ... other exports
  setupSchoolAndAdmin,


  // Auth
  login,
  logout,
  checkSession,
  bootstrapSuperAdmin,
  
  // Database
  initDatabase,
  getDatabaseStatus,
  
  // Students
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  
  // Staff
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  
  // Dashboard
  getDashboardStats,
  
  // Settings
  getSettings,
  updateSettings,
  
  // System
  checkHealth,
  getSystemInfo,
  
  // Backup
  createBackup,
  listBackups,
  restoreBackup,
  
  // Generic
  callPython
};