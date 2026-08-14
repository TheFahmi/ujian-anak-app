"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TopAppBar from '@/components/TopAppBar';
import MathText from '@/components/MathText';

const LEVEL_LABEL = (l: number) => (l === 0 ? 'TK' : `Kelas ${l}`);

export default function AdaptiveAssessmentPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    const { user } = useAuth();
    const router = useRouter();

    const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
    const [level, setLevel] = useState(0);
    const [levelLabel, setLevelLabel] = useState('');
    const [skill, setSkill] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<any>(null);
    const [tutor, setTutor] = useState<any>(null);
    const [badgeName, setBadgeName] = useState('');
    const [showSertifikat, setShowSertifikat] = useState(false);
    const [skillTree, setSkillTree] = useState<any[]>([]);

    useEffect(() => {
        if (!user || !subjectId) return;
        const fetchProgress = async () => {
            try {
                const res = await fetch(`/api/adaptive/progress/${subjectId}?userId=${user.id}`);
                const p = await res.json();
                setProgress(p);
                setLevel(p?.level ?? 0);
                setLevelLabel(LEVEL_LABEL(p?.level ?? 0));
            } catch (e) {
                console.error(e);
            }
        };
        const fetchTutor = async () => {
            try {
                const res = await fetch(`/api/adaptive/mapel-info/${subjectId}`);
                const d = await res.json();
                setTutor(d.tutor);
                setBadgeName(d.badge || '');
            } catch (e) {
                console.error(e);
            }
        };
        const fetchSkillTree = async () => {
            try {
                const res = await fetch(`/api/adaptive/skill-tree/${subjectId}`);
                const d = await res.json();
                setSkillTree(d.skills || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchProgress();
        fetchTutor();
        fetchSkillTree();
    }, [user, subjectId]);

    const startQuiz = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000);
            const res = await fetch('/api/adaptive/assessment/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, subjectId }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (!res.ok || !data.questions || data.questions.length === 0) {
                console.error('Start assessment failed:', data);
                alert(data.message || 'Gagal menyiapkan soal. Coba lagi.');
                setLoading(false);
                return;
            }
            setQuestions(data.questions);
            setSkill(data.skill);
            setLevel(data.level);
            setLevelLabel(data.levelLabel);
            setAnswers({});
            setPhase('quiz');
        } catch (e) {
            console.error(e);
            alert('Gagal mulai assessment. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const submitQuiz = async () => {
        if (!user) return;
        if (Object.keys(answers).length < questions.length) {
            alert('Jawab semua soal dulu ya!');
            return;
        }
        setLoading(true);
        try {
            const payload = questions.map((q, i) => ({
                pertanyaan: q.pertanyaan,
                jawaban: answers[i],
                jawaban_benar: q.jawaban_benar,
                penjelasan: q.penjelasan || '',
            }));
            const res = await fetch('/api/adaptive/assessment/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, subjectId, answers: payload }),
            });
            const data = await res.json();
            setResult(data);
            setPhase('result');
            if (data.naik || data.badgeBaru) {
                setTimeout(() => setShowSertifikat(true), 1200);
            }
        } catch (e) {
            console.error(e);
            alert('Gagal submit. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7] pb-32">
            <TopAppBar title="Belajar Adaptif" showBack />
            <div className="px-6 pt-20 max-w-lg mx-auto">
                {/* INTRO */}
                {phase === 'intro' && (
                    <>
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-3">
                                <span className="material-symbols-outlined text-6xl text-[#6c5ce7]">track_changes</span>
                            </div>
                            <h1 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-2">
                                Assessment Adaptif
                            </h1>
                            <p className="text-sm text-gray-500">
                                AI akan tes kemampuanmu dengan 3 soal. Jawab dengan jujur ya!
                            </p>
                        </div>
                        {/* Tutor AI banner */}
                        {tutor && (
                            <div className="flex items-center gap-4 bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] p-4 mb-6">
                                <img src={tutor.maskot} alt={tutor.nama} className="w-14 h-14 object-contain" />
                                <div>
                                    <p className="font-bold text-[#0f172a]" style={{ color: tutor.warna }}>{tutor.nama}</p>
                                    <p className="text-sm text-gray-500">{tutor.sapa}</p>
                                </div>
                            </div>
                        )}
                        <div className="bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] p-5 mb-6">
                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-gray-500">Level saat ini</span>
                                <span className="font-bold text-[#0f172a]">{LEVEL_LABEL(level)}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-4">
                                <span className="text-gray-500">Bintang</span>
                                <span className="font-bold text-[#6c5ce7]">Bintang {progress?.stars ?? 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Skill dikuasai</span>
                                <span className="font-bold text-[#0f172a]">{progress?.mastered?.length ?? 0} skill</span>
                            </div>
                        </div>
                        {/* Skill tree jalur */}
                        {skillTree.length > 0 && (
                            <div className="bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] p-5 mb-6">
                                <p className="font-[var(--font-fredoka)] font-bold text-[#0f172a] mb-3">Jalur Belajarmu</p>
                                <div className="flex flex-col gap-1.5">
                                    {[0, 1, 2, 3, 4, 5, 6].map(lv => {
                                        const skills = skillTree.filter(s => s.level === lv);
                                        if (skills.length === 0) return null;
                                        const isLevel = progress?.level === lv;
                                        const done = skills.every(s => (progress?.mastered || []).includes(s.id));
                                        return (
                                            <div key={lv} className="flex items-center gap-3">
                                                <div className={`w-14 shrink-0 text-[11px] font-bold rounded-lg px-2 py-1.5 text-center ${
                                                    done ? 'bg-green-100 text-green-700'
                                                    : isLevel ? 'bg-[#6c5ce7]/10 text-[#6c5ce7] border border-[#6c5ce7]'
                                                    : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {lv === 0 ? 'TK' : `K${lv}`}
                                                </div>
                                                <div className="flex-1 flex flex-wrap gap-1.5">
                                                    {skills.map(s => {
                                                        const mastered = (progress?.mastered || []).includes(s.id);
                                                        return (
                                                            <span key={s.id} className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                                                                mastered
                                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                                    : isLevel
                                                                        ? 'bg-[#6c5ce7]/5 text-[#6c5ce7] border-[#6c5ce7]/30'
                                                                        : 'bg-gray-50 text-gray-400 border-gray-200'
                                                            }`}>
                                                                {mastered ? '✓ ' : ''}{s.nama}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={startQuiz}
                                disabled={loading}
                                className="w-full bg-[#f4c025] text-[#0f172a] border-2 border-[#0f172a] rounded-2xl py-4 font-bold shadow-[4px_4px_0px_#0f172a] active:translate-y-1 active:shadow-none disabled:opacity-50"
                            >
                                {loading ? 'Menyiapkan soal...' : 'Mulai Assessment'}
                            </button>
                            <button
                                onClick={() => router.push(`/dashboard/siswa/adaptif/${subjectId}/latihan/${progress?.currentSkillId || ''}`)}
                                disabled={!progress?.currentSkillId}
                                className="w-full bg-[#6c5ce7] text-white border-2 border-[#0f172a] rounded-2xl py-4 font-bold shadow-[4px_4px_0px_#0f172a] active:translate-y-1 active:shadow-none disabled:opacity-40"
                            >
                                Lanjut Latihan Skill
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Jawab benar 2 dari 3 → naik level. Salah 2 → turun ke dasar. ✨
                        </p>
                    </>
                )}

                {/* QUIZ */}
                {phase === 'quiz' && (
                    <>
                        {/* Header status quiz */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-[#6c5ce7] bg-[#6c5ce7]/10 px-3 py-1.5 rounded-xl">
                                    {levelLabel} • {skill?.nama}
                                </span>
                                <span className="text-xs font-semibold text-[#0f172a]">
                                    {Object.keys(answers).length}/{questions.length} terjawab
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#6c5ce7] rounded-full transition-all duration-300"
                                    style={{ width: `${questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {questions.map((q, qi) => (
                            <div key={qi} className="bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] p-5 mb-4">
                                <p className="font-bold text-[#0f172a] mb-4">
                                    {qi + 1}. <MathText text={q.pertanyaan} />
                                </p>
                                <div className="space-y-2.5">
                                    {Object.entries(q.pilihan || {}).map(([k, v]) => (
                                        <button
                                            key={k}
                                            onClick={() => setAnswers({ ...answers, [qi]: k })}
                                            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                                                answers[qi] === k
                                                    ? 'bg-[#6c5ce7]/10 border-[#6c5ce7]'
                                                    : 'bg-white border-gray-200 hover:border-[#6c5ce7]/50'
                                            }`}
                                        >
                                            <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold border-2 ${
                                                answers[qi] === k ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]' : 'border-gray-300 text-gray-500'
                                            }`}>
                                                {k}
                                            </span>
                                            <span className="text-sm text-[#0f172a]"><MathText text={v as string} /></span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={submitQuiz}
                            disabled={loading}
                            className="w-full bg-[#f4c025] text-[#0f172a] border-2 border-[#0f172a] rounded-2xl py-4 font-bold shadow-[4px_4px_0px_#0f172a] active:translate-y-1 active:shadow-none disabled:opacity-50"
                        >
                            {loading ? 'Menilai...' : 'Selesai, Nilai Saya!'}
                        </button>
                    </>
                )}

                {/* RESULT */}
                {phase === 'result' && result && (
                    <>
                        <div className="text-center mb-6">
                            <div className="text-7xl mb-3">
                                <span className="material-symbols-outlined text-7xl" style={{ color: result.naik ? '#22c55e' : result.turun ? '#f59e0b' : '#6c5ce7' }}>
                                    {result.naik ? 'celebration' : result.turun ? 'trending_down' : 'sentiment_satisfied'}
                                </span>
                            </div>
                            <h1 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-2">
                                {result.naik ? 'Naik Level!' : result.turun ? 'Turun Level' : 'Level Tetap'}
                            </h1>
                            <p className="text-sm text-gray-500">{result.message}</p>
                        </div>
                        <div className="bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] p-6 mb-6">
                            <div className="flex items-center justify-center gap-8 text-center">
                                <div>
                                    <p className="text-3xl font-bold text-[#0f172a]">{result.skor}</p>
                                    <p className="text-xs text-gray-500 mt-1">Skor</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-[#0f172a]">{result.correct}/{result.total}</p>
                                    <p className="text-xs text-gray-500 mt-1">Benar</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-[#6c5ce7]">{result.levelLabel}</p>
                                    <p className="text-xs text-gray-500 mt-1">Level</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/dashboard/siswa/adaptif')}
                                className="flex-1 bg-white text-[#0f172a] border-2 border-gray-300 rounded-2xl py-3.5 font-bold"
                            >
                                ← Semua Mapel
                            </button>
                            <button
                                onClick={() => { setPhase('intro'); startQuiz(); }}
                                className="flex-1 bg-[#f4c025] text-[#0f172a] border-2 border-[#0f172a] rounded-2xl py-3.5 font-bold shadow-[4px_4px_0px_#0f172a]"
                            >
                                🔄 Coba Lagi
                            </button>
                        </div>
                        {result.badgeBaru && (
                            <div className="mt-4 bg-[#fef3c7] border-2 border-[#fbbf24] rounded-2xl p-4 text-center">
                                <p className="text-3xl mb-1">
                                    <span className="material-symbols-outlined text-3xl text-[#f59e0b]">military_tech</span>
                                </p>
                                <p className="font-bold text-[#92400e]">Badge Baru!</p>
                                <p className="text-sm text-[#92400e]">{result.badgeBaru}</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Sertifikat Modal */}
            {showSertifikat && result && (result.sertifikatBaru || result.badgeBaru) && (
                <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center border-4 border-[#fbbf24]">
                        <div className="text-6xl mb-3">
                            <span className="material-symbols-outlined text-6xl text-[#f59e0b]">workspace_premium</span>
                        </div>
                        <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1">Sertifikat</p>
                        <h2 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-2">
                            {result.badgeBaru || result.sertifikatBaru}
                        </h2>
                        <p className="text-sm text-gray-500 mb-1">
                            Diberikan kepada
                        </p>
                        <p className="font-bold text-xl text-[#0f172a] mb-4">{user?.username}</p>
                        <p className="text-xs text-gray-400 mb-6">
                            {result.sertifikatBaru ? `Level ${result.levelLabel} tercapai!` : 'Semua skill dikuasai!'} — Terus belajar ya!
                        </p>
                        <button
                            onClick={() => setShowSertifikat(false)}
                            className="w-full bg-[#f4c025] text-[#0f172a] border-2 border-[#0f172a] rounded-2xl py-3 font-bold shadow-[4px_4px_0px_#0f172a]"
                        >
                            Hebat! Lanjut
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
