import { Coins } from 'lucide-react';
import React from 'react';

interface CoinsHeaderProps {
    coins: number;
}

export default function CoinsHeader({ coins }: CoinsHeaderProps) {
    return (
        <div className="p-4 pt-6 flex justify-center">
            <div className="bg-white rounded-[2rem] p-6 border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] flex flex-col items-center gap-2 w-full max-w-xs animate-bounceIn">
                <div className="w-20 h-20 rounded-full bg-[#fef9c3] border-4 border-[#f4c025] flex items-center justify-center shadow-inner mb-2">
                    <Coins className="w-10 h-10 text-yellow-500" />
                </div>
                <h1 className="text-4xl font-[var(--font-fredoka)] text-[#0f172a] m-0">{coins}</h1>
                <p className="text-[#64748b] font-bold uppercase tracking-widest text-xs m-0">Koin Kamu</p>
            </div>
        </div>
    );
}
