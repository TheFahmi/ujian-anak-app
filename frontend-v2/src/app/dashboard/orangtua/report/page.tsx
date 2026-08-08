"use client";

import TopAppBar from '@/components/TopAppBar';

export default function ParentReportPage() {
    return (
        <div className="pt-20 px-6">
            <TopAppBar title="Laporan Belajar" showBack />
            <div className="text-center py-10">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">analytics</span>
                <p className="text-gray-500">Laporan detail perkembangan anak akan segera hadir.</p>
            </div>
        </div>
    );
}
