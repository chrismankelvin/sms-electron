// src/services/ipc.service.js
class IPCService {
  async invoke(type, action, data = {}) {
    // Check if we're in Electron environment
    if (!window.electron) {
      console.warn('Not in Electron environment, using mock data');
      return this.getMockResponse(type, action, data);
    }
    
    try {
      // Use the preload API structure from your electron/ipc files
      const result = await window.electron[type]?.[action]?.(data);
      
      if (result === undefined) {
        // Fallback to generic invoke if specific method doesn't exist
        return await window.electron.python.invoke(type, action, data);
      }
      
      return result;
    } catch (error) {
      console.error(`IPC call failed: ${type}/${action}`, error);
      throw error;
    }
  }

  getMockResponse(type, action, data) {
    // Simulate network delay
    return new Promise(resolve => {
      setTimeout(() => {
        switch(type) {
          case 'activation':
            if (action === 'status') return resolve({ activated: false });
            if (action === 'activate') return resolve({ success: true });
            break;
          case 'auth':
            if (action === 'login') return resolve({ success: true, user: { id: 1, username: 'admin' } });
            break;
          case 'students':
            if (action === 'get-all') return resolve({ students: [] });
            break;
          case 'staff':
            if (action === 'get-all') return resolve({ staff: [] });
            break;
          default:
            return resolve({ success: true });
        }
        resolve({ success: true });
      }, 500);
    });
  }
}

export const ipcService = new IPCService();