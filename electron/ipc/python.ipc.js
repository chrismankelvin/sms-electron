// electron/ipc/python.ipc.js
import { ipcMain } from 'electron';

export function setupPythonHandlers(pythonProcess) {
  console.log('🔌 Setting up Python IPC handler...');
  console.log('📡 Ready to route requests to Python backend');

  // Single handler for ALL Python requests
  ipcMain.handle('python-request', async (event, { type, action, data = {} }) => {
    const requestId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    console.log(`📨 Python request [${requestId}]: ${type}/${action}`);
    if (data) console.log(`   Data:`, JSON.stringify(data).substring(0, 100) + (JSON.stringify(data).length > 100 ? '...' : ''));
    
    return new Promise((resolve, reject) => {
      // Buffer to collect data chunks
      let buffer = '';
      let responseReceived = false;
      
      // Listen for response from Python
      const responseHandler = (chunk) => {
        if (responseReceived) return; // Already handled
        
        buffer += chunk.toString();
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const response = JSON.parse(line);
            
            // Check if this response matches our request
            if (response.requestId === requestId) {
              responseReceived = true;
              
              // Clean up listener
              pythonProcess.stdout.removeListener('data', responseHandler);
              clearTimeout(timeoutId);
              
              if (response.error) {
                console.error(`❌ Python error [${requestId}]:`, response.error);
                reject(new Error(response.error));
              } else if (response.status === 'error') {
                console.error(`❌ Python error [${requestId}]:`, response.error || 'Unknown error');
                reject(new Error(response.error || 'Unknown error'));
              } else {
                console.log(`✅ Python response [${requestId}]:`, 
                  response.result ? 'success' : 'completed');
                resolve(response.result || response);
              }
              return;
            }
          } catch (e) {
            // Not JSON or not our response - just log as stdout
            console.log(`📄 Python stdout [${requestId}]:`, line);
          }
        }
      };
      
      // Attach listener
      pythonProcess.stdout.on('data', responseHandler);
      
      // Handle stderr separately (for logging)
      pythonProcess.stderr.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(l => l.trim());
        lines.forEach(line => {
          console.log(`🐍 Python [${requestId}]:`, line);
        });
      });
      
      // Send request to Python
      const request = { requestId, type, action, data };
      const requestJson = JSON.stringify(request) + '\n';
      
      console.log(`📤 Sending to Python [${requestId}]: ${type}/${action}`);
      pythonProcess.stdin.write(requestJson);
      
      // Set timeout (30 seconds for most operations, adjust as needed)
      const timeoutMs = (type === 'backup' || type === 'sync') ? 60000 : 30000;
      const timeoutId = setTimeout(() => {
        if (responseReceived) return;
        
        pythonProcess.stdout.removeListener('data', responseHandler);
        console.error(`⏰ Timeout [${requestId}]: ${type}/${action} (after ${timeoutMs/1000}s)`);
        reject(new Error(`Request timeout: ${type}/${action} (after ${timeoutMs/1000}s)`));
      }, timeoutMs);
    });
  });

  // Handle Python process errors
  pythonProcess.on('error', (err) => {
    console.error('❌ Python process error:', err);
  });

  pythonProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Python process exited normally');
    } else {
      console.error(`❌ Python process exited with code ${code}`);
    }
  });

  // Optional: Add a health check handler
  ipcMain.handle('python-health', async () => {
    return {
      status: pythonProcess && !pythonProcess.killed ? 'running' : 'stopped',
      pid: pythonProcess?.pid
    };
  });

  console.log('✅ Python IPC handler registered');
  console.log('📡 Available request types: activation, auth, settings, students, staff, dashboard, system, backup');
}

// Helper function to send requests from main process if needed
export async function sendToPython(pythonProcess, type, action, data = {}) {
  const requestId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  return new Promise((resolve, reject) => {
    let buffer = '';
    let responseReceived = false;
    
    const responseHandler = (chunk) => {
      if (responseReceived) return;
      
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const response = JSON.parse(line);
          if (response.requestId === requestId) {
            responseReceived = true;
            pythonProcess.stdout.removeListener('data', responseHandler);
            clearTimeout(timeoutId);
            
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.result || response);
            }
            return;
          }
        } catch (e) {
          console.log(`📄 Python:`, line);
        }
      }
    };
    
    pythonProcess.stdout.on('data', responseHandler);
    
    const request = { requestId, type, action, data };
    pythonProcess.stdin.write(JSON.stringify(request) + '\n');
    
    const timeoutId = setTimeout(() => {
      pythonProcess.stdout.removeListener('data', responseHandler);
      reject(new Error(`Timeout: ${type}/${action}`));
    }, 30000);
  });
}