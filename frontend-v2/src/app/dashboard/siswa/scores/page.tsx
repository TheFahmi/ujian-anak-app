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

        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/results/${user.id}?userId=${user.id}`);
                if (!res.ok) throw new Error('Failed');
                const results = await res.json();
                if (!Array.isArray(results) || results.length === 0) {
                    setStats({
                        totalExams: 0,
                        averageScore: 0,
                        highestScore: 0,
                        subjects: [],
                    });
                    setLoading(false);
                    return;
                }
                // Ambil hanya ujian dengan totalQuestions > 0 (skor valid)
                const valid = results.filter((r: any) => (r.totalQuestions || 0) > 0);
                const totalExams = valid.length;
                const avg = valid.length > 0
                    ? Math.round(valid.reduce((s: number, r: any) => s + (r.score || 0), 0) / valid.length)
                    : 0;
                const highest = valid.length > 0
                    ? Math.max(...valid.map((r: any) => r.score || 0))
                    : 0;

                // Agregat per mapel: rata-rata score per subjectName
                const bySubject: Record<string, { total: number; count: number }> = {};
                valid.forEach((r: any) => {
                    const name = r.subjectName || 'Tanpa Mapel';
                    if (!bySubject[name]) bySubject[name] = { total: 0, count: 0 };
                    bySubject[name].total += (r.score || 0);
                    bySubject[name].count += 1;
                });
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
                const subjects = Object.entries(bySubject).map(([name, v], i) => ({
                    name,
                    score: Math.round(v.total / v.count),
                    color: colors[i % colors.length],
                }));

                setStats({ totalExams, averageScore: avg, highestScore: highest, subjects });
            } catch (err) {
                console.error('Failed to fetch stats', err);
                setStats({ totalExams: 0, averageScore: 0, highestScore: 0, subjects: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (loading) return <div className="p-8 text-center">Loading Report...</div>;

    return (
        <>
            <div className="md:hidden">
                <TopAppBar title="Laporanku" showBack />
            </div>

            <div className="px-6 pt-20 md:pt-0 max-w-md mx-auto">
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
