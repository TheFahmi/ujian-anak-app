import React from 'react';
import MathText from '@/components/MathText';

interface QuestionCardProps {
    question: any;
    currentNumber: number;
    totalQuestions: number;
    selectedAnswer: string;
    onAnswer: (answerId: string) => void;
    fontSize: 'normal' | 'large' | 'extra-large';
}

export default function QuestionCard({
    question,
    currentNumber,
    totalQuestions,
    selectedAnswer,
    onAnswer,
    fontSize
}: QuestionCardProps) {
    const getFontSizeClass = () => {
        switch (fontSize) {
            case 'large': return 'text-xl';
            case 'extra-large': return 'text-2xl';
            default: return 'text-base';
        }
    };

    return (
        <div className="relative bg-white rounded-[2rem] border-2 border-[#e2e8f0] p-6 shadow-[4px_4px_0px_#e2e8f0] mb-6 mt-4 select-none">
            <div className="absolute -top-4 left-6 bg-[#f4c025] text-[#0f172a] font-[var(--font-fredoka)] px-4 py-1 rounded-full border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a]">
                Pertanyaan {currentNumber}
            </div>
            <h1 className={`text-[#0f172a] font-bold leading-relaxed text-center pt-4 m-0 ${getFontSizeClass() === 'text-base' ? 'text-xl' : getFontSizeClass()}`}>
                <MathText text={question.pertanyaan || ''} diagramSvg={question.diagram_svg} diagramAlt={question.pertanyaan?.slice(0, 60) || 'diagram'} />
            </h1>

            {question.tipe === 'isian' && (
                <div className="w-full mt-6">
                    <textarea
                        className={`w-full min-h-[150px] p-4 rounded-2xl border-2 border-[#e2e8f0] font-inherit resize-y mb-4 focus:outline-none focus:border-[#f4c025] focus:shadow-[4px_4px_0px_#f4c025] transition-all ${getFontSizeClass()}`}
                        placeholder="Tuliskan jawabanmu di sini..."
                        value={selectedAnswer || ''}
                        onChange={(e) => onAnswer(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}
