"use client";
import { Sparkles } from 'lucide-react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { BADGES } from '@/utils/rewards';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import QuizCard from '@/components/dashboard/QuizCard';
import AIFriendCard from '@/components/dashboard/AIFriendCard';
import BadgeCard from '@/components/dashboard/BadgeCard';
import AIFriendModal from '@/components/dashboard/AIFriendModal';
import TopAppBar from '@/components/TopAppBar';

export default function StudentDashboardPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const [rewards, setRewards] = useState<{ badges: string[], coins: number, stats: any }>({ badges: [], coins: 0, stats: {} });

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch subjects
                const subjectsRes = await fetch(`/api/subjects?kelas=${user.kelas}&userId=${user.id}`);
                const subjectsData = await subjectsRes.json();
                setSubjects(subjectsData);

                // Fetch rewards
                try {
                    const rewardsRes = await fetch(`/api/rewards/${user.id}`);
                    const rewardsData = await rewardsRes.json();
                    setRewards({
                        badges: rewardsData.badges || [],
                        coins: rewardsData.coins || 0,
                        stats: rewardsData.stats || {}
                    });
                } catch (err) {
                    console.error('Error fetching rewards:', err);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                addToast('Gagal memuat data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, addToast]);

    const handleStartExam = (subjectId: string) => {
        router.push(`/dashboard/siswa/exam/${subjectId}`);
    };

    const aiFriends = [
        { id: 'robo', name: 'Robo', image: '/images/ai-robo-v2.png', role: 'Teman Belajar' },
        { id: 'prof-hoot', name: 'Prof. Hoot', image: '/images/ai-prof-hoot-v2.png', role: 'Guru Bijak' },
        { id: 'cleo', name: 'Cleo', image: '/images/ai-cleo-v2.png', role: 'Teman Kreatif' },
        { id: 'dino', name: 'Dino', image: '/images/ai-dino-v2.png', role: 'Penjelajah Alam' },
    ];

    const getPersonalizedMessage = (friendId: string, subjects: any[]) => {
        const lowScoreSubjects = subjects.filter(s => s.highestScore !== null && s.highestScore < 70);
        const unattemptedSubjects = subjects.filter(s => s.highestScore === null);

        let suggestion = "";
        let subjectToStudy = null;

        if (lowScoreSubjects.length > 0) {
            subjectToStudy = lowScoreSubjects[Math.floor(Math.random() * lowScoreSubjects.length)];
            suggestion = `Kelihatannya kamu butuh latihan lebih di ${subjectToStudy.nama}. Ayo kita pelajari lagi!`;
        } else if (unattemptedSubjects.length > 0) {
            subjectToStudy = unattemptedSubjects[Math.floor(Math.random() * unattemptedSubjects.length)];
            suggestion = `Kamu belum mencoba kuis ${subjectToStudy.nama}. Yuk cobain sekarang!`;
        } else {
            suggestion = "Wow, nilai kamu bagus semua! Pertahankan prestasimu ya!";
        }

        switch (friendId) {
            case 'robo':
                return `Halo! Aku Robo. ${suggestion} Aku siap bantu hitung-hitungan!`;
            case 'prof-hoot':
                return `Hoo... Hoo... ${suggestion} Jangan lupa sejarah adalah guru terbaik.`;
            case 'cleo':
                return `Hai! ${suggestion} Belajar itu seperti melukis, butuh kesabaran dan kreativitas!`;
            case 'dino':
                return `Roaar! ${suggestion} Jadilah kuat dan pintar seperti T-Rex!`;
            default:
                return suggestion;
        }
    };

    const handleFriendClick = (friend: any) => {
        const message = getPersonalizedMessage(friend.id, subjects);
        setSelectedFriend({ ...friend, message });
    };

    const handleSelectFriend = async (friendId: string) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/rewards/${user.id}/friend`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendId })
            });
            const data = await res.json();
            if (data.success) {
                setRewards(prev => ({
                    ...prev,
                    stats: { ...prev.stats, selectedFriendId: friendId }
                }));
                setSelectedFriend(null);
                
                // Dispatch event to AIHelpWrapper
                window.dispatchEvent(new CustomEvent('friendChange', { detail: { friendId } }));
                
                addToast('Teman belajar berhasil dipilih!', 'success');
            }
        } catch (err) {
            console.error("Failed to select friend", err);
            addToast('Gagal memilih teman belajar', 'error');
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    const currentFriendId = rewards.stats?.selectedFriendId || 'robo';

    return (
        <>
            <TopAppBar
                title={`Halo, ${user?.username || 'Teman'}!`}
                avatarUrl={user?.avatar || "/images/avatar-student.png"}
            />

            {/* Section: Quiz Hari Ini */}
            <section className="mt-2">
                <div className="px-6 mb-4 flex items-center justify-between">
                    <h2 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] m-0">Quiz Seru!</h2>
                    <Sparkles className="w-6 h-6 animate-bounce text-yellow-400" />
                </div>

                <div className="pl-6 pr-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex gap-5 pb-8">
                        {subjects.length > 0 ? (
                            subjects.map((subject) => (
                                <QuizCard key={subject.id} subject={subject} onStart={handleStartExam} />
                            ))
                        ) : (
                            <div className="px-4 text-[#64748b] italic">
                                Belum ada mata pelajaran untuk kelasmu.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Section: Teman AI-ku */}
            <section className="mt-4">
                <div className="px-6 mb-4">
                    <h2 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] m-0">Teman Belajarmu</h2>
                </div>

                <div className="px-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full">
                    <div className="flex flex-row items-start justify-start gap-4 min-w-min pb-4">
                        {aiFriends.map((friend) => (
                            <AIFriendCard
                                key={friend.id}
                                friend={friend}
                                isSelected={currentFriendId === friend.id}
                                onClick={handleFriendClick}
                            />
                        ))}
                        <div className="flex flex-col items-center gap-2 w-28">
                            <div className="w-28 h-28 rounded-2xl bg-[#f1f5f9] border-2 border-dashed border-[#cbd5e1] flex items-center justify-center text-[#94a3b8]">
                                <span className="material-symbols-outlined text-3xl">add</span>
                            </div>
                            <p className="text-xs font-medium text-[#94a3b8]">Tambah</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section: Hadiahku */}
            <section className="mt-6 px-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a]">Koleksi Hadiah</h2>
                    <button
                        className="text-sm font-bold text-[#2b8cee] hover:text-[#1e7cd9] transition-colors"
                        onClick={() => router.push('/dashboard/siswa/rewards')}
                    >
                        Lihat Semua
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {(() => {
                        const unlockedBadges = BADGES.filter(b => rewards.badges.includes(b.id));
                        const lockedBadges = BADGES.filter(b => !rewards.badges.includes(b.id));
                        const displayBadges = [...unlockedBadges.slice(0, 3), ...lockedBadges].slice(0, 3);

                        return displayBadges.map((badge) => (
                            <BadgeCard
                                key={badge.id}
                                badge={badge}
                                isUnlocked={rewards.badges.includes(badge.id)}
                            />
                        ));
                    })()}
                </div>
            </section>

            {selectedFriend && (
                <AIFriendModal
                    friend={selectedFriend}
                    currentFriendId={currentFriendId}
                    onSelect={handleSelectFriend}
                    onClose={() => setSelectedFriend(null)}
                />
            )}
        </>
    );
}
