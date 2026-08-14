"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import TopAppBar from '@/components/TopAppBar';

interface MapelInfo {
    id: string;
    nama: string;
    kelas: string;
    jumlahSoal: number;
}

interface SiswaInfo {
    id: string;
    nama: string;
    kelas: string;
    avatar: string;
    jumlahUjian: number;
    rataNilai: number | null;
    terakhir: { subjectName: string; score: number; date: string } | null;
}

export default function TeacherDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ totalStudents: 0, totalExams: 0 });
    const [mapel, setMapel] = useState<MapelInfo[]>([]);
    const [kelas, setKelas] = useState<string[]>([]);
    const [siswa, setSiswa] = useState<SiswaInfo[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [tab, setTab] = useState<'beranda' | 'mapel' | 'siswa' | 'adaptif'>('beranda');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/dashboard/guru?userId=${user.id}`);
                const data = await res.json();
                setStats(data.stats || { totalStudents: 0, totalExams: 0 });
                setMapel(data.mapel || []);
                setKelas(data.kelas || []);
                setRecentActivity(data.recentActivity || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const loadSiswa = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/dashboard/guru/siswa?userId=${user.id}`);
            const data = await res.json();
            setSiswa(data.siswa || []);
        } catch (error) {
            console.error('Failed to fetch students', error);
        }
    };

    const [adaptifData, setAdaptifData] = useState<any>(null);
    const loadAdaptif = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/dashboard/guru/adaptif?userId=${user.id}`);
            const data = await res.json();
            setAdaptifData(data);
        } catch (error) {
            console.error('Failed to fetch adaptive progress', error);
        }
    };

    useEffect(() => {
        if (tab === 'siswa' && user) loadSiswa();
        if (tab === 'adaptif' && user) loadAdaptif();
    }, [tab, user]);

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    const navBtn = (active: boolean) =>
        `px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
            active
                ? 'bg-[#f4c025] border-[#0f172a] text-[#0f172a] shadow-[2px_2px_0px_#0f172a]'
                : 'bg-white border-[#e2e8f0] text-[#64748b]'
        }`;

    return (
        <div className="pt-20 md:pt-0 px-4 md:px-0 pb-8">
            <div className="mb-6 md:hidden">
                <div className="md:hidden">
                    <TopAppBar
                    title={`Halo, Guru ${user?.username || ''}!`}
                    avatarUrl={user?.avatar || "/images/avatar-teacher.png"}
                />
                </div>
            </div>

            <h1 className="mb-6 hidden text-2xl font-bold text-[#171717] md:block">
                Halo, Guru {user?.username || ''}!
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button className={navBtn(tab === 'beranda')} onClick={() => setTab('beranda')}>Beranda</button>
                <button className={navBtn(tab === 'mapel')} onClick={() => setTab('mapel')}>Mapel Saya</button>
                <button className={navBtn(tab === 'siswa')} onClick={() => setTab('siswa')}>Siswa</button>
                <button className={navBtn(tab === 'adaptif')} onClick={() => setTab('adaptif')}>Progress Adaptif</button>
            </div>

            {tab === 'beranda' && (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
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
                        <div className="hidden bg-white p-4 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] md:block">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-amber-600">menu_book</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Mapel</p>
                            <p className="text-2xl font-bold text-[#0f172a]">{mapel.length}</p>
                        </div>
                        <div className="hidden bg-white p-4 rounded-[2rem] border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] md:block">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-purple-600">groups</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Kelas</p>
                            <p className="text-2xl font-bold text-[#0f172a]">{kelas.length}</p>
                        </div>
                    </div>

                    {/* Mapel card ringkas */}
                    {mapel.length > 0 && (
                        <>
                            <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-3">Mapel Saya ({mapel.length})</h3>
                            <div className="flex flex-col gap-3 mb-6 md:grid md:grid-cols-2 lg:grid-cols-3">
                                {mapel.map(m => (
                                    <button
                                        key={m.id}
                                        className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] active:translate-y-1 active:shadow-none transition-all text-left"
                                        onClick={() => router.push('/dashboard/guru/exams')}
                                    >
                                        <div className="w-12 h-12 bg-[#6c5ce7] rounded-xl flex items-center justify-center border-2 border-[#0f172a]">
                                            <span className="material-symbols-outlined text-white">menu_book</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-[#0f172a]">{m.nama}</p>
                                            <p className="text-xs text-gray-500">{m.kelas} • {m.jumlahSoal} soal</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

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
                </>
            )}

            {tab === 'mapel' && (
                <>
                    <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-3">
                        Mata Pelajaran Saya
                        {kelas.length > 0 && <span className="text-sm text-gray-500 ml-2">({kelas.join(', ')})</span>}
                    </h3>
                    {mapel.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Belum ada mapel yang di-assign. Hubungi admin.</p>
                    ) : (
                        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                            {mapel.map(m => (
                                <button
                                    key={m.id}
                                    className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] active:translate-y-1 active:shadow-none transition-all text-left"
                                    onClick={() => router.push(`/dashboard/guru/exams?subjectId=${m.id}`)}
                                >
                                    <div className="w-12 h-12 bg-[#6c5ce7] rounded-xl flex items-center justify-center border-2 border-[#0f172a]">
                                        <span className="material-symbols-outlined text-white">menu_book</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[#0f172a]">{m.nama}</p>
                                        <p className="text-xs text-gray-500">{m.kelas} • {m.jumlahSoal} soal</p>
                                    </div>
                                    <span className="text-xs font-bold text-[#6c5ce7] bg-[#6c5ce7]/10 px-3 py-1.5 rounded-xl">Kelola Soal</span>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {tab === 'siswa' && (
                <>
                    <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-3">
                        Siswa Saya
                        {kelas.length > 0 && <span className="text-sm text-gray-500 ml-2">({kelas.join(', ')})</span>}
                    </h3>
                    {siswa.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            {kelas.length > 0
                                ? `Belum ada siswa di kelas ${kelas.join(', ')}.`
                                : 'Belum ada siswa terdaftar.'}
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                            {siswa.map(s => (
                                <div key={s.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                        <img src={s.avatar || "/images/avatar-student.png"} alt={s.nama} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#0f172a] truncate">{s.nama}</p>
                                        <p className="text-xs text-gray-500">
                                            {s.kelas || '-'} • {s.jumlahUjian} ujian
                                            {s.rataNilai !== null && ` • Rata-rata ${s.rataNilai}`}
                                        </p>
                                        {s.terakhir && (
                                            <p className="text-[11px] text-[#6c5ce7] mt-0.5 truncate">
                                                Terakhir: {s.terakhir.subjectName} — {s.terakhir.score}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {tab === 'adaptif' && (
                <>
                    <h3 className="font-[var(--font-fredoka)] text-xl text-[#0f172a] mb-3">
                        Progress Adaptif Siswa
                        {adaptifData?.kelas?.length > 0 && <span className="text-sm text-gray-500 ml-2">({adaptifData.kelas.join(', ')})</span>}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Level aktual tiap siswa per mapel — AI turunkan level kalau belum kuasai dasar.
                    </p>
                    {!adaptifData ? (
                        <p className="text-center text-gray-500 py-8">Memuat...</p>
                    ) : adaptifData.siswa.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Belum ada siswa.</p>
                    ) : (
                        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                            {adaptifData.siswa.map((s: any) => (
                                <div key={s.id} className="bg-white p-4 rounded-2xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                            <img src={s.avatar || '/images/avatar-student.png'} alt={s.nama} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-[#0f172a] truncate">{s.nama}</p>
                                            <p className="text-xs text-gray-500">{s.kelas || '-'}</p>
                                        </div>
                                    </div>
                                    {s.mapel.length === 0 ? (
                                        <p className="text-xs text-gray-400">Belum ada progress adaptif.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {s.mapel.map((m: any) => (
                                                <div key={m.subjectId} className="flex items-center justify-between bg-[#f8fafc] rounded-xl px-3 py-2">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-[#0f172a] truncate">{m.nama}</p>
                                                        <p className="text-[11px] text-gray-500">{m.mastered} skill • Bintang {m.stars}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {m.badges?.length > 0 && <span title={m.badges[0]} className="material-symbols-outlined text-sm text-[#f59e0b]">military_tech</span>}
                                                        <span className="text-xs font-bold text-[#6c5ce7] bg-[#6c5ce7]/10 px-2.5 py-1 rounded-xl">
                                                            {m.levelLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
