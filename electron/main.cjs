const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { WebSocketServer } = require('ws');

let mainWindow;
let bridge;
const clients = new Set();

function startBridge() {
  bridge = new WebSocketServer({ host: '127.0.0.1', port: 3120 });
  bridge.on('connection', socket => {
    clients.add(socket);
    mainWindow?.webContents.send('bridge-status', { connected: true, clients: clients.size });
    socket.on('message', raw => mainWindow?.webContents.send('bridge-message', raw.toString()));
    socket.on('close', () => {
      clients.delete(socket);
      mainWindow?.webContents.send('bridge-status', { connected: clients.size > 0, clients: clients.size });
    });
  });
  bridge.on('error', error => mainWindow?.webContents.send('bridge-error', error.message));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500, height: 920, minWidth: 1050, minHeight: 680,
    backgroundColor: '#0b1020',
    title: 'HTKstudio',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false }
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL || (app.isPackaged ? null : 'http://127.0.0.1:5173');
  if (devUrl) mainWindow.loadURL(devUrl); else mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}

app.whenReady().then(() => { createWindow(); startBridge(); });
app.on('window-all-closed', () => { bridge?.close(); if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

ipcMain.handle('save-workflow', async (_event, payload) => {
  const dir = path.join(app.getPath('documents'), 'HTKstudio', 'workflows');
  fs.mkdirSync(dir, { recursive: true });
  const safe = String(payload.name || 'workflow').replace(/[^a-zA-Z0-9_-]/g, '_');
  const file = path.join(dir, `${safe}.json`);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');
  return file;
});
ipcMain.handle('extension-path', () => path.join(process.resourcesPath, 'extension'));
ipcMain.handle('broadcast', (_event, data) => { for (const client of clients) if (client.readyState === 1) client.send(JSON.stringify(data)); return clients.size; });
