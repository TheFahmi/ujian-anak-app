"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import TopAppBar from '@/components/TopAppBar';
import BottomNavigation from '@/components/BottomNavigation';

export default function SettingsPage() {
  const { user, login } = useAuth(); // We need login to update user in context
  const { addToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Avatar list
  const AVATARS = [
    '/images/avatars/avatar-1.png',
    '/images/avatars/avatar-2.png',
    '/images/avatars/avatar-3.png',
    '/images/avatars/avatar-4.png',
    '/images/avatars/avatar-5.png',
    '/images/ai-robo-v2.png',
    '/images/ai-prof-hoot-v2.png',
    '/images/ai-cleo-v2.png',
    '/images/ai-dino-v2.png',
    '/images/avatar-student.png',
    '/images/login-robot-waving.png',
    '/images/home-ai-robot.png',
    '/images/login-rocket.png'
  ];

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${user.id}/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar: avatarUrl })
      });
      const data = await res.json();

      if (res.ok && data && (data.success || data.id)) {
        // Update context and local storage
        login({ ...user, avatar: data.avatar || avatarUrl }, token || '');
        addToast('Avatar berhasil diganti!', 'success');
        setShowAvatarModal(false);
      } else {
        addToast('Gagal mengganti avatar', 'error');
      }
    } catch (err) {
      console.error(err);
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

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: passwordForm.newPassword
        })
      });
      const data = await res.json();

      if (data && data.id) {
        addToast('Kata sandi berhasil diubah!', 'success');
        setShowPasswordModal(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        addToast('Gagal mengubah kata sandi', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Terjadi kesalahan', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-['Lexend',sans-serif] pb-32">
      <div className="md:hidden">
      <TopAppBar
        title="Pengaturan"
        avatarUrl={user.avatar || "/images/avatar-student.png"}
      />
      </div>

      <div className="px-6 max-w-md mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="relative">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] bg-white"
              style={{
                backgroundImage: `url("${user.avatar || '/images/avatar-student.png'}")`
              }}
            ></div>
            <button
              className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#f4c025] text-[#0f172a] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] hover:bg-[#e6b020] active:translate-y-0.5 active:shadow-none transition-all"
              onClick={() => setShowAvatarModal(true)}
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>
          <p className="text-[#0f172a] text-2xl font-['Fredoka_One',cursive] leading-tight text-center m-0">
            {user.username}
          </p>
        </div>

        {/* Settings List */}
        <div className="flex flex-col gap-6">
          {/* Change Name Field - DISABLED */}
          <label className="flex flex-col w-full gap-2 opacity-60">
            <p className="text-[#0f172a] text-sm font-bold px-1">
              Nama Pengguna (Tidak dapat diubah)
            </p>
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#64748b]">
                <span className="material-symbols-outlined">person</span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 rounded-2xl text-[#0f172a] bg-gray-100 border-2 border-[#e2e8f0] h-14 py-4 pl-12 pr-4 text-base font-bold cursor-not-allowed"
                value={user.username}
                disabled
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#64748b]">
                <span className="material-symbols-outlined text-lg">lock</span>
              </div>
            </div>
          </label>

          {/* List Items Container */}
          <div className="flex flex-col gap-3">
            {/* Change Avatar */}
            <div
              className="flex items-center gap-4 rounded-2xl p-4 min-h-16 justify-between bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] hover:bg-gray-50 transition-all active:translate-y-0.5 active:shadow-none cursor-pointer"
              onClick={() => setShowAvatarModal(true)}
            >
              <div className="flex items-center gap-4">
                <div className="text-[#2b8cee] flex items-center justify-center rounded-xl bg-blue-50 border-2 border-blue-100 shrink-0 size-10">
                  <span className="material-symbols-outlined">face_6</span>
                </div>
                <p className="text-[#0f172a] text-base font-bold flex-1 truncate m-0">
                  Ganti Avatar
                </p>
              </div>
              <div className="shrink-0">
                <span className="material-symbols-outlined text-[#64748b]">chevron_right</span>
              </div>
            </div>

            {/* Change Password */}
            <div
              className="flex items-center gap-4 rounded-2xl p-4 min-h-16 justify-between bg-white border-2 border-[#e2e8f0] shadow-[2px_2px_0px_#e2e8f0] hover:bg-gray-50 transition-all active:translate-y-0.5 active:shadow-none cursor-pointer"
              onClick={() => setShowPasswordModal(true)}
            >
              <div className="flex items-center gap-4">
                <div className="text-[#f4c025] flex items-center justify-center rounded-xl bg-yellow-50 border-2 border-yellow-100 shrink-0 size-10">
                  <span className="material-symbols-outlined">key</span>
                </div>
                <p className="text-[#0f172a] text-base font-bold flex-1 truncate m-0">
                  Ganti Kata Sandi
                </p>
              </div>
              <div className="shrink-0">
                <span className="material-symbols-outlined text-[#64748b]">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-24 left-0 right-0 z-40 w-full max-w-md mx-auto bg-[#fdfbf7]/90 backdrop-blur-sm p-4 border-t-2 border-[#e2e8f0]">
        <div className="flex w-full flex-col items-center gap-4">
          <button
            className="flex w-full max-w-[480px] cursor-pointer items-center justify-center rounded-2xl h-14 px-4 bg-[#2b8cee] text-white text-base font-bold border-2 border-[#1a6bb5] shadow-[4px_4px_0px_#1a6bb5] hover:bg-[#1a6bb5] active:translate-y-1 active:shadow-none transition-all"
            onClick={() => addToast('Perubahan berhasil disimpan', 'success')}
          >
            Simpan Perubahan
          </button>
          <a
            className="text-[#2b8cee] text-sm font-bold hover:underline no-underline"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              addToast('Bantuan & Dukungan akan segera tersedia', 'info');
            }}
          >
            Bantuan & Dukungan
          </a>
        </div>
      </div>

      <BottomNavigation />

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAvatarModal(false)}>
          <div className="bg-[#fdfbf7] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border-4 border-[#0f172a] animate-bounceIn relative overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-['Fredoka_One',cursive] text-xl text-[#0f172a] m-0">Pilih Avatar</h3>
              <button onClick={() => setShowAvatarModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <span className="material-symbols-outlined text-gray-600">close</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 overflow-y-auto p-2">
              {AVATARS.map((avatar, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-2xl border-2 cursor-pointer relative overflow-hidden transition-all hover:scale-105 ${user.avatar === avatar ? 'border-[#f4c025] shadow-[0_0_0_4px_rgba(244,192,37,0.3)]' : 'border-[#e2e8f0]'}`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                  {user.avatar === avatar && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-[#f4c025] rounded-full p-1 border-2 border-white">
                        <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-[#fdfbf7] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border-4 border-[#0f172a] animate-bounceIn relative" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-['Fredoka_One',cursive] text-xl text-[#0f172a] m-0">Ganti Kata Sandi</h3>
              <button onClick={() => setShowPasswordModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <span className="material-symbols-outlined text-gray-600">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#64748b]">Kata Sandi Baru</label>
                <input
                  type="password"
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#e2e8f0] focus:border-[#2b8cee] focus:outline-none font-bold text-[#0f172a]"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#64748b]">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#e2e8f0] focus:border-[#2b8cee] focus:outline-none font-bold text-[#0f172a]"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <button
                className="mt-4 w-full py-3 rounded-xl bg-[#2b8cee] text-white font-bold border-2 border-[#1a6bb5] shadow-[4px_4px_0px_#1a6bb5] active:translate-y-1 active:shadow-none transition-all"
                onClick={handlePasswordChange}
              >
                Simpan Kata Sandi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



