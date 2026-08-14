"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { GraduationCap, Hand, Sparkles, Rocket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const { login } = useAuth();
    const router = useRouter();

    // Load saved credentials on mount
    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        const savedPassword = localStorage.getItem('rememberedPassword');
        if (savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                login(data.user, data.access_token);
                addToast(`Hore! Selamat datang ${data.user.username}!`, 'success');

                if (data.user.role === 'admin' || data.user.role === 'pengawas') {
                    router.push('/dashboard/admin');
                } else if (data.user.role === 'guru') {
                    router.push('/dashboard/guru');
                } else if (data.user.role === 'orangtua') {
                    router.push('/dashboard/orangtua');
                } else {
                    router.push('/dashboard/siswa');
                }
            } else {
                setError(data.message || 'Yah, login gagal! Coba lagi ya');
                addToast('Username atau password salah nih!', 'error');
            }
        } catch {
            setError('Waduh, servernya lagi sibuk! Coba lagi nanti ya');
            addToast('Gagal terhubung ke server', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#fafafa] font-[var(--font-lexend)] overflow-x-hidden relative flex items-center justify-center px-4 py-10">
            {/* Navbar Simple */}
            <nav className="p-6 flex justify-between items-center relative z-10">
                <Link href="/" className="flex items-center gap-2 no-underline">
                    <div className="w-10 h-10 bg-[#f4c025] rounded-xl rotate-3 flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
                        <GraduationCap className="w-6 h-6 text-[#0f172a]" />
                    </div>
                    <span className="font-[var(--font-fredoka)] font-bold text-xl text-[#0f172a]">TemanUjian</span>
                </Link>
            </nav>

            <main className="w-full max-w-md flex flex-col items-center justify-center min-h-[70vh] relative z-10">
                <div className="w-full bg-white border-2 border-[#e5e5e5] rounded-3xl p-8 shadow-sm">
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-[#f4c025] shadow-[4px_4px_0px_#0f172a] relative z-10">
                            <Hand className="w-10 h-10 text-[#0f172a]" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl border-2 border-[#0f172a] rotate-12 z-20">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                        </div>
                    </div>
                    <h1 className="font-[var(--font-fredoka)] font-bold text-3xl text-[#0f172a] mb-2">Selamat Datang!</h1>
                    <p className="text-[#64748b]">Siap untuk petualangan belajar hari ini?</p>
                </div>

                {error && (
                    <div className="w-full bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-center font-bold text-sm shadow-sm animate-bounceIn">
                        {error}
                    </div>
                )}

                <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-[#0f172a] text-sm ml-1">Username</label>
                        <input
                            className="w-full px-4 py-3.5 bg-white border-2 border-[#e2e8f0] text-[#0f172a] rounded-2xl text-base transition-all duration-200 shadow-[4px_4px_0px_#e2e8f0] focus:outline-none focus:border-[#f4c025] focus:shadow-[4px_4px_0px_#f4c025] placeholder:text-gray-400"
                            placeholder="Ketik username kamu..."
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-[#0f172a] text-sm ml-1">Password</label>
                        <input
                            className="w-full px-4 py-3.5 bg-white border-2 border-[#e2e8f0] text-[#0f172a] rounded-2xl text-base transition-all duration-200 shadow-[4px_4px_0px_#e2e8f0] focus:outline-none focus:border-[#f4c025] focus:shadow-[4px_4px_0px_#f4c025] placeholder:text-gray-400"
                            placeholder="Ketik password rahasia..."
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end">
                        <Link href="/lupa" className="text-sm font-bold text-[#f4c025] hover:text-[#e6b020] no-underline">Lupa password?</Link>
                    </div>

                    <button
                        className="w-full mt-4 group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-[#0f172a] font-[var(--font-fredoka)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 no-underline transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        type="submit"
                        disabled={loading}
                    >
                        <span className="absolute bottom-0 right-0 w-full h-full -mb-2 -mr-2 transition-all duration-200 ease-linear bg-[#f4c025] rounded-2xl group-hover:mb-0 group-hover:mr-0 group-disabled:mb-0 group-disabled:mr-0"></span>
                        <span className="relative mr-2 text-xl">{loading ? 'Tunggu Sebentar...' : 'Masuk Sekarang'}</span>
                        {!loading && <Rocket className="relative w-6 h-6 group-hover:rotate-12 transition-transform" />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[#64748b] text-sm">
                        Belum punya akun? <Link href="/register" className="font-bold text-[#0f172a] hover:text-[#f4c025] no-underline">Daftar dulu yuk!</Link>
                    </p>
                </div>
                </div>
            </main>
        </div>
    );
}
