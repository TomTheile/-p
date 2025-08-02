const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Sicherheitseinstellungen
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'Roblox Lua Executor v2.0',
    show: false,
    titleBarStyle: 'hidden',
    frame: false
  });

  // Lade die App
  mainWindow.loadFile('renderer/index.html');

  // Zeige Fenster wenn bereit
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // DevTools nur in Development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handler für Lua Ausführung
ipcMain.handle('execute-lua', async (event, code) => {
  try {
    // Hier würde normalerweise die Lua Engine laufen
    // Für Demo-Zwecke simulieren wir die Ausführung
    const result = await executeLuaCode(code);
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handler für Datei-Operationen
ipcMain.handle('save-script', async (event, content) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Lua Scripts', extensions: ['lua'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    fs.writeFileSync(result.filePath, content);
    return { success: true, path: result.filePath };
  }
  return { success: false };
});

ipcMain.handle('load-script', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'Lua Scripts', extensions: ['lua'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const content = fs.readFileSync(result.filePaths[0], 'utf8');
    return { success: true, content, path: result.filePaths[0] };
  }
  return { success: false };
});

// Simulierte Lua Ausführung mit Roblox APIs
async function executeLuaCode(code) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simuliere Ausgabe basierend auf Code-Inhalt
      let output = [];
      
      if (code.includes('print(')) {
        const printMatches = code.match(/print\(([^)]+)\)/g);
        if (printMatches) {
          printMatches.forEach(match => {
            const content = match.match(/print\(([^)]+)\)/)[1];
            output.push(`> ${content.replace(/['"]/g, '')}`);
          });
        }
      }

      if (code.includes('Instance.new')) {
        output.push('> Instance created successfully');
      }

      if (code.includes('Vector3.new')) {
        output.push('> Vector3 object created');
      }

      if (output.length === 0) {
        output.push('> Script executed successfully');
      }

      resolve(output.join('\n'));
    }, Math.random() * 50 + 10); // 10-60ms Ausführungszeit
  });
}