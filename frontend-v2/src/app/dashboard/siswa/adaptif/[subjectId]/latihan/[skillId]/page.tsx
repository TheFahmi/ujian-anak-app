"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TopAppBar from '@/components/TopAppBar';
import MathText from '@/components/MathText';

const LEVEL_LABEL = (l: number) => (l === 0 ? 'TK' : `Kelas ${l}`);

export default function LatihanPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    const skillId = params.skillId as string;
    const { user } = useAuth();
    const router = useRouter();

    const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
    const [levelLabel, setLevelLabel] = useState('');
    const [skill, setSkill] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const startLatihan = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000);
            const res = await fetch('/api/adaptive/latihan/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, subjectId, skillId }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (!res.ok || !data.questions || data.questions.length === 0) {
                alert(data.message || 'Gagal menyiapkan latihan. Coba lagi.');
                setLoading(false);
                return;
            }
            setQuestions(data.questions);
            setSkill(data.skill);
            setLevelLabel(data.levelLabel);
            setAnswers({});
            setShowFeedback({});
            setPhase('quiz');
        } catch (e) {
            console.error(e);
            alert('Gagal mulai latihan. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const jawab = (qi: number, k: string) => {
        setAnswers({ ...answers, [qi]: k });
        setShowFeedback({ ...showFeedback, [qi]: true });
    };

    const selesai = () => {
        const belum = questions.filter((_, i) => !answers[i]);
        if (belum.length > 0) {
            alert('Jawab semua soal dulu ya!');
            return;
        }
        const payload = questions.map((q, i) => ({
            pertanyaan: q.pertanyaan,
            jawaban: answers[i],
            jawaban_benar: q.jawaban_benar,
            penjelasan: q.penjelasan || '',
        }));
        fetch('/api/adaptive/latihan/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user!.id, subjectId, skillId, answers: payload }),
        })
            .then(r => r.json())
            .then(d => { setResult(d); setPhase('result'); })
            .catch(() => alert('Gagal submit. Coba lagi.'));
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7] pb-32">
            <TopAppBar title="Latihan Skill" showBack />
            <div className="px-6 pt-20 max-w-lg mx-auto">
                {phase === 'intro' && (
                    <>
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-3">
                                <span className="material-symbols-outlined text-6xl text-[#6c5ce7]">menu_book</span>
                            </div>
                            <h1 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-2">
                                Latihan Intensif
                            </h1>
                            <p className="text-sm text-gray-500">
                                5 soal pilihan ganda. Jawab benar 4 dari 5 → skill dikuasai!
                            </p>
                        </div>
                        <div className="bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] p-5 mb-6">
                            <p className="text-xs font-bold text-[#6c5ce7] bg-[#6c5ce7]/10 inline-block px-3 py-1 rounded-xl mb-2">
                                {levelLabel || 'Level ini'}
                            </p>
                            <p className="font-bold text-[#0f172a]">{skill?.nama}</p>
                            {skill?.deskripsi && <p className="text-sm text-gray-500 mt-1">{skill.deskripsi}</p>}
                        </div>
                        <button
                            onClick={startLatihan}
                            disabled={loading}
                            className="w-full bg-[#6c5ce7] text-white border-2 border-[#0f172a] rounded-2xl py-4 font-bold shadow-[4px_4px_0px_#0f172a] active:translate-y-1 active:shadow-none disabled:opacity-50"
                        >
                            {loading ? 'Menyiapkan latihan...' : 'Mulai Latihan'}
                        </button>
                    </>
                )}

                {phase === 'quiz' && (
                    <>
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
                                    {Object.entries(q.pilihan || {}).map(([k, v]) => {
                                        const isAnswer = answers[qi] === k;
                                        const isCorrect = q.jawaban_benar === k;
                                        const showResult = showFeedback[qi];
                                        let style = 'bg-white border-gray-200 hover:border-[#6c5ce7]/50';
                                        if (showResult && isCorrect) style = 'bg-green-50 border-green-500';
                                        else if (showResult && isAnswer && !isCorrect) style = 'bg-red-50 border-red-400';
                                        else if (isAnswer) style = 'bg-[#6c5ce7]/10 border-[#6c5ce7]';
                                        return (
                                            <button
                                                key={k}
                                                onClick={() => jawab(qi, k)}
                                                disabled={showResult}
                                                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${style} ${showResult ? 'cursor-default' : ''}`}
                                            >
                                                <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold border-2 shrink-0 ${
                                                    showResult && isCorrect ? 'bg-green-500 text-white border-green-500'
                                                    : showResult && isAnswer && !isCorrect ? 'bg-red-400 text-white border-red-400'
                                                    : isAnswer ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]'
                                                    : 'border-gray-300 text-gray-500'
                                                }`}>
                                                    {showResult && isCorrect ? '✓' : showResult && isAnswer && !isCorrect ? '✗' : k}
                                                </span>
                                                <span className="text-sm text-[#0f172a]"><MathText text={v as string} /></span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {showFeedback[qi] && q.penjelasan && (
                                    <div className="mt-3 p-3 rounded-xl bg-[#f0fdf4] border border-green-200 text-xs text-[#166534]">
                                        💡 <MathText text={q.penjelasan} />
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={selesai}
                            className="w-full bg-[#f4c025] text-[#0f172a] border-2 border-[#0f172a] rounded-2xl py-4 font-bold shadow-[4px_4px_0px_#0f172a] active:translate-y-1 active:shadow-none"
                        >
                            Selesai
                        </button>
                    </>
                )}

                {phase === 'result' && result && (
                    <>
                        <div className="text-center mb-6">
                            <div className="text-7xl mb-3">
                                <span className="material-symbols-outlined text-7xl" style={{ color: result.kuasai ? '#22c55e' : '#f59e0b' }}>
                                    {result.kuasai ? 'military_tech' : 'fitness_center'}
                                </span>
                            </div>
                            <h1 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-2">
                                {result.kuasai ? 'Skill Dikuasai!' : 'Terus Berlatih'}
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
                            </div>
                        </div>
                        {result.badgeBaru && (
                            <div className="mb-5 bg-[#fef3c7] border-2 border-[#fbbf24] rounded-2xl p-4 text-center">
                                <p className="text-3xl mb-1">
                                    <span className="material-symbols-outlined text-3xl text-[#f59e0b]">military_tech</span>
                                </p>
                                <p className="font-bold text-[#92400e]">Badge Baru!</p>
                                <p className="text-sm text-[#92400e]">{result.badgeBaru}</p>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push(`/dashboard/siswa/adaptif/${subjectId}`)}
                                className="flex-1 bg-white text-[#0f172a] border-2 border-gray-300 rounded-2xl py-3.5 font-bold"
                            >
                                ← Kembali
                            </button>
                            <button
                                onClick={() => { setPhase('intro'); }}
                                className="flex-1 bg-[#f4c025] text-[#0f172a] border-2 border-[#0f172a] rounded-2xl py-3.5 font-bold shadow-[4px_4px_0px_#0f172a]"
                            >
                                🔄 Ulangi
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
