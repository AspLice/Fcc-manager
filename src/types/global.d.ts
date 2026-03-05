// src/types/global.d.ts

export interface FccPack {
    name: string;
    path: string;
}

export interface FccApplyResult {
    success: boolean;
    message: string;
}

export interface ElectronAPI {
    windowMinimize: () => void;
    windowMaximize: () => void;
    windowClose: () => void;
    selectFolder: () => Promise<string | null>;
    getPacks: (fccFolderPath: string) => Promise<FccPack[]>;
    checkExists: (checkPath: string) => Promise<boolean>;
    applyPack: (fccFolderPath: string, packName: string) => Promise<FccApplyResult>;
    launchFiveM: () => Promise<FccApplyResult>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
