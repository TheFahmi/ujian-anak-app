import { Rocket } from 'lucide-react';
import React from 'react';

interface AIFriendModalProps {
    friend: any;
    currentFriendId: string;
    onSelect: (id: string) => void;
    onClose: () => void;
}

export default function AIFriendModal({ friend, currentFriendId, onSelect, onClose }: AIFriendModalProps) {
    return (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-[#fdfbf7] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border-4 border-[#0f172a] animate-bounceIn relative overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Decorative background */}
                <div className="absolute top-0 left-0 w-full h-24 bg-[#f4c025]/20 rounded-b-[50%] -mt-12"></div>

                <div className="relative flex flex-col items-center text-center gap-4 pt-4">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full bg-white border-4 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] flex items-center justify-center overflow-hidden">
                            <img src={friend.image} alt={friend.name} className="w-24 h-24 object-contain" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0f172a] text-[#f4c025] text-xs font-bold px-4 py-1.5 rounded-full border-2 border-[#f4c025] shadow-sm whitespace-nowrap">
                            {friend.role}
                        </div>
                    </div>

                    <div className="mt-2">
                        <h3 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-1">{friend.name}</h3>
                        <p className="text-sm text-[#64748b] font-medium">Siap membantumu belajar!</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl w-full border-2 border-[#e2e8f0] relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-t-2 border-l-2 border-[#e2e8f0] transform rotate-45"></div>
                        <p className="text-[#0f172a] m-0 text-base leading-relaxed font-medium">"{friend.message}"</p>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        {currentFriendId !== friend.id && (
                            <button
                                className="w-full py-3 rounded-xl bg-white text-[#0f172a] font-bold border-2 border-[#0f172a] shadow-[4px_4px_0px_#e2e8f0] cursor-pointer hover:translate-y-1 hover:shadow-[2px_2px_0px_#e2e8f0] active:translate-y-2 active:shadow-none transition-all"
                                onClick={() => onSelect(friend.id)}
                            >
                                Pilih Sebagai Teman
                            </button>
                        )}
                        <button
                            className="w-full py-3 rounded-xl bg-[#f4c025] text-[#0f172a] font-[var(--font-fredoka)] text-lg border-2 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] cursor-pointer hover:translate-y-1 hover:shadow-[2px_2px_0px_#0f172a] active:translate-y-2 active:shadow-none transition-all"
                            onClick={onClose}
                        >
                            {currentFriendId === friend.id ? <>Oke, Siap! <Rocket className="inline w-4 h-4" /></> : 'Tutup'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
