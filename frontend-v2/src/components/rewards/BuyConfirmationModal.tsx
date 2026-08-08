import { Coins } from 'lucide-react';
import React from 'react';

interface BuyConfirmationModalProps {
    item: any;
    coins: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function BuyConfirmationModal({ item, coins, onConfirm, onCancel }: BuyConfirmationModalProps) {
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onCancel}>
            <div className="bg-[#fdfbf7] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border-4 border-[#0f172a] animate-bounceIn relative overflow-hidden text-center" onClick={e => e.stopPropagation()}>
                <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-white border-4 border-[#e2e8f0] flex items-center justify-center p-4 shadow-lg">
                    <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                </div>

                <h2 className="text-xl font-[var(--font-fredoka)] text-[#0f172a] mb-2">Beli {item.name}?</h2>

                <p className="text-[#64748b] font-medium mb-6">
                    Harga: <span className="font-bold text-[#0f172a]"><span className="inline-flex items-center gap-1"><Coins className="inline w-4 h-4" /> {item.cost}</span></span>
                    <br />
                    <span className="text-xs">Sisa koinmu nanti: {coins - item.cost}</span>
                </p>

                <div className="flex gap-3">
                    <button
                        className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold border-none cursor-pointer"
                        onClick={onCancel}
                    >
                        Batal
                    </button>
                    <button
                        className="flex-1 py-3 rounded-xl bg-[#0f172a] text-white font-bold border-none cursor-pointer"
                        onClick={onConfirm}
                    >
                        Beli
                    </button>
                </div>
            </div>
        </div>
    );
}
