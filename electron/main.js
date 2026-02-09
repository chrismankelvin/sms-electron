import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix for Linux sandbox and shared memory issues
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-dev-shm-usage');
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  app.commandLine.appendSwitch('use-gl', 'desktop');
  app.commandLine.appendSwitch('use-angle', 'swiftshader');
  app.commandLine.appendSwitch('in-process-gpu');
  app.disableHardwareAcceleration();
}

let mainWindow;
let pythonProcess;

function startPythonBackend() {
  const backendDir = path.join(__dirname, '../backend');
  const backendScript = path.join(backendDir, 'run.py');
  
  let pythonExec;
  
  if (process.platform === 'win32') {
    pythonExec = path.join(backendDir, 'venv', 'Scripts', 'python.exe');
  } else {
    pythonExec = path.join(backendDir, '.venv', 'bin', 'python');
  }

  try {
    console.log('Starting Python backend with:', pythonExec);
    console.log('Backend script:', backendScript);
    
    if (!fs.existsSync(pythonExec)) {
      console.error(`Python executable not found at: ${pythonExec}`);
      return;
    }

    pythonProcess = spawn(pythonExec, [backendScript], {
      cwd: backendDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        PYTHONPATH: backendDir,
        VIRTUAL_ENV: path.join(backendDir, '.venv')
      }
    });

    pythonProcess.on('exit', (code) => {
      console.log(`Python backend exited with code ${code}`);
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python backend:', err);
    });

    console.log('Python backend started');
  } catch (error) {
    console.error('Error starting Python backend:', error);
  }
}

function createWindow() {
  console.log('Creating window...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: true,
    backgroundColor: '#2e3440',
  });

  // Add event listeners for debugging
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window finished loading content');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', {
      errorCode,
      errorDescription,
      validatedURL
    });
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM is ready');
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer console [${level}]: ${message}`);
  });

  // Load the production build
  const distPath = path.join(__dirname, '../dist/index.html');
  console.log('Loading from:', distPath);
  
  if (fs.existsSync(distPath)) {
    console.log('dist/index.html exists, loading file...');
    mainWindow.loadFile(distPath).then(() => {
      console.log('loadFile() promise resolved');
    }).catch(err => {
      console.error('loadFile() failed:', err);
    });
  } else {
    console.error('dist/index.html does not exist!');
    mainWindow.loadURL(`data:text/html,<h1>Build not found</h1><p>Run: npm run build</p>`);
  }

  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.openDevTools();
  
  console.log('Window created and shown');

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            if (pythonProcess) pythonProcess.kill();
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' }
      ]
    }
  ]);
  
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  startPythonBackend();
  
  setTimeout(() => {
    createWindow(); // <-- This is called!
  }, 1000);
});

app.on('window-all-closed', () => {
  if (pythonProcess) pythonProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});