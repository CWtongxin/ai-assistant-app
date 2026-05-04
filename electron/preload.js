const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onManualCheckUpdate: (callback) => {
    ipcRenderer.on('manual-check-update', () => callback());
  },
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});