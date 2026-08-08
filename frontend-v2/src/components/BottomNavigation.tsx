"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { subscribeToGlobalChatOpen, getGlobalChatOpen } from '@/context/AIHelpContext';

export default function BottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Subscribe to global chat open state
    useEffect(() => {
        setIsChatOpen(getGlobalChatOpen());
        const unsubscribe = subscribeToGlobalChatOpen(setIsChatOpen);
        return unsubscribe;
    }, []);

    const isActive = (path: string) => pathname === path;
    
    // Hide BottomNavigation when in exam, review page, or when chat is open
    const isExamPage = pathname?.includes('/exam');
    const isReviewPage = pathname?.includes('/review');
    if (isExamPage || isReviewPage || isChatOpen) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#fdfbf7]/90 backdrop-blur-md border-t-2 border-[#e2e8f0] flex justify-around items-center px-4 pb-4 z-50 max-w-md md:max-w-md lg:max-w-md mx-auto">
            <button
                className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer flex-1 transition-all duration-200 ${isActive('/dashboard/siswa') ? 'text-[#0f172a] -translate-y-1' : 'text-[#64748b]'}`}
                onClick={() => router.push('/dashboard/siswa')}
            >
                <div className={`p-2 rounded-2xl transition-all duration-200 ${isActive('/dashboard/siswa') ? 'bg-[#f4c025] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a]' : ''}`}>
                    <span className="material-symbols-outlined text-3xl">home</span>
                </div>
                <span className={`text-xs font-[var(--font-fredoka)] ${isActive('/dashboard/siswa') ? 'text-[#0f172a]' : 'text-[#64748b]'}`}>Home</span>
            </button>
            <button
                className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer flex-1 transition-all duration-200 ${isActive('/dashboard/siswa/quizzes') ? 'text-[#0f172a] -translate-y-1' : 'text-[#64748b]'}`}
                onClick={() => router.push('/dashboard/siswa/quizzes')}
            >
                <div className={`p-2 rounded-2xl transition-all duration-200 ${isActive('/dashboard/siswa/quizzes') ? 'bg-[#2b8cee] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] text-white' : ''}`}>
                    <span className="material-symbols-outlined text-3xl">quiz</span>
                </div>
                <span className={`text-xs font-[var(--font-fredoka)] ${isActive('/dashboard/siswa/quizzes') ? 'text-[#0f172a]' : 'text-[#64748b]'}`}>Kuis</span>
            </button>
            <button
                className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer flex-1 transition-all duration-200 ${isActive('/dashboard/siswa/profile') ? 'text-[#0f172a] -translate-y-1' : 'text-[#64748b]'}`}
                onClick={() => router.push('/dashboard/siswa/profile')}
            >
                <div className={`p-2 rounded-2xl transition-all duration-200 ${isActive('/dashboard/siswa/profile') ? 'bg-[#ef4444] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] text-white' : ''}`}>
                    <span className="material-symbols-outlined text-3xl">person</span>
                </div>
                <span className={`text-xs font-[var(--font-fredoka)] ${isActive('/dashboard/siswa/profile') ? 'text-[#0f172a]' : 'text-[#64748b]'}`}>Profil</span>
            </button>
        </div>
    );
}
