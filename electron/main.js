// electron/main.js
import { app } from 'electron';
import { createWindow } from './window.js';
import { setupPythonHandlers } from './ipc/python.ipc.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let pythonProcess = null;

async function startPythonBackend() {
  console.log('🚀 Starting Python backend...');
  
  const pythonPath = process.platform === 'win32' 
    ? 'python' 
    : 'python3';
  
  const scriptPath = path.join(__dirname, '../backend/run.py');
  
  pythonProcess = spawn(pythonPath, [scriptPath], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  });
  
  // Set up IPC handlers
  setupPythonHandlers(pythonProcess);
  
  pythonProcess.on('spawn', () => {
    console.log('✅ Python process started with PID:', pythonProcess.pid);
  });
  
  return pythonProcess;
}

app.whenReady().then(async () => {
  await startPythonBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (pythonProcess) {
      pythonProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (pythonProcess) {
    console.log('🛑 Stopping Python process...');
    pythonProcess.kill();
  }
});