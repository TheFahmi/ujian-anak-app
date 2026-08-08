import React from 'react';

interface RetryGradingButtonProps {
    onRetry: () => void;
    isLoading: boolean;
}

export default function RetryGradingButton({ onRetry, isLoading }: RetryGradingButtonProps) {
    return (
        <div className="text-center mt-8 p-6 bg-yellow-50 rounded-2xl border-2 border-dashed border-yellow-300">
            <p className="text-yellow-800 font-medium mb-4">
                Merasa nilaimu kurang tepat? AI mungkin salah menilai jawaban essay-mu.
            </p>
            <button
                onClick={onRetry}
                disabled={isLoading}
                className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mx-auto ${isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 hover:-translate-y-1 active:translate-y-0'
                    }`}
            >
                {isLoading ? (
                    <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Sedang Menilai Ulang...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">restart_alt</span>
                        Minta Nilai Ulang ke AI
                    </>
                )}
            </button>
        </div>
    );
}
