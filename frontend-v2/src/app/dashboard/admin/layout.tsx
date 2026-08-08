export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9fa] font-['Segoe_UI',sans-serif]">
            {children}
        </div>
    );
}
