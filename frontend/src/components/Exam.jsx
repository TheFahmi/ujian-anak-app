import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import './Exam.css';

const Exam = ({ user, subjectId, onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [subjectName, setSubjectName] = useState('');
    const [answers, setAnswers] = useState(() => {
        const savedAnswers = localStorage.getItem(`answers_${subjectId}_${user.id}`);
        return savedAnswers ? JSON.parse(savedAnswers) : {};
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const { addToast } = useToast();

    // New States for Focus Mode
    const [currentIndex, setCurrentIndex] = useState(0);

    // New State for Anti-Cheat
    const [cheatCount, setCheatCount] = useState(0);
    const [showCheatWarning, setShowCheatWarning] = useState(false);

    // New State for Mobile Navigator
    const [showNavigator, setShowNavigator] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        fetch(`/api/soal/${subjectId}?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                setSubjectName(data.subjectName);

                const pgQuestions = data.questions.filter(q => q.tipe !== 'isian');
                const essayQuestions = data.questions.filter(q => q.tipe === 'isian');

                const shuffledPg = pgQuestions.sort(() => Math.random() - 0.5);
                const shuffledEssay = essayQuestions.sort(() => Math.random() - 0.5);

                const finalPg = shuffledPg.map(q => ({
                    ...q,
                    pilihan: q.pilihan ? q.pilihan.sort(() => Math.random() - 0.5) : []
                }));

                setQuestions([...finalPg, ...shuffledEssay]);

                if (data.remainingSeconds !== undefined) {
                    setTimeLeft(data.remainingSeconds);
                } else if (data.duration) {
                    setTimeLeft(data.duration * 60);
                } else {
                    setTimeLeft(60 * 60);
                }

                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [subjectId, user.id]);

    const handleSubmit = useCallback(() => {
        setSubmitting(true);
        fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                subjectId: subjectId,
                jawaban: answers,
                cheatCount: cheatCount
            })
        })
            .then(res => res.json())
            .then(data => {
                setResult(data);
                localStorage.removeItem(`answers_${subjectId}_${user.id}`);
                setSubmitting(false);
                addToast('Ujian berhasil dikirim! 🎉', 'success');
            })
            .catch(err => {
                console.error(err);
                setSubmitting(false);
                addToast("Terjadi kesalahan saat mengirim jawaban. Silakan coba lagi.", 'error');
            });
    }, [user.id, subjectId, answers, cheatCount, addToast]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft === null || result || submitting) return;

        if (timeLeft === 0) {
            // Use setTimeout to break the synchronous render cycle
            setTimeout(() => {
                handleSubmit();
            }, 0);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, result, submitting, handleSubmit]);

    // Anti-Cheat Logic
    useEffect(() => {
        if (result || submitting) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setCheatCount(prev => prev + 1);
                setShowCheatWarning(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [result, submitting]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSelect = (qId, optionId) => {
        const newAnswers = { ...answers, [qId]: optionId };
        setAnswers(newAnswers);
        localStorage.setItem(`answers_${subjectId}_${user.id}`, JSON.stringify(newAnswers));
    };



    if (loading) {
        return (
            <div className="exam-container">
                <div className="exam-header-sticky" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                    background: 'rgba(255,255,255,0.95)',
                    padding: '1rem 2rem',
                    borderRadius: '0 0 24px 24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div className="skeleton skeleton-text" style={{ width: '150px' }}></div>
                    <div className="skeleton skeleton-circle" style={{ width: '40px', height: '40px' }}></div>
                </div>
                <div style={{ height: '100px', marginBottom: '1rem' }}></div>
                <div className="glass-panel question-card" style={{ minHeight: '400px', padding: '2rem' }}>
                    <div className="question-header">
                        <div className="skeleton skeleton-text" style={{ width: '80px', height: '30px', marginBottom: '1rem' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '100%', height: '20px' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '90%', height: '20px' }}></div>
                    </div>
                    <div className="options-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton skeleton-card" style={{ height: '80px' }}></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (submitting) {
        return (
            <div className="loading-overlay">
                <div className="loading-content">
                    <div className="spinner"></div>
                    <h3>Sedang Menilai...</h3>
                    <p>AI sedang memeriksa jawaban esai kamu 🤖</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>Guru AI sedang menyiapkan saran belajar khusus buat kamu...</p>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="exam-container">
                <div className="glass-panel result-container" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2>Hasil Ujian: {subjectName}</h2>
                    <div className="score-circle" style={{
                        width: '150px', height: '150px', borderRadius: '50%',
                        background: result.score >= 70 ? 'var(--success-color)' : '#FF6B6B',
                        color: 'white', display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center', margin: '0 auto 1rem'
                    }}>
                        <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{result.score}</span>
                        <small>Nilai Akhir</small>
                    </div>
                    <p style={{ fontSize: '1.2rem' }}>
                        Jawaban Benar: <strong>{result.correctCount}</strong> / {result.totalQuestions}
                    </p>

                    {/* AI Coach Section */}
                    <div style={{ background: '#E3F2FD', padding: '1.5rem', borderRadius: '16px', marginTop: '1.5rem', textAlign: 'left', border: '2px solid #2196F3' }}>
                        <h3 style={{ color: '#1565C0', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            👨‍🏫 Saran Guru AI
                        </h3>
                        <div style={{ lineHeight: '1.6', color: '#333' }}>
                            {result.aiCoachFeedback ? (
                                result.aiCoachFeedback.split('\n').map((line, i) => (
                                    <p key={i} style={{ marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{
                                        __html: line
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                                            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
                                    }} />
                                ))
                            ) : (
                                <p>Kerja bagus! Terus pertahankan prestasimu. Jangan lupa review jawaban yang salah ya!</p>
                            )}
                        </div>
                    </div>

                    <button className="btn-primary" onClick={onBack} style={{ marginTop: '2rem' }}>Kembali ke Dashboard</button>
                </div>

                <div className="section-title">
                    <h3>📝 Review Jawaban</h3>
                    <p>Pelajari di mana letak kesalahanmu!</p>
                </div>

                {result.results.map((r, index) => {
                    const originalQ = questions.find(q => q.id === r.id);
                    const questionText = originalQ ? originalQ.pertanyaan : `Pertanyaan ${index + 1}`;

                    return (
                        <div key={r.id} className="glass-panel" style={{
                            borderLeft: `8px solid ${r.correct ? 'var(--success-color)' : '#FF6B6B'}`,
                            marginBottom: '1.5rem', textAlign: 'left'
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{
                                    background: '#eee', padding: '0.2rem 0.6rem', borderRadius: '4px',
                                    fontSize: '0.8rem', fontWeight: 'bold', marginRight: '0.5rem'
                                }}>
                                    No. {index + 1}
                                </span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{questionText}</span>
                            </div>

                            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                                <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '12px' }}>
                                    <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem' }}>Jawaban Kamu:</small>
                                    <div style={{ fontWeight: 'bold', color: r.correct ? 'green' : 'red' }}>
                                        {r.tipe === 'pilihan_ganda' ? (
                                            originalQ?.pilihan?.find(p => p.id === r.userAnswer)?.text || r.userAnswer || '(Tidak dijawab)'
                                        ) : (
                                            r.userAnswer || '(Tidak dijawab)'
                                        )}
                                    </div>
                                </div>

                                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px' }}>
                                    <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem' }}>
                                        {r.tipe === 'pilihan_ganda' ? 'Kunci Jawaban:' : 'Feedback AI:'}
                                    </small>
                                    <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                        {r.tipe === 'pilihan_ganda' ? (
                                            originalQ?.pilihan?.find(p => p.id === r.correctAnswer)?.text || r.correctAnswer
                                        ) : (
                                            r.aiFeedback
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="exam-container">
            {/* Anti-Cheat Warning Modal */}
            {showCheatWarning && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.1)', // More transparent to show blur
                    backdropFilter: 'blur(15px)', // Strong blur effect
                    WebkitBackdropFilter: 'blur(15px)',
                    zIndex: 2000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    animation: 'fadeIn 0.3s ease'
                }} onClick={() => setShowCheatWarning(false)}>
                    <div className="modal-content" style={{
                        textAlign: 'center',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '3rem',
                        borderRadius: '24px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        maxWidth: '90%',
                        width: '400px',
                        transform: 'scale(1)',
                        animation: 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'shake 0.5s infinite' }}>👀</div>
                        <h2 style={{ color: '#FF6B6B', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Hayooo mau kemana?</h2>
                        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>Jangan nyontek ya! Guru AI sedang memantau lho.</p>
                        <button className="btn-primary" onClick={() => setShowCheatWarning(false)} style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.1rem',
                            borderRadius: '12px',
                            background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
                        }}>
                            Maaf, saya fokus lagi 😇
                        </button>
                    </div>
                </div>
            )}

            <div className="exam-header-sticky" style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                padding: isScrolled ? '0.5rem 2rem' : '1rem 2rem',
                borderRadius: isScrolled ? '0' : '0 0 24px 24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.3s ease'
            }}>
                {!isScrolled ? (
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{subjectName}</h2>
                        <small style={{ color: '#666' }}>Soal {currentIndex + 1} dari {questions.length}</small>
                    </div>
                ) : (
                    <div /> /* Spacer for flex alignment */
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: isScrolled ? 'auto' : 0 }}>
                    <div style={{
                        background: timeLeft < 300 ? '#FFEBEE' : '#E3F2FD',
                        color: timeLeft < 300 ? '#D32F2F' : '#1976D2',
                        padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        animation: timeLeft < 300 ? 'pulse 1s infinite' : 'none'
                    }}>
                        <span>⏰</span>
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                    <button className="btn-secondary" onClick={onBack} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Keluar</button>
                </div>
            </div>

            {/* Spacer for fixed header */}
            <div style={{ height: '100px', marginBottom: '1rem' }}></div>

            {/* Focus Mode: Single Question View */}
            {currentQuestion && (
                <div className="glass-panel question-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div className="question-header">
                        <span className="q-number">No. {currentIndex + 1}</span>
                        <h3>{currentQuestion.pertanyaan}</h3>
                    </div>

                    <div style={{ flex: 1 }}>
                        {currentQuestion.tipe === 'isian' ? (
                            <div className="essay-answer">
                                <textarea
                                    className="essay-input"
                                    placeholder="Tuliskan jawabanmu di sini..."
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleSelect(currentQuestion.id, e.target.value)}
                                    rows={8}
                                    style={{ width: '100%', fontSize: '1.1rem' }}
                                />
                                {currentQuestion.rubrik_penilaian && (
                                    <div className="rubrik-info">
                                        <small>💡 Petunjuk: {currentQuestion.rubrik_penilaian}</small>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="options-grid">
                                {currentQuestion.pilihan && currentQuestion.pilihan.map((opt, idx) => (
                                    <div
                                        key={opt.id}
                                        className={`option-card ${answers[currentQuestion.id] === opt.id ? 'selected' : ''}`}
                                        onClick={() => handleSelect(currentQuestion.id, opt.id)}
                                    >
                                        <span className="opt-id">{String.fromCharCode(65 + idx)}</span>
                                        <span className="opt-text">{opt.text}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="navigation-buttons" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
                        <button
                            className="btn-secondary nav-btn-prev"
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            style={{
                                visibility: currentIndex === 0 ? 'hidden' : 'visible'
                            }}
                            title="Sebelumnya"
                        >
                            ⬅️
                        </button>

                        {currentIndex === questions.length - 1 ? (
                            <button
                                className="btn-primary"
                                onClick={handleSubmit}
                                disabled={questions.some(q => !answers[q.id])}
                                style={{
                                    background: questions.every(q => answers[q.id]) ? '#4CAF50' : '#ccc',
                                    borderColor: questions.every(q => answers[q.id]) ? '#4CAF50' : '#ccc',
                                    cursor: questions.every(q => answers[q.id]) ? 'pointer' : 'not-allowed',
                                    flex: 2 // Make submit button wider
                                }}
                            >
                                {questions.every(q => answers[q.id]) ? '✅ Selesai & Kirim' : '⚠️ Lengkapi Jawaban'}
                            </button>
                        ) : (
                            <button
                                className="btn-primary nav-btn-next"
                                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                title="Selanjutnya"
                            >
                                ➡️
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Question Navigator (Bottom Sheet style) */}
            <div className={`question-navigator ${showNavigator ? 'open' : ''}`} style={{
                marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.8rem',
                justifyContent: 'center', background: 'rgba(255,255,255,0.9)', padding: '1.5rem', borderRadius: '20px',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
            }}>
                <button
                    className="navigator-close-btn"
                    onClick={() => setShowNavigator(false)}
                    title="Tutup"
                >
                    ✖️
                </button>
                <div style={{ width: '100%', textAlign: 'center', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                    Klik nomor untuk lompat ke soal
                </div>
                {questions.map((q, idx) => (
                    <button
                        key={q.id}
                        onClick={() => {
                            setCurrentIndex(idx);
                            setShowNavigator(false); // Close on select
                        }}
                        style={{
                            width: '45px', height: '45px', borderRadius: '12px',
                            background: currentIndex === idx ? 'var(--primary-color)' : (answers[q.id] ? 'var(--secondary-color)' : '#f0f0f0'),
                            color: currentIndex === idx || answers[q.id] ? 'white' : '#444',
                            fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem',
                            border: currentIndex === idx ? '3px solid #fff' : '1px solid #ddd',
                            boxShadow: currentIndex === idx ? '0 4px 12px rgba(33, 150, 243, 0.4)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>

            {/* Navigator Toggle Button (Mobile Only) */}
            {!showNavigator && (
                <button
                    className="navigator-toggle"
                    onClick={() => setShowNavigator(!showNavigator)}
                >
                    🔢
                </button>
            )}

            {/* Overlay to close navigator when clicking outside */}
            {showNavigator && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', zIndex: 89 }}
                    onClick={() => setShowNavigator(false)}
                />
            )}
        </div>
    );
};

export default Exam;
