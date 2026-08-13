"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TopAppBar from '@/components/TopAppBar';

const LEVEL_LABEL = (l: number) => (l === 0 ? 'TK' : `Kelas ${l}`);
const LEVEL_EMOJI = ['🌱', '🌿', '🍀', '🌳', '🎄', '🌟', '🚀'];

interface MapelProgress {
    subjectId: string;
    nama: string;
    level: number;
    stars: number;
    mastered: number;
    totalSkills: number;
}

export default function AdaptiveDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [mapels, setMapels] = useState<MapelProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                // Semua subject
                const res = await fetch(`/api/subjects?kelas=${user.kelas}&userId=${user.id}`);
                const subjects = await res.json();
                // Progress per subject
                const withProgress = await Promise.all(
                    (Array.isArray(subjects) ? subjects : []).map(async (s: any) => {
                        try {
                            const pRes = await fetch(`/api/adaptive/progress/${s.id}?userId=${user.id}`);
                            const p = await pRes.json();
                            const treeRes = await fetch(`/api/adaptive/skill-tree/${s.id}`);
                            const tree = await treeRes.json();
                            return {
                                subjectId: s.id,
                                nama: s.nama,
                                level: p?.level ?? 0,
                                stars: p?.stars ?? 0,
                                mastered: (p?.mastered || []).length,
                                totalSkills: (tree?.skills || []).length,
                            };
                        } catch {
                            return { subjectId: s.id, nama: s.nama, level: 0, stars: 0, mastered: 0, totalSkills: 0 };
                        }
                    })
                );
                setMapels(withProgress);
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
            <TopAppBar title="Belajar Adaptif" showBack />
            <div className="px-6 pt-6">
                <h1 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-1">
                    Belajar Sesuai Kemampuanmu! 🌟
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    AI deteksi kemampuan dasar. Kalau belum paham, kita turun ke level paling dasar dulu!
                </p>

                {loading ? (
                    <p className="text-center py-10 text-gray-400">Memuat...</p>
                ) : mapels.length === 0 ? (
                    <div className="text-center py-10">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">school</span>
                        <p className="text-gray-500">Belum ada mata pelajaran. Hubungi admin.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mapels.map(m => {
                            const pct = m.totalSkills > 0 ? Math.round((m.mastered / m.totalSkills) * 100) : 0;
                            return (
                                <button
                                    key={m.subjectId}
                                    onClick={() => router.push(`/dashboard/siswa/adaptif/${m.subjectId}`)}
                                    className="w-full bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] p-5 text-left transition-all active:translate-y-1 active:shadow-none"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-[#6c5ce7] rounded-2xl flex items-center justify-center text-2xl border-2 border-[#0f172a]">
                                                📘
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#0f172a]">{m.nama}</p>
                                                <p className="text-xs text-gray-500">
                                                    {LEVEL_EMOJI[m.level]} Level {LEVEL_LABEL(m.level)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-[#6c5ce7] bg-[#6c5ce7]/10 px-3 py-1.5 rounded-xl">
                                            ⭐ {m.stars}
                                        </span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#6c5ce7] rounded-full transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                                        <span>{m.mastered} skill dikuasai</span>
                                        <span>{pct}%</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
