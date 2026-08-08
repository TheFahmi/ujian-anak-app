import React from 'react';

interface AdminHeaderProps {
    title: string;
    toggleSidebar?: () => void;
    onLogout?: () => void;
}

export default function AdminHeader({ title, toggleSidebar, onLogout }: AdminHeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    onClick={toggleSidebar}
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 m-0 truncate">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
                {onLogout && (
                    <button
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors text-sm"
                        onClick={onLogout}
                    >
                        Keluar
                    </button>
                )}
                <div className="w-8 h-8 rounded-full bg-[#6c5ce7] text-white flex items-center justify-center font-bold text-sm">
                    A
                </div>
            </div>
        </header>
    );
}
