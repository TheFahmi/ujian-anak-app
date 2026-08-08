import ParentBottomNavigation from "@/components/ParentBottomNavigation";

export default function ParentDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#fdfbf7] font-['Lexend',sans-serif] pb-32 text-[#0f172a] overflow-x-hidden max-w-md md:max-w-md lg:max-w-md mx-auto relative">
            {children}
            <ParentBottomNavigation />
        </div>
    );
}
