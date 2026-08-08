import React from 'react';
import { Trophy, Star, Hash, FlaskConical, ScrollText, Medal } from 'lucide-react';

interface BadgeCardProps {
    badge: any;
    isUnlocked: boolean;
}

const getBadgeIcon = (badgeId: string) => {
    switch (badgeId) {
        case 'first-win': return <Trophy className="w-8 h-8 text-yellow-500" />;
        case 'perfect-score': return <Star className="w-8 h-8 text-yellow-500" />;
        case 'high-score': return <Star className="w-8 h-8 text-amber-400" />;
        case 'math-lover': return <Hash className="w-8 h-8 text-blue-500" />;
        case 'science-geek': return <FlaskConical className="w-8 h-8 text-purple-500" />;
        case 'history-buff': return <ScrollText className="w-8 h-8 text-orange-500" />;
        default: return <Medal className="w-8 h-8 text-yellow-500" />;
    }
};

export default function BadgeCard({ badge, isUnlocked }: BadgeCardProps) {
    return (
        <div
            className={`rounded-2xl p-3 border-2 flex flex-col items-center gap-2 transition-all ${isUnlocked
                ? 'bg-white border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0]'
                : 'bg-white/50 border-dashed border-[#e2e8f0] opacity-60'
                }`}
        >
            {badge.icon ? (
                <div className="w-12 h-12 relative">
                    <img
                        src={badge.icon}
                        alt={badge.name}
                        className={`w-full h-full object-contain ${!isUnlocked ? 'grayscale' : ''}`}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center');
                            }
                        }}
                    />
                    {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400 text-xl">lock</span>
                        </div>
                    )}
                </div>
            ) : (
                <span className={`filter drop-shadow-md ${!isUnlocked ? 'grayscale' : ''}`}>
                    {getBadgeIcon(badge.id)}
                </span>
            )}
            <p className={`text-[10px] font-bold text-center leading-tight ${isUnlocked ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>
                {badge.name}
            </p>
        </div>
    );
}
