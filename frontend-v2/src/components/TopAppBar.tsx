"use client";

import { useRouter } from 'next/navigation';

interface TopAppBarProps {
    title: string;
    subtitle?: string;
    avatarUrl?: string;
    showBack?: boolean;
    onBack?: () => void;
    showNotification?: boolean;
    variant?: 'default' | 'profile' | 'simple';
}

export default function TopAppBar({
    title,
    subtitle,
    avatarUrl,
    showBack = false,
    onBack,
    showNotification = true,
    variant = 'default'
}: TopAppBarProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    if (variant === 'simple') {
        return (
            <div className="fixed top-0 left-0 right-0 w-full z-[1000] flex items-center justify-between p-4 pb-2 bg-[#fdfbf7]/90 backdrop-blur-md max-w-md mx-auto">
                {showBack ? (
                    <button
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] cursor-pointer text-[#0f172a] active:translate-y-0.5 active:shadow-none transition-all"
                        onClick={handleBack}
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                ) : <div className="w-12"></div>}
                <h1 className="text-xl font-[var(--font-fredoka)] font-bold text-[#0f172a] m-0">{title}</h1>
                <div className="w-12"></div>
            </div>
        );
    }

    return (
        <div className="fixed top-0 left-0 right-0 w-full z-[1000] flex items-center justify-between p-4 pb-2 bg-[#fdfbf7]/90 backdrop-blur-md max-w-md mx-auto">
            <div className="flex items-center gap-3">
                {avatarUrl ? (
                    <div
                        className="w-12 h-12 rounded-full bg-cover bg-center bg-no-repeat border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a]"
                        style={{ backgroundImage: `url("${avatarUrl}")` }}
                    ></div>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-[#f4c025] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-[#0f172a]">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                )}
                <div>
                    <h2 className="text-lg font-[var(--font-fredoka)] font-bold text-[#0f172a] m-0 leading-tight">{title}</h2>
                    {subtitle && <p className="text-sm font-bold text-[#64748b] m-0">{subtitle}</p>}
                </div>
            </div>
            {showNotification && (
                <button className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] cursor-pointer text-[#0f172a] active:translate-y-0.5 active:shadow-none transition-all">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
            )}
        </div>
    );
}
