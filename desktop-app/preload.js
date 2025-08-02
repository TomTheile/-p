const { contextBridge, ipcRenderer } = require('electron');

// Sichere API für Renderer-Prozess
contextBridge.exposeInMainWorld('electronAPI', {
  // Lua Ausführung
  executeLua: (code) => ipcRenderer.invoke('execute-lua', code),
  
  // Datei-Operationen
  saveScript: (content) => ipcRenderer.invoke('save-script', content),
  loadScript: () => ipcRenderer.invoke('load-script'),
  
  // Window-Kontrolle
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  
  // Roblox Game Integration (Simulation)
  attachToRoblox: () => ipcRenderer.invoke('attach-roblox'),
  injectScript: (script) => ipcRenderer.invoke('inject-script', script),
  
  // Version Info
  getVersion: () => ipcRenderer.invoke('get-version')
});

// Console Override für bessere Logs
window.addEventListener('DOMContentLoaded', () => {
  const originalLog = console.log;
  console.log = (...args) => {
    originalLog(...args);
    // Könnte an Main-Prozess gesendet werden für Logging
  };
});