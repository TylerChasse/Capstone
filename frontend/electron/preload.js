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
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
});
