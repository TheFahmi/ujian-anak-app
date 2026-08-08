"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

interface AIFriend {
    id: string;
    name: string;
    role: string;
    image: string;
    description: string;
}

const friends: AIFriend[] = [
    {
        id: 'robo',
        name: 'Robo',
        role: 'Teman Belajar',
        image: '/images/ai-robo-v2.png',
        description: 'Robot pintar yang siap membantumu belajar!'
    },
    {
        id: 'prof-hoot',
        name: 'Prof. Hoot',
        role: 'Guru Bijak',
        image: '/images/ai-prof-hoot-v2.png',
        description: 'Burung hantu bijak yang suka mengajar!'
    },
    {
        id: 'cleo',
        name: 'Cleo',
        role: 'Teman Kreatif',
        image: '/images/ai-cleo-v2.png',
        description: 'Teman kreatif yang penuh ide!'
    },
    {
        id: 'dino',
        name: 'Dino',
        role: 'Penjelajah Alam',
        image: '/images/ai-dino-v2.png',
        description: 'Dinosaurus penjelajah yang suka petualangan!'
    }
];

export default function ChooseFriendPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

    useEffect(() => {
        const savedFriend = localStorage.getItem('selectedAiFriend');
        if (savedFriend) {
            try {
                const parsed = JSON.parse(savedFriend);
                setSelectedFriendId(parsed.id);
            } catch (e) {
                console.error("Error parsing saved friend", e);
            }
        } else {
            setSelectedFriendId(friends[0].id);
        }
    }, []);

    const handleSelectFriend = (friend: AIFriend) => {
        setSelectedFriendId(friend.id);
    };

    const handleConfirmSelection = () => {
        const friend = friends.find(f => f.id === selectedFriendId);
        if (friend) {
            localStorage.setItem('selectedAiFriend', JSON.stringify(friend));
            addToast(`Kamu memilih ${friend.name} sebagai teman belajar!`, 'success');
            router.push('/dashboard/siswa/profile');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f8f5] font-[var(--font-lexend)] flex flex-col overflow-x-hidden max-w-md mx-auto">
            {/* Top App Bar */}
            <div className="fixed top-0 left-0 right-0 flex items-center justify-between p-4 pb-2 bg-[#fdfbf7]/90 backdrop-blur-sm z-[1000] max-w-md mx-auto">
                <button
                    onClick={() => router.push('/dashboard/siswa/profile')}
                    className="flex w-12 h-12 flex-shrink-0 items-center justify-center bg-white border-2 border-[#e2e8f0] rounded-xl shadow-[2px_2px_0px_#e2e8f0] cursor-pointer text-[#0f172a] active:translate-y-0.5 active:shadow-none transition-all"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <h2 className="text-[#0f172a] text-xl font-[var(--font-fredoka)] font-bold leading-tight tracking-tight flex-1 text-center m-0">
                    Pilih Teman Belajarmu!
                </h2>
                <div className="w-12 flex-shrink-0"></div>
            </div>

            {/* Carousel */}
            <div className="flex-grow flex flex-col justify-center py-8 pt-4">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide py-8 px-4 gap-6">
                    <div className="w-[10vw] flex-shrink-0"></div>

                    {friends.map((friend) => (
                        <div
                            key={friend.id}
                            onClick={() => handleSelectFriend(friend)}
                            className={`flex flex-col gap-4 rounded-[2rem] min-w-[70vw] max-w-[70vw] snap-center flex-shrink-0 cursor-pointer transition-all duration-300 ${selectedFriendId === friend.id
                                ? 'scale-105 opacity-100'
                                : 'scale-95 opacity-70 blur-[1px]'
                                }`}
                        >
                            <div
                                className={`w-full bg-center bg-no-repeat aspect-[3/4] bg-contain rounded-[2rem] flex flex-col shadow-xl transition-all bg-white border-2 border-[#e2e8f0] ${selectedFriendId === friend.id
                                    ? 'ring-4 ring-[#f4c025] shadow-[#f4c025]/30 border-[#f4c025]'
                                    : ''
                                    }`}
                                style={{ backgroundImage: `url("${friend.image}")` }}
                                role="img"
                                aria-label={friend.description}
                            ></div>
                            <div className="text-center">
                                <p className="text-[#0f172a] text-xl font-bold leading-normal font-[var(--font-fredoka)]">
                                    {friend.name}
                                </p>
                                <p className="text-[#64748b] text-base font-medium leading-normal">
                                    {friend.role}
                                </p>
                            </div>
                        </div>
                    ))}

                    <div className="w-[10vw] flex-shrink-0"></div>
                </div>
            </div>

            {/* Button Group */}
            <div className="flex justify-center sticky bottom-0 bg-[#fdfbf7]/90 backdrop-blur-md pt-4 pb-8 w-full max-w-md mx-auto">
                <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-6">
                    <button
                        onClick={handleConfirmSelection}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-[#f4c025] text-[#0f172a] text-base font-bold leading-normal tracking-[0.015em] w-full border-2 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] active:translate-y-0.5 active:shadow-[2px_2px_0px_#0f172a] transition-all font-[var(--font-fredoka)]"
                    >
                        <span className="truncate">Pilih Teman Ini!</span>
                    </button>
                    <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] text-[#0f172a] text-base font-bold leading-normal tracking-[0.015em] w-full active:translate-y-0.5 active:shadow-none transition-all font-[var(--font-fredoka)]">
                        <span className="truncate">Sesuaikan!</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
