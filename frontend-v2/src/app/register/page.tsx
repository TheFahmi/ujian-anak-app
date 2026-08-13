"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

const KELAS_PILIHAN = ['TK', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];

const ROLE_LIST = [
    { id: 'siswa', label: 'Siswa', icon: '🎒', desc: 'Kerjakan ujian & belajar adaptif' },
    { id: 'guru', label: 'Guru', icon: '👨‍🏫', desc: 'Kelola soal & pantau siswa' },
    { id: 'orangtua', label: 'Orang Tua', icon: '👪', desc: 'Pantau perkembangan anak' },
];

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState('siswa');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [kelas, setKelas] = useState('Kelas 5');
    const [password, setPassword] = useState('');
    const [konfirmasi, setKonfirmasi] = useState('');
    const [error, setError] = useState('');
    const [sukses, setSukses] = useState(false);
    const [pending, setPending] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (username.trim().length < 3) {
            setError('Username minimal 3 huruf ya');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Format emailnya belum benar. Contoh: nama@sekolah.com');
            return;
        }
        if (password.length < 8) {
            setError('Password minimal 8 karakter ya');
            return;
        }
        if (password !== konfirmasi) {
            setError('Konfirmasi passwordnya belum sama nih');
            return;
        }

        setLoading(true);
        try {
            const payload: any = {
                username: username.trim(),
                email: email.trim(),
                password,
                role,
            };
            if (role === 'siswa') payload.kelas = kelas;

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.access_token) {
                setSukses(true);
                addToast('Yeay, akunmu berhasil dibuat!', 'success');
                setTimeout(() => {
                    if (role === 'orangtua') router.push('/dashboard/orangtua');
                    else router.push('/dashboard/siswa');
                }, 1500);
            } else if (data.pending) {
                // Guru pending approval
                setPending(true);
                addToast('Pendaftaran guru diterima! Tunggu persetujuan admin.', 'success');
            } else {
                const pesan = data.message === 'Username already exists'
                    ? 'Username ini sudah dipakai. Coba yang lain ya'
                    : (data.message || 'Yah, pendaftaran gagal! Coba lagi ya');
                setError(pesan);
                addToast('Pendaftaran belum berhasil', 'error');
            }
        } catch {
            setError('Waduh, servernya lagi sibuk! Coba lagi nanti ya');
            addToast('Gagal terhubung ke server', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Layar sukses guru pending
    if (pending) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
                <div className="w-full max-w-md text-center bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[6px_6px_0px_#e2e8f0] p-8">
                    <div className="text-6xl mb-4">⏳</div>
                    <h1 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-2">Menunggu Persetujuan</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Pendaftaran guru kamu diterima! Admin akan memeriksa dan menyetujui akunmu.
                        Setelah disetujui, kamu bisa login.
                    </p>
                    <Link href="/login" className="inline-block bg-[#f4c025] text-[#0f172a] border-2 border-[#0f172a] rounded-2xl px-8 py-3 font-bold shadow-[4px_4px_0px_#0f172a]">
                        Ke Halaman Login
                    </Link>
                </div>
            </div>
        );
    }

    // Layar sukses siswa
    if (sukses) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
                <div className="w-full max-w-md text-center bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[6px_6px_0px_#e2e8f0] p-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-2">Akun Berhasil Dibuat!</h1>
                    <p className="text-gray-500 text-sm">Selamat datang! Kamu akan dialihkan sebentar lagi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">📚</div>
                    <h1 className="font-[var(--font-fredoka)] text-3xl text-[#0f172a] m-0">Daftar TemanUjian</h1>
                    <p className="text-gray-500 mt-1">Pilih peranmu, yuk mulai!</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[6px_6px_0px_#e2e8f0] p-6">
                    {/* Pilih role */}
                    <label className="block text-sm font-bold text-[#0f172a] mb-2">Kamu daftar sebagai</label>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                        {ROLE_LIST.map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setRole(r.id)}
                                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                                    role === r.id
                                        ? 'bg-[#6c5ce7]/10 border-[#6c5ce7]'
                                        : 'bg-white border-gray-200 hover:border-[#6c5ce7]/50'
                                }`}
                            >
                                <div className="text-2xl mb-1">{r.icon}</div>
                                <p className={`text-xs font-bold ${role === r.id ? 'text-[#6c5ce7]' : 'text-[#0f172a]'}`}>{r.label}</p>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Pengguna</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="contoh: budi123"
                                className="w-full p-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-[#6c5ce7]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="nama@sekolah.com"
                                className="w-full p-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-[#6c5ce7]"
                            />
                        </div>

                        {role === 'siswa' && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Kelas</label>
                                <select
                                    value={kelas}
                                    onChange={e => setKelas(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-[#6c5ce7] bg-white"
                                >
                                    {KELAS_PILIHAN.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Minimal 8 karakter"
                                className="w-full p-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-[#6c5ce7]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={konfirmasi}
                                onChange={e => setKonfirmasi(e.target.value)}
                                placeholder="Ulangi password"
                                className="w-full p-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-[#6c5ce7]"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-5 bg-[#f4c025] text-[#0f172a] border-2 border-[#0f172a] rounded-2xl py-3.5 font-bold shadow-[4px_4px_0px_#0f172a] active:translate-y-1 active:shadow-none disabled:opacity-50"
                    >
                        {loading ? 'Membuat akun...' : '🚀 Daftar Sekarang'}
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-4">
                        Sudah punya akun? <Link href="/login" className="font-bold text-[#6c5ce7]">Masuk</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
