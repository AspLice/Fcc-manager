import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastProps {
    toasts: ToastMessage[];
    removeToast: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
            ))}
        </div>
    );
};

interface ToastItemProps {
    toast: ToastMessage;
    removeToast: (id: number) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, removeToast }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(toast.id);
        }, 5000); // 5 seconds duration
        return () => clearTimeout(timer);
    }, [toast.id, removeToast]);

    const bgColor =
        toast.type === 'success' ? 'bg-emerald-600/90' :
            toast.type === 'error' ? 'bg-rose-600/90' :
                'bg-app-panel/90';

    const borderColor =
        toast.type === 'success' ? 'border-emerald-500' :
            toast.type === 'error' ? 'border-rose-500' :
                'border-app-border';

    return (
        <div className={`flex items-start p-4 rounded shadow-lg border backdrop-blur-sm ${bgColor} ${borderColor} text-white animate-fade-in`}>
            <div className="mr-3 mt-0.5">
                {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-200" />}
                {toast.type === 'error' && <AlertCircle size={20} className="text-rose-200" />}
                {toast.type === 'info' && <Info size={20} className="text-blue-200" />}
            </div>
            <div className="flex-1 mr-4 text-sm font-medium leading-relaxed">
                {toast.message}
            </div>
            <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white transition-colors p-1 -mr-2 -mt-1"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
