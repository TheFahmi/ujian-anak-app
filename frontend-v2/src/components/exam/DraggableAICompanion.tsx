import React, { useState, useEffect, useCallback } from 'react';

const MOTIVATIONAL_QUOTES = [
    "Kamu pasti bisa!", "Jangan menyerah!", "Fokus!", "Tarik napas dalam-dalam...", "Kamu hebat!",
    "Satu soal lagi!", "Semangat!", "Percaya diri!", "Ayo, kamu cerdas!", "Tenang dan kerjakan.",
    "Waktu masih ada.", "Baca pelan-pelan.", "Jawaban ada di pikiranmu.", "Terus berusaha!", "Jangan ragu!",
    "Kamu juara!", "Belajar itu asyik!", "Nikmati prosesnya.", "Setiap usaha berharga.", "Kesuksesan menanti.",
    "Gampang kok ini!", "Ingat materi kemarin.", "Tetap tenang.", "Jangan buru-buru.", "Cek lagi jawabanmu.",
    "Kamu sudah siap.", "Hasil tidak mengkhianati usaha.", "Jadilah yang terbaik.", "Buktikan kemampuanmu.", "Semoga sukses!"
];

interface DraggableAICompanionProps {
    friendId: string;
    message?: string;
}

export default function DraggableAICompanion({ friendId, message }: DraggableAICompanionProps) {
    const [position, setPosition] = useState({ x: typeof window !== 'undefined' ? Math.min(window.innerWidth - 80, 240) : 240, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    // Quote rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    }, [isDragging, dragOffset]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (isDragging) {
            const touch = e.touches[0];
            setPosition({
                x: touch.clientX - dragOffset.x,
                y: touch.clientY - dragOffset.y
            });
        }
    }, [isDragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

    const getFriendImage = () => {
        switch (friendId) {
            case 'robo': return '/images/ai-robo-v2.png';
            case 'prof-hoot': return '/images/ai-prof-hoot-v2.png';
            case 'cleo': return '/images/ai-cleo-v2.png';
            case 'dino': return '/images/ai-dino-v2.png';
            default: return '/images/ai-robo-v2.png';
        }
    };

    const displayMessage = message || MOTIVATIONAL_QUOTES[currentQuoteIndex];

    return (
        <div
            className="flex flex-col items-center z-[1000] touch-none"
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {/* Speech Bubble */}
            {displayMessage && (
                <div className="bg-white rounded-2xl border-2 border-[#0f172a] py-2 px-3 mb-2 text-xs font-bold text-[#0f172a] shadow-[4px_4px_0px_#0f172a] max-w-[150px] text-center animate-bounceIn relative">
                    {displayMessage}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-[#0f172a] rotate-45"></div>
                </div>
            )}

            <div className="w-20 h-20 sm:w-32 sm:h-32 transition-transform hover:scale-105 active:scale-95">
                <img 
                    src={getFriendImage()} 
                    alt="AI Helper" 
                    className="w-full h-full object-contain drop-shadow-lg" 
                    draggable={false}
                />
            </div>
        </div>
    );
}
