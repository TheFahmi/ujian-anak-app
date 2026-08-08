"use client";

import { useRouter, usePathname } from 'next/navigation';

export default function TeacherBottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#fdfbf7]/90 backdrop-blur-md border-t-2 border-[#e2e8f0] flex justify-around items-center px-4 pb-4 z-50 max-w-md md:max-w-md lg:max-w-md mx-auto">
            <button
                className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer flex-1 transition-all duration-200 ${isActive('/dashboard/guru') ? 'text-[#0f172a] -translate-y-1' : 'text-[#64748b]'}`}
                onClick={() => router.push('/dashboard/guru')}
            >
                <div className={`p-2 rounded-2xl transition-all duration-200 ${isActive('/dashboard/guru') ? 'bg-[#f4c025] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a]' : ''}`}>
                    <span className="material-symbols-outlined text-3xl">home</span>
                </div>
                <span className={`text-xs font-[var(--font-fredoka)] ${isActive('/dashboard/guru') ? 'text-[#0f172a]' : 'text-[#64748b]'}`}>Home</span>
            </button>
            <button
                className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer flex-1 transition-all duration-200 ${isActive('/dashboard/guru/exams') ? 'text-[#0f172a] -translate-y-1' : 'text-[#64748b]'}`}
                onClick={() => router.push('/dashboard/guru/exams')}
            >
                <div className={`p-2 rounded-2xl transition-all duration-200 ${isActive('/dashboard/guru/exams') ? 'bg-[#2b8cee] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] text-white' : ''}`}>
                    <span className="material-symbols-outlined text-3xl">assignment</span>
                </div>
                <span className={`text-xs font-[var(--font-fredoka)] ${isActive('/dashboard/guru/exams') ? 'text-[#0f172a]' : 'text-[#64748b]'}`}>Ujian</span>
            </button>
            <button
                className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer flex-1 transition-all duration-200 ${isActive('/dashboard/guru/profile') ? 'text-[#0f172a] -translate-y-1' : 'text-[#64748b]'}`}
                onClick={() => router.push('/dashboard/guru/profile')}
            >
                <div className={`p-2 rounded-2xl transition-all duration-200 ${isActive('/dashboard/guru/profile') ? 'bg-[#ef4444] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] text-white' : ''}`}>
                    <span className="material-symbols-outlined text-3xl">person</span>
                </div>
                <span className={`text-xs font-[var(--font-fredoka)] ${isActive('/dashboard/guru/profile') ? 'text-[#0f172a]' : 'text-[#64748b]'}`}>Profil</span>
            </button>
        </div>
    );
}
