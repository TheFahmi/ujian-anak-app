import React from 'react';

interface AdminMobileNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function AdminMobileNav({ activeTab, setActiveTab }: AdminMobileNavProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Home', icon: 'home' },
        { id: 'subjects', label: 'Mapel', icon: 'menu_book' },
        { id: 'users', label: 'User', icon: 'group' },
        { id: 'results', label: 'Hasil', icon: 'bar_chart' },
        { id: 'token-usage', label: 'Token', icon: 'token' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-50 md:hidden pb-safe">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    className={`flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer text-[10px] p-1.5 min-w-0 flex-1 ${activeTab === item.id ? 'text-[#6c5ce7]' : 'text-gray-500'
                        }`}
                    onClick={() => setActiveTab(item.id)}
                >
                    <span className={`material-symbols-outlined text-2xl ${activeTab === item.id ? 'font-bold' : ''}`}>
                        {item.icon}
                    </span>
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
}
