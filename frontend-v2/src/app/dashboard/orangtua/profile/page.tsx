"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import TopAppBar from '@/components/TopAppBar';
import PasswordInput from '@/components/PasswordInput';

const AVATARS = [
    '/images/avatar-parent.png',
    '/images/avatars/avatar-1.png',
    '/images/avatars/avatar-2.png',
    '/images/avatars/avatar-3.png',
    '/images/avatars/avatar-4.png',
    '/images/avatars/avatar-5.png',
    '/images/login-rocket.png',
];

export default function ParentProfilePage() {
    const { user, login, logout } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const [children, setChildren] = useState<any[]>([]);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);

    // Ambil daftar anak
    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                const res = await fetch(`/api/dashboard/orangtua/${user.id}`);
                const data = await res.json();
                if (data.hasChildren) setChildren(data.children || []);
            } catch (e) {
                console.error('Failed to load children', e);
            }
        };
        load();
    }, [user]);

    const handleAvatarSelect = async (avatarUrl: string) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/users/${user.id}/avatar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: avatarUrl }),
            });
            const data = await res.json();
            if (res.ok && data && (data.success || data.id)) {
                login({ ...user, avatar: data.avatar || avatarUrl }, localStorage.getItem('token') || '');
                addToast('Avatar berhasil diganti!', 'success');
                setShowAvatarModal(false);
            } else {
                addToast('Gagal mengganti avatar', 'error');
            }
        } catch {
            addToast('Terjadi kesalahan', 'error');
        }
    };

    const handlePasswordChange = async () => {
        if (!user) return;
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            addToast('Konfirmasi kata sandi tidak cocok', 'error');
            return;
        }
        if (passwordForm.newPassword.length < 4) {
            addToast('Kata sandi minimal 4 karakter', 'error');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/users/${user.id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordForm.newPassword }),
            });
            const data = await res.json();
            if (data && data.id) {
                addToast('Kata sandi berhasil diubah!', 'success');
                setShowPasswordModal(false);
                setPasswordForm({ newPassword: '', confirmPassword: '' });
            } else {
                addToast('Gagal mengubah kata sandi', 'error');
            }
        } catch {
            addToast('Terjadi kesalahan', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="pt-20 md:pt-8 px-6 pb-28">
            <div className="md:hidden">
                <TopAppBar title="Profil Orang Tua" showBack />
            </div>

            {/* Profile Header */}
            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative">
                    <div
                        className="w-28 h-28 rounded-full border-4 border-[#0f172a] bg-cover bg-center shadow-[4px_4px_0px_#0f172a] bg-white"
                        style={{ backgroundImage: `url("${user.avatar || '/images/avatar-parent.png'}")` }}
                    ></div>
                    <button
                        onClick={() => setShowAvatarModal(true)}
                        className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#6c5ce7] text-white border-2 border-[#0f172a] flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#0f172a] active:translate-y-0.5 active:shadow-none transition-all"
                        aria-label="Ganti avatar"
                    >
                        <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-[var(--font-fredoka)] font-bold text-[#0f172a] m-0">{user.username || 'Orang Tua'}</h2>
                    <p className="text-sm text-gray-500 m-0 mt-1 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-base">family_restroom</span>
                        Wali Murid
                    </p>
                </div>
            </div>

            {/* Anak terhubung */}
            <div className="bg-white rounded-2xl border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[#6c5ce7]">family_restroom</span>
                    <p className="font-bold text-[#0f172a] m-0 text-sm">Anak Terhubung ({children.length})</p>
                </div>
                {children.length === 0 ? (
                    <p className="text-xs text-gray-500 m-0">
                        Belum ada anak terhubung. Gunakan menu Hubungkan Anak di dashboard.
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {children.map((c: any) => (
                            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-[#e2e8f0]">
                                <div
                                    className="w-9 h-9 rounded-full bg-cover bg-center border-2 border-[#e2e8f0] flex-shrink-0"
                                    style={{ backgroundImage: `url("${c.avatar || '/images/avatar-student.png'}")` }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#0f172a] text-sm m-0 truncate">{c.username}</p>
                                    <p className="text-xs text-gray-500 m-0">{c.kelas || '-'}</p>
                                </div>
                                <button
                                    onClick={() => router.push(`/dashboard/orangtua/report?childId=${c.id}`)}
                                    className="text-xs font-bold text-[#2b8cee] bg-[#eff6ff] px-3 py-1.5 rounded-lg cursor-pointer border-2 border-[#dbeafe] active:translate-y-0.5 transition-all"
                                >
                                    Laporan
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Menu aksi */}
            <div className="flex flex-col gap-3 mb-6">
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[#0f172a]">lock</span>
                    <span className="flex-grow text-left font-bold text-[#0f172a] text-sm">Ganti Kata Sandi</span>
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </button>
                <button
                    onClick={() => router.push('/dashboard/orangtua')}
                    className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[#0f172a]">home</span>
                    <span className="flex-grow text-left font-bold text-[#0f172a] text-sm">Dashboard Orang Tua</span>
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </button>
            </div>

            <button
                onClick={logout}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold border-2 border-red-200 cursor-pointer hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined">logout</span>
                Keluar
            </button>

            {/* Modal Avatar */}
            {showAvatarModal && (
                <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAvatarModal(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-[#0f172a] text-lg m-0 mb-4 text-center">Pilih Avatar</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {AVATARS.map(a => (
                                <button
                                    key={a}
                                    onClick={() => handleAvatarSelect(a)}
                                    className={`aspect-square rounded-2xl bg-cover bg-center border-2 cursor-pointer transition-all hover:scale-105 ${user.avatar === a ? 'border-[#6c5ce7] ring-2 ring-[#6c5ce7]/30' : 'border-[#e2e8f0]'}`}
                                    style={{ backgroundImage: `url("${a}")` }}
                                ></button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowAvatarModal(false)}
                            className="w-full mt-5 py-2.5 rounded-xl font-bold text-sm border-2 border-[#e2e8f0] bg-white text-gray-500 cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Password */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-[#0f172a] text-lg m-0 mb-4 text-center">Ganti Kata Sandi</h3>
                        <PasswordInput
                            inputClassName="w-full p-3 border-2 border-[#e2e8f0] rounded-xl mb-3 text-sm focus:outline-none focus:border-[#6c5ce7]"
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Kata sandi baru (min. 4)"
                        />
                        <PasswordInput
                            inputClassName="w-full p-3 border-2 border-[#e2e8f0] rounded-xl mb-4 text-sm focus:outline-none focus:border-[#6c5ce7]"
                            value={passwordForm.confirmPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="Ulangi kata sandi baru"
                        />
                        <button
                            onClick={handlePasswordChange}
                            disabled={saving}
                            className="w-full py-2.5 rounded-xl font-bold text-sm bg-[#6c5ce7] text-white cursor-pointer disabled:opacity-60"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="w-full mt-2 py-2.5 rounded-xl font-bold text-sm border-2 border-[#e2e8f0] bg-white text-gray-500 cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
