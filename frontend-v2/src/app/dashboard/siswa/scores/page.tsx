"use client";
import { Rocket } from 'lucide-react';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TopAppBar from '@/components/TopAppBar';

export default function ScoreReportPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        // Mock data for now, replace with actual API call
        // const fetchStats = async () => { ... }

        setTimeout(() => {
            setStats({
                totalExams: 12,
                averageScore: 85,
                highestScore: 100,
                subjects: [
                    { name: 'Matematika', score: 90, color: 'bg-blue-500' },
                    { name: 'Bahasa Indonesia', score: 85, color: 'bg-green-500' },
                    { name: 'IPA', score: 78, color: 'bg-purple-500' },
                    { name: 'Sejarah', score: 95, color: 'bg-orange-500' },
                ]
            });
            setLoading(false);
        }, 1000);
    }, [user]);

    if (loading) return <div className="p-8 text-center">Loading Report...</div>;

    return (
        <>
            <TopAppBar title="Laporanku" showBack />

            <div className="px-6 max-w-md mx-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                        <p className="text-sm text-gray-500 mb-1">Rata-rata</p>
                        <p className="text-3xl font-bold text-[#0f172a]">{stats.averageScore}</p>
                    </div>
                    <div className="bg-white p-4 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                        <p className="text-sm text-gray-500 mb-1">Ujian Selesai</p>
                        <p className="text-3xl font-bold text-[#0f172a]">{stats.totalExams}</p>
                    </div>
                </div>

                {/* Subject Performance Chart */}
                <div className="bg-white p-6 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] mb-8">
                    <h3 className="font-bold text-lg mb-6 text-[#0f172a]">Performa Mapel</h3>
                    <div className="flex flex-col gap-4">
                        {stats.subjects.map((sub: any, idx: number) => (
                            <div key={idx}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                                    <span className="text-sm font-bold text-[#0f172a]">{sub.score}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${sub.color}`}
                                        style={{ width: `${sub.score}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Motivation Card */}
                <div className="bg-[#f4c025] p-6 rounded-[2rem] border-2 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] text-[#0f172a]">
                    <div className="flex items-center gap-4 mb-2">
                        <Rocket className="w-10 h-10 text-blue-500" />
                        <h3 className="font-bold text-lg m-0">Terus Semangat!</h3>
                    </div>
                    <p className="m-0 font-medium opacity-90">
                        Nilai Matematika kamu meningkat tajam minggu ini. Pertahankan prestasimu!
                    </p>
                </div>
            </div>
        </>
    );
}
