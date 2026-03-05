const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
    getPacks: (path) => ipcRenderer.invoke('fs:getPacks', path),
    checkExists: (path) => ipcRenderer.invoke('fs:exists', path),
    applyPack: (basePath, packName) => ipcRenderer.invoke('fs:applyPack', basePath, packName),
    windowMinimize: () => ipcRenderer.send('window-min'),
    windowMaximize: () => ipcRenderer.send('window-max'),
    windowClose: () => ipcRenderer.send('window-close'),
});
