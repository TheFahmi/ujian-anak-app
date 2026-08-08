import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, Star, Trophy, Rocket, Gamepad2, Gift, Bot, BarChart3, Heart } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen w-full bg-[#fdfbf7] font-[var(--font-lexend)] max-w-md md:max-w-md lg:max-w-md mx-auto overflow-x-hidden">
            {/* Navbar Simple */}
            <nav className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#f4c025] rounded-xl rotate-3 flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
                        <GraduationCap className="w-6 h-6 text-[#0f172a]" />
                    </div>
                    <span className="font-[var(--font-fredoka)] font-bold text-xl text-[#0f172a]">TemanUjian</span>
                </div>
                <Link href="/login" className="no-underline text-[#0f172a] font-bold text-sm hover:text-[#f4c025] transition-colors">
                    Masuk
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="px-6 pt-4 pb-12 flex flex-col items-center text-center">
                <div className="relative w-full max-w-[300px] aspect-square mb-8">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 left-10 w-20 h-20 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-10 w-20 h-20 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-20 h-20 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                    {/* Main Hero Image Composition */}
                    <div className="relative z-10 w-full h-full">
                        <Image
                            src="/images/home-children-books.png"
                            alt="Happy students"
                            fill
                            className="object-contain drop-shadow-xl"
                            priority
                        />
                        {/* Floating Elements */}
                        <div className="absolute -top-4 -right-4 bg-white p-2 rounded-2xl shadow-[4px_4px_0px_#0f172a] rotate-12 animate-bounce hover:rotate-6 transition-transform">
                            <Star className="w-7 h-7 text-[#f4c025] fill-[#f4c025]" />
                        </div>
                        <div className="absolute bottom-4 -left-4 bg-white p-2 rounded-2xl shadow-[4px_4px_0px_#0f172a] -rotate-12 animate-pulse">
                            <Trophy className="w-7 h-7 text-[#f4c025]" />
                        </div>
                    </div>
                </div>

                <h1 className="font-[var(--font-fredoka)] font-bold text-3xl sm:text-4xl text-[#0f172a] leading-tight mb-4">
                    Belajar Jadi <span className="text-[#f4c025] inline-block transform hover:scale-110 transition-transform cursor-default">Petualangan!</span>
                </h1>

                <p className="text-[#64748b] text-lg mb-8 leading-relaxed max-w-xs mx-auto">
                    Temukan cara seru belajar bareng teman-teman AI yang pintar dan lucu!
                </p>

                <Link
                    href="/login"
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-[#0f172a] font-[var(--font-fredoka)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 no-underline transform hover:-translate-y-1 active:translate-y-0"
                >
                    <span className="absolute bottom-0 right-0 w-full h-full -mb-2 -mr-2 transition-all duration-200 ease-linear bg-[#f4c025] rounded-2xl group-hover:mb-0 group-hover:mr-0"></span>
                    <span className="relative mr-2 text-xl">Mulai Petualangan</span>
                    <Rocket className="relative w-6 h-6 group-hover:rotate-12 transition-transform" />
                </Link>
            </main>

            {/* Meet the Friends Section */}
            <section className="py-12 px-6 bg-[#fff9e6] rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="text-center mb-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#f4c025]/20 text-[#b4860b] text-xs font-bold tracking-wider mb-2 uppercase">Tim Pengajar</span>
                    <h2 className="font-[var(--font-fredoka)] font-bold text-2xl text-[#0f172a]">Kenalan sama Teman Belajarmu!</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Robo */}
                    <div className="bg-white p-4 rounded-3xl shadow-[4px_4px_0px_#e2e8f0] border-2 border-[#f1f5f9] flex items-center gap-3 sm:gap-4 transform hover:scale-[1.02] transition-transform">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 border-2 border-blue-100 relative">
                            <Image src="/images/ai-robo-v2.png" alt="Robo" width={112} height={112} className="object-contain" />
                        </div>
                        <div>
                            <h3 className="font-[var(--font-fredoka)] font-bold text-lg text-[#0f172a] mb-1">Robo</h3>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-1">Ahli Matematika</p>
                            <p className="text-sm text-[#64748b] leading-tight">&quot;Hitung-hitungan itu gampang kalau tahu caranya!&quot;</p>
                        </div>
                    </div>

                    {/* Prof Hoot */}
                    <div className="bg-white p-4 rounded-3xl shadow-[4px_4px_0px_#e2e8f0] border-2 border-[#f1f5f9] flex items-center gap-3 sm:gap-4 transform hover:scale-[1.02] transition-transform">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0 border-2 border-amber-100 relative">
                            <Image src="/images/ai-prof-hoot-v2.png" alt="Prof Hoot" width={112} height={112} className="object-contain" />
                        </div>
                        <div>
                            <h3 className="font-[var(--font-fredoka)] font-bold text-lg text-[#0f172a] mb-1">Prof. Hoot</h3>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Guru Sejarah</p>
                            <p className="text-sm text-[#64748b] leading-tight">&quot;Setiap masa lalu punya cerita seru untuk dipelajari.&quot;</p>
                        </div>
                    </div>

                    {/* Cleo */}
                    <div className="bg-white p-4 rounded-3xl shadow-[4px_4px_0px_#e2e8f0] border-2 border-[#f1f5f9] flex items-center gap-3 sm:gap-4 transform hover:scale-[1.02] transition-transform">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-pink-50 flex items-center justify-center flex-shrink-0 border-2 border-pink-100 relative">
                            <Image src="/images/ai-cleo-v2.png" alt="Cleo" width={112} height={112} className="object-contain" />
                        </div>
                        <div>
                            <h3 className="font-[var(--font-fredoka)] font-bold text-lg text-[#0f172a] mb-1">Cleo</h3>
                            <p className="text-xs font-bold text-pink-500 uppercase tracking-wide mb-1">Teman Kreatif</p>
                            <p className="text-sm text-[#64748b] leading-tight">&quot;Ayo warnai duniamu dengan pengetahuan baru!&quot;</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features / Why Us */}
            <section className="py-12 px-6">
                <h2 className="font-[var(--font-fredoka)] font-bold text-2xl text-[#0f172a] text-center mb-8">Kenapa Belajar di Sini?</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#e0f2fe] p-4 rounded-3xl flex flex-col items-center text-center gap-2">
                        <Gamepad2 className="w-8 h-8 text-blue-600" />
                        <h3 className="font-bold text-[#0f172a] text-sm">Belajar Rasa Main</h3>
                    </div>
                    <div className="bg-[#fce7f3] p-4 rounded-3xl flex flex-col items-center text-center gap-2">
                        <Gift className="w-8 h-8 text-pink-600" />
                        <h3 className="font-bold text-[#0f172a] text-sm">Dapat Hadiah</h3>
                    </div>
                    <div className="bg-[#dcfce7] p-4 rounded-3xl flex flex-col items-center text-center gap-2">
                        <Bot className="w-8 h-8 text-green-600" />
                        <h3 className="font-bold text-[#0f172a] text-sm">Teman AI Pintar</h3>
                    </div>
                    <div className="bg-[#ffedd5] p-4 rounded-3xl flex flex-col items-center text-center gap-2">
                        <BarChart3 className="w-8 h-8 text-orange-600" />
                        <h3 className="font-bold text-[#0f172a] text-sm">Pantau Nilai</h3>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <footer className="px-6 pb-12 pt-4 text-center">
                <div className="bg-[#0f172a] rounded-3xl p-8 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

                    <h2 className="font-[var(--font-fredoka)] font-bold text-2xl text-white mb-4 relative z-10">Siap Jadi Juara?</h2>
                    <p className="text-blue-200 text-sm mb-6 relative z-10">Gabung sekarang dan buktikan kalau kamu bisa!</p>

                    <Link
                        href="/login"
                        className="inline-block w-full py-3 bg-[#f4c025] text-[#0f172a] font-bold rounded-xl shadow-[0_4px_0_#b4860b] active:shadow-none active:translate-y-[4px] transition-all relative z-10 no-underline"
                    >
                        Yuk, Daftar Gratis!
                    </Link>
                </div>
                <p className="text-[#94a3b8] text-xs mt-8">© 2024 TemanUjian. Dibuat dengan <Heart className="inline-block w-3 h-3 text-red-500 fill-red-500" /> untuk Siswa Indonesia.</p>
            </footer>
        </div>
    );
}
