"use client";
import { BookOpen, Users, FileText, CheckCircle, PlusCircle } from 'lucide-react';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminMobileNav from '@/components/admin/AdminMobileNav';
import SubjectForm from '@/components/admin/SubjectForm';
import QuestionEditor from '@/components/admin/QuestionEditor';
import UserForm from '@/components/admin/UserForm';
import ResultsTable from '@/components/admin/ResultsTable';
import JSONImport from '@/components/admin/JSONImport';
import TokenStatsCards from '@/components/admin/TokenStatsCards';
import TokenUsageTable from '@/components/admin/TokenUsageTable';
import TokenSettingsForm from '@/components/admin/TokenSettingsForm';
import StudentDetailModal from '@/components/admin/StudentDetailModal';

function AdminDashboardContent() {
    const { user, logout } = useAuth();
    const { addToast } = useToast();
    const { confirm } = useConfirm();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
    const [subjects, setSubjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [subjectsLoaded, setSubjectsLoaded] = useState(false);
    const [usersLoaded, setUsersLoaded] = useState(false);
    const [resultsLoaded, setResultsLoaded] = useState(false);

    // Form States
    const [isEditingSubject, setIsEditingSubject] = useState(false);
    const [editingSubject, setEditingSubject] = useState<any>(null);
    const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [selectedUserForDetail, setSelectedUserForDetail] = useState<any>(null);

    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [questionsJson, setQuestionsJson] = useState('');

    // Token Usage States
    const [tokenStats, setTokenStats] = useState<any>(null);
    const [tokenUsage, setTokenUsage] = useState<any[]>([]);
    const [tokenPagination, setTokenPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [tokenSettings, setTokenSettings] = useState<any>(null);
    const [tokenSortBy, setTokenSortBy] = useState('timestamp');
    const [tokenSortOrder, setTokenSortOrder] = useState<'asc' | 'desc'>('desc');
    const [tokenLoading, setTokenLoading] = useState(false);

    const fetchSubjects = useCallback(async () => {
        if (subjectsLoaded) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/subjects');
            const data = await res.json();
            // an error response is a truthy object, not a list: storing it
            // crashes the render on .map
            if (!res.ok || !Array.isArray(data)) throw new Error(data?.message || 'Bad response');
            setSubjects(data);
            setSubjectsLoaded(true);
        } catch (err) {
            console.error(err);
            addToast('Gagal memuat subjects', 'error');
        } finally {
            setLoading(false);
        }
    }, [subjectsLoaded, addToast]);

    const fetchUsers = useCallback(async () => {
        if (usersLoaded) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            // an error response is a truthy object, not a list: storing it
            // crashes the render on .map
            if (!res.ok || !Array.isArray(data)) throw new Error(data?.message || 'Bad response');
            setUsers(data);
            setUsersLoaded(true);
        } catch (err) {
            console.error(err);
            addToast('Gagal memuat users', 'error');
        } finally {
            setLoading(false);
        }
    }, [usersLoaded, addToast]);

    const fetchResults = useCallback(async () => {
        if (resultsLoaded) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/results');
            const data = await res.json();
            // an error response is a truthy object, not a list: storing it
            // crashes the render on .map
            if (!res.ok || !Array.isArray(data)) throw new Error(data?.message || 'Bad response');
            setResults(data);
            setResultsLoaded(true);
        } catch (err) {
            console.error(err);
            addToast('Gagal memuat results', 'error');
        } finally {
            setLoading(false);
        }
    }, [resultsLoaded, addToast]);

    useEffect(() => {
        if (activeTab === 'subjects') {
            fetchSubjects();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'results') {
            fetchResults();
        }
    }, [activeTab, fetchSubjects, fetchUsers, fetchResults]);

    // Fetch token data when tab changes to token-usage
    const fetchTokenData = useCallback(async () => {
        setTokenLoading(true);
        try {
            const [statsRes, usageRes, settingsRes] = await Promise.all([
                fetch('/api/admin/token/stats'),
                fetch(`/api/admin/token/usage?page=${tokenPagination.page}&limit=${tokenPagination.limit}&sortBy=${tokenSortBy}&sortOrder=${tokenSortOrder}`),
                fetch('/api/admin/token/settings'),
            ]);
            
            const [stats, usage, settings] = await Promise.all([
                statsRes.json(),
                usageRes.json(),
                settingsRes.json(),
            ]);
            
            setTokenStats(stats);
            setTokenUsage(usage.data || []);
            setTokenPagination(usage.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
            setTokenSettings(settings);
        } catch (err) {
            console.error('Failed to fetch token data:', err);
            addToast('Gagal memuat data token', 'error');
        } finally {
            setTokenLoading(false);
        }
    }, [tokenPagination.page, tokenPagination.limit, tokenSortBy, tokenSortOrder, addToast]);

    useEffect(() => {
        if (activeTab === 'token-usage') {
            fetchTokenData();
        }
    }, [activeTab, fetchTokenData]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.push(`/dashboard/admin?tab=${tab}`, { scroll: false });
    };



    // --- SUBJECT MANAGEMENT (using dedicated API) ---
    const handleSubjectSubmit = async (formData: any) => {
        try {
            let res;
            if (isEditingSubject) {
                const id = formData.id;
                res = await fetch(`/api/admin/subjects/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, id }),
                });
            } else {
                // ID digenerate backend, jangan kirim id
                res = await fetch('/api/admin/subjects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nama: formData.nama, kelas: formData.kelas, soal: formData.soal || [] }),
                });
            }

            const data = await res.json();
            if (res.ok) {
                addToast(isEditingSubject ? 'Mata pelajaran berhasil diupdate!' : 'Mata pelajaran berhasil ditambahkan!', 'success');
                fetchSubjects();
                setIsEditingSubject(false);
                setEditingSubject(null);
            } else {
                addToast(data.message || 'Gagal menyimpan mata pelajaran', 'error');
            }
        } catch (err) {
            addToast('Gagal menyimpan mata pelajaran', 'error');
        }
    };

    const handleDeleteSubject = async (id: string) => {
        const confirmed = await confirm({
            title: 'Hapus Mata Pelajaran?',
            message: 'Yakin ingin menghapus mata pelajaran ini? Semua soal di dalamnya akan ikut terhapus.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'danger',
        });
        if (confirmed) {
            try {
                const res = await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    addToast('Mata pelajaran berhasil dihapus!', 'success');
                    fetchSubjects();
                } else {
                    addToast('Gagal menghapus mata pelajaran', 'error');
                }
            } catch (err) {
                addToast('Gagal menghapus mata pelajaran', 'error');
            }
        }
    };

    const handleUpdateSubjectQuestions = async (subjectId: string, updatedQuestions: any[]) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        try {
            const res = await fetch(`/api/admin/subjects/${subjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...subject, soal: updatedQuestions }),
            });

            if (res.ok) {
                addToast('Soal berhasil disimpan!', 'success');
                await fetchSubjects();
            } else {
                addToast('Gagal menyimpan soal', 'error');
                throw new Error('save failed');
            }
        } catch (err) {
            addToast('Gagal menyimpan soal', 'error');
            throw err;
        }
    };

    // --- USER MANAGEMENT (using dedicated API) ---
    const handleUserSubmit = async (formData: any) => {
        try {
            const id = isEditingUser ? formData.id : undefined;
            const userToSave = { ...formData };

            let res;
            if (isEditingUser) {
                res = await fetch(`/api/admin/users/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userToSave),
                });
            } else {
                res = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userToSave),
                });
            }

            const data = await res.json();
            if (res.ok) {
                addToast(isEditingUser ? 'Pengguna berhasil diupdate!' : 'Pengguna berhasil ditambahkan!', 'success');
                fetchUsers();
                setIsEditingUser(false);
                setEditingUser(null);
            } else {
                addToast(data.message || 'Gagal menyimpan pengguna', 'error');
            }
        } catch (err) {
            addToast('Gagal menyimpan pengguna', 'error');
        }
    };

    const handleDeleteUser = async (id: string) => {
        const confirmed = await confirm({
            title: 'Hapus Pengguna?',
            message: 'Yakin ingin menghapus pengguna ini? Data pengguna akan dihapus permanen.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'danger',
        });
        if (confirmed) {
            try {
                const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    addToast('Pengguna berhasil dihapus!', 'success');
                    fetchUsers();
                } else {
                    addToast('Gagal menghapus pengguna', 'error');
                }
            } catch (err) {
                addToast('Gagal menghapus pengguna', 'error');
            }
        }
    };

    // --- IMPORT --- (using new efficient API that only sends new data)
    const handleImportJSON = async (jsonString: string) => {
        try {
            const parsed = JSON.parse(jsonString);
            const newSubjects = Array.isArray(parsed) ? parsed : [parsed];

            if (!newSubjects[0].nama || !newSubjects[0].soal) {
                addToast("Format JSON tidak valid! Pastikan ada 'nama' dan 'soal'.", 'error');
                return;
            }

            // Use new API that only sends new subjects (not all data)
            const res = await fetch('/api/admin/subjects/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjects: newSubjects })
            });

            const data = await res.json();
            if (res.ok) {
                addToast(data.message || `Berhasil import ${newSubjects.length} mata pelajaran!`, 'success');
                fetchSubjects();
            } else {
                addToast(data.message || 'Gagal import mata pelajaran', 'error');
            }
        } catch (e: any) {
            addToast("Error parsing JSON: " + e.message, 'error');
        }
    };

    // --- STATS ---
    const stats = {
        totalSubjects: subjects.length,
        totalUsers: users.length,
        totalResults: results.length,
        recentActivity: results.slice(0, 5)
    };

    const getUserName = (userId: string) => {
        const u = users.find(user => user.id === userId);
        return u ? u.username : userId;
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50">
            <div className="animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                </div>
                
                <div className="flex">
                    {/* Sidebar Skeleton */}
                    <div className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen p-4">
                        <div className="space-y-3">
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                    
                    {/* Content Skeleton */}
                    <div className="flex-1 p-6">
                        <div className="space-y-4">
                            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="h-32 bg-gray-200 rounded"></div>
                                <div className="h-32 bg-gray-200 rounded"></div>
                                <div className="h-32 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const handleTokenPageChange = (page: number) => {
        setTokenPagination(prev => ({ ...prev, page }));
    };

    const handleTokenSort = (field: string) => {
        if (tokenSortBy === field) {
            setTokenSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setTokenSortBy(field);
            setTokenSortOrder('desc');
        }
    };

    const handleTokenSettingsSave = async (settings: { inputTokenPrice: number; outputTokenPrice: number }) => {
        const res = await fetch('/api/admin/token/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (res.ok) {
            addToast('Pengaturan token berhasil disimpan!', 'success');
            fetchTokenData();
        } else {
            throw new Error('Failed to save settings');
        }
    };

    const getTitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Dashboard Overview';
            case 'subjects': return 'Kelola Mata Pelajaran';
            case 'add-questions': return 'Tambah Soal (JSON)';
            case 'users': return 'Kelola Pengguna';
            case 'import': return 'Import Mata Pelajaran';
            case 'results': return 'Hasil Ujian';
            case 'token-usage': return 'Token AI Usage';
            default: return 'Admin Panel';
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-['Segoe_UI',sans-serif] md:pl-64 pb-20 md:pb-0">
            <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} onLogout={logout}
                isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <AdminHeader title={getTitle()} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onLogout={logout} />

            <main className="p-3 sm:p-6 max-w-7xl mx-auto">
                {activeTab === 'dashboard' && (
                    <div className="animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div className="p-6 rounded-[15px] text-white shadow-lg bg-gradient-to-br from-[#0984e3] to-[#74b9ff]">
                                <h3 className="m-0 text-lg opacity-90 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Mapel</h3>
                                <div className="text-[2.5rem] font-bold mt-2">{stats.totalSubjects}</div>
                            </div>
                            <div className="p-6 rounded-[15px] text-white shadow-lg bg-gradient-to-br from-[#e84393] to-[#fd79a8]">
                                <h3 className="m-0 text-lg opacity-90 flex items-center gap-2"><Users className="w-5 h-5" /> Siswa</h3>
                                <div className="text-[2.5rem] font-bold mt-2">{stats.totalUsers}</div>
                            </div>
                            <div className="p-6 rounded-[15px] text-[#2d3436] shadow-lg bg-gradient-to-br from-[#fdcb6e] to-[#ffeaa7]">
                                <h3 className="m-0 text-lg opacity-90 flex items-center gap-2"><FileText className="w-5 h-5" /> Ujian</h3>
                                <div className="text-[2.5rem] font-bold mt-2">{stats.totalResults}</div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[15px] shadow-sm">
                            <h3 className="m-0 mb-4 text-xl font-bold text-gray-800">Aktivitas Terbaru</h3>
                            {stats.recentActivity.length === 0 ? (
                                <p className="text-gray-500">Belum ada aktivitas ujian.</p>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {stats.recentActivity.map((r, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                                            <div className="flex-1">
                                                <p className="m-0 text-gray-800">
                                                    <strong>{getUserName(r.userId)}</strong> mengerjakan <strong>{r.subjectName}</strong>
                                                </p>
                                                <small className="text-gray-500 block mt-1">
                                                    Nilai: <span className="font-bold text-[#6c5ce7]">{r.score}</span> • {new Date(r.date).toLocaleDateString()}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'subjects' && (
                    <div className="animate-fadeIn">
                        <SubjectForm
                            initialData={editingSubject}
                            isEditing={isEditingSubject}
                            onSubmit={handleSubjectSubmit}
                            onCancel={() => { setIsEditingSubject(false); setEditingSubject(null); }}
                        />

                        {isEditingSubject && editingSubject && (
                            <QuestionEditor
                                questions={editingSubject.soal}
                                onUpdate={(updatedQuestions) => setEditingSubject({ ...editingSubject, soal: updatedQuestions })}
                            />
                        )}

                        {!isEditingSubject && (
                            <div className="grid gap-4">
                                {subjects.map(sub => (
                                    <div key={sub.id} className="bg-white p-4 sm:p-6 rounded-[15px] shadow-sm border border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                                            <div className="min-w-0">
                                                <h4 className="text-base sm:text-lg font-bold text-gray-800 m-0 truncate">{sub.nama}</h4>
                                                <p className="text-gray-500 text-sm m-0 mt-1 truncate">
                                                    {sub.kelas} • ID: {sub.id} • <span className="font-medium text-[#6c5ce7]">{sub.soal.length} Soal</span>
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                        expandedSubjectId === sub.id
                                                            ? 'bg-[#6c5ce7] text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                    onClick={() => setExpandedSubjectId(expandedSubjectId === sub.id ? null : sub.id)}
                                                >
                                                    {expandedSubjectId === sub.id ? 'Tutup Soal' : 'Kelola Soal'}
                                                </button>
                                                <button
                                                    className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
                                                    onClick={() => { setEditingSubject(sub); setIsEditingSubject(true); }}
                                                >
                                                    Edit Info
                                                </button>
                                                <button
                                                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                                                    onClick={() => handleDeleteSubject(sub.id)}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>

                                        {expandedSubjectId === sub.id && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <QuestionEditor
                                                    questions={sub.soal}
                                                    onUpdate={(updatedQuestions) => handleUpdateSubjectQuestions(sub.id, updatedQuestions)}
                                                    subjectName={sub.nama}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'add-questions' && (
                    <div className="animate-fadeIn">
                        <div className="bg-white p-4 sm:p-8 rounded-[15px] shadow-sm mb-8">
                            <h3 className="m-0 mb-2 text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Tambah Soal (JSON)</h3>
                            <p className="m-0 mb-6 text-gray-500">Tambahkan banyak soal sekaligus ke mata pelajaran yang sudah ada.</p>

                            <div className="mb-6">
                                <label className="block mb-2 font-bold text-gray-700">Pilih Mata Pelajaran:</label>
                                <select
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    className="w-full p-3 rounded-lg border-2 border-gray-200 text-base focus:outline-none focus:border-[#6c5ce7]"
                                >
                                    <option value="">-- Pilih Mata Pelajaran --</option>
                                    {subjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.nama} - {sub.kelas} ({sub.soal.length} soal)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <label className="block mb-2 font-bold text-gray-700">Array Soal (JSON):</label>
                            <textarea
                                className="w-full p-4 border-2 border-gray-200 rounded-lg text-base font-mono focus:outline-none focus:border-[#6c5ce7] min-h-[300px]"
                                placeholder='[{"pertanyaan": "...", "pilihan": [...], "jawaban_benar": "A"}]'
                                value={questionsJson}
                                onChange={(e) => setQuestionsJson(e.target.value)}
                            />

                            <button
                                className="mt-6 bg-[#6c5ce7] text-white px-8 py-3 rounded-[10px] font-bold hover:bg-[#5b4cc4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!selectedSubjectId || !questionsJson}
                                onClick={async () => {
                                    try {
                                        const newQuestions = JSON.parse(questionsJson);
                                        if (!Array.isArray(newQuestions)) {
                                            addToast('JSON harus berupa array soal!', 'error');
                                            return;
                                        }

                                        // Use dedicated API to add questions
                                        const res = await fetch(`/api/admin/subject/${selectedSubjectId}/questions`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ questions: newQuestions }),
                                        });

                                        const data = await res.json();
                                        if (res.ok) {
                                            addToast(data.message || `Berhasil menambahkan soal!`, 'success');
                                            fetchSubjects();
                                            setQuestionsJson('');
                                            setSelectedSubjectId('');
                                        } else {
                                            addToast(data.message || 'Gagal menambahkan soal', 'error');
                                        }
                                    } catch (e: any) {
                                        addToast('Error parsing JSON: ' + e.message, 'error');
                                    }
                                }}
                            >
                                Tambahkan Soal
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="animate-fadeIn">
                        <UserForm
                            initialData={editingUser}
                            isEditing={isEditingUser}
                            onSubmit={handleUserSubmit}
                            onCancel={() => { setIsEditingUser(false); setEditingUser(null); }}
                            subjects={subjects}
                            users={users}
                        />

                        <div className="bg-white rounded-[15px] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="m-0 text-lg font-bold text-gray-800">Daftar Pengguna</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-4 font-semibold text-gray-600">Username</th>
                                            <th className="p-4 font-semibold text-gray-600">Role</th>
                                            <th className="p-4 font-semibold text-gray-600">Kelas</th>
                                            <th className="p-4 font-semibold text-gray-600">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 font-medium">{u.username}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        u.role === 'pengawas' ? 'bg-orange-100 text-orange-700' :
                                                            u.role === 'guru' ? 'bg-green-100 text-green-700' :
                                                                u.role === 'orangtua' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {u.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-600">{u.kelas || '-'}</td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        {u.role === 'siswa' && (
                                                            <button
                                                                className="text-green-600 hover:text-green-800 font-medium text-sm cursor-pointer"
                                                                onClick={() => setSelectedUserForDetail(u)}
                                                            >
                                                                Detail
                                                            </button>
                                                        )}
                                                        <button
                                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
                                                            onClick={() => { setEditingUser(u); setIsEditingUser(true); }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="text-red-600 hover:text-red-800 font-medium text-sm cursor-pointer"
                                                            onClick={() => handleDeleteUser(u.id)}
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'import' && (
                    <div className="animate-fadeIn">
                        <JSONImport onImport={handleImportJSON} />
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className="animate-fadeIn">
                        <ResultsTable results={results} getUserName={getUserName} />
                    </div>
                )}

                {activeTab === 'token-usage' && (
                    <div className="animate-fadeIn">
                        {tokenLoading ? (
                            <div className="text-center py-8 text-gray-500">Loading token data...</div>
                        ) : (
                            <>
                                {tokenStats && (
                                    <TokenStatsCards
                                        today={tokenStats.today}
                                        week={tokenStats.week}
                                        month={tokenStats.month}
                                        all={tokenStats.all}
                                    />
                                )}

                                {tokenSettings && (
                                    <TokenSettingsForm
                                        settings={tokenSettings}
                                        onSave={handleTokenSettingsSave}
                                    />
                                )}

                                <TokenUsageTable
                                    data={tokenUsage}
                                    pagination={tokenPagination}
                                    onPageChange={handleTokenPageChange}
                                    onSort={handleTokenSort}
                                    sortBy={tokenSortBy}
                                    sortOrder={tokenSortOrder}
                                />
                            </>
                        )}
                    </div>
                )}
            </main>

            {selectedUserForDetail && (
                <StudentDetailModal
                    user={selectedUserForDetail}
                    onClose={() => setSelectedUserForDetail(null)}
                />
            )}

            <AdminMobileNav activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>
    );
}

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50">
                <div className="animate-pulse">
                    {/* Header Skeleton */}
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="h-8 bg-gray-200 rounded w-48"></div>
                    </div>
                    
                    <div className="flex">
                        {/* Sidebar Skeleton */}
                        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen p-4">
                            <div className="space-y-3">
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        
                        {/* Content Skeleton */}
                        <div className="flex-1 p-6">
                            <div className="space-y-4">
                                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="h-32 bg-gray-200 rounded"></div>
                                    <div className="h-32 bg-gray-200 rounded"></div>
                                    <div className="h-32 bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-64 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    );
}
