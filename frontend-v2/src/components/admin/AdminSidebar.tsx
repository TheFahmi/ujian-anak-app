import React from 'react';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AdminSidebar({ activeTab, setActiveTab, onLogout, isOpen = false, onClose }: AdminSidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'subjects', label: 'Kelola Mapel', icon: 'menu_book' },
        { id: 'add-questions', label: 'Tambah Soal', icon: 'post_add' },
        { id: 'users', label: 'Kelola User', icon: 'group' },
        { id: 'import', label: 'Import JSON', icon: 'upload_file' },
        { id: 'results', label: 'Lihat Hasil', icon: 'bar_chart' },
        { id: 'token-usage', label: 'Token AI', icon: 'token' },
        { id: 'guru-pending', label: 'Persetujuan Guru', icon: 'badge' },
    ];

    const go = (tab: string) => { setActiveTab(tab); onClose?.(); };

    return (
        <>
        {isOpen && (
            <div
                className="fixed inset-0 bg-black/40 z-[1000] md:hidden"
                onClick={onClose}
                aria-hidden="true"
            />
        )}
        <div
            className={`w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col z-[1001] transition-transform duration-200 md:translate-x-0 md:z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#6c5ce7] flex items-center gap-2 m-0">
                    <span className="material-symbols-outlined text-3xl">school</span>
                    Admin
                </h2>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2 list-none p-0 m-0">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => go(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left ${activeTab === item.id
                                        ? 'bg-[#6c5ce7] text-white shadow-lg shadow-indigo-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 font-medium"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Keluar
                </button>
            </div>
        </div>
        </>
    );
}
