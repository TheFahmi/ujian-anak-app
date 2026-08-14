"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TopAppBar from '@/components/TopAppBar';

interface ReportData {
    anak: { id: string; nama: string; kelas: string; avatar: string };
    stats: { totalUjian: number; rataKeseluruhan: number };
    perMapel: Array<{ nama: string; jumlahUjian: number; rataRata: number; hasil: any[] }>;
    tren: Array<{ tanggal: string; skor: number; mapel: string }>;
    riwayat: Array<{ id: string; subjectName: string; score: number; date: string; correctCount: number; totalQuestions: number }>;
    adaptif?: Array<{ subjectId: string; nama: string; levelLabel: string; stars: number; mastered: number; badges: string[]; sertifikat: any[] }>;
}

export default function ParentReportPage() {
    const { user } = useAuth();
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [riwayat, setRiwayat] = useState<ReportData['riwayat']>([]);
    const [riwayatTotal, setRiwayatTotal] = useState(0);
    const [riwayatPage, setRiwayatPage] = useState(1);
    const [riwayatTotalPages, setRiwayatTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    // Ambil daftar anak
    useEffect(() => {
        if (!user) return;
        const loadChildren = async () => {
            try {
                const res = await fetch(`/api/dashboard/orangtua/${user.id}`);
                const data = await res.json();
                if (data.hasChildren) {
                    setChildren(data.children);
                    if (data.children.length > 0) {
                        setSelectedChildId(data.children[0].id);
                    }
                }
            } catch (e) {
                console.error('Failed to load children', e);
            } finally {
                setLoading(false);
            }
        };
        loadChildren();
    }, [user]);

    // Ambil laporan per anak
    useEffect(() => {
        if (!user || !selectedChildId) return;
        setLoading(true);
        const loadReport = async () => {
            try {
                const res = await fetch(`/api/dashboard/orangtua/${user.id}/report/${selectedChildId}`);
                const data = await res.json();
                setReport(data);
                setRiwayat(data.riwayat || []);
                setRiwayatTotal(data.riwayatTotal || (data.riwayat || []).length);
                setRiwayatTotalPages(data.riwayatTotalPages || 1);
                setRiwayatPage(1);
            } catch (e) {
                console.error('Failed to load report', e);
            } finally {
                setLoading(false);
            }
        };
        loadReport();
    }, [user, selectedChildId]);

    const loadMoreRiwayat = async () => {
        if (!user || !selectedChildId || loadingMore) return;
        setLoadingMore(true);
        try {
            const nextPage = riwayatPage + 1;
            const res = await fetch(`/api/dashboard/orangtua/${user.id}/report/${selectedChildId}/riwayat?page=${nextPage}&limit=10`);
            const data = await res.json();
            if (data.items) {
                setRiwayat(prev => [...prev, ...data.items]);
                setRiwayatPage(nextPage);
                setRiwayatTotalPages(data.totalPages || riwayatTotalPages);
            }
        } catch (e) {
            console.error('Failed to load more riwayat', e);
        } finally {
            setLoadingMore(false);
        }
    };

    const scoreColor = (s: number) =>
        s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-500';

    const barColor = (s: number) =>
        s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-yellow-400' : 'bg-red-400';

    if (loading && !report) return <div className="p-8 text-center">Loading Laporan...</div>;

    return (
        <div className="pt-20 md:pt-8 px-6 pb-28">
            <div className="md:hidden">
                <TopAppBar title="Laporan Belajar" showBack />
            </div>

            {/* Pilih anak */}
            {children.length > 1 && (
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Pilih Anak</label>
                    <select
                        className="w-full p-3 border-2 border-[#e2e8f0] rounded-xl text-base font-bold text-[#0f172a] bg-white focus:outline-none focus:border-[#2b8cee]"
                        value={selectedChildId}
                        onChange={e => setSelectedChildId(e.target.value)}
                    >
                        {children.map(c => (
                            <option key={c.id} value={c.id}>{c.username} — {c.kelas || '-'}</option>
                        ))}
                    </select>
                </div>
            )}

            {!report ? (
                <div className="text-center py-10">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">analytics</span>
                    <p className="text-gray-500">Belum ada data laporan.</p>
                </div>
            ) : (
                <>
                    {/* Header anak */}
                    <div className="bg-[#0f172a] rounded-[2rem] p-5 text-white mb-6 relative overflow-hidden shadow-[4px_4px_0px_#94a3b8]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-14 h-14 bg-white rounded-full border-2 border-[#f4c025] p-0.5 overflow-hidden flex-shrink-0">
                                <img src={report.anak.avatar || "/images/avatar-student.png"} alt={report.anak.nama} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">Laporan Belajar</p>
                                <h2 className="text-xl font-bold font-[var(--font-fredoka)]">{report.anak.nama}</h2>
                                <p className="text-sm bg-white/20 inline-block px-2 py-0.5 rounded-lg mt-1">{report.anak.kelas || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistik */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                            <p className="text-sm text-gray-500 mb-1">Total Ujian</p>
                            <p className="text-3xl font-bold text-[#2b8cee]">{report.stats.totalUjian}</p>
                        </div>
                        <div className="bg-white p-4 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                            <p className="text-sm text-gray-500 mb-1">Rata-rata Nilai</p>
                            <p className={`text-3xl font-bold ${scoreColor(report.stats.rataKeseluruhan)}`}>{report.stats.rataKeseluruhan}</p>
                        </div>
                    </div>

                    {/* Per Mapel */}
                    <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-3">Nilai per Mata Pelajaran</h3>
                    {report.perMapel.length === 0 ? (
                        <p className="text-center text-gray-500 py-6 bg-white rounded-2xl border-2 border-[#e2e8f0]">Belum ada ujian dikerjakan.</p>
                    ) : (
                        <div className="flex flex-col gap-3 mb-6">
                            {report.perMapel.map(m => (
                                <div key={m.nama} className="bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0]">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-[#0f172a]">{m.nama}</p>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-lg font-bold ${scoreColor(m.rataRata)}`}>{m.rataRata}</span>
                                            <span className="text-xs text-gray-400">{m.jumlahUjian}×</span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${barColor(m.rataRata)} rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, m.rataRata)}%` }} />
                                    </div>
                                    {m.hasil.length > 0 && (
                                        <div className="flex gap-1.5 mt-2.5">
                                            {m.hasil.slice(0, 10).map((h: any, i: number) => (
                                                <span
                                                    key={i}
                                                    title={`${new Date(h.date).toLocaleDateString()}: ${h.score}`}
                                                    className={`w-4 h-4 rounded-full ${h.score >= 70 ? 'bg-green-400' : 'bg-red-300'}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Progress Adaptif */}
                    <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-3">Progress Belajar Adaptif</h3>
                    {!report.adaptif || report.adaptif.length === 0 ? (
                        <p className="text-center text-gray-500 py-6 bg-white rounded-2xl border-2 border-[#e2e8f0] mb-6">
                            Belum ada progress adaptif. Ajak anak mencoba Belajar Adaptif!
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3 mb-6">
                            {report.adaptif.map((a: any) => (
                                <div key={a.subjectId} className="bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0]">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-[#0f172a]">{a.nama}</p>
                                        <span className="text-xs font-bold text-[#6c5ce7] bg-[#6c5ce7]/10 px-3 py-1.5 rounded-xl">
                                            Level {a.levelLabel}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span>{a.stars} bintang</span>
                                        <span>•</span>
                                        <span>{a.mastered} skill dikuasai</span>
                                        {a.badges?.length > 0 && (
                                            <>
                                                <span>•</span>
                                                {a.badges.map((b: string) => <span key={b} title={b} className="material-symbols-outlined text-sm text-[#f59e0b]">military_tech</span>)}
                                            </>
                                        )}
                                    </div>
                                    {a.sertifikat?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                                            {a.sertifikat.map((s: any, i: number) => (
                                                <span key={i} className="text-[11px] font-bold text-[#92400e] bg-[#fef3c7] border border-[#fbbf24] px-2 py-0.5 rounded-lg">
                                                    {s.nama}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tren */}
                    {report.tren.length > 1 && (
                        <>
                            <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-3">Perkembangan Nilai</h3>
                            <div className="bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] mb-6">
                                {report.tren.map((t, i) => (
                                    <div key={i} className="flex items-center gap-3 mb-2 last:mb-0">
                                        <span className="text-[10px] text-gray-400 w-16 flex-shrink-0">
                                            {new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <div className="flex-1 h-5 bg-gray-100 rounded-lg overflow-hidden">
                                            <div className={`h-full ${barColor(t.skor)} rounded-lg`} style={{ width: `${Math.min(100, t.skor)}%` }} />
                                        </div>
                                        <span className={`text-xs font-bold w-8 text-right ${scoreColor(t.skor)}`}>{t.skor}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Riwayat Lengkap */}
                    <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-3">Riwayat Ujian</h3>
                    <div className="flex flex-col gap-3">
                        {riwayat.length === 0 ? (
                            <p className="text-center text-gray-500 py-4 bg-white rounded-2xl border-2 border-[#e2e8f0]">Belum ada riwayat.</p>
                        ) : (
                            riwayat.map(r => (
                                <div key={r.id} className="bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.score >= 70 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                            <span className="material-symbols-outlined">assignment</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#0f172a]">{r.subjectName || 'Ujian'}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {r.totalQuestions ? ` • Benar ${r.correctCount}/${r.totalQuestions}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${scoreColor(r.score)}`}>{r.score}</p>
                                        <p className={`text-xs font-bold ${r.score >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                                            {r.score >= 70 ? 'Lulus' : 'Remedial'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        {riwayatPage < riwayatTotalPages && (
                            <button
                                type="button"
                                onClick={loadMoreRiwayat}
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
                                        Muat Lebih Banyak ({riwayatTotalPages - riwayatPage} halaman lagi)
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
