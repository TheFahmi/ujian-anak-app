"use client";

import { useState, Suspense } from 'react';
import PasswordInput from '@/components/PasswordInput';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Rocket } from 'lucide-react';

const inputClass = "w-full px-4 py-3.5 bg-white border-2 border-[#e2e8f0] text-[#0f172a] rounded-2xl text-base transition-all duration-200 shadow-[4px_4px_0px_#e2e8f0] focus:outline-none focus:border-[#f4c025] focus:shadow-[4px_4px_0px_#f4c025] placeholder:text-gray-400";

function IsiReset() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [konfirmasi, setKonfirmasi] = useState('');
    const [error, setError] = useState('');
    const [pesan, setPesan] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!token) {
            setError('Tautannya tidak lengkap. Coba buka lagi tautan dari emailmu ya.');
            return;
        }
        if (password.length < 8) {
            setError('Password baru minimal 8 karakter ya');
            return;
        }
        if (password !== konfirmasi) {
            setError('Konfirmasi passwordnya belum sama nih');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, passwordBaru: password }),
            });
            const data = await res.json();
            if (res.ok && data.pesan) {
                setPesan(data.pesan);
                setTimeout(() => router.push('/login'), 2500);
            } else {
                setError(data.message || 'Tautannya tidak bisa dipakai. Coba minta tautan baru ya.');
            }
        } catch {
            setError('Waduh, servernya lagi sibuk! Coba lagi nanti ya');
        } finally {
            setLoading(false);
        }
    };

    if (pesan) {
        return (
            <div className="w-full">
                <div data-testid="pesan-reset" className="bg-green-50 border-2 border-green-100 text-green-700 p-5 rounded-2xl mb-6 text-center font-bold shadow-sm animate-bounceIn">
                    {pesan}
                </div>
                <Link href="/login" className="block w-full py-4 bg-[#0f172a] text-white text-center font-bold rounded-2xl font-[var(--font-fredoka)] text-xl no-underline">
                    Masuk Sekarang
                </Link>
            </div>
        );
    }

    return (
        <>
            {error && (
                <div data-testid="pesan-reset" className="w-full bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-center font-bold text-sm shadow-sm animate-bounceIn">
                    {error}
                </div>
            )}
            <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-[#0f172a] text-sm ml-1">Password Baru</label>
                    <PasswordInput
                        inputClassName={inputClass}
                        placeholder="Minimal 8 karakter..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-bold text-[#0f172a] text-sm ml-1">Ulangi Password Baru</label>
                    <PasswordInput
                        inputClassName={inputClass}
                        placeholder="Ketik ulang passwordnya..."
                        value={konfirmasi}
                        onChange={(e) => setKonfirmasi(e.target.value)}
                        required
                    />
                </div>

                <button
                    className="w-full mt-2 group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-[#0f172a] font-[var(--font-fredoka)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 no-underline transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    type="submit"
                    disabled={loading}
                >
                    <span className="absolute bottom-0 right-0 w-full h-full -mb-2 -mr-2 transition-all duration-200 ease-linear bg-[#f4c025] rounded-2xl group-hover:mb-0 group-hover:mr-0 group-disabled:mb-0 group-disabled:mr-0"></span>
                    <span className="relative mr-2 text-xl">{loading ? 'Tunggu Sebentar...' : 'Simpan Password'}</span>
                    {!loading && <Rocket className="relative w-6 h-6 group-hover:rotate-12 transition-transform" />}
                </button>
            </form>
        </>
    );
}

export default function ResetPage() {
    return (
        <div className="min-h-screen w-full bg-[#fdfbf7] font-[var(--font-lexend)] max-w-md md:max-w-md lg:max-w-md mx-auto overflow-x-hidden relative">
            <nav className="p-6 flex justify-between items-center relative z-10">
                <Link href="/" className="flex items-center gap-2 no-underline">
                    <div className="w-10 h-10 bg-[#f4c025] rounded-xl rotate-3 flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
                        <GraduationCap className="w-6 h-6 text-[#0f172a]" />
                    </div>
                    <span className="font-[var(--font-fredoka)] font-bold text-xl text-[#0f172a]">TemanUjian</span>
                </Link>
            </nav>

            <main className="px-6 pt-4 pb-12 flex flex-col items-center justify-center min-h-[80vh] relative z-10">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-[#f4c025] shadow-[4px_4px_0px_#0f172a] mb-4 mx-auto">
                        <ShieldCheck className="w-10 h-10 text-[#0f172a]" />
                    </div>
                    <h1 className="font-[var(--font-fredoka)] font-bold text-3xl text-[#0f172a] mb-2">Password Baru</h1>
                    <p className="text-[#64748b]">Bikin password baru yang gampang kamu ingat tapi susah ditebak orang lain</p>
                </div>

                <Suspense fallback={<p className="text-[#64748b]">Sebentar ya...</p>}>
                    <IsiReset />
                </Suspense>
            </main>
        </div>
    );
}
