// electron/preload.js
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // =========================
  // GENERIC - One method to call any Python function
  // =========================
  python: {
    invoke: (type, action, data = {}) => 
      ipcRenderer.invoke('python-request', { type, action, data })
  },
  
// In electron/preload.js, add to the exposed object:


  backend: {
    fetchData: (endpoint, method = 'GET', data = null) => 
      ipcRenderer.invoke('python-request', { 
        type: 'api', 
        action: 'request',
        data: { endpoint, method, data }
      })
  },
  


setup: {
  schoolAndAdmin: (formData) => ipcRenderer.invoke('python-request', {
    type: 'setup',
    action: 'school-and-admin',
    data: formData
  })
},

  // =========================
  // ACTIVATION
  // =========================
  activation: {
    status: () => ipcRenderer.invoke('python-request', { 
      type: 'activation', 
      action: 'status' 
    }),
      getMachineId: () => ipcRenderer.invoke('python-request', { type: 'activation', action: 'machine-id' }),
    
    activate: (code, schoolName) => ipcRenderer.invoke('python-request', { 
      type: 'activation', 
      action: 'activate', 
      data: { code, schoolName } 
    }),
    deactivate: () => ipcRenderer.invoke('python-request', { 
      type: 'activation', 
      action: 'deactivate' 
    }),
    fingerprint: () => ipcRenderer.invoke('python-request', { 
      type: 'activation', 
      action: 'fingerprint' 
    }),
    initTables: () => ipcRenderer.invoke('python-request', { 
      type: 'activation', 
      action: 'init-tables' 
    }),
    getStatus: () => ipcRenderer.invoke('python-request', { 
      type: 'activation', 
      action: 'get-status' 
    }),
       stagenow: () => ipcRenderer.invoke('python-request', { 
      type: 'activation', 
      action: 'get-status' 
    })
  },

  // =========================
  // AUTHENTICATION
  // =========================
  // auth: {
  //   login: (username, password, role = null) => ipcRenderer.invoke('python-request', { 
  //     type: 'auth', 
  //     action: 'login', 
  //     data: { username, password, role } 
  //   }),
  //   logout: () => ipcRenderer.invoke('python-request', { 
  //     type: 'auth', 
  //     action: 'logout' 
  //   }),
  //   session: () => ipcRenderer.invoke('python-request', { 
  //     type: 'auth', 
  //     action: 'session' 
  //   }),
  //   bootstrap: (username, password) => ipcRenderer.invoke('python-request', { 
  //     type: 'auth', 
  //     action: 'bootstrap', 
  //     data: { username, password } 
  //   })
  // },

    auth: {
    login: (username, password, role) => 
      ipcRenderer.invoke('python-request', { 
        type: 'auth', 
        action: 'login', 
        data: { username, password, role } 
      }),
    logout: (session_id) => 
      ipcRenderer.invoke('python-request', { 
        type: 'auth', 
        action: 'logout', 
        data: { session_id } 
      }),
    session: (session_id) => 
      ipcRenderer.invoke('python-request', { 
        type: 'auth', 
        action: 'session', 
        data: { session_id } 
      }),
    bootstrap: (username, password) => 
      ipcRenderer.invoke('python-request', { 
        type: 'auth', 
        action: 'bootstrap', 
        data: { username, password } 
      })
  },



  // =========================
  // STUDENTS
  // =========================
  students: {
    getAll: () => ipcRenderer.invoke('python-request', { 
      type: 'students', 
      action: 'get-all' 
    }),
    add: (studentData) => ipcRenderer.invoke('python-request', { 
      type: 'students', 
      action: 'add', 
      data: studentData 
    }),
    update: (id, studentData) => ipcRenderer.invoke('python-request', { 
      type: 'students', 
      action: 'update', 
      data: { id, ...studentData } 
    }),
    delete: (id) => ipcRenderer.invoke('python-request', { 
      type: 'students', 
      action: 'delete', 
      data: { id } 
    }),
    search: (query) => ipcRenderer.invoke('python-request', { 
      type: 'students', 
      action: 'search', 
      data: { query } 
    }),
    getByClass: (className) => ipcRenderer.invoke('python-request', { 
      type: 'students', 
      action: 'get-by-class', 
      data: { class: className } 
    })
  },

  // =========================
  // STAFF
  // =========================
  staff: {
    getAll: () => ipcRenderer.invoke('python-request', { 
      type: 'staff', 
      action: 'get-all' 
    }),
    add: (staffData) => ipcRenderer.invoke('python-request', { 
      type: 'staff', 
      action: 'add', 
      data: staffData 
    }),
    update: (id, staffData) => ipcRenderer.invoke('python-request', { 
      type: 'staff', 
      action: 'update', 
      data: { id, ...staffData } 
    }),
    delete: (id) => ipcRenderer.invoke('python-request', { 
      type: 'staff', 
      action: 'delete', 
      data: { id } 
    }),
    getByRole: (role) => ipcRenderer.invoke('python-request', { 
      type: 'staff', 
      action: 'get-by-role', 
      data: { role } 
    })
  },

  // =========================
  // DASHBOARD
  // =========================
  dashboard: {
    getStats: () => ipcRenderer.invoke('python-request', { 
      type: 'dashboard', 
      action: 'stats' 
    })
  },

  // =========================
  // SETTINGS
  // =========================
  settings: {
    get: () => ipcRenderer.invoke('python-request', { 
      type: 'settings', 
      action: 'get' 
    }),
    update: (settings) => ipcRenderer.invoke('python-request', { 
      type: 'settings', 
      action: 'update', 
      data: settings 
    })
  },

  // =========================
  // SYSTEM
  // =========================
  system: {
    health: () => ipcRenderer.invoke('python-request', { 
      type: 'system', 
      action: 'health' 
    }),
    info: () => ipcRenderer.invoke('python-request', { 
      type: 'system', 
      action: 'info' 
    }),
    resources: () => ipcRenderer.invoke('python-request', { 
      type: 'system', 
      action: 'resources' 
    })
  },

  // =========================
  // BACKUP & RESTORE
  // =========================
  backup: {
    create: () => ipcRenderer.invoke('python-request', { 
      type: 'backup', 
      action: 'create' 
    }),
    list: () => ipcRenderer.invoke('python-request', { 
      type: 'backup', 
      action: 'list' 
    }),
    restore: (fileName) => ipcRenderer.invoke('python-request', { 
      type: 'backup', 
      action: 'restore', 
      data: { file: fileName } 
    })
  },

  // =========================
  // DATABASE
  // =========================
  db: {
    query: (sql, params = []) => ipcRenderer.invoke('python-request', { 
      type: 'db', 
      action: 'query', 
      data: { sql, params } 
    }),
    init: () => ipcRenderer.invoke('python-request', { 
      type: 'db', 
      action: 'init-tables' 
    }),
    status: () => ipcRenderer.invoke('python-request', { 
      type: 'db', 
      action: 'status' 
    }),
      SetupStatus: () => ipcRenderer.invoke('python-request', { 
      type: 'db', 
      action: 'get-status' 
    })
  },

  // =========================
  // UTILITIES
  // =========================
  utils: {
    ping: () => ipcRenderer.invoke('python-request', { 
      type: 'system', 
      action: 'health' 
    })
  },

  // =========================
  // RECOVERY
  // =========================
   // NEW: Recovery methods
  recovery: {
 
    // importToMainApp: (encryptedBlob, schoolEmail) => ipcRenderer.invoke('python-request', { 
    //   type: 'recovery', 
    //   action: 'importToMainApp', 
    //   data: { encryptedBlob, schoolEmail } 
    // }),
   
    // verifyMainAppData: () => ipcRenderer.invoke('python-request', { 
    //   type: 'recovery', 
    //   action: 'verifyMainAppData' 
    // })
    
  },


  




});

// Log that preload is ready (for debugging)
console.log('✅ Electron preload script loaded with all IPC handlers');