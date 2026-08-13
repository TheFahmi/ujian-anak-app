"use client";
import { Lock, Unlock, Monitor, Rocket } from 'lucide-react';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import QuestionCard from '@/components/exam/QuestionCard';
import QuestionSheet from '@/components/exam/QuestionSheet';
import DraggableAICompanion from '@/components/exam/DraggableAICompanion';
import { SmartText } from '@/components/RichText';
import { useAntiCheating, ViolationType } from '@/hooks/useAntiCheating';
import CryptoJS from 'crypto-js';

const decryptData = (encryptedData: string) => {
    try {
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';
        if (!key) return null;
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) return null;
        return JSON.parse(decrypted);
    } catch (error) {
        console.error("Decryption failed", error);
        return null;
    }
};

const aiFriends = [
    { id: 'robo', name: 'Robo', localImage: '/images/ai-robo-v2.png', role: 'Teman Belajar' },
    { id: 'prof-hoot', name: 'Prof. Hoot', localImage: '/images/ai-prof-hoot-v2.png', role: 'Guru Bijak' },
    { id: 'cleo', name: 'Cleo', localImage: '/images/ai-cleo-v2.png', role: 'Teman Kreatif' },
    { id: 'dino', name: 'Dino', localImage: '/images/ai-dino-v2.png', role: 'Penjelajah Alam' },
];

export default function ExamPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { confirm } = useConfirm();
    const router = useRouter();
    const params = useParams();
    const subjectId = params.subjectId as string;

    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`currentIndex_${subjectId}_${user?.id}`);
            return saved ? parseInt(saved, 10) : 0;
        }
        return 0;
    });
    const [answers, setAnswers] = useState<{ [key: string]: string }>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`answers_${subjectId}_${user?.id}`);
            return saved ? JSON.parse(saved) : {};
        }
        return {};
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
    const [showExitPrompt, setShowExitPrompt] = useState(false);
    const [exitPassword, setExitPassword] = useState('');
    const [aiMessage, setAiMessage] = useState('');
    const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');

    const activeFriend = (() => {
        try {
            const saved = typeof window !== 'undefined' ? localStorage.getItem('selectedAiFriend') : null;
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return aiFriends[0];
    })();

    const violationMessages: Record<ViolationType, string> = {
        'copy': 'Copy tidak diizinkan selama ujian!',
        'paste': 'Paste tidak diizinkan selama ujian!',
        'cut': 'Cut tidak diizinkan selama ujian!',
        'context-menu': 'Klik kanan tidak diizinkan selama ujian!',
        'screenshot': 'Screenshot tidak diizinkan selama ujian!',
        'visibility-change': 'Terdeteksi keluar dari halaman ujian!',
        'selection': 'Select all tidak diizinkan selama ujian!',
    };

    const lockExam = useCallback(async () => {
        setIsLocked(true);
        try {
            await fetch(`/api/exam/lock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id, subjectId })
            });
        } catch (err) {
            console.error("Failed to lock exam", err);
        }
    }, [user?.id, subjectId]);

    useAntiCheating({
        disableSelection: true,
        disableCopyPaste: true,
        disableContextMenu: true,
        disableScreenshot: true,
        detectVisibilityChange: true,
        warningThreshold: 3,
        warningTimeWindow: 30000,
        onViolation: (type: ViolationType) => {
            addToast(violationMessages[type], 'info');
            if (type === 'visibility-change') {
                lockExam();
            }
        },
        onWarningThreshold: () => {
            addToast('Peringatan! Terlalu banyak aktivitas mencurigakan. Ujian akan dikunci.', 'error');
            lockExam();
        },
    });

    // Load Exam Data
    useEffect(() => {
        if (!user || !subjectId) return;

        const fetchQuestions = async () => {
            try {
                const res = await fetch(`/api/exam/questions/${subjectId}?userId=${user.id}`);
                const data = await res.json();

                if (data.isLocked) {
                    setIsLocked(true);
                    setLoading(false);
                    return;
                }

                const encryptedQuestions = data.questions || data.encryptedData;

                if (encryptedQuestions && data.isEncrypted) {
                    const decrypted = decryptData(encryptedQuestions);
                    if (decrypted && Array.isArray(decrypted) && decrypted.length > 0) {
                        setQuestions(decrypted);
                    } else {
                        addToast('Soal tidak ditemukan dalam paket ini', 'error');
                    }

                    // Use backend time as source of truth
                    const backendTime = data.remainingSeconds !== undefined ? data.remainingSeconds : 60 * 60;
                    
                    // Check if time has expired according to backend
                    if (backendTime <= 0) {
                        // Time expired - auto submit
                        setTimeLeft(0);
                        setLoading(false);
                        return; // Will trigger auto-submit in separate effect
                    }
                    
                    // Use backend time (server is authoritative)
                    setTimeLeft(backendTime);
                    // Also save to localStorage for display consistency during countdown
                    localStorage.setItem(`timeLeft_${subjectId}_${user.id}`, backendTime.toString());
                } else if (encryptedQuestions && !data.isEncrypted) {
                    setQuestions(Array.isArray(encryptedQuestions) ? encryptedQuestions : []);
                    const backendTime = data.remainingSeconds || 60 * 60;
                    
                    // Check if time has expired according to backend
                    if (backendTime <= 0) {
                        setTimeLeft(0);
                        setLoading(false);
                        return; // Will trigger auto-submit in separate effect
                    }
                    
                    setTimeLeft(backendTime);
                    localStorage.setItem(`timeLeft_${subjectId}_${user.id}`, backendTime.toString());
                } else {
                    addToast('Data soal tidak ditemukan', 'error');
                }
            } catch (err) {
                console.error(err);
                addToast('Gagal memuat soal', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [user, subjectId, addToast]);

    // Fullscreen Enforcement
    useEffect(() => {
        const enterFullscreen = async () => {
            try {
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.log("Auto-fullscreen blocked");
            }
        };
        enterFullscreen();
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFs = !!document.fullscreenElement;
            setIsFullscreen(isFs);
            if (!isFs && !loading && !isLocked) {
                setShowFullscreenWarning(true);
            } else {
                setShowFullscreenWarning(false);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        if (!document.fullscreenElement && !loading) {
            setShowFullscreenWarning(true);
        }
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [loading, isLocked]);

    const handleEnterFullscreen = () => {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    };

    const handleExitExam = () => {
        if (exitPassword === '1234') {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(e => console.log(e));
            }
            router.push('/dashboard/siswa');
        } else {
            addToast('Password salah!', 'error');
        }
    };

    const handleUnlock = async () => {
        try {
            const res = await fetch('/api/exam/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id, subjectId, password: exitPassword })
            });
            const data = await res.json();
            if (data.success) {
                setIsLocked(false);
                setExitPassword('');
                handleEnterFullscreen();
                addToast('Ujian berhasil dibuka!', 'success');
            } else {
                addToast(data.error || 'Password salah!', 'error');
            }
        } catch (err) {
            addToast('Terjadi kesalahan saat membuka ujian.', 'error');
        }
    };

    const handleAnswer = (answer: string) => {
        const currentQ = questions[currentIndex];
        const newAnswers = { ...answers, [currentQ.id]: answer };
        setAnswers(newAnswers);
        if (user) {
            localStorage.setItem(`answers_${subjectId}_${user.id}`, JSON.stringify(newAnswers));
        }
    };

    const handleSkip = () => {
        setCurrentIndex(prev => {
            const newIndex = Math.min(questions.length - 1, prev + 1);
            if (user) localStorage.setItem(`currentIndex_${subjectId}_${user.id}`, newIndex.toString());
            return newIndex;
        });
    };

    const handleHelp = () => {
        const currentQ = questions[currentIndex];
        if (currentQ?.rubrik_penilaian) {
            setAiMessage(`Petunjuk: ${currentQ.rubrik_penilaian}`);
        } else {
            setAiMessage('Semangat! Kamu pasti bisa mengerjakannya sendiri!');
        }
        setTimeout(() => setAiMessage(''), 5000);
    };

    const submitExam = useCallback(async (isAutoSubmit = false) => {
        if (submitting || !user || !user.id || !subjectId) return;
        setSubmitting(true);

        try {
            const res = await fetch(`/api/exam/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, subjectId, answers })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            if (data.success) {
                localStorage.removeItem(`answers_${subjectId}_${user.id}`);
                localStorage.removeItem(`currentIndex_${subjectId}_${user.id}`);
                localStorage.removeItem(`timeLeft_${subjectId}_${user.id}`);

                if (document.fullscreenElement) {
                    try { await document.exitFullscreen(); } catch (e) {}
                }

                localStorage.setItem('lastExamResult', JSON.stringify(data));
                localStorage.setItem('lastExamQuestions', JSON.stringify(questions));

                addToast(isAutoSubmit ? 'Waktu habis! Ujian telah dikumpulkan.' : 'Ujian berhasil dikumpulkan!', 'success');
                router.push(`/dashboard/siswa/exam/result`);
            } else {
                addToast('Gagal mengumpulkan ujian', 'error');
                setSubmitting(false);
            }
        } catch (err) {
            console.error("Submit error:", err);
            addToast('Gagal mengumpulkan ujian', 'error');
            setSubmitting(false);
        }
    }, [submitting, user, subjectId, answers, questions, router, addToast]);

    const handleSubmit = async () => {
        if (submitting || !user) return;
        const confirmed = await confirm({
            title: 'Kumpulkan Ujian?',
            message: 'Yakin ingin mengumpulkan ujian? Pastikan semua jawaban sudah benar.',
            confirmText: 'Ya, Kumpulkan',
            cancelText: 'Batal',
            type: 'warning'
        });
        if (!confirmed) return;
        await submitExam(false);
    };

    const handleTimeUp = useCallback(() => {
        if (submitting || !user) return;
        addToast('Waktu habis! Ujian otomatis dikumpulkan.', 'info');
        submitExam(true);
    }, [submitting, user, submitExam, addToast]);

    // Auto-submit when time is already expired on page load/refresh
    useEffect(() => {
        if (loading || submitting || isLocked) return;
        if (timeLeft === 0 && questions.length > 0 && user) {
            // Time has expired, auto-submit
            handleTimeUp();
        }
    }, [loading, timeLeft, questions.length, user, submitting, isLocked, handleTimeUp]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || submitting) return;

        if (timeLeft === 0) {
            handleTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = prev - 1;
                if (user) localStorage.setItem(`timeLeft_${subjectId}_${user.id}`, newTime.toString());
                if (newTime <= 0) {
                    handleTimeUp();
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitting, handleTimeUp, subjectId, user]);

    // Save currentIndex to localStorage
    useEffect(() => {
        if (user && questions.length > 0) {
            localStorage.setItem(`currentIndex_${subjectId}_${user.id}`, currentIndex.toString());
        }
    }, [currentIndex, user, subjectId, questions.length]);

    // Keyboard shortcuts
    useEffect(() => {
        if (loading || submitting) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') return;

            const currentQ = questions[currentIndex];

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentIndex > 0) setCurrentIndex(prev => Math.max(0, prev - 1));
                    break;
                case 'ArrowRight':
                case 'Enter':
                    e.preventDefault();
                    if (currentIndex < questions.length - 1) {
                        setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
                    } else if (!questions.some(q => !answers[q.id])) {
                        handleSubmit();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setShowFullscreenWarning(true);
                    setShowExitPrompt(true);
                    break;
                case '1': case '2': case '3': case '4':
                    e.preventDefault();
                    if (currentQ?.pilihan && currentQ.tipe !== 'isian') {
                        const optionIndex = parseInt(e.key) - 1;
                        if (currentQ.pilihan[optionIndex]) {
                            handleAnswer(currentQ.pilihan[optionIndex].id);
                        }
                    }
                    break;
                case 'h': case 'H':
                    e.preventDefault();
                    handleHelp();
                    break;
                case 's': case 'S':
                    e.preventDefault();
                    handleSkip();
                    break;
                case '?':
                    e.preventDefault();
                    setIsSheetOpen(prev => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, questions, answers, loading, submitting, isSheetOpen]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const progress = ((currentIndex + 1) / questions.length) * 100;
    const currentQuestion = questions[currentIndex];

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#fdfbf7] flex flex-col overflow-x-hidden text-[#0f172a] font-[var(--font-lexend)]">
                <div className="flex justify-center items-center h-screen">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-[#f4c025] border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 font-bold font-[var(--font-fredoka)]">Memuat Soal...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (submitting) {
        return (
            <div className="min-h-screen w-full bg-[#fdfbf7] flex flex-col overflow-x-hidden text-[#0f172a] font-[var(--font-lexend)]">
                <div className="flex items-center justify-center min-h-screen p-6">
                    <div className="relative w-full max-w-md p-8 text-center border-2 border-[#e2e8f0] rounded-3xl bg-white shadow-[4px_4px_0px_#e2e8f0]">
                        <div className="relative w-40 h-40 mx-auto mb-8">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img alt={activeFriend.name} className="w-28 h-28 object-contain animate-bounce" src={activeFriend.localImage} />
                            </div>
                        </div>
                        <h1 className="font-[var(--font-fredoka)] text-3xl text-[#0f172a] mb-4 mt-0">Sedang Menilai...</h1>
                        <p className="text-lg font-semibold text-[#64748b] mb-2 mt-0">
                            {activeFriend.name} sedang memeriksa jawabanmu
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#fdfbf7] flex flex-col overflow-x-hidden text-[#0f172a] font-[var(--font-lexend)] max-w-md mx-auto relative">
            {/* Lockout Modal */}
            {isLocked && (
                <div className="fixed inset-0 bg-red-900/90 backdrop-blur-md z-[2002] flex justify-center items-center animate-fadeIn">
                    <div className="text-center border-4 border-[#0f172a] bg-white p-8 rounded-[2rem] shadow-[8px_8px_0px_#0f172a] max-w-[90%] w-80 animate-bounceIn">
                        <div className="mb-4 animate-shake flex justify-center"><Lock className="w-20 h-20 text-gray-600" /></div>
                        <h2 className="font-[var(--font-fredoka)] text-[#ef4444] text-2xl mb-2">Ujian Terkunci!</h2>
                        <p className="text-[#64748b] text-base mb-4">Kamu terdeteksi keluar dari aplikasi ujian. Panggil guru untuk membuka kunci.</p>
                        <div className="flex flex-col gap-3">
                            <input
                                type="password"
                                className="w-full h-12 px-4 rounded-xl border-2 border-[#e2e8f0] font-bold text-center text-lg focus:border-[#f4c025] focus:outline-none transition-colors"
                                placeholder="Password Guru"
                                value={exitPassword}
                                onChange={(e) => setExitPassword(e.target.value)}
                            />
                            <button
                                className="flex items-center justify-center w-full h-14 bg-[#0f172a] text-white text-lg font-[var(--font-fredoka)] rounded-2xl border-none shadow-[4px_4px_0px_#f4c025] cursor-pointer active:translate-y-1 active:shadow-none transition-all"
                                onClick={handleUnlock}
                            >
                                <>Buka Kunci <Unlock className="inline w-5 h-5 ml-1" /></>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Warning Modal */}
            {showFullscreenWarning && !isLocked && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2001] flex justify-center items-center animate-fadeIn">
                    <div className="text-center border-4 border-[#0f172a] bg-white p-8 rounded-[2rem] shadow-[8px_8px_0px_#0f172a] max-w-[90%] w-80 animate-bounceIn">
                        <div className="mb-4 flex justify-center"><Monitor className="w-20 h-20 text-gray-600" /></div>
                        <h2 className="font-[var(--font-fredoka)] text-[#0f172a] text-2xl mb-2">Mode Layar Penuh</h2>
                        <p className="text-[#64748b] text-base mb-8">Ujian ini wajib menggunakan mode layar penuh agar kamu lebih fokus.</p>

                        {!showExitPrompt ? (
                            <div className="flex flex-col gap-3">
                                <button
                                    className="flex items-center justify-center w-full h-14 bg-[#f4c025] text-[#0f172a] text-lg font-[var(--font-fredoka)] rounded-2xl border-2 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] cursor-pointer active:translate-y-1 active:shadow-none transition-all"
                                    onClick={handleEnterFullscreen}
                                >
                                    <>Masuk Layar Penuh <Rocket className="inline w-5 h-5 ml-1" /></>
                                </button>
                                <button
                                    className="flex items-center justify-center w-full h-12 bg-transparent text-[#ef4444] font-bold border-none cursor-pointer hover:bg-red-50 rounded-xl transition-colors"
                                    onClick={() => setShowExitPrompt(true)}
                                >
                                    Keluar Ujian (Butuh Password)
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <p className="text-sm font-bold text-[#0f172a] mb-1">Masukkan Password Guru:</p>
                                <input
                                    type="password"
                                    className="w-full h-12 px-4 rounded-xl border-2 border-[#e2e8f0] font-bold text-center text-lg focus:border-[#f4c025] focus:outline-none transition-colors"
                                    placeholder="****"
                                    value={exitPassword}
                                    onChange={(e) => setExitPassword(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        className="flex-1 h-12 bg-gray-200 text-[#64748b] font-bold rounded-xl border-none cursor-pointer"
                                        onClick={() => { setShowExitPrompt(false); setExitPassword(''); }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        className="flex-1 h-12 bg-[#ef4444] text-white font-bold rounded-xl border-none cursor-pointer shadow-[2px_2px_0px_#991b1b] active:shadow-none active:translate-y-0.5"
                                        onClick={handleExitExam}
                                    >
                                        Keluar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Draggable AI Companion */}
            <DraggableAICompanion friendId={activeFriend.id} message={aiMessage} />

            {/* Header */}
            <header className="flex items-center justify-between p-4 pb-2 relative z-0">
                <button 
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] text-[#0f172a] cursor-pointer active:translate-y-1 active:shadow-none transition-all" 
                    onClick={() => { setShowFullscreenWarning(true); setShowExitPrompt(true); }}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <button
                    className="flex-grow px-4 flex flex-col gap-2 cursor-pointer group"
                    onClick={() => setIsSheetOpen(true)}
                    title="Klik untuk melihat semua soal"
                >
                    <div className="flex items-center justify-center gap-2 text-[#0f172a] text-sm font-bold leading-normal group-hover:text-[#f4c025] transition-colors">
                        <span>Soal {currentIndex + 1} dari {questions.length}</span>
                        <span className="material-symbols-outlined text-base">expand_more</span>
                    </div>
                    <div className="h-3 bg-white border-2 border-[#e2e8f0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#f4c025] rounded-full transition-all duration-300 ease-in-out" style={{ width: `${progress}%` }}></div>
                    </div>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 flex items-center justify-center font-bold text-[#0f172a] bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] rounded-xl text-xs" title={`Sisa Waktu: ${formatTime(timeLeft)}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col p-4 pt-4 max-w-[600px] mx-auto w-full relative z-0">
                {currentQuestion && (
                    <>
                        <QuestionCard
                            question={currentQuestion}
                            currentNumber={currentIndex + 1}
                            totalQuestions={questions.length}
                            selectedAnswer={answers[currentQuestion.id]}
                            onAnswer={handleAnswer}
                            fontSize={fontSize}
                        />

                        {/* Multiple Choice Options */}
                        {currentQuestion.tipe !== 'isian' && currentQuestion.pilihan && (
                            <div className="flex flex-col gap-3 justify-center flex-1">
                                {currentQuestion.pilihan.map((opt: any) => {
                                    const isSelected = answers[currentQuestion.id] === opt.id;
                                    const optionText = opt.text || opt.jawaban || opt.label || '';
                                    return (
                                        <button
                                            key={opt.id}
                                            className={`flex items-center justify-center w-full min-h-16 px-5 text-base font-bold rounded-2xl border-2 cursor-pointer transition-all duration-100 active:scale-95 ${isSelected
                                                ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-[4px_4px_0px_#f4c025]'
                                                : 'bg-white border-[#e2e8f0] text-[#0f172a] shadow-[4px_4px_0px_#e2e8f0] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#e2e8f0]'
                                            }`}
                                            onClick={() => handleAnswer(opt.id)}
                                        >
                                            {optionText ? <SmartText text={optionText} /> : ''}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="p-4 pt-2 max-w-[600px] mx-auto w-full relative z-0">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <button className="flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer group" onClick={handleHelp} title="Bantuan (H)">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] group-hover:-translate-y-1 transition-transform">
                            <span className="material-symbols-outlined text-[#f4c025]">lightbulb</span>
                        </div>
                        <span className="text-xs font-bold text-[#64748b]">Bantuan</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer group" onClick={handleSkip} title="Lewati (S)">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] group-hover:-translate-y-1 transition-transform">
                            <span className="material-symbols-outlined text-[#64748b]">fast_forward</span>
                        </div>
                        <span className="text-xs font-bold text-[#64748b]">Lewati</span>
                    </button>
                </div>

                {currentIndex === questions.length - 1 ? (
                    <button
                        className="flex items-center justify-center w-full h-16 bg-[#f4c025] text-[#0f172a] text-xl font-[var(--font-fredoka)] rounded-2xl border-2 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] cursor-pointer transition-all duration-200 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSubmit}
                        disabled={questions.some(q => !answers[q.id])}
                    >
                        {questions.every(q => answers[q.id]) ? 'Selesai & Kirim' : 'Lengkapi Jawaban'}
                    </button>
                ) : (
                    <button 
                        className="flex items-center justify-center w-full h-16 bg-[#0f172a] text-white text-xl font-[var(--font-fredoka)] rounded-2xl border-none shadow-[4px_4px_0px_#f4c025] cursor-pointer transition-all duration-200 active:translate-y-1 active:shadow-none hover:-translate-y-1" 
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    >
                        Selanjutnya
                    </button>
                )}
            </footer>

            {/* Question Sheet */}
            <QuestionSheet
                questions={questions}
                currentQuestionIndex={currentIndex}
                answers={answers}
                onNavigate={(idx) => setCurrentIndex(idx)}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
            />
        </div>
    );
}
