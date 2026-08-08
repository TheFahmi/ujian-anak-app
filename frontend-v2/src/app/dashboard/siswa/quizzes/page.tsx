"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopAppBar from '@/components/TopAppBar';
import { useAuth } from '@/context/AuthContext';
import { Search } from 'lucide-react';

interface Subject {
    id: string;
    nama: string;
    highestScore: number | null;
}

interface SubjectStyle {
    icon: string;
    colorClass: string;
    desc: string;
    image?: string;
}

const getSubjectStyle = (name: string): SubjectStyle => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('matematika')) {
        return { icon: 'calculate', colorClass: 'icon-blue', desc: 'Latih kecepatan berhitungmu dengan soal-soal seru!' };
    } else if (lowerName.includes('bahasa')) {
        return { icon: 'spellcheck', colorClass: 'icon-green', desc: 'Uji kosakatamu dan kemampuan bahasamu.' };
    } else if (lowerName.includes('sains') || lowerName.includes('ipa')) {
        return { icon: 'science', colorClass: 'icon-purple', desc: 'Kenali dunia hewan dan alam sekitarmu.', image: '/images/quiz-science.svg' };
    } else if (lowerName.includes('sejarah') || lowerName.includes('ips')) {
        return { icon: 'history_edu', colorClass: 'icon-orange', desc: 'Pelajari peristiwa penting di masa lalu.', image: '/images/quiz-history.svg' };
    } else if (lowerName.includes('geografi')) {
        return { icon: 'public', colorClass: 'icon-blue', desc: 'Jelajahi dunia dan tempat-tempat menarik.', image: '/images/quiz-geography.svg' };
    } else if (lowerName.includes('seni')) {
        return { icon: 'palette', colorClass: 'icon-purple', desc: 'Ekspresikan kreativitasmu melalui seni.', image: '/images/quiz-art.svg' };
    } else if (lowerName.includes('musik')) {
        return { icon: 'music_note', colorClass: 'icon-purple', desc: 'Dengarkan dan pelajari nada-nada indah.', image: '/images/quiz-music.svg' };
    } else if (lowerName.includes('olahraga')) {
        return { icon: 'sports_soccer', colorClass: 'icon-orange', desc: 'Tetap sehat dan bugar dengan olahraga.', image: '/images/quiz-sports.svg' };
    } else if (lowerName.includes('teknologi') || lowerName.includes('komputer')) {
        return { icon: 'computer', colorClass: 'icon-blue', desc: 'Pelajari dunia teknologi masa depan.', image: '/images/quiz-technology.svg' };
    }
    return { icon: 'pentagon', colorClass: 'icon-blue', desc: 'Tantang dirimu dengan soal-soal pengetahuan umum.', image: '/images/quiz-general.svg' };
};

const getReadiness = (score: number | null) => {
    if (score === null || score === undefined) return { percent: 0, color: 'bar-red', label: '0%' };
    if (score >= 100) return { percent: 100, color: 'bar-green', label: 'Selesai' };
    if (score >= 70) return { percent: score, color: 'bar-green', label: `${score}%` };
    if (score >= 40) return { percent: score, color: 'bar-yellow', label: `${score}%` };
    return { percent: score, color: 'bar-red', label: `${score}%` };
};

const iconColorClasses: Record<string, string> = {
    'icon-blue': 'bg-blue-100 text-blue-600 border-blue-200',
    'icon-green': 'bg-green-100 text-green-600 border-green-200',
    'icon-purple': 'bg-purple-100 text-purple-600 border-purple-200',
    'icon-orange': 'bg-orange-100 text-orange-600 border-orange-200'
};

const barColorClasses: Record<string, string> = {
    'bar-green': 'bg-[#22c55e]',
    'bar-yellow': 'bg-[#eab308]',
    'bar-red': 'bg-[#ef4444]'
};

export default function QuizSiswaPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { user, logout, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const subjectsRes = await fetch(`/api/subjects?kelas=${user.kelas}&userId=${user.id}`);
                const subjectsData = await subjectsRes.json();
                setSubjects(subjectsData);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, isLoading, router, logout]);

    const handleStartExam = (subjectId: string) => {
        router.push(`/dashboard/siswa/exam/${subjectId}`);
    };

    const filteredSubjects = subjects.filter(s =>
        s.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading || loading) {
        return (
            <>
                <TopAppBar title="Ujian" variant="simple" showBack={true} />
                <div className="px-4 pt-2 pb-2">
                    <div className="w-full h-14 bg-white rounded-2xl border-2 border-[#e2e8f0] animate-pulse"></div>
                </div>
                <div className="py-3 px-4 bg-[#fdfbf7] sticky top-16 z-10">
                    <div className="flex items-center bg-white rounded-2xl h-14 w-full overflow-hidden border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]">
                        <div className="w-full h-14 bg-gray-100 animate-pulse"></div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 p-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-5 border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0 animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-6 bg-gray-200 rounded-lg animate-pulse mb-2 w-2/5"></div>
                                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-4/5"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    return (
        <>
            <TopAppBar title="Ujian" variant="simple" showBack={true} />

            {/* History Button */}
            <div className="px-4 pt-2 pb-2">
                <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white rounded-2xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] cursor-pointer transition-all duration-200 active:translate-y-1 active:shadow-none hover:bg-gray-50"
                    onClick={() => router.push('/dashboard/siswa/history')}
                >
                    <span className="material-symbols-outlined text-[#2b8cee] text-2xl">history</span>
                    <span className="text-base font-bold text-[#0f172a]">Lihat Riwayat Ujian</span>
                    <span className="material-symbols-outlined text-[#64748b] text-xl ml-auto">chevron_right</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="py-3 px-4 bg-[#fdfbf7] sticky top-20 z-10">
                <div className="flex items-center bg-white rounded-2xl h-14 w-full overflow-hidden border-2 border-[#0f172a] shadow-[4px_4px_0px_#0f172a]">
                    <div className="pl-4 flex items-center justify-center text-[#0f172a]">
                        <span className="material-symbols-outlined text-2xl">search</span>
                    </div>
                    <input
                        className="flex-1 border-none h-full px-4 pl-2 text-base font-bold text-[#0f172a] outline-none placeholder:text-[#64748b] bg-transparent"
                        placeholder="Cari Ujian..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Quiz List */}
            <div className="flex flex-col gap-4 p-4">
                {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => {
                        const style = getSubjectStyle(subject.nama);
                        const readiness = getReadiness(subject.highestScore);
                        const isCompleted = subject.highestScore !== null && subject.highestScore >= 100;

                        return (
                            <div key={subject.id} className="bg-white rounded-[2rem] p-5 border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-200">
                                <div className="flex items-start gap-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${iconColorClasses[style.colorClass] || iconColorClasses['icon-blue']}`}>
                                        <span className="material-symbols-outlined text-[2rem]">{style.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="text-lg font-bold text-[#0f172a] m-0 font-[var(--font-fredoka)]">{subject.nama}</p>
                                            {subject.highestScore !== null && subject.highestScore !== undefined && (
                                                <div className="flex items-center gap-1 px-2 py-1 bg-[#f4c025]/20 rounded-lg flex-shrink-0 border border-[#f4c025]">
                                                    <span className="material-symbols-outlined text-sm text-[#b4860b]">workspace_premium</span>
                                                    <span className="text-xs font-bold text-[#b4860b]">{subject.highestScore}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#64748b] m-0 leading-normal font-medium">{style.desc}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                                    <div className="flex-1 min-w-0">
                                        {isCompleted ? (
                                            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl w-fit">
                                                <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                                                <span className="text-sm font-bold text-green-700">Selesai</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Kesiapan</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${readiness.percent >= 70 ? 'bg-green-100 text-green-700' : readiness.percent >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                        {readiness.label}
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                                    <div
                                                        className={`h-full ${barColorClasses[readiness.color] || barColorClasses['bar-red']} transition-all duration-500 ease-out rounded-full`}
                                                        style={{ width: `${readiness.percent}%` }}
                                                    ></div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold border-2 cursor-pointer transition-all duration-200 flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none ${isCompleted
                                            ? 'bg-white border-[#2b8cee] text-[#2b8cee] hover:bg-blue-50'
                                            : 'bg-[#2b8cee] border-[#1a6bb5] text-white hover:bg-[#1a6bb5]'}`}
                                        onClick={() => handleStartExam(subject.id)}
                                    >
                                        {isCompleted ? 'Ulangi' : 'Mulai'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4 opacity-50 flex justify-center"><Search className="w-16 h-16 text-gray-400" /></div>
                        <p className="text-[#64748b] font-bold text-lg">Tidak ada ujian yang ditemukan.</p>
                        <p className="text-[#94a3b8] text-sm">Coba cari dengan kata kunci lain.</p>
                    </div>
                )}
            </div>
        </>
    );
}
