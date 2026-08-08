"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TopAppBar from '@/components/TopAppBar';

export default function ParentDashboardPage() {
    const { user } = useAuth();
    const [children, setChildren] = useState<any[]>([]);
    const [stats, setStats] = useState({ averageScore: 0, totalExams: 0 });
    const [recentResults, setRecentResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/dashboard/orangtua/${user.id}`);
                const data = await res.json();

                if (data.hasChildren) {
                    setChildren(data.children);
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

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    // Use first child for display if available, otherwise placeholder
    const currentChild = children.length > 0 ? children[0] : null;

    return (
        <div className="pt-20 px-6">
            <TopAppBar
                title={`Halo, Orang Tua!`}
                avatarUrl={user?.avatar || "/images/avatar-parent.png"}
            />

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
                {recentResults.length > 0 ? (
                    recentResults.map((result, index) => (
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
