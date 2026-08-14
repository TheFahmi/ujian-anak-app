"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ParentBottomNavigation from "@/components/ParentBottomNavigation";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
    { href: "/dashboard/orangtua", label: "Beranda", icon: "home" },
    { href: "/dashboard/orangtua/report", label: "Laporan Anak", icon: "assessment" },
    { href: "/dashboard/orangtua/profile", label: "Profil", icon: "person" },
];

export default function ParentDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

    return (
        <div className="min-h-screen bg-[#fafafa] font-['Lexend',sans-serif] text-[#171717] overflow-x-hidden relative">
            {/* Sidebar desktop */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[#e5e5e5] bg-white md:flex">
                <div className="flex h-16 items-center gap-3 border-b border-[#e5e5e5] px-5">
                    <span className="material-symbols-outlined text-2xl text-[#c9a227]">family_restroom</span>
                    <div>
                        <p className="text-sm font-bold leading-tight">TemanUjian</p>
                        <p className="text-xs text-[#a3a3a3]">Panel Orang Tua</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-3">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                                isActive(item.href)
                                    ? "bg-[#f5f5f5] text-[#171717]"
                                    : "text-[#737373] hover:bg-[#fafafa] hover:text-[#171717]"
                            }`}
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="border-t border-[#e5e5e5] p-3">
                    <div className="flex items-center gap-3 rounded-md px-3 py-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5] text-[#171717]">
                            <span className="material-symbols-outlined text-lg">person</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{user?.username || "Orang Tua"}</p>
                            <p className="text-xs text-[#a3a3a3]">Orang Tua</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="mt-1 flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-[#737373] transition-colors hover:bg-[#fafafa] hover:text-[#171717]"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Top bar desktop */}
            <header className={`fixed inset-x-0 top-0 z-30 h-16 border-b border-[#e5e5e5] bg-white/95 backdrop-blur-sm transition-all md:left-60 ${scrolled ? "shadow-sm" : ""}`}>
                <div className="flex h-full items-center justify-between px-4 md:px-6">
                    <p className="text-sm font-bold md:text-base">Dashboard Orang Tua</p>
                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-[#737373] md:block">{user?.username}</span>
                        <button
                            onClick={() => logout()}
                            className="rounded-md border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#737373] hover:bg-[#fafafa] md:hidden"
                        >
                            Keluar
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="pt-16 md:ml-60">
                <div className="mx-auto w-full max-w-md px-4 pb-32 md:max-w-6xl md:px-8 md:pb-12">
                    {children}
                </div>
            </main>

            {/* Bottom nav mobile only */}
            <div className="md:hidden">
                <ParentBottomNavigation />
            </div>
        </div>
    );
}
