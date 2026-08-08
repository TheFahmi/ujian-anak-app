import React from 'react';

interface ReviewQuestionCardProps {
    question: any;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
    number: number;
    isCorrect?: boolean;
    aiScore?: number;
    aiFeedback?: string;
}

export default function ReviewQuestionCard({
    question,
    userAnswer,
    correctAnswer,
    explanation,
    number,
    isCorrect: propIsCorrect,
    aiScore,
    aiFeedback
}: ReviewQuestionCardProps) {
    const isCorrect = propIsCorrect !== undefined ? propIsCorrect : userAnswer === correctAnswer;
    const isSkipped = !userAnswer;
    const isEssay = question.tipe === 'isian' || !question.pilihan || question.pilihan.length === 0;

    return (
        <div className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 mb-4 sm:mb-6 transition-all ${isCorrect
            ? 'border-green-200 shadow-[4px_4px_0px_#bbf7d0]'
            : isSkipped
                ? 'border-yellow-200 shadow-[4px_4px_0px_#fef08a]'
                : 'border-red-200 shadow-[4px_4px_0px_#fecaca]'
            }`}>
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <span className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-[var(--font-fredoka)] text-base sm:text-lg ${isCorrect
                    ? 'bg-green-100 text-green-600'
                    : isSkipped
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                    {number}
                </span>
                <div className="flex-1">
                    <p className="font-medium text-[#0f172a] text-base sm:text-lg leading-relaxed mb-3 sm:mb-4">
                        {question.pertanyaan}
                    </p>

                    {isEssay ? (
                        // Essay question display
                        <div className="space-y-4">
                            <div className={`p-3 sm:p-4 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`material-symbols-outlined ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {isCorrect ? 'check_circle' : 'cancel'}
                                    </span>
                                    <span className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                        Jawaban Kamu:
                                    </span>
                                </div>
                                <p className="text-[#0f172a] whitespace-pre-wrap text-sm sm:text-base">{userAnswer || '(Tidak dijawab)'}</p>
                            </div>
                            {correctAnswer && (
                                <div className="p-3 sm:p-4 rounded-xl border-2 bg-blue-50 border-blue-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-blue-600">lightbulb</span>
                                        <span className="font-bold text-blue-700">Jawaban Benar:</span>
                                    </div>
                                    <p className="text-[#0f172a]">{correctAnswer}</p>
                                </div>
                            )}
                            {aiScore !== undefined && (
                                <div className="p-3 sm:p-4 rounded-xl border-2 bg-purple-50 border-purple-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-purple-600">psychology</span>
                                        <span className="font-bold text-purple-700">Nilai AI: {aiScore}/100</span>
                                    </div>
                                    {aiFeedback && (
                                        <p className="text-[#0f172a] text-sm whitespace-pre-wrap mt-2">{aiFeedback}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Multiple choice question display
                        <div className="space-y-3">
                            {question.pilihan && question.pilihan.length > 0 ? question.pilihan.map((option: any, optionIdx: number) => {
                                const optionText = option.text || option.jawaban || option.label || '';
                                const optionId = option.id || optionText;
                                // Check if user selected this option by comparing with userAnswer
                                // userAnswer could be the option ID (like "A", "B", "C") or the option text
                                const isSelected = userAnswer === optionId || userAnswer === optionText;
                                const isTheCorrectAnswer = correctAnswer === optionId || correctAnswer === optionText;

                                let styleClass = "bg-white border-[#e2e8f0] text-[#64748b]";
                                let icon = null;

                                if (isTheCorrectAnswer) {
                                    styleClass = "bg-green-50 border-green-500 text-green-700 font-bold";
                                    icon = "check_circle";
                                } else if (isSelected && !isCorrect) {
                                    styleClass = "bg-red-50 border-red-500 text-red-700 font-bold";
                                    icon = "cancel";
                                } else if (isSelected && isCorrect) {
                                    styleClass = "bg-green-50 border-green-500 text-green-700 font-bold";
                                    icon = "check_circle";
                                }

                                return (
                                    <div
                                        key={optionId || optionIdx}
                                        className={`p-3 rounded-xl border-2 flex items-center justify-between ${styleClass}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/50 border flex items-center justify-center text-sm font-bold">
                                                {String.fromCharCode(65 + optionIdx)}
                                            </div>
                                            <span>{optionText}</span>
                                        </div>
                                        {icon && <span className="material-symbols-outlined">{icon}</span>}
                                    </div>
                                );
                            }) : (
                                <p className="text-[#64748b] italic">Tidak ada pilihan tersedia</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {explanation && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-2 sm:gap-3">
                    <span className="material-symbols-outlined text-blue-500">lightbulb</span>
                    <div>
                        <p className="font-bold text-blue-700 text-sm mb-1">Pembahasan:</p>
                        <p className="text-blue-600 text-sm leading-relaxed">{explanation}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
