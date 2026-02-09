// electron/preload.js
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // =========================
  // Activation IPC
  // =========================
  activation: {
    activate: (schoolName, activationCode) =>
      ipcRenderer.invoke('activation-activate', schoolName, activationCode),
    status: () => ipcRenderer.invoke('activation-status'),
    deactivate: () => ipcRenderer.invoke('activation-deactivate')
  },

  // =========================
  // State / DB tables IPC
  // =========================
  state: {
    initTables: () => ipcRenderer.invoke('state-init-tables'),
    getStatus: () => ipcRenderer.invoke('state-get-status')
  },

  // =========================
  // Backend general IPC
  // =========================
  backend: {
    fetchData: (endpoint, body) => ipcRenderer.invoke('backend-request', endpoint, body)
  },

  // =========================
  // System / Fingerprint IPC
  // =========================
  system: {
    getFingerprint: () => ipcRenderer.invoke('system-fingerprint')
  }
});