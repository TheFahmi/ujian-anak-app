"use client";
import { Sparkles, Star, Rocket, Medal, MessageCircle } from 'lucide-react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AIFriend {
    id: string;
    name: string;
    image: string;
    role: string;
}

const aiFriends: AIFriend[] = [
    { id: 'robo', name: 'Robo', image: '/images/ai-robo-v2.png', role: 'Teman Belajar' },
    { id: 'prof-hoot', name: 'Prof. Hoot', image: '/images/ai-prof-hoot-v2.png', role: 'Guru Bijak' },
    { id: 'cleo', name: 'Cleo', image: '/images/ai-cleo-v2.png', role: 'Teman Kreatif' },
    { id: 'dino', name: 'Dino', image: '/images/ai-dino-v2.png', role: 'Penjelajah Alam' },
];

export default function ProfilPage() {
    const router = useRouter();
    const { user, logout, isLoading } = useAuth();
    const [badgeCount, setBadgeCount] = useState(0);
    const [avgScore, setAvgScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFriend, setSelectedFriend] = useState<AIFriend | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        fetch(`/api/rewards/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setBadgeCount(data.badges ? data.badges.length : 0);
                if (data.stats && data.stats.selectedFriendId) {
                    const friend = aiFriends.find(f => f.id === data.stats.selectedFriendId);
                    if (friend) setSelectedFriend(friend);
                }
            })
            .catch(err => console.error("Failed to fetch rewards", err))

        // Ambil rata-rata nilai dari hasil ujian
        fetch(`/api/results/${user.id}?userId=${user.id}`)
            .then(res => res.json())
            .then((results: any[]) => {
                if (Array.isArray(results) && results.length > 0) {
                    const valid = results.filter((r: any) => (r.totalQuestions || 0) > 0);
                    if (valid.length > 0) {
                        const avg = Math.round(valid.reduce((s: number, r: any) => s + (r.score || 0), 0) / valid.length);
                        setAvgScore(avg);
                    }
                }
            })
            .catch(err => console.error("Failed to fetch stats", err))
            .finally(() => setLoading(false));
    }, [user, isLoading, router]);

    if (isLoading || loading || !user) {
        return (
            <>
                {/* TopAppBar Skeleton */}
                <div className="fixed top-0 left-0 right-0 flex md:hidden items-center justify-between p-4 pb-2 bg-[#fdfbf7]/90 backdrop-blur-sm z-[1000] max-w-md mx-auto">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="w-24 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-12 h-12"></div>
                </div>
                <div className="p-4 pt-20 md:pt-0">
                    <div className="flex w-full flex-col gap-6 items-center">
                        <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 animate-pulse"></div>
                        <div className="w-40 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </>
        );
    }

    const handleBack = () => router.push('/dashboard/siswa');
    const handleSettings = () => router.push('/dashboard/siswa/settings');

    return (
        <>
            {/* TopAppBar */}
            <div className="fixed top-0 left-0 right-0 flex md:hidden items-center justify-between p-4 pb-2 bg-[#fdfbf7]/90 backdrop-blur-sm z-[1000] max-w-md mx-auto">
                <button
                    className="flex w-12 h-12 flex-shrink-0 items-center justify-center bg-white border-2 border-[#e2e8f0] rounded-xl shadow-[2px_2px_0px_#e2e8f0] cursor-pointer text-[#0f172a] active:translate-y-0.5 active:shadow-none transition-all"
                    onClick={handleBack}
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <h2 className="text-[#0f172a] text-xl font-[var(--font-fredoka)] font-bold leading-tight tracking-tight flex-1 text-center m-0">Profil</h2>
                <div className="w-12 flex-shrink-0"></div>
            </div>

            {/* ProfileHeader */}
            <div className="p-4 pt-20 md:pt-0">
                <div className="flex w-full flex-col gap-6 items-center">
                    <div className="flex gap-4 flex-col items-center relative">
                        <div className="absolute -top-6 -right-6 animate-bounce delay-700"><Sparkles className="w-10 h-10 text-yellow-400" /></div>
                        <div className="absolute -bottom-2 -left-4 animate-bounce delay-1000"><Star className="w-10 h-10 text-yellow-400" /></div>
                        <div
                            className="bg-center bg-no-repeat aspect-square rounded-full min-h-32 w-32 border-4 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] bg-cover bg-white"
                            style={{ backgroundImage: `url("${user.avatar || '/images/profil-avatar-dino.png'}")` }}
                        ></div>
                        <div className="flex flex-col items-center justify-center gap-1">
                            <p className="text-[#0f172a] text-2xl font-[var(--font-fredoka)] font-bold leading-tight tracking-tight text-center m-0">{user.username || 'Budi Sanjaya'}</p>
                            <div className="px-4 py-1 bg-[#f4c025] border-2 border-[#0f172a] rounded-full shadow-[2px_2px_0px_#0f172a]">
                                <p className="text-[#0f172a] text-sm font-bold leading-normal text-center m-0">{user.kelas || 'Kelas 4 SD'}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-white border-2 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] text-[#0f172a] text-sm font-bold leading-normal tracking-wide w-full max-w-[200px] active:translate-y-1 active:shadow-none transition-all hover:bg-gray-50"
                        onClick={handleSettings}
                    >
                        <span className="material-symbols-outlined mr-2 text-lg">edit</span>
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">Edit Profil</span>
                    </button>
                </div>
            </div>

            {/* SectionHeader: Progres & Prestasi */}
            <h3 className="text-[#0f172a] text-lg font-[var(--font-fredoka)] font-bold leading-tight tracking-tight p-4 pb-2 pt-6 m-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f4c025]">trophy</span>
                Progres & Prestasi
            </h3>

            {/* Card: Skor Terbaik */}
            <div className="p-4 pt-2">
                <div className="flex flex-col items-stretch justify-start rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] bg-white overflow-hidden sm:flex-row sm:items-start hover:-translate-y-1 transition-transform duration-200">
                    <div
                        className="w-full h-32 bg-center bg-no-repeat bg-cover sm:w-48 sm:h-auto border-b-2 sm:border-b-0 sm:border-r-2 border-[#e2e8f0]"
                        style={{ backgroundImage: `url("/images/profil-score-rocket.png")`, backgroundColor: '#e0f2fe' }}
                    ></div>
                    <div className="flex w-full min-w-0 flex-grow flex-col items-stretch justify-center gap-3 p-5">
                        <div className="flex justify-between items-start">
                            <p className="text-[#0f172a] text-lg font-bold leading-tight tracking-tight m-0 font-[var(--font-fredoka)]">Skor Terbaik</p>
                            <Rocket className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-[#64748b] text-sm font-medium leading-normal m-0">Rata-rata nilaimu saat ini:</p>
                            <p className="text-3xl font-[var(--font-fredoka)] font-bold leading-normal m-0 text-[#2b8cee]">{avgScore !== null ? `${avgScore}%` : '—'}</p>
                        </div>
                        <button
                            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#2b8cee] border-2 border-[#1a6bb5] shadow-[2px_2px_0px_#1a6bb5] text-white text-sm font-bold leading-normal active:translate-y-0.5 active:shadow-none transition-all"
                            onClick={() => router.push('/dashboard/siswa/history')}
                        >
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap">Lihat Detail</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Card: Lencana Kehormatan */}
            <div className="p-4 pt-2">
                <div className="flex flex-col items-stretch justify-start rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] bg-white overflow-hidden sm:flex-row sm:items-start hover:-translate-y-1 transition-transform duration-200">
                    <div
                        className="w-full h-32 bg-center bg-no-repeat bg-cover sm:w-48 sm:h-auto border-b-2 sm:border-b-0 sm:border-r-2 border-[#e2e8f0]"
                        style={{ backgroundImage: `url("/images/profil-badges.png")`, backgroundColor: '#fef3c7' }}
                    ></div>
                    <div className="flex w-full min-w-0 flex-grow flex-col items-stretch justify-center gap-3 p-5">
                        <div className="flex justify-between items-start">
                            <p className="text-[#0f172a] text-lg font-bold leading-tight tracking-tight m-0 font-[var(--font-fredoka)]">Lencana</p>
                            <Medal className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-[#64748b] text-sm font-medium leading-normal m-0">Koleksi lencanamu:</p>
                            <p className="text-3xl font-[var(--font-fredoka)] font-bold leading-normal m-0 text-[#b4860b]">{badgeCount} Lencana</p>
                        </div>
                        <button
                            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f4c025] border-2 border-[#b4860b] shadow-[2px_2px_0px_#b4860b] text-[#0f172a] text-sm font-bold leading-normal active:translate-y-0.5 active:shadow-none transition-all"
                            onClick={() => router.push('/dashboard/siswa/rewards')}
                        >
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap">Lihat Semua</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* SectionHeader: Teman AI */}
            <h3 className="text-[#0f172a] text-lg font-[var(--font-fredoka)] font-bold leading-tight tracking-tight p-4 pb-2 pt-6 m-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2b8cee]">smart_toy</span>
                Teman AI Pilihan
            </h3>

            {/* Card: Teman AI Pilihan */}
            <div className="py-2 px-4 pb-4">
                <div
                    className="flex items-center gap-4 rounded-[2rem] p-4 border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] bg-white cursor-pointer no-underline text-inherit hover:-translate-y-1 transition-transform duration-200"
                    onClick={() => router.push('/dashboard/siswa/choose-friend')}
                >
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-2xl h-16 w-16 flex-shrink-0 border-2 border-[#e2e8f0] bg-gray-50"
                        style={{ backgroundImage: `url("${selectedFriend ? selectedFriend.image : '/images/ai-robo-v2.png'}")` }}
                    ></div>
                    <div className="flex-grow">
                        <p className="text-[#0f172a] text-lg font-bold leading-tight tracking-tight m-0 font-[var(--font-fredoka)]">
                            {selectedFriend ? selectedFriend.name : 'Robo Si Cerdas'}
                        </p>
                        <p className="text-[#64748b] text-sm font-medium leading-normal m-0 mt-1">
                            {selectedFriend ? selectedFriend.role : 'Siap membantumu belajar kapan saja!'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#64748b] text-2xl">chevron_right</span>
                    </div>
                </div>
            </div>

            {/* SectionHeader: Bantuan & Dukungan */}
            <h3 className="text-[#0f172a] text-lg font-[var(--font-fredoka)] font-bold leading-tight tracking-tight p-4 pb-2 pt-6 m-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10b981]">help</span>
                Bantuan & Dukungan
            </h3>

            {/* Card: Tanya AI */}
            <div className="py-2 px-4 pb-4">
                <div
                    className="flex items-center gap-4 rounded-[2rem] p-4 border-2 border-[#10b981] shadow-[4px_4px_0px_#059669] bg-gradient-to-r from-emerald-50 to-teal-50 cursor-pointer no-underline text-inherit hover:-translate-y-1 transition-transform duration-200"
                    onClick={() => {
                        // Trigger AI Help chat - the FAB will handle this via layout
                        const event = new CustomEvent('openAIHelp');
                        window.dispatchEvent(event);
                    }}
                >
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-2xl h-16 w-16 flex-shrink-0 border-2 border-[#10b981] bg-white"
                        style={{ backgroundImage: `url("${selectedFriend ? selectedFriend.image : '/images/ai-robo-v2.png'}")` }}
                    ></div>
                    <div className="flex-grow">
                        <p className="text-[#0f172a] text-lg font-bold leading-tight tracking-tight m-0 font-[var(--font-fredoka)]">
                            <>Tanya AI <MessageCircle className="inline w-4 h-4 ml-1" /></>
                        </p>
                        <p className="text-[#64748b] text-sm font-medium leading-normal m-0 mt-1">
                            Butuh bantuan belajar? Tanya {selectedFriend ? selectedFriend.name : 'Robo'} sekarang!
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-white text-2xl">chat</span>
                    </div>
                </div>
            </div>

            {/* Settings & Actions Section */}
            <div className="p-4 pt-4 flex flex-col gap-4">
                <button
                    className="flex items-center gap-4 rounded-2xl p-4 border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] bg-white no-underline text-inherit cursor-pointer hover:bg-gray-50 transition-colors active:translate-y-0.5 active:shadow-none"
                    onClick={() => router.push('/dashboard/siswa/kode-ortua')}
                >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center border-2 border-purple-200">
                        <span className="material-symbols-outlined text-purple-600 text-xl">family_restroom</span>
                    </div>
                    <p className="flex-grow text-[#0f172a] font-bold m-0">Kode Orang Tua</p>
                    <span className="material-symbols-outlined text-[#64748b] text-2xl">chevron_right</span>
                </button>
                <button
                    className="flex items-center gap-4 rounded-2xl p-4 border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] bg-white no-underline text-inherit cursor-pointer hover:bg-gray-50 transition-colors active:translate-y-0.5 active:shadow-none"
                    onClick={handleSettings}
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                        <span className="material-symbols-outlined text-blue-600 text-xl">settings</span>
                    </div>
                    <p className="flex-grow text-[#0f172a] font-bold m-0">Pengaturan Akun</p>
                    <span className="material-symbols-outlined text-[#64748b] text-2xl">chevron_right</span>
                </button>
                <button
                    className="flex items-center gap-4 rounded-2xl p-4 border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] bg-white no-underline text-inherit cursor-pointer hover:bg-red-50 transition-colors active:translate-y-0.5 active:shadow-none"
                    onClick={logout}
                >
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center border-2 border-red-200">
                        <span className="material-symbols-outlined text-red-500 text-xl">logout</span>
                    </div>
                    <p className="flex-grow text-[#0f172a] font-bold m-0">Keluar</p>
                    <span className="material-symbols-outlined text-[#64748b] text-2xl">chevron_right</span>
                </button>
            </div>

            <div className="h-5"></div>
        </>
    );
}
