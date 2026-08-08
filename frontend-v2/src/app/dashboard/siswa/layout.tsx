"use client";

import { usePathname } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import AIHelpWrapper from "@/components/AIHelpWrapper";

export default function StudentDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    
    // Check if current page is fullscreen (exam, result, review)
    const isFullscreenPage = pathname?.includes('/exam') || pathname?.includes('/review');
    
    if (isFullscreenPage) {
        // For fullscreen pages, render without padding and navigation
        return (
            <div className="min-h-screen bg-[#fdfbf7] font-[var(--font-lexend)] text-[#0f172a] overflow-x-hidden max-w-md mx-auto relative">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] font-[var(--font-lexend)] pb-32 pt-20 text-[#0f172a] overflow-x-hidden max-w-md mx-auto relative">
            {children}
            <AIHelpWrapper />
            <BottomNavigation />
        </div>
    );
}
