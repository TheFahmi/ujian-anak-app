"use client";

import React, { useState, useEffect, useCallback } from 'react';

export default function GuruPendingPanel() {
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/guru-pending');
            const data = await res.json();
            setPending(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const setStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/guru/${id}/approval`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const d = await res.json();
            setMessage(d.message || 'OK');
            setTimeout(() => setMessage(''), 3000);
            load();
        } catch (e) {
            console.error(e);
            setMessage('Gagal. Coba lagi.');
        }
    };

    return (
        <div className="animate-fadeIn">
            {message && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                    {message}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : pending.length === 0 ? (
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-3">verified_user</span>
                    <p className="text-gray-500">Tidak ada guru yang menunggu persetujuan.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pending.map(g => (
                        <div key={g.id} className="bg-white rounded-2xl border-2 border-[#e2e8f0] shadow-sm p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-bold text-[#0f172a]">{g.username}</p>
                                    <p className="text-sm text-gray-500">{g.email || '-'}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Daftar: {g.createdAt ? new Date(g.createdAt).toLocaleDateString('id-ID') : '-'}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {(g.mata_pelajaran || []).map((m: string, i: number) => (
                                            <span key={i} className="text-xs font-bold text-[#6c5ce7] bg-[#6c5ce7]/10 px-2.5 py-1 rounded-lg">
                                                📘 {m}
                                            </span>
                                        ))}
                                        {(g.kelas_assign || []).map((k: string, i: number) => (
                                            <span key={i} className="text-xs font-bold text-[#0ea5e9] bg-sky-50 px-2.5 py-1 rounded-lg">
                                                🏫 {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => setStatus(g.id, 'active')}
                                        className="bg-green-500 text-white border-2 border-[#0f172a] rounded-xl px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#0f172a] hover:bg-green-600"
                                    >
                                        ✓ Setujui
                                    </button>
                                    <button
                                        onClick={() => setStatus(g.id, 'rejected')}
                                        className="bg-red-500 text-white border-2 border-[#0f172a] rounded-xl px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#0f172a] hover:bg-red-600"
                                    >
                                        ✗ Tolak
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
