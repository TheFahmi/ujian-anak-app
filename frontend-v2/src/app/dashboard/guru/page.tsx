"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TopAppBar from '@/components/TopAppBar';

export default function TeacherDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalStudents: 0, totalExams: 0 });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard/guru');
                const data = await res.json();
                setStats(data.stats);
                setRecentActivity(data.recentActivity);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <div className="pt-20 px-6">
            <TopAppBar
                title={`Halo, Guru ${user?.username || ''}!`}
                avatarUrl={user?.avatar || "/images/avatar-teacher.png"}
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-blue-600">groups</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Siswa</p>
                    <p className="text-2xl font-bold text-[#0f172a]">{stats.totalStudents}</p>
                </div>
                <div className="bg-white p-4 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-green-600">assignment_turned_in</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Ujian Selesai</p>
                    <p className="text-2xl font-bold text-[#0f172a]">{stats.totalExams}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-4">Aksi Cepat</h3>
            <div className="flex flex-col gap-3">
                <button className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] active:translate-y-1 active:shadow-none transition-all">
                    <div className="w-12 h-12 bg-[#f4c025] rounded-xl flex items-center justify-center border-2 border-[#0f172a]">
                        <span className="material-symbols-outlined text-[#0f172a]">add</span>
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-[#0f172a]">Buat Ujian Baru</p>
                        <p className="text-xs text-gray-500">Siapkan soal untuk siswa</p>
                    </div>
                </button>
                <button className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] active:translate-y-1 active:shadow-none transition-all">
                    <div className="w-12 h-12 bg-[#2b8cee] rounded-xl flex items-center justify-center border-2 border-[#0f172a]">
                        <span className="material-symbols-outlined text-white">grading</span>
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-[#0f172a]">Periksa Jawaban</p>
                        <p className="text-xs text-gray-500">Review jawaban essay</p>
                    </div>
                </button>
            </div>

            {/* Recent Activity */}
            <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-4 mt-6">Aktivitas Terbaru</h3>
            <div className="bg-white rounded-[2rem] border-2 border-[#e2e8f0] p-4">
                {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 mb-4 last:mb-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                <img
                                    src={activity.studentAvatar || "/images/avatar-student.png"}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#0f172a]">
                                    {activity.studentName} menyelesaikan {activity.subjectName || 'Ujian'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Nilai: {activity.score} • {new Date(activity.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-4">Belum ada aktivitas terbaru.</p>
                )}
            </div>
        </div>
    );
}
