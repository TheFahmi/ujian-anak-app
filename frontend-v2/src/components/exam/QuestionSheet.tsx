import React, { useState, useEffect, useRef } from 'react';

interface Question {
    id: number;
    pertanyaan: string;
    tipe: string;
    pilihan?: any[];
}

interface QuestionSheetProps {
    questions: Question[];
    currentQuestionIndex: number;
    answers: { [key: string]: string };
    onNavigate: (index: number) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function QuestionSheet({
    questions,
    currentQuestionIndex,
    answers,
    onNavigate,
    isOpen,
    onClose
}: QuestionSheetProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [sheetPosition, setSheetPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ y: 0, startPosition: 0 });

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
                setSheetPosition(0);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldRender]);

    // Handle drag events
    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const relativeY = clientY - rect.top;

        // Only allow dragging from the top handle area (top 100px)
        if (relativeY <= 100) {
            setIsDragging(true);
            dragStart.current = {
                y: clientY,
                startPosition: sheetPosition
            };
        }
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (isDragging) {
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const deltaY = clientY - dragStart.current.y;

            // Dragging down (positive delta) closes the sheet
            const newPosition = Math.max(0, dragStart.current.startPosition + deltaY);
            setSheetPosition(newPosition);
        }
    };

    const handleTouchEnd = () => {
        if (isDragging) {
            setIsDragging(false);
            if (sheetPosition > 100) {
                // Dragged down enough to close
                onClose();
            } else {
                // Snap back
                setSheetPosition(0);
            }
        }
    };

    // Global mouse up/move for dragging (in case mouse leaves the element)
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaY = e.clientY - dragStart.current.y;
                const newPosition = Math.max(0, dragStart.current.startPosition + deltaY);
                setSheetPosition(newPosition);
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                if (sheetPosition > 100) {
                    onClose();
                } else {
                    setSheetPosition(0);
                }
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, sheetPosition, onClose]);


    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
            onClick={onClose}
        >
            <div
                className={`bg-[#fdfbf7] rounded-t-[2rem] pt-4 pb-6 shadow-2xl max-h-[80vh] overflow-y-auto border-t-4 border-[#0f172a] ${isClosing ? 'animate-slideDown' : 'animate-slideUp'} transition-transform duration-200`}
                style={{
                    transform: `translateY(${sheetPosition}px)`,
                    touchAction: 'pan-y'
                }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
            >
                <div className="w-full flex justify-center mb-6 cursor-grab active:cursor-grabbing">
                    <div className="w-16 h-1.5 bg-[#cbd5e1] rounded-full"></div>
                </div>

                <div className="px-6">
                    <h2 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-6 text-center">Peta Soal</h2>
                    <div className="grid grid-cols-5 gap-3">
                        {questions.map((question, idx) => {
                            const isAnswered = answers[question.id] !== undefined && answers[question.id] !== '';
                            const isCurrent = currentQuestionIndex === idx;

                            return (
                                <button
                                    key={question.id}
                                    onClick={() => {
                                        onNavigate(idx);
                                        onClose();
                                    }}
                                    className={`aspect-square rounded-xl font-bold text-lg border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center ${isCurrent
                                            ? 'bg-[#0f172a] border-[#0f172a] text-white scale-110 shadow-[4px_4px_0px_#f4c025]'
                                            : isAnswered
                                                ? 'bg-[#f4c025] border-[#0f172a] text-[#0f172a]'
                                                : 'bg-white border-[#e2e8f0] text-[#64748b]'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
