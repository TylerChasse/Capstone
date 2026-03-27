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
const path = require('path');

let mainWindow;

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
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// =============================================================================
// APP LIFECYCLE
// =============================================================================

// Create window when Electron is ready
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);   // Remove native menu entirely (prevents Alt key popup)
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
