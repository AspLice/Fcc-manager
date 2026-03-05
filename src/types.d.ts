export interface IElectronAPI {
    selectFolder: () => Promise<string | null>;
    getPacks: (path: string) => Promise<{ name: string; path: string }[]>;
    checkExists: (path: string) => Promise<boolean>;
    applyPack: (basePath: string, packName: string) => Promise<{ success: boolean; message: string }>;
    windowMinimize: () => void;
    windowMaximize: () => void;
    windowClose: () => void;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}
