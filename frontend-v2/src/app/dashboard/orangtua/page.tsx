"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TopAppBar from '@/components/TopAppBar';

export default function ParentDashboardPage() {
    const { user } = useAuth();
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [stats, setStats] = useState({ averageScore: 0, totalExams: 0 });
    const [recentResults, setRecentResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [kodeInput, setKodeInput] = useState('');
    const [linkMsg, setLinkMsg] = useState('');
    const [linking, setLinking] = useState(false);

    const linkAnak = async () => {
        if (!user || kodeInput.trim().length !== 6) {
            setLinkMsg('Masukkan kode 6 karakter dari anak.');
            return;
        }
        setLinking(true);
        try {
            const res = await fetch(`/api/user/${user.id}/link-anak`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kode: kodeInput.trim() }),
            });
            const d = await res.json();
            if (d.success) {
                setLinkMsg(d.message);
                setKodeInput('');
                // Refresh children
                const data = await (await fetch(`/api/dashboard/orangtua/${user.id}`)).json();
                if (data.hasChildren) {
                    setChildren(data.children);
                    setSelectedChildId(data.children[0]?.id);
                    setStats(data.stats);
                    setRecentResults(data.recentResults);
                }
            } else {
                setLinkMsg(d.message || 'Gagal hubungkan anak.');
            }
        } catch {
            setLinkMsg('Terjadi kesalahan. Coba lagi.');
        } finally {
            setLinking(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/dashboard/orangtua/${user.id}`);
                const data = await res.json();

                if (data.hasChildren) {
                    setChildren(data.children);
                    // Default pilih anak pertama
                    if (!selectedChildId && data.children.length > 0) {
                        setSelectedChildId(data.children[0].id);
                    }
                    setStats(data.stats);
                    setRecentResults(data.recentResults);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Pilih anak → filter hasil
    const currentChild = children.find(c => c.id === selectedChildId) || children[0] || null;
    const childResults = selectedChildId
        ? recentResults.filter(r => r.userId === selectedChildId)
        : recentResults;

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <div className="pt-20 px-6">
            <TopAppBar
                title={`Halo, Orang Tua!`}
                avatarUrl={user?.avatar || "/images/avatar-parent.png"}
            />

            {/* Child Selector */}
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

            {/* Link Anak via Kode */}
            <div className="mb-6 bg-white rounded-2xl border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#6c5ce7]">link</span>
                    <p className="font-bold text-[#0f172a] m-0 text-sm">Hubungkan Anak</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                    Masukkan kode 6 karakter dari halaman "Kode Orang Tua" di akun anakmu.
                </p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={kodeInput}
                        onChange={e => setKodeInput(e.target.value.toUpperCase())}
                        placeholder="XXXXXX"
                        maxLength={6}
                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl text-center font-mono text-lg font-bold tracking-[0.3em] uppercase focus:outline-none focus:border-[#6c5ce7]"
                    />
                    <button
                        onClick={linkAnak}
                        disabled={linking}
                        className="bg-[#6c5ce7] text-white border-2 border-[#0f172a] rounded-xl px-5 py-3 font-bold shadow-[2px_2px_0px_#0f172a] disabled:opacity-50"
                    >
                        {linking ? '...' : 'Hubungkan'}
                    </button>
                </div>
                {linkMsg && (
                    <p className={`text-xs mt-2 font-semibold ${linkMsg.includes('berhasil') || linkMsg.includes('terhubung') ? 'text-green-600' : 'text-red-500'}`}>
                        {linkMsg}
                    </p>
                )}
            </div>

            {/* Child Profile Card */}
            <div className="bg-[#0f172a] rounded-[2rem] p-6 text-white mb-6 relative overflow-hidden shadow-[4px_4px_0px_#94a3b8]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-white rounded-full border-2 border-[#f4c025] p-1 overflow-hidden">
                        <img
                            src={currentChild?.avatar || "/images/avatar-student.png"}
                            alt="Child"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="text-sm opacity-80">Laporan Anak</p>
                        <h2 className="text-xl font-bold font-[var(--font-fredoka)]">{currentChild?.username || 'Belum ada anak'}</h2>
                        <p className="text-sm bg-white/20 inline-block px-2 py-0.5 rounded-lg mt-1">{currentChild?.kelas || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-4">Ringkasan Belajar</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                    <p className="text-sm text-gray-500 mb-1">Rata-rata Nilai</p>
                    <p className="text-3xl font-bold text-[#2b8cee]">{stats.averageScore}</p>
                    <p className="text-xs text-green-600 font-bold mt-1">Total Keseluruhan</p>
                </div>
                <div className="bg-white p-4 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                    <p className="text-sm text-gray-500 mb-1">Ujian Selesai</p>
                    <p className="text-3xl font-bold text-[#f4c025]">{stats.totalExams}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Ujian</p>
                </div>
            </div>

            {/* Recent Results */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] m-0">Hasil Terbaru</h3>
                <button className="text-sm font-bold text-[#2b8cee]">Lihat Semua</button>
            </div>

            <div className="flex flex-col gap-3">
                {childResults.length > 0 ? (
                    childResults.map((result, index) => (
                        <div key={index} className="bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <span className="material-symbols-outlined">assignment</span>
                                </div>
                                <div>
                                    <p className="font-bold text-[#0f172a]">{result.subjectName || 'Ujian'}</p>
                                    <p className="text-xs text-gray-500">{new Date(result.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-[#0f172a]">{result.score}</p>
                                <p className={`text-xs font-bold ${result.score >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                                    {result.score >= 70 ? 'Lulus' : 'Remedial'}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-4">Belum ada hasil ujian.</p>
                )}
            </div>
        </div>
    );
}
