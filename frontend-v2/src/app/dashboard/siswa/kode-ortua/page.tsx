"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TopAppBar from '@/components/TopAppBar';

export default function KodeOrtuaPage() {
    const { user } = useAuth();
    const [kode, setKode] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchKode = async () => {
            try {
                const res = await fetch(`/api/user/${user.id}/kode-ortua`);
                const d = await res.json();
                if (d.success) setKode(d.kode);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchKode();
    }, [user]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(kode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7] pb-32">
            <TopAppBar title="Kode Orang Tua" showBack />
            <div className="px-6 pt-20 max-w-lg mx-auto">
                <div className="text-center mb-6">
                    <div className="text-6xl mb-3">
                        <span className="material-symbols-outlined text-6xl text-[#6c5ce7]">family_restroom</span>
                    </div>
                    <h1 className="font-[var(--font-fredoka)] text-2xl text-[#0f172a] mb-2">Kode untuk Orang Tuamu</h1>
                    <p className="text-sm text-gray-500">
                        Berikan kode ini ke ayah/ibu. Mereka memakainya saat daftar untuk terhubung dengan akunmu.
                    </p>
                </div>

                <div className="bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] p-8 text-center mb-6">
                    {loading ? (
                        <p className="text-gray-400 py-6">Memuat kode...</p>
                    ) : (
                        <>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kode Unik</p>
                            <p className="font-mono text-4xl font-bold tracking-[0.35em] text-[#0f172a] mb-6">
                                {kode}
                            </p>
                            <button
                                onClick={copy}
                                className="w-full bg-[#6c5ce7] text-white border-2 border-[#0f172a] rounded-2xl py-3.5 font-bold shadow-[4px_4px_0px_#0f172a] active:translate-y-1 active:shadow-none"
                            >
                                {copied ? 'Tersalin!' : 'Salin Kode'}
                            </button>
                        </>
                    )}
                </div>

                <div className="bg-[#eef2ff] border-2 border-[#c7d2fe] rounded-2xl p-4">
                    <p className="text-xs font-bold text-[#4338ca] mb-1">Cara pakai:</p>
                    <ol className="text-xs text-[#4338ca] space-y-1 list-decimal list-inside">
                        <li>Kirim kode ini ke orang tuamu</li>
                        <li>Orang tua daftar, pilih peran "Orang Tua"</li>
                        <li>Masukkan kode ini saat diminta</li>
                        <li>Akun terhubung otomatis!</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
