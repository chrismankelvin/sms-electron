// electron/window.js - Enhanced with better error handling and IPC integration
import { app, BrowserWindow, Menu, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let pythonProcess;

export function createWindow(pythonProcessRef) {
  // Store reference to pythonProcess
  pythonProcess = pythonProcessRef;
  
  console.log('🪟 Creating main window...');
  
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
      devTools: true, // Enable dev tools always
    },
    show: false, // Don't show until ready
    backgroundColor: '#2e3440',
    frame: true,
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../public/icon.ico'), // Add your icon
  });

  // Add event listeners for debugging
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Window finished loading content');
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Failed to load:', {
      errorCode,
      errorDescription,
      validatedURL
    });
    
    // Show error page with retry option
    showErrorPage(errorDescription);
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('📄 DOM is ready');
  });

  // Capture console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levels = ['verbose', 'info', 'warning', 'error'];
    console.log(`📱 Renderer [${levels[level] || 'log'}]: ${message}`);
  });

  // Handle unresponsive process
  mainWindow.webContents.on('unresponsive', () => {
    console.error('❌ Window is unresponsive');
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Application Unresponsive',
      message: 'The application is not responding. Would you like to restart it?',
      buttons: ['Restart', 'Close'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) {
        app.relaunch();
        app.exit();
      }
    });
  });

  // Check if we're in development mode
  const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // DEVELOPMENT: Try Vite dev server first
    const devUrl = 'http://localhost:5173';
    console.log(`🌐 Development mode: loading from ${devUrl}`);
    
    // Try to load dev server with retry
    loadWithRetry(devUrl, 3, 1000);
  } else {
    // PRODUCTION: Load from build
    loadBuild();
  }

  function loadWithRetry(url, retries, delay) {
    console.log(`🔄 Loading URL: ${url} (${retries} retries left)`);
    
    mainWindow.loadURL(url)
      .then(() => {
        console.log('✅ Successfully loaded from dev server');
        mainWindow.show();
        mainWindow.focus();
        
        // Open DevTools automatically in dev mode
        mainWindow.webContents.openDevTools({ mode: 'right' });
      })
      .catch((error) => {
        console.log(`⚠️ Failed to load from dev server: ${error.message}`);
        
        if (retries > 0) {
          console.log(`⏳ Retrying in ${delay}ms... (${retries} retries left)`);
          setTimeout(() => {
            loadWithRetry(url, retries - 1, delay * 1.5);
          }, delay);
        } else {
          console.log('❌ All retries failed, falling back to build...');
          loadBuild();
        }
      });
  }

  function loadBuild() {
    const distPath = path.join(__dirname, '../dist/index.html');
    console.log('📁 Loading from build:', distPath);
    
    if (fs.existsSync(distPath)) {
      mainWindow.loadFile(distPath)
        .then(() => {
          console.log('✅ Successfully loaded from build');
          mainWindow.show();
          mainWindow.focus();
        })
        .catch(err => {
          console.error('❌ Failed to load build:', err);
          showErrorPage(err.message);
        });
    } else {
      console.error('❌ Build not found at:', distPath);
      console.log('📁 Current directory:', __dirname);
      console.log('📁 Expected build path:', distPath);
      
      // Show error page with instructions
      showErrorPage(`
        Build not found!<br><br>
        Please run: <code>npm run build</code><br><br>
        Expected path: ${distPath}
      `);
    }
  }

  function showErrorPage(errorMessage = 'Unknown error') {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Error - School Management System</title>
          <style>
            body {
              background: #2e3440;
              color: #eceff4;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              padding: 2rem;
              box-sizing: border-box;
            }
            .error-container {
              max-width: 600px;
              text-align: center;
            }
            h1 {
              color: #bf616a;
              font-size: 2rem;
              margin-bottom: 1rem;
            }
            .error-message {
              background: #3b4252;
              padding: 1rem;
              border-radius: 8px;
              margin: 1rem 0;
              font-family: monospace;
              text-align: left;
              white-space: pre-wrap;
              word-break: break-word;
            }
            code {
              background: #434c5e;
              padding: 0.2rem 0.4rem;
              border-radius: 4px;
              font-family: monospace;
            }
            button {
              background: #5e81ac;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 6px;
              font-size: 1rem;
              cursor: pointer;
              margin: 0.5rem;
              transition: background 0.2s;
            }
            button:hover {
              background: #81a1c1;
            }
            button.secondary {
              background: #4c566a;
            }
            button.secondary:hover {
              background: #616e88;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>❌ Failed to Load Application</h1>
            <div class="error-message">${errorMessage}</div>
            <p>Try the following:</p>
            <button onclick="location.reload()">🔄 Reload</button>
            <button class="secondary" onclick="window.electron?.utils?.ping()">🔍 Check Backend</button>
            <p style="margin-top: 2rem; color: #8fbcbb; font-size: 0.9rem;">
              <code>School Management System</code>
            </p>
          </div>
          <script>
            console.log('Error page loaded');
            
            // Check if Electron API is available
            if (window.electron) {
              console.log('✅ Electron API available in error page');
              
              // Optional: Try to ping backend
              document.querySelector('.secondary').addEventListener('click', async () => {
                try {
                  const result = await window.electron.utils.ping();
                  alert('✅ Backend is reachable!');
                  console.log('Backend health:', result);
                } catch (err) {
                  alert('❌ Backend is not reachable: ' + err.message);
                }
              });
            } else {
              console.log('❌ Electron API not available in error page');
            }
          </script>
        </body>
      </html>
    `;
    
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`)
      .then(() => {
        mainWindow.show();
        mainWindow.focus();
      })
      .catch(err => {
        console.error('❌ Even error page failed to load:', err);
      });
  }

  // Handle closed window
  mainWindow.on('closed', () => {
    console.log('🪟 Window closed');
    mainWindow = null;
  });

  // Handle before close - cleanup
  mainWindow.on('close', (e) => {
    console.log('🪟 Window closing...');
    
    if (pythonProcess) {
      console.log('🛑 Cleaning up Python process...');
      try {
        if (process.platform === 'win32') {
          spawnSync('taskkill', ['/pid', pythonProcess.pid, '/f', '/t']);
        } else {
          pythonProcess.kill('SIGTERM');
        }
        console.log('✅ Python process terminated');
      } catch (e) {
        console.error('❌ Failed to kill Python process:', e);
        pythonProcess.kill();
      }
    }
  });

  // Create application menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate', '/');
            }
          }
        },
        {
          label: 'Students',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate', '/students');
            }
          }
        },
        {
          label: 'Staff',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate', '/staff');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            if (pythonProcess) {
              try {
                if (process.platform === 'win32') {
                  spawnSync('taskkill', ['/pid', pythonProcess.pid, '/f', '/t']);
                } else {
                  pythonProcess.kill('SIGTERM');
                }
              } catch (e) {
                pythonProcess.kill();
              }
            }
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', accelerator: 'CmdOrCtrl+R' },
        { role: 'forcereload', accelerator: 'CmdOrCtrl+Shift+R' },
        { type: 'separator' },
        { role: 'toggledevtools', accelerator: 'F12' },
        { type: 'separator' },
        { role: 'resetzoom', accelerator: 'CmdOrCtrl+0' },
        { role: 'zoomin', accelerator: 'CmdOrCtrl+Plus' },
        { role: 'zoomout', accelerator: 'CmdOrCtrl+-' },
        { type: 'separator' },
        {
          label: 'Toggle Full Screen',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check Backend Status',
          click: async () => {
            try {
              if (mainWindow && mainWindow.webContents) {
                const result = await mainWindow.webContents.executeJavaScript(`
                  window.electron?.utils?.ping?.().then(r => r).catch(e => ({ error: e.message }))
                `);
                
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Backend Status',
                  message: result?.error ? '❌ Backend Error' : '✅ Backend is Running',
                  detail: result?.error ? result.error : JSON.stringify(result, null, 2)
                });
              }
            } catch (err) {
              dialog.showErrorBox('Backend Error', err.message);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About School Management System',
              message: 'School Management System v1.0.0',
              detail: 'Electron + React + Python Desktop Application\n\n'
                     + 'IPC Communication via stdin/stdout\n'
                     + 'FastAPI Backend with SQLite Database'
            });
          }
        }
      ]
    }
  ]);
  
  Menu.setApplicationMenu(menu);
  
  console.log('✅ Window creation complete');
  return mainWindow;
}

export function getMainWindow() {
  return mainWindow;
}

export function closePythonProcess() {
  if (pythonProcess) {
    console.log('🛑 Closing Python process...');
    try {
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/pid', pythonProcess.pid, '/f', '/t']);
      } else {
        pythonProcess.kill('SIGTERM');
      }
      console.log('✅ Python process closed');
    } catch (e) {
      console.error('❌ Failed to kill Python process:', e);
      pythonProcess.kill();
    }
  }
}

export function sendToRenderer(channel, ...args) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, ...args);
  }
}