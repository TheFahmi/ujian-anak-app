"use client";

import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'success', duration: number = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    const getToastStyles = (type: ToastType) => {
        const baseStyles = "flex items-center gap-3 p-4 bg-white rounded-xl shadow-lg min-w-[300px] max-w-[400px] pointer-events-auto animate-slideInRight transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border-l-4";
        
        switch (type) {
            case 'success':
                return `${baseStyles} border-l-green-500 bg-gradient-to-r from-green-50 to-white`;
            case 'error':
                return `${baseStyles} border-l-red-500 bg-gradient-to-r from-red-50 to-white`;
            case 'info':
                return `${baseStyles} border-l-blue-500 bg-gradient-to-r from-blue-50 to-white`;
            default:
                return `${baseStyles} border-l-gray-500 bg-white`;
        }
    };

    const getIcon = (type: ToastType): React.ReactNode => {
        switch (type) {
            case 'success': return <CheckCircle className='w-5 h-5 text-green-500' />;
            case 'error': return <XCircle className='w-5 h-5 text-red-500' />;
            case 'info': return <Info className='w-5 h-5 text-blue-500' />;
            default: return <Info className='w-5 h-5 text-gray-500' />;
        }
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-[400px] pointer-events-none sm:top-4 sm:right-4 sm:left-auto sm:max-w-[400px] sm:min-w-0">
                {toasts.map(toast => (
                    <div key={toast.id} className={getToastStyles(toast.type)}>
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 text-2xl">
                            {getIcon(toast.type)}
                        </div>
                        <div className="flex-1 text-[0.9375rem] font-medium text-gray-800 leading-relaxed break-words">
                            {toast.message}
                        </div>
                        <button 
                            className="flex-shrink-0 bg-transparent border-none text-gray-500 text-2xl font-light leading-none cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-90" 
                            onClick={() => removeToast(toast.id)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
