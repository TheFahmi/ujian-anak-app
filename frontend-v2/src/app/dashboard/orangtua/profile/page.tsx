"use client";

import TopAppBar from '@/components/TopAppBar';
import { useAuth } from '@/context/AuthContext';

export default function ParentProfilePage() {
    const { user, logout } = useAuth();

    return (
        <div className="pt-20 md:pt-8 px-6">
            <div className="md:hidden">
                <TopAppBar title="Profil Orang Tua" showBack />
            </div>

            <div className="flex flex-col items-center py-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 border-4 border-[#0f172a]"></div>
                <h2 className="text-xl font-bold text-[#0f172a]">{user?.username || 'Orang Tua'}</h2>
                <p className="text-gray-500">Wali Murid</p>
            </div>

            <button
                onClick={logout}
                className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold border-2 border-red-200"
            >
                Keluar
            </button>
        </div>
    );
}
