"use client";

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminMobileNav from '@/components/admin/AdminMobileNav';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
    const { logout } = useAuth();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-['Segoe_UI',sans-serif] md:pl-64 pb-20 md:pb-0">
            <AdminSidebar activeTab="settings" setActiveTab={(tab) => router.push(`/dashboard/admin?tab=${tab}`)} onLogout={logout} />
            <AdminHeader title="Pengaturan Admin" />

            <main className="p-3 sm:p-6 max-w-4xl mx-auto">
                <div className="bg-white p-4 sm:p-8 rounded-[15px] shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Pengaturan Umum</h2>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border border-gray-100 rounded-xl">
                            <div>
                                <h3 className="font-bold text-gray-700 m-0">Mode Maintenance</h3>
                                <p className="text-sm text-gray-500 m-0 mt-1">Matikan akses siswa sementara waktu.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6c5ce7]"></div>
                            </label>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border border-gray-100 rounded-xl">
                            <div>
                                <h3 className="font-bold text-gray-700 m-0">Notifikasi Email</h3>
                                <p className="text-sm text-gray-500 m-0 mt-1">Terima laporan harian via email.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6c5ce7]"></div>
                            </label>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <button className="bg-[#6c5ce7] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#5b4cc4] transition-colors">
                                Simpan Pengaturan
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <AdminMobileNav activeTab="settings" setActiveTab={(tab) => router.push(`/dashboard/admin?tab=${tab}`)} />
        </div>
    );
}
