'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface StudentDetailModalProps {
    user: any;
    onClose: () => void;
}

export default function StudentDetailModal({ user, onClose }: StudentDetailModalProps) {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`/api/admin/results?userId=${user.id}`);
                const data = await res.json();
                setResults(data);
            } catch (err) {
                console.error('Failed to fetch student results:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [user.id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div 
            className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Detail Siswa</h2>
                            <p className="text-white/90">{user.username} • {user.kelas || '-'}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            Memuat data...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Belum ada hasil ujian
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-1">Total Ujian</div>
                                    <div className="text-2xl font-bold text-blue-700">{results.length}</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-1">Rata-rata</div>
                                    <div className="text-2xl font-bold text-green-700">
                                        {Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)}
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-1">Tertinggi</div>
                                    <div className="text-2xl font-bold text-purple-700">
                                        {Math.max(...results.map(r => r.score))}
                                    </div>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Mata Pelajaran</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Nilai</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Benar</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Cheat</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((result, idx) => (
                                            <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                                                <td className="p-3 font-medium text-gray-900">{result.subjectName}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-sm font-bold ${
                                                        result.score >= 80 ? 'bg-green-100 text-green-700' :
                                                        result.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {result.score}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-600">
                                                    {result.correctCount}/{result.totalQuestions}
                                                </td>
                                                <td className="p-3">
                                                    {result.cheatCount > 0 ? (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                            {result.cheatCount}×
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {formatDate(result.date)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
