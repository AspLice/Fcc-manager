/// <reference path="../types/global.d.ts" />
import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export const TitleBar: React.FC = () => {
    const handleMinimize = () => window.electronAPI.windowMinimize();
    const handleMaximize = () => window.electronAPI.windowMaximize();
    const handleClose = () => window.electronAPI.windowClose();

    return (
        <div className="h-8 bg-app-base border-b border-app-border flex justify-between items-center draggable select-none z-50 relative w-full transition-colors duration-300">
            <div className="flex items-center pl-3">
                {/* Simple Logo/Text */}
                <span className="text-xs font-bold text-app-text tracking-wider">FCC <span className="text-app-primary">CITIZEN CHANGER</span></span>
            </div>

            {/* Window Controls */}
            <div className="flex h-full non-draggable">
                <button
                    onClick={handleMinimize}
                    className="h-full px-4 hover:bg-app-panel text-app-muted hover:text-app-text transition-colors flex items-center justify-center"
                >
                    <Minus size={14} />
                </button>
                <button
                    onClick={handleMaximize}
                    className="h-full px-4 hover:bg-app-panel text-app-muted hover:text-app-text transition-colors flex items-center justify-center"
                >
                    <Square size={12} />
                </button>
                <button
                    onClick={handleClose}
                    className="h-full px-4 hover:bg-red-500 text-app-muted hover:text-white transition-colors flex items-center justify-center"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
