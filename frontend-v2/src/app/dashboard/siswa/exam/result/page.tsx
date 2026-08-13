"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanionById } from '@/utils/aiCompanions';
import { PartyPopper, Sparkles, Trophy, Star, FileText } from 'lucide-react';
import MathText from '@/components/MathText';

interface ExamResult {
    success: boolean;
    score: number;
    correctCount: number;
    totalQuestions: number;
    results: Array<{
        id: string;
        correct: boolean;
        userAnswer: string;
        correctAnswer?: string;
        aiScore?: number;
        aiFeedback?: string;
        penjelasan?: string;
    }>;
    newBadges?: Array<{
        id: string;
        name: string;
        icon: string;
    }>;
    aiCoachFeedback?: string;
    coinsEarned?: number;
    resultId?: string;
}

interface Question {
    id: string;
    pertanyaan: string;
    tipe?: string;
    pilihan?: Array<{ id: string; text?: string; jawaban?: string }>;
    penjelasan?: string;
    diagram_svg?: string;
}

export default function ExamResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<ExamResult | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [reviewTab, setReviewTab] = useState<'correct' | 'incorrect'>('correct');
    const [activeFriend, setActiveFriend] = useState(getCompanionById('robo'));

    useEffect(() => {
        // Load result and questions from localStorage
        const savedResult = localStorage.getItem('lastExamResult');
        const savedQuestions = localStorage.getItem('lastExamQuestions');
        const savedFriend = localStorage.getItem('selectedAiFriend');

        if (!savedResult) {
            router.push('/dashboard/siswa');
            return;
        }

        try {
            setResult(JSON.parse(savedResult));
            if (savedQuestions) {
                setQuestions(JSON.parse(savedQuestions));
            }
            if (savedFriend) {
                const friend = JSON.parse(savedFriend);
                setActiveFriend(getCompanionById(friend.id || 'robo'));
            }
        } catch (e) {
            console.error('Error parsing exam result:', e);
            router.push('/dashboard/siswa');
        }
    }, [router]);

    if (!result) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#f4c025] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const correctCount = result.correctCount || 0;
    const incorrectCount = (result.totalQuestions || 0) - correctCount;
    const filteredResults = (result.results || []).filter(r => 
        reviewTab === 'correct' ? r.correct : !r.correct
    );

    const getScoreMessage = (score: number) => {
        if (score >= 80) return 'Hebat! Kamu berhasil! Terus tingkatkan pengetahuanmu ya!';
        if (score >= 60) return 'Bagus! Sedikit lagi kamu bisa dapat nilai sempurna!';
        return 'Jangan menyerah! Ayo belajar lagi dan coba lagi!';
    };

    const handleGoToDashboard = () => {
        router.push('/dashboard/siswa');
    };

    const handleReviewQuestions = () => {
        if (result.resultId) {
            router.push(`/dashboard/siswa/review?resultId=${result.resultId}`);
        } else {
            // Fallback: go to history page where user can select a result to review
            router.push('/dashboard/siswa/history');
        }
    };

    const handlePlayAgain = () => {
        // Clear the result from localStorage before going back
        localStorage.removeItem('lastExamResult');
        localStorage.removeItem('lastExamQuestions');
        router.push('/dashboard/siswa/quizzes');
    };

    return (
        <div className="bg-[#fdfbf7] min-h-screen flex flex-col text-[#0f172a] font-[var(--font-lexend)] max-w-md mx-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#fdfbf7] p-4 pb-2 flex items-center justify-between">
                <button 
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] text-[#0f172a] cursor-pointer active:translate-y-1 active:shadow-none transition-all" 
                    onClick={handleGoToDashboard}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h2 className="text-xl font-[var(--font-fredoka)] flex-1 text-center m-0 text-[#0f172a]">Hasil Kuis</h2>
                <div className="w-10"></div>
            </div>

            <main className="flex-1 flex flex-col gap-6 p-4 pt-2">
                {/* Score Section */}
                <div className="relative flex flex-col items-center justify-center text-center py-4">
                    <div className="absolute top-0 left-[20%] opacity-20 rotate-12 select-none"><PartyPopper className="w-8 h-8" /></div>
                    <div className="absolute top-[10%] right-[20%] opacity-30 -rotate-12 select-none"><Sparkles className="w-8 h-8" /></div>
                    <div className="absolute bottom-[10%] right-[25%] opacity-20 rotate-6 select-none"><Trophy className="w-8 h-8" /></div>
                    <div className="absolute bottom-[20%] left-[15%] opacity-30 -rotate-6 select-none"><Star className="w-8 h-8" /></div>

                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path 
                                className="text-[#e2e8f0]"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="3"
                            />
                            <path 
                                className="text-[#f4c025] transition-[stroke-dasharray] duration-1000 ease-out"
                                strokeDasharray={`${result.score}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="3" 
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-[var(--font-fredoka)] text-[#0f172a]">{result.score}</span>
                            <span className="text-sm text-[#64748b] font-bold">/100</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-[var(--font-fredoka)] mt-4 mb-2 text-[#0f172a] leading-tight">Skor Kamu!</h1>
                </div>

                {/* AI Message */}
                <div className="bg-white p-4 rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] flex items-center gap-4">
                    <div 
                        className="w-12 h-12 rounded-full bg-center bg-no-repeat bg-contain flex-shrink-0 border-2 border-[#e2e8f0]" 
                        style={{ backgroundImage: `url('${activeFriend.image}')` }}
                    ></div>
                    <p className="text-[#0f172a] text-base font-medium leading-normal m-0">
                        {getScoreMessage(result.score)}
                    </p>
                </div>

                {/* Rewards */}
                <div>
                    <h3 className="text-lg font-[var(--font-fredoka)] text-[#0f172a] mb-3 mt-4">Hadiah Didapat</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {result.newBadges && result.newBadges.length > 0 ? (
                            result.newBadges.map(badge => (
                                <div key={badge.id} className="bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] flex items-center gap-3 animate-bounceIn">
                                    <div className="w-10 h-10 rounded-full bg-[#f4c025]/20 flex items-center justify-center text-[#f4c025] flex-shrink-0">
                                        <img src={badge.icon} alt={badge.name} className="w-8 h-8 object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[#0f172a] text-sm">Lencana Baru!</span>
                                        <span className="text-xs text-[#64748b]">{badge.name}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#f4c025]/20 flex items-center justify-center text-[#f4c025] flex-shrink-0">
                                    <span className="material-symbols-outlined">monetization_on</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[#0f172a] text-sm">+{result.coinsEarned || Math.floor(result.score / 10)} Koin</span>
                                    <span className="text-xs text-[#64748b]">Dikumpulkan</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Answer Summary */}
                <div>
                    <h3 className="text-lg font-[var(--font-fredoka)] text-[#0f172a] mb-3 mt-4">Ringkasan Jawaban</h3>
                    <div className="bg-white p-2 rounded-2xl border-2 border-[#e2e8f0] flex gap-2">
                        <button
                            className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all duration-200 ${
                                reviewTab === 'correct' 
                                    ? 'bg-[#f4c025] text-[#0f172a] shadow-sm' 
                                    : 'bg-transparent text-[#64748b] hover:bg-gray-50'
                            }`}
                            onClick={() => setReviewTab('correct')}
                        >
                            Benar ({correctCount})
                        </button>
                        <button
                            className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all duration-200 ${
                                reviewTab === 'incorrect' 
                                    ? 'bg-[#f4c025] text-[#0f172a] shadow-sm' 
                                    : 'bg-transparent text-[#64748b] hover:bg-gray-50'
                            }`}
                            onClick={() => setReviewTab('incorrect')}
                        >
                            Salah ({incorrectCount})
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        {filteredResults.map((r, idx) => {
                            const originalQ = questions.find(q => q.id === r.id);
                            const penjelasan = r.penjelasan || originalQ?.penjelasan || '';
                            return (
                                <div key={r.id} className={`bg-white p-3 px-4 rounded-2xl border-2 ${r.correct ? 'border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0]' : 'border-red-200 shadow-[2px_2px_0px_#fecaca]'} min-h-14`}>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium text-[#0f172a] m-0">
                                            {originalQ ? <MathText text={originalQ.pertanyaan || ''} /> : `Pertanyaan ${idx + 1}`}
                                        </p>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                                            r.correct 
                                                ? 'bg-green-100 border-green-200 text-green-600' 
                                                : 'bg-red-100 border-red-200 text-red-600'
                                        }`}>
                                            <span className="material-symbols-outlined text-lg">
                                                {r.correct ? 'check' : 'close'}
                                            </span>
                                        </div>
                                    </div>
                                    {!r.correct && penjelasan && (
                                        <div className="mt-3 pt-3 border-t-2 border-red-100">
                                            <p className="text-blue-600 text-xs font-bold mb-1 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">lightbulb</span>
                                                Kenapa salah?
                                            </p>
                                            <p className="text-[#0f172a] text-xs leading-relaxed whitespace-pre-wrap"><MathText text={penjelasan} diagramSvg={originalQ?.diagram_svg} diagramAlt="diagram penjelasan" /></p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {filteredResults.length === 0 && (
                            <p className="text-center text-gray-500 py-4 italic">
                                Tidak ada jawaban {reviewTab === 'correct' ? 'benar' : 'salah'}.
                            </p>
                        )}
                    </div>

                    {/* AI Feedback for Essay */}
                    {result.aiCoachFeedback && (
                        <div className="mt-4 bg-white p-4 rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                            <h4 className="m-0 mb-2 text-[#f4c025] font-[var(--font-fredoka)] flex items-center gap-2">
                                <FileText className="inline w-6 h-6" /> Catatan Guru AI
                            </h4>
                            <div className="text-sm leading-relaxed text-[#0f172a]">
                                {result.aiCoachFeedback.split('\n').map((line, i) => (
                                    <p key={i} className="my-1" dangerouslySetInnerHTML={{
                                        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-[#fdfbf7] p-4 flex flex-col gap-3 border-t-2 border-[#e2e8f0]">
                <button
                    className="w-full h-14 rounded-2xl bg-[#0f172a] text-white font-[var(--font-fredoka)] text-lg border-none cursor-pointer shadow-[4px_4px_0px_#f4c025] active:shadow-none active:translate-y-[4px] transition-all"
                    onClick={handleReviewQuestions}
                >
                    Review Soal
                </button>
                <button 
                    className="w-full h-14 rounded-2xl bg-[#f4c025] text-[#0f172a] font-[var(--font-fredoka)] text-lg border-2 border-[#0f172a] cursor-pointer shadow-[4px_4px_0px_#0f172a] active:shadow-none active:translate-y-[4px] transition-all" 
                    onClick={handlePlayAgain}
                >
                    Main Lagi!
                </button>
                <button 
                    className="w-full h-12 rounded-xl bg-transparent text-[#64748b] font-bold border-none cursor-pointer text-sm hover:text-[#0f172a] transition-colors" 
                    onClick={handleGoToDashboard}
                >
                    Kembali ke Beranda
                </button>
            </div>
        </div>
    );
}
