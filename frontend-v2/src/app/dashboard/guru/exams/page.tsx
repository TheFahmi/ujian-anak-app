"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import TopAppBar from '@/components/TopAppBar';
import QuestionEditor from '@/components/admin/QuestionEditor';

function TeacherExamsContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const subjectId = searchParams.get('subjectId') || '';

    const [subject, setSubject] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user || !subjectId) {
            setLoading(false);
            return;
        }
        const fetchSubject = async () => {
            try {
                const res = await fetch(`/api/dashboard/guru/mapel/${subjectId}?userId=${user.id}`);
                if (!res.ok) {
                    const d = await res.json().catch(() => ({}));
                    setError(d.message || 'Gagal memuat mapel');
                    return;
                }
                const data = await res.json();
                setSubject(data.mapel || data.subject || data);
                setQuestions(data.soal || data.questions || []);
            } catch (e) {
                console.error(e);
                setError('Gagal memuat data mapel');
            } finally {
                setLoading(false);
            }
        };
        fetchSubject();
    }, [user, subjectId]);

    const handleUpdate = useCallback(async (newQuestions: any[]) => {
        if (!user || !subjectId) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/subjects/${subjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ soal: newQuestions }),
            });
            if (!res.ok) throw new Error('Gagal simpan');
            setQuestions(newQuestions);
        } catch (e) {
            console.error(e);
            alert('Gagal menyimpan soal');
        } finally {
            setSaving(false);
        }
    }, [user, subjectId]);

    if (loading) return <div className="pt-6"><TopAppBar title="Kelola Ujian" showBack /><p className="text-center py-10 text-gray-500">Loading...</p></div>;

    return (
        <div className="pt-6 pb-8">
            <div className="mb-6 md:hidden">
                <TopAppBar title={subject?.nama || 'Kelola Ujian'} showBack />
            </div>
            <h1 className="mb-6 hidden text-2xl font-bold text-[#171717] md:block">
                {subject?.nama || 'Kelola Ujian'}
            </h1>

            {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-4 text-sm">
                    {error}
                </div>
            )}

            {!subjectId && (
                <div className="text-center py-10">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">assignment</span>
                    <p className="text-gray-500">Pilih mapel dari halaman Mapel Saya untuk kelola soal.</p>
                </div>
            )}

            {subjectId && !error && (
                <>
                    <QuestionEditor
                        questions={questions}
                        onUpdate={handleUpdate}
                        subjectName={subject?.nama}
                    />
                    {saving && <p className="text-sm text-gray-500 text-center">Menyimpan...</p>}
                </>
            )}
        </div>
    );
}

export default function TeacherExamsPage() {
    return (
        <Suspense fallback={<div className="pt-20 px-6"><p className="text-center py-10 text-gray-500">Loading...</p></div>}>
            <TeacherExamsContent />
        </Suspense>
    );
}
