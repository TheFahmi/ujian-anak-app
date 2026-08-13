"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

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

function ReviewPageContent() {
    const { addToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const resultId = searchParams.get('resultId');

    const [currentIndex, setCurrentIndex] = useState(0);
    const [questions, setQuestions] = useState<any[]>([]);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);
    const [currentFriend, setCurrentFriend] = useState<AIFriend>(aiFriends[0]);

    useEffect(() => {
        // Load saved friend
        try {
            const saved = localStorage.getItem('selectedAiFriend');
            if (saved) {
                const parsed = JSON.parse(saved);
                const friend = aiFriends.find(f => f.id === parsed.id);
                if (friend) setCurrentFriend(friend);
            }
        } catch (e) {
            console.error("Error loading saved friend", e);
        }
    }, []);

    useEffect(() => {
        if (!resultId) {
            // Try localStorage fallback
            const storedResult = localStorage.getItem('lastExamResult');
            const storedQuestions = localStorage.getItem('lastExamQuestions');
            
            if (storedResult && storedQuestions) {
                try {
                    const parsedResult = JSON.parse(storedResult);
                    const parsedQuestions = JSON.parse(storedQuestions);
                    if (parsedResult && parsedQuestions?.length > 0) {
                        setResult(parsedResult);
                        setQuestions(parsedQuestions);
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error('Error parsing stored data:', err);
                }
            }
            router.push('/dashboard/siswa');
            return;
        }

        const fetchResult = async () => {
            try {
                const res = await fetch(`/api/results/${resultId}`);
                if (!res.ok) throw new Error('Result not found');
                const data = await res.json();
                setResult(data);
                setQuestions(data.questions || []);
            } catch (err: any) {
                addToast(err.message || 'Gagal memuat hasil ujian', 'error');
                router.push('/dashboard/siswa/history');
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [resultId, router, addToast]);

    const handleBack = useCallback(() => {
        router.push('/dashboard/siswa');
    }, [router]);

    const handlePrevious = useCallback(() => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
    }, [questions.length]);

    const handleRetryGrading = async () => {
        if (!result?._id || !questions[currentIndex]) return;
        setIsRetrying(true);
        try {
            const res = await fetch('/api/retry-grading', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resultId: result._id,
                    questionId: questions[currentIndex].id
                })
            });
            const data = await res.json();
            if (data.success) {
                const updatedResults = result.results.map((r: any) =>
                    r.id === questions[currentIndex].id ? data.updatedQuestionResult : r
                );
                setResult((prev: any) => ({
                    ...prev,
                    score: data.newScore,
                    correctCount: data.newCorrectCount,
                    results: updatedResults
                }));
                addToast('Penilaian ulang berhasil!', 'success');
            } else {
                addToast('Gagal melakukan penilaian ulang: ' + data.error, 'error');
            }
        } catch (err) {
            addToast('Terjadi kesalahan saat menghubungi server.', 'error');
        } finally {
            setIsRetrying(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        if (loading || !questions.length) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentIndex > 0) handlePrevious();
                    break;
                case 'ArrowRight':
                case 'Enter':
                    e.preventDefault();
                    if (currentIndex < questions.length - 1) handleNext();
                    else handleBack();
                    break;
                case 'Escape':
                    e.preventDefault();
                    handleBack();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, questions.length, loading, handlePrevious, handleNext, handleBack]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] font-[var(--font-lexend)] flex items-center justify-center max-w-md mx-auto">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-[#f4c025] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 font-bold text-[#0f172a] font-[var(--font-fredoka)]">Memuat Review Soal...</p>
                </div>
            </div>
        );
    }

    if (!result || !questions.length) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] font-[var(--font-lexend)] flex items-center justify-center p-4 max-w-md mx-auto">
                <div className="text-center">
                    <p className="text-[#0f172a] mb-4 font-bold">Tidak ada data review yang tersedia.</p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-3 rounded-2xl bg-[#f4c025] text-[#0f172a] font-bold border-2 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] cursor-pointer active:translate-y-1 active:shadow-none transition-all"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const questionResult = result.results?.find((r: any) => r.id === currentQuestion?.id);

    if (!currentQuestion || !questionResult) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] font-[var(--font-lexend)] flex items-center justify-center p-4 max-w-md mx-auto">
                <div className="text-center">
                    <p className="text-[#0f172a] mb-4 font-bold">Soal tidak ditemukan.</p>
                    <button onClick={handleBack} className="px-6 py-3 rounded-2xl bg-[#f4c025] text-[#0f172a] font-bold border-2 border-[#0f172a] shadow-[4px_4px_0px_#0f172a]">
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const getAIExplanation = () => {
        if (currentQuestion.tipe === 'isian' && questionResult.aiFeedback) return questionResult.aiFeedback;
        if (questionResult.penjelasan) return questionResult.penjelasan;
        if (currentQuestion.penjelasan) return currentQuestion.penjelasan;
        return questionResult.correct
            ? `Bagus! Kamu menjawab dengan benar.`
            : `Jangan menyerah! Pelajari lagi materi ini dan coba lagi.`;
    };

    const getCorrectAnswerText = () => {
        if (currentQuestion.tipe === 'isian') return questionResult.correctAnswer || currentQuestion.jawaban_benar || '';
        if (currentQuestion.pilihan) {
            const correctId = questionResult.correctAnswer || currentQuestion.jawaban_benar;
            const opt = currentQuestion.pilihan.find((o: any) => o.id === correctId);
            return opt?.text || '';
        }
        return '';
    };

    const getUserAnswerText = () => {
        if (currentQuestion.tipe === 'isian') return questionResult.userAnswer || '';
        if (currentQuestion.pilihan && questionResult.userAnswer) {
            const opt = currentQuestion.pilihan.find((o: any) => o.id === questionResult.userAnswer);
            return opt?.text || questionResult.userAnswer;
        }
        return questionResult.userAnswer || '';
    };

    const correctAnswerId = questionResult.correctAnswer || currentQuestion.jawaban_benar;

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#fdfbf7] font-[var(--font-lexend)] max-w-md mx-auto">
            {/* Top App Bar */}
            <header className="sticky top-0 z-10 flex items-center bg-[#fdfbf7]/90 p-4 pb-2 justify-between backdrop-blur-sm">
                <button
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] text-[#0f172a] cursor-pointer active:translate-y-1 active:shadow-none transition-all"
                    onClick={handleBack}
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h1 className="text-[#0f172a] text-xl font-[var(--font-fredoka)] font-bold leading-tight flex-1 text-center">
                    Review Soal
                </h1>
                <div className="size-12 shrink-0"></div>
            </header>

            {/* Body */}
            <main className="flex flex-col flex-1 px-4 pb-24">
                {/* Progress Indicator */}
                <div className="flex flex-col items-center py-4">
                    <p className="text-[#64748b] text-sm font-bold uppercase tracking-wider mb-2">
                        Soal {currentIndex + 1} dari {questions.length}
                    </p>
                    <div className="w-full h-3 bg-white border-2 border-[#e2e8f0] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#f4c025] rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-[2rem] border-2 border-[#e2e8f0] p-6 shadow-[4px_4px_0px_#e2e8f0] mb-6">
                    <p className="text-[#0f172a] text-lg font-bold leading-relaxed">{currentQuestion.pertanyaan}</p>
                </div>

                {/* Multiple Choice Options */}
                {(currentQuestion.tipe === 'pilihan_ganda' || (!currentQuestion.tipe && currentQuestion.pilihan)) && currentQuestion.pilihan && (
                    <div className="flex flex-col gap-3">
                        {currentQuestion.pilihan.map((option: any) => {
                            const isUserAnswer = questionResult.userAnswer === option.id;
                            const isCorrectAnswer = option.id === correctAnswerId;
                            const isUserIncorrect = isUserAnswer && !isCorrectAnswer;
                            const optionText = option.text || option.jawaban || option.label || '';

                            return (
                                <div
                                    key={option.id}
                                    className={`relative flex items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
                                        isUserIncorrect
                                            ? 'border-red-500 bg-red-50 shadow-[2px_2px_0px_#ef4444]'
                                            : isCorrectAnswer
                                                ? 'border-green-500 bg-green-50 shadow-[2px_2px_0px_#22c55e]'
                                                : 'border-[#e2e8f0] bg-white opacity-60'
                                    }`}
                                >
                                    <div className="flex-grow flex items-center gap-3">
                                        <p className="text-[#0f172a] text-base font-bold leading-normal flex-1">{optionText}</p>
                                        {isUserIncorrect && <span className="material-symbols-outlined text-red-500 text-2xl">close</span>}
                                        {isCorrectAnswer && <span className="material-symbols-outlined text-green-500 text-2xl">check</span>}
                                    </div>
                                    {isUserAnswer && (
                                        <div className="absolute -top-3 -right-2 bg-[#0f172a] text-white text-xs font-bold px-2 py-1 rounded-lg transform rotate-6">
                                            Jawabanmu
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Essay Answer Display */}
                {currentQuestion.tipe === 'isian' && (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-2xl border-2 border-[#e2e8f0] p-4 bg-white shadow-[2px_2px_0px_#e2e8f0]">
                            <p className="text-[#0f172a] text-sm font-bold mb-2 uppercase tracking-wide text-[#64748b]">Jawabanmu:</p>
                            <p className="text-[#0f172a] text-base font-medium leading-relaxed whitespace-pre-wrap">
                                {getUserAnswerText() || '(Tidak ada jawaban)'}
                            </p>
                            {questionResult.aiScore !== undefined && (
                                <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${
                                        questionResult.aiScore >= 70 ? 'bg-green-50 border-green-200 text-green-700'
                                            : questionResult.aiScore >= 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                                : 'bg-red-50 border-red-200 text-red-700'
                                    }`}>
                                        <span className="material-symbols-outlined text-xl">
                                            {questionResult.aiScore >= 70 ? 'check_circle' : 'info'}
                                        </span>
                                        <span className="text-sm font-bold">Nilai AI: {questionResult.aiScore}/100</span>
                                    </div>
                                    <button
                                        onClick={handleRetryGrading}
                                        disabled={isRetrying}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                                            isRetrying
                                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-white border-[#2b8cee] text-[#2b8cee] hover:bg-blue-50 shadow-[2px_2px_0px_#2b8cee] active:translate-y-0.5 active:shadow-none'
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined text-lg ${isRetrying ? 'animate-spin' : ''}`}>
                                            {isRetrying ? 'refresh' : 'history'}
                                        </span>
                                        {isRetrying ? 'Menilai Ulang...' : 'Nilai Ulang'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {(getCorrectAnswerText() || questionResult.aiFeedback) && (
                            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4 shadow-[2px_2px_0px_#bbf7d0]">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-white border-2 border-green-200 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-green-600">lightbulb</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-green-800 text-sm font-bold mb-2 uppercase tracking-wide">Jawaban yang Benar:</p>
                                        {getCorrectAnswerText() && (
                                            <p className="text-[#0f172a] text-base font-medium leading-relaxed mb-4">{getCorrectAnswerText()}</p>
                                        )}
                                        {!questionResult.correct && getAIExplanation() && currentQuestion.tipe !== 'isian' && (
                                            <div className="mt-3 pt-3 border-t-2 border-green-200/50">
                                                <p className="text-blue-600 text-sm font-bold mb-2 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-lg">lightbulb</span>
                                                    Kenapa jawabanmu salah?
                                                </p>
                                                <p className="text-[#0f172a] text-sm leading-relaxed whitespace-pre-wrap">{getAIExplanation()}</p>
                                            </div>
                                        )}
                                        {questionResult.aiFeedback && (
                                            <div className="mt-3 pt-3 border-t-2 border-green-200/50">
                                                <p className="text-blue-600 text-sm font-bold mb-2 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-lg">psychology</span>
                                                    Feedback dari AI:
                                                </p>
                                                <p className="text-[#0f172a] text-sm leading-relaxed whitespace-pre-wrap">{questionResult.aiFeedback}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* AI Tips Box */}
                {(!currentQuestion.tipe || currentQuestion.tipe !== 'isian' || !questionResult.aiFeedback) && (
                    <div className="mt-6">
                        <div className="flex items-start justify-between gap-4 rounded-[2rem] bg-[#fff9e6] border-2 border-[#fef08a] p-6 shadow-[4px_4px_0px_#fef08a]">
                            <div className="flex flex-col gap-2 flex-[2_2_0px]">
                                <p className="text-[#0f172a] text-lg font-[var(--font-fredoka)] font-bold leading-tight">
                                    Tips dari {currentFriend.name}:
                                </p>
                                <p className="text-[#0f172a] text-sm font-medium leading-relaxed">{getAIExplanation()}</p>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                <div className="w-20 h-20 bg-white rounded-full border-2 border-[#f4c025] p-1 shadow-md relative overflow-hidden">
                                    <Image src={currentFriend.image} alt={currentFriend.name} fill className="object-contain" />
                                </div>
                                <span className="text-[10px] font-bold text-[#b4860b] bg-[#f4c025]/20 px-2 py-1 rounded-full uppercase tracking-wider">
                                    {currentFriend.role}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Navigation Controls */}
            <footer className="fixed bottom-0 left-0 right-0 bg-[#fdfbf7]/90 backdrop-blur-md p-3 sm:p-4 border-t-2 border-[#e2e8f0] max-w-md mx-auto">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <button
                        className={`flex items-center justify-center gap-1 sm:gap-2 rounded-2xl px-3 sm:px-6 py-3 sm:py-4 text-[#0f172a] w-full font-bold text-sm sm:text-base border-2 border-[#e2e8f0] cursor-pointer transition-all ${
                            currentIndex === 0
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white shadow-[4px_4px_0px_#e2e8f0] active:translate-y-1 active:shadow-none'
                        }`}
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                    >
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                        <span className="hidden sm:inline">Sebelumnya</span>
                        <span className="sm:hidden">Prev</span>
                    </button>
                    <button
                        className="flex items-center justify-center gap-1 sm:gap-2 rounded-2xl px-3 sm:px-6 py-3 sm:py-4 text-[#0f172a] w-full font-bold text-sm sm:text-base border-2 border-[#0f172a] cursor-pointer transition-all shadow-[4px_4px_0px_#0f172a] active:translate-y-1 active:shadow-none bg-[#f4c025] hover:bg-[#e6b020]"
                        onClick={currentIndex === questions.length - 1 ? handleBack : handleNext}
                    >
                        {currentIndex === questions.length - 1 ? 'Selesai' : 'Lanjut'}
                        {currentIndex < questions.length - 1 && <span className="material-symbols-outlined text-xl">chevron_right</span>}
                    </button>
                </div>
            </footer>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading Result...</div>}>
            <ReviewPageContent />
        </Suspense>
    );
}
