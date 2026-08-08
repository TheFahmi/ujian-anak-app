import React from 'react';

interface BadgeModalProps {
    badge: any;
    onClose: () => void;
}

export default function BadgeModal({ badge, onClose }: BadgeModalProps) {
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-[#fdfbf7] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border-4 border-[#0f172a] animate-bounceIn relative overflow-hidden text-center" onClick={e => e.stopPropagation()}>
                <div className={`w-32 h-32 mx-auto mb-6 rounded-full border-4 flex items-center justify-center ${badge.isUnlocked ? 'bg-white border-[#f4c025] shadow-[0_0_20px_rgba(244,192,37,0.3)]' : 'bg-gray-100 border-gray-300 grayscale'}`}>
                    <img src={badge.icon} alt={badge.name} className="w-20 h-20 object-contain" />
                </div>

                <h2 className="text-2xl font-[var(--font-fredoka)] text-[#0f172a] mb-2">{badge.name}</h2>

                <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold mb-4 ${badge.isUnlocked ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {badge.isUnlocked ? 'Telah Dimiliki' : 'Belum Dimiliki'}
                </div>

                <p className="text-[#64748b] font-medium leading-relaxed mb-6">
                    {badge.description}
                </p>

                <button
                    className="w-full py-3 rounded-xl bg-[#0f172a] text-white font-bold border-none cursor-pointer"
                    onClick={onClose}
                >
                    Tutup
                </button>
            </div>
        </div>
    );
}
