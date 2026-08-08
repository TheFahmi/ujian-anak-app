import React from 'react';

interface FullscreenWarningProps {
    onEnableFullscreen: () => void;
}

export default function FullscreenWarning({ onEnableFullscreen }: FullscreenWarningProps) {
    return (
        <div className="fixed inset-0 z-[2000] bg-[#fdfbf7] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <span className="material-symbols-outlined text-6xl text-red-500">fullscreen</span>
            </div>

            <h1 className="font-[var(--font-fredoka)] text-3xl text-[#0f172a] mb-4">
                Mode Layar Penuh Diperlukan
            </h1>

            <p className="text-[#64748b] max-w-md mb-8 leading-relaxed">
                Untuk menjaga integritas ujian, kamu harus masuk ke mode layar penuh.
                Jangan keluar dari mode ini selama ujian berlangsung atau ujian akan terkunci!
            </p>

            <button
                onClick={onEnableFullscreen}
                className="px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-bold text-lg shadow-[4px_4px_0px_#94a3b8] hover:translate-y-1 hover:shadow-[2px_2px_0px_#94a3b8] active:translate-y-2 active:shadow-none transition-all"
            >
                Aktifkan Layar Penuh
            </button>
        </div>
    );
}
