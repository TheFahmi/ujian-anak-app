"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TopAppBar from '@/components/TopAppBar';

const LEVEL_LABEL = (l: number) => (l === 0 ? 'TK' : `Kelas ${l}`);

export default function KoleksiPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [koleksi, setKoleksi] = useState<any[]>([]);
    const [badges, setBadges] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/adaptive/koleksi?userId=${user.id}`);
                const d = await res.json();
                setKoleksi(d.koleksi || []);
                setBadges(d.badges || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    return (
        <div className="min-h-screen bg-[#fdfbf7] pb-32">
            <TopAppBar title="Koleksiku" showBack />
            <div className="px-6 pt-20 max-w-lg mx-auto">
                <h1 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-1">Koleksiku 🏆</h1>
                <p className="text-sm text-gray-500 mb-6">Semua sertifikat & badge yang kamu raih!</p>

                {/* Badges */}
                {badges.length > 0 && (
                    <div className="mb-6">
                        <h2 className="font-[var(--font-fredoka)] text-lg text-[#0f172a] mb-3">🏅 Badge</h2>
                        <div className="flex flex-wrap gap-2">
                            {badges.map(b => (
                                <span key={b} className="text-sm font-bold text-[#92400e] bg-[#fef3c7] border border-[#fbbf24] px-4 py-2 rounded-xl">
                                    🏅 {b}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sertifikat */}
                <h2 className="font-[var(--font-fredoka)] text-lg text-[#0f172a] mb-3">📜 Sertifikat</h2>
                {loading ? (
                    <p className="text-center py-10 text-gray-400">Memuat...</p>
                ) : koleksi.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-[#c7d2fe]">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-3">military_tech</span>
                        <p className="text-gray-500">Belum ada sertifikat.</p>
                        <p className="text-sm text-gray-400 mt-1">Naik level di Belajar Adaptif untuk dapat sertifikat!</p>
                        <button
                            onClick={() => router.push('/dashboard/siswa/adaptif')}
                            className="mt-4 bg-[#6c5ce7] text-white border-2 border-[#0f172a] rounded-2xl px-6 py-2.5 font-bold shadow-[3px_3px_0px_#0f172a]"
                        >
                            🚀 Mulai Belajar
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {koleksi.map((s: any) => (
                            <button
                                key={s.id}
                                onClick={() => setSelected(s)}
                                className="w-full bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] p-5 text-left transition-all active:translate-y-1 active:shadow-none"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">📜</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#0f172a] truncate">{s.nama}</p>
                                        <p className="text-xs text-gray-500">
                                            {s.mapel} • {LEVEL_LABEL(s.level)} • {new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail sertifikat modal */}
            {selected && (
                <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center border-4 border-[#fbbf24]">
                        <div className="text-6xl mb-3">📜</div>
                        <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1">Sertifikat</p>
                        <h2 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-2">{selected.nama}</h2>
                        <p className="text-sm text-gray-500 mb-1">Diberikan kepada</p>
                        <p className="font-bold text-xl text-[#0f172a] mb-4">{user?.username}</p>
                        <p className="text-xs text-gray-400 mb-1">Mata Pelajaran: {selected.mapel}</p>
                        <p className="text-xs text-gray-400 mb-6">Level {LEVEL_LABEL(selected.level)} • {new Date(selected.date).toLocaleDateString('id-ID')}</p>
                        <button
                            onClick={() => setSelected(null)}
                            className="w-full bg-[#f4c025] text-[#0f172a] border-2 border-[#0f172a] rounded-2xl py-3 font-bold shadow-[4px_4px_0px_#0f172a]"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
