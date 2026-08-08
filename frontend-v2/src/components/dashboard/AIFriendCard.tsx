import React from 'react';

interface AIFriendCardProps {
    friend: any;
    isSelected: boolean;
    onClick: (friend: any) => void;
}

export default function AIFriendCard({ friend, isSelected, onClick }: AIFriendCardProps) {
    return (
        <div
            className="flex flex-col items-center gap-2 w-28 cursor-pointer group"
            onClick={() => onClick(friend)}
        >
            <div
                className={`w-28 h-28 rounded-2xl bg-white border-2 ${isSelected ? 'border-[#f4c025] shadow-[0_0_15px_rgba(244,192,37,0.4)]' : 'border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]'} p-1 transition-transform group-hover:-translate-y-1 group-active:translate-y-0 group-active:shadow-none relative`}
            >
                <div
                    className="w-full h-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${friend.image}")` }}
                ></div>
                {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-[#f4c025] text-[#0f172a] rounded-full p-1 border-2 border-white shadow-sm">
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                )}
            </div>
            <p className={`text-xs font-bold text-center ${isSelected ? 'text-[#f4c025]' : 'text-[#0f172a]'}`}>{friend.name}</p>
        </div>
    );
}
