/**
 * preload.js - Secure Bridge Between Main and Renderer
 *
 * This script runs before the React app loads and creates a safe way
 * for the React app to access Electron features.
 *
 * It exposes window.electronAPI with methods the React app can call.
 * These methods send messages to the main process via IPC.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose these functions to the React app as window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
  // File dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // Window controls (custom title bar)
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  appQuit: () => ipcRenderer.send('app-quit'),

  // View actions
  windowReload: () => ipcRenderer.send('window-reload'),
  windowForceReload: () => ipcRenderer.send('window-force-reload'),
  windowToggleDevTools: () => ipcRenderer.send('window-toggle-devtools'),
  windowResetZoom: () => ipcRenderer.send('window-reset-zoom'),
  windowZoomIn: () => ipcRenderer.send('window-zoom-in'),
  windowZoomOut: () => ipcRenderer.send('window-zoom-out'),
  windowToggleFullscreen: () => ipcRenderer.send('window-toggle-fullscreen'),

  // External links
  openExternal: (url) => ipcRenderer.send('open-external', url),
});
