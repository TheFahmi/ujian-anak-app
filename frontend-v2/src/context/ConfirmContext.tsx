"use client";

import { createContext, useState, useContext, useCallback, ReactNode } from 'react';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

interface ConfirmProviderProps {
    children: ReactNode;
}

export const ConfirmProvider = ({ children }: ConfirmProviderProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);
        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolvePromise?.(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolvePromise?.(false);
    };

    const getTypeStyles = (type: ConfirmOptions['type']) => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'warning',
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmBtn: 'bg-red-500 hover:bg-red-600 text-white',
                };
            case 'warning':
                return {
                    icon: 'help',
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    confirmBtn: 'bg-[#f4c025] hover:bg-[#e5b320] text-[#0f172a]',
                };
            default:
                return {
                    icon: 'help',
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white',
                };
        }
    };

    const styles = options ? getTypeStyles(options.type) : getTypeStyles('info');

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {isOpen && options && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                        onClick={handleCancel}
                    />
                    
                    {/* Dialog */}
                    <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2 border-[#e2e8f0] animate-scaleIn">
                        {/* Icon */}
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-4xl ${styles.iconColor}`}>
                                {styles.icon}
                            </span>
                        </div>

                        {/* Title */}
                        {options.title && (
                            <h3 className="text-xl font-bold text-[#0f172a] text-center mb-2 font-[var(--font-fredoka)]">
                                {options.title}
                            </h3>
                        )}

                        {/* Message */}
                        <p className="text-[#64748b] text-center mb-6 font-medium">
                            {options.message}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm border-2 border-[#e2e8f0] bg-white text-[#64748b] hover:bg-gray-50 transition-all duration-200"
                            >
                                {options.cancelText || 'Batal'}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm border-2 border-transparent transition-all duration-200 ${styles.confirmBtn}`}
                            >
                                {options.confirmText || 'Ya'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};
