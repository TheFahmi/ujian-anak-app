import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, Star, Trophy, Rocket, Gamepad2, Gift, Bot, BarChart3, Heart, School, Users, Sparkles } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen w-full bg-[#fafafa] font-[var(--font-lexend)] overflow-x-hidden">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#fafafa]/95 backdrop-blur-sm border-b border-[#e5e5e5]">
                <div className="mx-auto max-w-6xl px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#f4c025] rounded-xl rotate-3 flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
                            <GraduationCap className="w-6 h-6 text-[#0f172a]" />
                        </div>
                        <span className="font-[var(--font-fredoka)] font-bold text-xl text-[#171717]">TemanUjian</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="no-underline text-[#171717] font-bold text-sm hover:text-[#b08d3e] transition-colors">
                            Masuk
                        </Link>
                        <Link href="/register" className="no-underline bg-[#171717] text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-black transition-colors">
                            Daftar
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section — 2 kolom desktop */}
            <main>
                <section className="mx-auto max-w-6xl px-6 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-10 items-center">
                    {/* Teks */}
                    <div className="text-center md:text-left">
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-[#8f7027] bg-[#f5f0e0] border border-[#e5d9b8] px-4 py-1.5 rounded-full mb-5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Platform Ujian & Belajar Adaptif untuk SD
                        </span>
                        <h1 className="font-[var(--font-fredoka)] text-4xl md:text-5xl text-[#171717] leading-tight m-0">
                            Ujian Seru, <br className="hidden md:block" />
                            Belajar Sesuai Kemampuanmu
                        </h1>
                        <p className="text-[#737373] text-lg mt-4 mb-8 leading-relaxed max-w-md mx-auto md:mx-0">
                            AI deteksi level belajarmu, turun ke dasar kalau perlu, naik bertahap sampai paham.
                            Lengkap dengan tutor AI, badge, dan sertifikat!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            <Link href="/register" className="no-underline bg-[#f4c025] text-[#171717] border-2 border-[#171717] font-bold px-8 py-4 rounded-xl shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 transition-transform text-center">
                                Daftar Gratis
                            </Link>
                            <Link href="/login" className="no-underline bg-white text-[#171717] border-2 border-[#e5e5e5] font-bold px-8 py-4 rounded-xl hover:bg-[#fafafa] transition-colors text-center">
                                Masuk
                            </Link>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative hidden md:block">
                        <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                                    <School className="w-6 h-6 text-[#171717]" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#171717] text-sm m-0">Andi, Kelas 5 SD</p>
                                    <p className="text-xs text-[#a3a3a3] m-0">Dashboard Siswa</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-3">
                                    <span className="text-sm font-semibold text-[#171717]">Matematika</span>
                                    <span className="text-xs font-bold text-[#171717] bg-[#f4c025] px-3 py-1 rounded-full">Level Kelas 3</span>
                                </div>
                                <div className="flex items-center justify-between bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-3">
                                    <span className="text-sm font-semibold text-[#171717]">Bahasa Indonesia</span>
                                    <span className="text-xs font-bold text-white bg-[#6c5ce7] px-3 py-1 rounded-full">Level TK</span>
                                </div>
                                <div className="flex items-center justify-between bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-3">
                                    <span className="text-sm font-semibold text-[#171717]">IPA</span>
                                    <span className="text-xs font-bold text-[#171717] bg-green-100 px-3 py-1 rounded-full">Level Kelas 2</span>
                                </div>
                                <div className="flex items-center justify-between bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-3">
                                    <span className="text-sm font-semibold text-[#171717]">Bahasa Inggris</span>
                                    <span className="text-xs font-bold text-[#171717] bg-sky-100 px-3 py-1 rounded-full">Level Kelas 1</span>
                                </div>
                            </div>
                            <div className="mt-5 p-4 bg-[#6c5ce7] rounded-xl">
                                <p className="text-xs font-bold text-white/70 uppercase tracking-wide m-0 mb-1">Rekomendasi Hari Ini</p>
                                <p className="text-sm font-bold text-white m-0">Latihan "Mengenal Huruf A-Z" di Bahasa Indonesia</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Fitur — grid lebar */}
                <section className="bg-white border-y border-[#e5e5e5] py-14">
                    <div className="mx-auto max-w-6xl px-6">
                        <h2 className="font-[var(--font-fredoka)] text-2xl md:text-3xl text-[#171717] text-center mb-10">
                            Fitur Lengkap untuk Semua
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { icon: Bot, title: 'Tutor AI', desc: 'Maskot AI membantu & memberi petunjuk, bukan jawaban langsung.' },
                                { icon: BarChart3, title: 'Adaptif', desc: 'AI deteksi skill gap dan turunkan level sampai paham dasar.' },
                                { icon: Gamepad2, title: 'Gamifikasi', desc: 'Badge, bintang, sertifikat — belajar terasa seperti game.' },
                                { icon: Users, title: 'Untuk Guru', desc: 'Kelola soal, pantau progress adaptif tiap siswa.' },
                                { icon: Heart, title: 'Untuk Orang Tua', desc: 'Hubungkan via kode unik, pantau laporan anak.' },
                                { icon: Gift, title: 'Toko Hadiah', desc: 'Tukar koin dengan item seru di toko.' },
                            ].map((f, i) => (
                                <div key={i} className="bg-[#fafafa] border border-[#e5e5e5] rounded-xl p-6 hover:border-[#c9a227] transition-colors">
                                    <div className="w-11 h-11 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center mb-4">
                                        <f.icon className="w-5 h-5 text-[#171717]" />
                                    </div>
                                    <h3 className="font-bold text-[#171717] text-lg m-0 mb-1.5">{f.title}</h3>
                                    <p className="text-sm text-[#737373] m-0 leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-14">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2 className="font-[var(--font-fredoka)] text-2xl md:text-3xl text-[#171717] mb-3">
                            Siap Mulai?
                        </h2>
                        <p className="text-[#737373] mb-6">Daftar gratis, langsung coba ujian & belajar adaptif.</p>
                        <Link href="/register" className="no-underline inline-block bg-[#f4c025] text-[#171717] border-2 border-[#171717] font-bold px-10 py-4 rounded-xl shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 transition-transform">
                            Daftar Sekarang
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#e5e5e5] py-8">
                <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#f4c025] rounded-lg rotate-3 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-[#171717]" />
                        </div>
                        <span className="font-[var(--font-fredoka)] font-bold text-[#171717]">TemanUjian</span>
                    </div>
                    <p className="text-xs text-[#a3a3a3] m-0">Platform ujian & belajar adaptif untuk SD</p>
                </div>
            </footer>
        </div>
    );
}
