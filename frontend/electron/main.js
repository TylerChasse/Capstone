/**
 * main.js - Electron Main Process
 *
 * This is the entry point for the Electron desktop app.
 * It creates the browser window and handles native OS features
 * that the web app can't access directly (like file dialogs).
 *
 * Electron apps have two processes:
 *   - Main process (this file): Node.js, can access OS APIs
 *   - Renderer process (React app): Runs in browser, limited access
 *
 * Communication between them uses IPC (Inter-Process Communication).
 */

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const { spawn, execSync } = require('child_process');
const path = require('path');

// =============================================================================
// WIRESHARK CHECK
// =============================================================================

function isTsharkAvailable() {
  const candidates = [
    'tshark',
    'C:\\Program Files\\Wireshark\\tshark.exe',
    'C:\\Program Files (x86)\\Wireshark\\tshark.exe',
  ];
  for (const cmd of candidates) {
    try {
      execSync(`"${cmd}" -v`, { stdio: 'ignore' });
      return true;
    } catch {}
  }
  return false;
}

async function enforceWireshark() {
  if (isTsharkAvailable()) return true;

  const { response } = await dialog.showMessageBox({
    type: 'error',
    title: 'Wireshark Required',
    message: 'Wireshark is not installed.',
    detail:
      'Network Analyzer requires Wireshark to capture packets.\n\n' +
      'Please install Wireshark (which includes tshark), then relaunch the app.',
    buttons: ['Download Wireshark', 'Quit'],
    defaultId: 0,
    cancelId: 1,
  });

  if (response === 0) {
    shell.openExternal('https://www.wireshark.org/download.html');
  }
  app.quit();
  return false;
}

// Disable GPU acceleration to prevent black screen on some Windows systems
app.disableHardwareAcceleration();

let mainWindow;
let backendProcess;

// =============================================================================
// BACKEND PROCESS
// =============================================================================

function killPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    for (const line of result.trim().split('\n')) {
      if (line.includes('LISTENING')) {
        const pid = line.trim().split(/\s+/).pop();
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      }
    }
  } catch {}
}

function startBackend() {
  killPort(8000);
  let cmd, args, opts;

  if (app.isPackaged) {
    // Production: run the bundled api.exe from extraResources
    cmd = path.join(process.resourcesPath, 'api.exe');
    args = [];
    opts = { windowsHide: true };
  } else {
    // Development: run api.py directly with Python from the venv
    const apiScript = path.join(__dirname, '../../backend/api.py');
    cmd = 'C:\\Python313\\python.exe';
    args = [apiScript];
    opts = { windowsHide: false };
  }

  backendProcess = spawn(cmd, args, opts);

  backendProcess.stdout?.on('data', (data) => {
    console.log('[backend]', data.toString().trim());
  });
  backendProcess.stderr?.on('data', (data) => {
    console.error('[backend]', data.toString().trim());
  });
  backendProcess.on('exit', (code) => {
    console.log(`[backend] exited with code ${code}`);
    backendProcess = null;
  });
}

function stopBackend() {
  if (backendProcess) {
    const pid = backendProcess.pid;
    backendProcess = null;
    try {
      execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
    } catch {}
  }
  killPort(8000);
}

function waitForBackend(url, timeoutMs = 30000) {
  const http = require('http');
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function poll() {
      http.get(url, (res) => {
        res.resume();
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Backend did not start in time'));
        } else {
          setTimeout(poll, 250);
        }
      });
    }
    poll();
  });
}

function registerCleanup() {
  app.on('before-quit', stopBackend);
  app.on('will-quit', stopBackend);
  process.on('exit', stopBackend);
  process.on('SIGINT', () => { stopBackend(); process.exit(0); });
  process.on('SIGTERM', () => { stopBackend(); process.exit(0); });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    stopBackend();
    process.exit(1);
  });
}

// =============================================================================
// WINDOW CREATION
// =============================================================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,                // Remove native title bar — custom menu bar in React
    webPreferences: {
      nodeIntegration: false,    // Security: don't expose Node.js to renderer
      contextIsolation: true,    // Security: isolate preload script context
      preload: path.join(__dirname, 'preload.js'),  // Bridge script
    },
  });

  // In development, load from Vite dev server (hot reload)
  // In production, load the built files
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

}

// =============================================================================
// APP LIFECYCLE
// =============================================================================

// Create window when Electron is ready
app.whenReady().then(async () => {
  registerCleanup();
  if (!await enforceWireshark()) return;
  startBackend();
  Menu.setApplicationMenu(null);   // Remove native menu entirely (prevents Alt key popup)
  try {
    await waitForBackend('http://127.0.0.1:8000');
  } catch (err) {
    dialog.showErrorBox('Backend Failed to Start', err.message);
    app.quit();
    return;
  }
  createWindow();
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS: re-create window when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// =============================================================================
// IPC HANDLERS - File Dialogs
// =============================================================================
// These let the React app show native file dialogs through the preload bridge

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: options.defaultPath || 'capture.json',
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  return result;
});

// =============================================================================
// IPC HANDLERS - Window Controls & View Actions
// =============================================================================
// Custom menu bar needs IPC to control the window since native frame is removed

ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow.close());
ipcMain.on('app-quit', () => app.quit());

ipcMain.on('window-reload', () => mainWindow.reload());
ipcMain.on('window-force-reload', () => mainWindow.webContents.reloadIgnoringCache());
ipcMain.on('window-toggle-devtools', () => mainWindow.webContents.toggleDevTools());
ipcMain.on('window-reset-zoom', () => mainWindow.webContents.setZoomLevel(0));
ipcMain.on('window-zoom-in', () => {
  mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5);
});
ipcMain.on('window-zoom-out', () => {
  mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5);
});
ipcMain.on('window-toggle-fullscreen', () => {
  mainWindow.setFullScreen(!mainWindow.isFullScreen());
});
ipcMain.on('open-external', (event, url) => shell.openExternal(url));
