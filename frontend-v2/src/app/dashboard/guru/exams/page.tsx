"use client";

import TopAppBar from '@/components/TopAppBar';

export default function TeacherExamsPage() {
    return (
        <div className="pt-20 px-6">
            <TopAppBar title="Kelola Ujian" showBack />
            <div className="text-center py-10">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">assignment</span>
                <p className="text-gray-500">Halaman kelola ujian akan segera hadir.</p>
            </div>
        </div>
    );
}
