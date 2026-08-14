"use client";
import { FileText, Zap } from 'lucide-react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TopAppBar from '@/components/TopAppBar';
import { useToast } from '@/context/ToastContext';

interface ResultItem {
    id: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
}

interface ExamResult {
    _id: string;
    subjectId: string;
    subjectName: string;
    score: number;
    totalQuestions: number;
    correctCount: number;
    date: string;
    results: ResultItem[];
    questions?: Question[];
    aiCoachFeedback?: string;
}

interface Question {
    id: string;
    pertanyaan: string;
    pilihan?: { id: string; text: string }[];
    jawaban_benar: string;
}

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

export default function ExamHistoryPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [results, setResults] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedFriend, setSelectedFriend] = useState<AIFriend>(aiFriends[0]);

    const PAGE_SIZE = 10;

    const loadPage = async (targetPage: number, append: boolean) => {
        if (!userId) return;
        try {
            if (append) setLoadingMore(true);
            const res = await fetch(`/api/results/${userId}?userId=${userId}&paginated=1&page=${targetPage}&limit=${PAGE_SIZE}`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            if (append) {
                setResults(prev => [...prev, ...(data.items || [])]);
            } else {
                setResults(data.items || []);
            }
            setTotalPages(data.totalPages || 1);
            setHasMore(targetPage < (data.totalPages || 1));
            setPage(targetPage);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    setUserId(user.id);

                    await loadPage(1, false);

                    const rewardsRes = await fetch(`/api/rewards/${user.id}`);
                    const rewardsData = await rewardsRes.json();
                    if (rewardsData?.stats?.selectedFriendId) {
                        const friend = aiFriends.find(f => f.id === rewardsData.stats.selectedFriendId);
                        if (friend) setSelectedFriend(friend);
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleReview = async (result: ExamResult) => {
        if (!result._id) {
            addToast('ID hasil ujian tidak ditemukan.', 'error');
            return;
        }

        // Navigate to review page with resultId as query parameter
        router.push(`/dashboard/siswa/review?resultId=${result._id}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
        if (score >= 70) return 'text-blue-600 bg-blue-100 border-blue-200';
        if (score >= 50) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
        return 'text-red-600 bg-red-100 border-red-200';
    };

    if (loading) {
        return (
            <>
                <div className="md:hidden">
                    <TopAppBar title="Riwayat Ujian" variant="simple" showBack />
                </div>
                <div className="flex flex-col gap-4 p-4 pt-20 md:pt-0">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-3xl p-4 border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                            <div className="h-4 bg-gray-200 rounded-lg animate-skeleton mb-3 w-2/3"></div>
                            <div className="h-4 bg-gray-200 rounded-lg animate-skeleton mb-2 w-1/2"></div>
                            <div className="h-10 bg-gray-200 rounded-lg animate-skeleton w-24"></div>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    return (
        <>
            <div className="md:hidden">
                <TopAppBar title="Riwayat Ujian" variant="simple" showBack />
            </div>

            <div className="flex flex-col gap-4 p-4 pt-20 md:pt-0">
                {results.length === 0 ? (
                    <div className="bg-white rounded-[2rem] px-6 py-10 flex flex-col items-center text-center border-2 border-[#dbeafe] shadow-[4px_4px_0px_rgba(43,140,238,0.15)]">
                        <div className="w-20 h-20 rounded-full bg-[#eff6ff] border-2 border-[#dbeafe] flex items-center justify-center mb-4">
                            <FileText className="w-9 h-9 text-[#2b8cee]" strokeWidth={1.7} />
                        </div>
                        <p className="text-[#0f172a] text-lg font-bold m-0 mb-2 font-[var(--font-fredoka)]">Belum ada hasil ujian</p>
                        <p className="text-[#64748b] text-sm m-0 mb-5 max-w-[17rem]">
                            Setiap ujian yang kamu kerjakan akan muncul di sini lengkap dengan nilainya.
                        </p>
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/siswa/quizzes")}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold border-2 bg-[#2b8cee] border-[#1a6bb5] text-white cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none transition-all duration-200"
                        >
                            Cari ujian
                        </button>
                    </div>
                ) : (
                    results.map((result, index) => (
                        <div key={index} className="bg-white rounded-[2rem] p-5 border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-200">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-[#0f172a] m-0 mb-1 font-[var(--font-fredoka)]">{result.subjectName || 'Mata Pelajaran'}</h3>
                                    <p className="text-sm text-[#64748b] m-0 font-medium">{formatDate(result.date)}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl font-bold text-sm flex-shrink-0 border-2 ${getScoreColor(result.score)}`}>
                                    {result.score}/100
                                </div>
                            </div>

                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                                        <span className="text-xs sm:text-sm font-bold text-[#64748b]">{result.correctCount || 0} Benar</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-red-600 text-lg">cancel</span>
                                        <span className="text-xs sm:text-sm font-bold text-[#64748b]">{(result.totalQuestions || 0) - (result.correctCount || 0)} Salah</span>
                                    </div>
                                </div>
                                <button
                                    className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-[#0f172a] cursor-pointer transition-all duration-200 bg-[#f4c025] text-[#0f172a] shadow-[2px_2px_0px_#0f172a] active:shadow-none active:translate-y-[2px] flex items-center gap-1.5"
                                    onClick={() => handleReview(result)}
                                >
                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                    Review
                                </button>
                            </div>

                            {result.aiCoachFeedback && (
                                <div className="mt-1 p-4 bg-[#f4c025]/10 rounded-2xl border-2 border-[#f4c025]/20 flex gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full border-2 border-[#f4c025] bg-white overflow-hidden relative">
                                            <Image src={selectedFriend.image} alt={selectedFriend.name} fill className="object-contain" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#0f172a] mb-1 flex items-center gap-1 uppercase tracking-wider">
                                            <span className="material-symbols-outlined text-sm">psychology</span>
                                            Catatan {selectedFriend.name}
                                        </p>
                                        <p className="text-sm text-[#64748b] leading-relaxed m-0 font-medium whitespace-pre-wrap">
                                            {result.aiCoachFeedback}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}

                {hasMore && (
                    <button
                        type="button"
                        onClick={() => loadPage(page + 1, true)}
                        disabled={loadingMore}
                        className="w-full py-3 rounded-xl text-sm font-bold border-2 border-[#0f172a] bg-white text-[#0f172a] cursor-pointer transition-all duration-200 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loadingMore ? (
                            <>
                                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                Memuat...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">expand_more</span>
                                Muat Lebih Banyak ({totalPages - page} halaman lagi)
                            </>
                        )}
                    </button>
                )}
            </div>
        </>
    );
}
