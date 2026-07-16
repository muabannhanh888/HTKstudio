const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('htk', {
  saveWorkflow: payload => ipcRenderer.invoke('save-workflow', payload),
  extensionPath: () => ipcRenderer.invoke('extension-path'),
  broadcast: data => ipcRenderer.invoke('broadcast', data),
  onBridgeStatus: callback => ipcRenderer.on('bridge-status', (_e, value) => callback(value)),
  onBridgeMessage: callback => ipcRenderer.on('bridge-message', (_e, value) => callback(value))
});
