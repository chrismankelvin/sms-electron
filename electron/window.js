// window.js 
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
    show: true, // Set to true to force show
    backgroundColor: '#2e3440', // Dark background so we can see it
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

    mainWindow.webContents.openDevTools({ mode: 'right' }); // <-- ADD THIS

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
    // Fallback HTML
    mainWindow.loadURL(`data:text/html,<h1>Build not found</h1><p>Run: npm run build</p>`);
  }

  // Force show and open dev tools
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.openDevTools();
  
  console.log('Window created and shown');

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  // Keep your existing menu code
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
module.exports = { createWindow };