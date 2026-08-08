import React, { useEffect, useState, useRef } from 'react';

interface TimerProps {
    duration: number; // in seconds
    onTimeUp: () => void;
    isWarning?: boolean;
}

export default function Timer({ duration, onTimeUp, isWarning = false }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const onTimeUpRef = useRef(onTimeUp);
    const hasTriggeredTimeUp = useRef(false);
    const isInitialized = useRef(false);

    // Update ref when callback changes
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    // Sync with duration prop only when it changes to a valid value
    useEffect(() => {
        if (duration > 0) {
            setTimeLeft(duration);
            isInitialized.current = true;
            hasTriggeredTimeUp.current = false; // Reset when new duration is set
        }
    }, [duration]);

    useEffect(() => {
        // Don't start timer until we have a valid duration
        if (!isInitialized.current || timeLeft <= 0) {
            // Only trigger onTimeUp once and only if we were initialized
            if (timeLeft <= 0 && isInitialized.current && !hasTriggeredTimeUp.current) {
                hasTriggeredTimeUp.current = true;
                onTimeUpRef.current();
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const isCritical = timeLeft < 60; // Less than 1 minute

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-[var(--font-fredoka)] transition-colors ${isCritical || isWarning
            ? 'bg-red-100 border-red-500 text-red-600 animate-pulse'
            : 'bg-white border-[#e2e8f0] text-[#0f172a]'
            }`}>
            <span className="material-symbols-outlined">timer</span>
            <span className="text-lg tracking-wider">{formatTime(timeLeft)}</span>
        </div>
    );
}
