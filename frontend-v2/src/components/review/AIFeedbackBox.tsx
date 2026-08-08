import { PartyPopper, Star, Zap } from 'lucide-react';
import React from 'react';

interface AIFeedbackBoxProps {
    friendId: string;
    score: number;
    feedback: string;
}

export default function AIFeedbackBox({ friendId, score, feedback }: AIFeedbackBoxProps) {
    const getFriendImage = () => {
        switch (friendId) {
            case 'robo': return '/images/ai-robo-v2.png';
            case 'prof-hoot': return '/images/ai-prof-hoot-v2.png';
            case 'cleo': return '/images/ai-cleo-v2.png';
            case 'dino': return '/images/ai-dino-v2.png';
            default: return '/images/ai-robo-v2.png';
        }
    };

    const getFriendName = () => {
        switch (friendId) {
            case 'robo': return 'Robo';
            case 'prof-hoot': return 'Prof. Hoot';
            case 'cleo': return 'Cleo';
            case 'dino': return 'Dino';
            default: return 'Teman AI';
        }
    };

    return (
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 border-2 sm:border-4 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] sm:shadow-[8px_8px_0px_#0f172a] relative overflow-hidden mb-6 sm:mb-8">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f4c025]/20 rounded-full -mr-10 -mt-10"></div>

            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 relative z-10">
                <div className="flex-shrink-0 text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white rounded-full border-2 sm:border-4 border-[#0f172a] shadow-lg mb-2 overflow-hidden">
                        <img src={getFriendImage()} alt="AI Friend" className="w-full h-full object-contain" />
                    </div>
                    <div className="bg-[#0f172a] text-white px-3 py-1 rounded-full text-xs font-bold inline-block">
                        {getFriendName()}
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h3 className="font-[var(--font-fredoka)] text-lg sm:text-xl text-[#0f172a] mb-2">
                        {score === 100 ? <><span>Luar Biasa!</span> <PartyPopper className="inline w-5 h-5" /></> : score >= 80 ? <><span>Hebat Sekali!</span> <Star className="inline w-5 h-5" /></> : <><span>Tetap Semangat!</span> <Zap className="inline w-5 h-5" /></>}
                    </h3>
                    <div className="bg-[#f8fafc] p-3 sm:p-4 rounded-2xl border-2 border-[#e2e8f0] relative">
                        {/* Speech Bubble Arrow */}
                        <div className="absolute -top-3 left-1/2 md:left-8 -translate-x-1/2 w-6 h-6 bg-[#f8fafc] border-t-2 border-l-2 border-[#e2e8f0] transform rotate-45"></div>
                        <p className="text-[#64748b] font-medium leading-relaxed italic">
                            "{feedback}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
