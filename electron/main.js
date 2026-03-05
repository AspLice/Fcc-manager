const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Frameless for custom titlebar (optional)
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    backgroundColor: '#0f172a', // Tailwind slate-900 equivalent
  });

  win.once('ready-to-show', () => {
    win.show()
    win.webContents.openDevTools()
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow);


// IPC Handlers

// Min/Max/Close App
ipcMain.on('window-min', () => win.minimize());
ipcMain.on('window-max', () => win.isMaximized() ? win.unmaximize() : win.maximize());
ipcMain.on('window-close', () => win.close());

// Select Folder Dialog
ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });
  if (canceled) return null;
  return filePaths[0];
});

// Get FCC Citizens Folders (Available Packs)
ipcMain.handle('fs:getPacks', async (_, fccFolderPath) => {
  try {
    const packsPath = path.join(fccFolderPath, 'FCC_Citizens');
    if (!fs.existsSync(packsPath)) {
      await fsPromises.mkdir(packsPath, { recursive: true });
      return [];
    }

    const dirents = await fsPromises.readdir(packsPath, { withFileTypes: true });
    // Filter out only directories
    const packs = dirents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        path: path.join(packsPath, dirent.name)
      }));
    return packs;
  } catch (error) {
    console.error("Failed to read packs:", error);
    return [];
  }
});

// Check if a directory exists
ipcMain.handle('fs:exists', async (_, checkPath) => {
  try {
    return fs.existsSync(checkPath);
  } catch (e) {
    return false;
  }
});

// Apply a selected Citizen pack (or vanilla)
ipcMain.handle('fs:applyPack', async (_, fivemAppDataPath, packName) => {
  try {
    const targetCitizenPath = path.join(fivemAppDataPath, 'citizen');
    const backupPath = path.join(fivemAppDataPath, 'citizen_vanilla_backup');

    // 1. Check existing `citizen` folder
    try {
      const stat = await fsPromises.lstat(targetCitizenPath);
      if (stat.isSymbolicLink() || stat.isSymbolicLink === undefined) {
        // It's a junction/symlink from a previous pack, just delete it.
        // Note: on older Node versions or depending on the exact symlink type, we use unlink.
        await fsPromises.unlink(targetCitizenPath);
        console.log("Removed existing citizen junction.");
      } else {
        // It's a real folder (Vanilla). Back it up if backup doesn't exist yet, 
        // otherwise rename it with a timestamp.
        if (!fs.existsSync(backupPath)) {
          await fsPromises.rename(targetCitizenPath, backupPath);
          console.log("Backed up vanilla citizen to citizen_vanilla_backup.");
        } else {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          await fsPromises.rename(targetCitizenPath, `${backupPath}_${timestamp}`);
          console.log(`Backed up extra vanilla citizen with timestamp.`);
        }
      }
    } catch (e) {
      // Path doesn't exist, which is fine
      console.log("No existing citizen folder found before applying.");
    }

    // 2. Apply Vanilla or Pack
    if (packName === 'Vanilla') {
      // Restore vanilla from backup if it exists
      if (fs.existsSync(backupPath)) {
        await fsPromises.rename(backupPath, targetCitizenPath);
        return { success: true, message: 'バニラ(標準状態)のフォルダーを復元しました。' };
      } else {
        return { success: true, message: 'バニラ(標準状態)にリセットしました。次回FiveM起動時に自動でダウンロードされます。' };
      }
    }

    // 3. Create Junction link for the new pack
    const sourcePackPath = path.join(fivemAppDataPath, 'FCC_Citizens', packName);
    if (!fs.existsSync(sourcePackPath)) {
      return { success: false, message: `指定されたパックが存在しません: ${packName}` };
    }

    // Use Junction (directory symlink on Windows) for instant operation
    await fsPromises.symlink(sourcePackPath, targetCitizenPath, 'junction');
    console.log(`Successfully created junction for pack: ${packName}`);

    return { success: true, message: `${packName} を適用しました！(高速切り替え)` };

  } catch (error) {
    console.error("Failed to apply pack:", error);
    return { success: false, message: `エラーが発生しました: ${error.message}` };
  }
});
