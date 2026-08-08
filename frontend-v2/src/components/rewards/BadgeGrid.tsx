import React from 'react';
import BadgeCard from '../dashboard/BadgeCard';

interface BadgeGridProps {
    badges: any[];
    unlockedBadges: string[];
    onBadgeClick: (badge: any) => void;
}

export default function BadgeGrid({ badges, unlockedBadges, onBadgeClick }: BadgeGridProps) {
    return (
        <div className="p-4 animate-fadeIn">
            <h3 className="text-[#0f172a] text-lg font-[var(--font-fredoka)] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f4c025]">military_tech</span>
                Lencana ({unlockedBadges.length}/{badges.length})
            </h3>

            <div className="grid grid-cols-3 gap-4">
                {badges.map((badge) => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    return (
                        <div key={badge.id} onClick={() => onBadgeClick({ ...badge, isUnlocked })}>
                            <BadgeCard badge={badge} isUnlocked={isUnlocked} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
