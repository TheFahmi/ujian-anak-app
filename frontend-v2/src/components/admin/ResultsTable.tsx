import React from 'react';

interface ResultsTableProps {
    results: any[];
    getUserName: (id: string) => string;
}

export default function ResultsTable({ results, getUserName }: ResultsTableProps) {
    return (
        <div className="overflow-x-auto bg-white p-4 rounded-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-4 text-left border-b border-gray-200 font-semibold text-[#636e72]">Tanggal</th>
                        <th className="p-4 text-left border-b border-gray-200 font-semibold text-[#636e72]">Siswa</th>
                        <th className="p-4 text-left border-b border-gray-200 font-semibold text-[#636e72]">Mata Pelajaran</th>
                        <th className="p-4 text-left border-b border-gray-200 font-semibold text-[#636e72]">Nilai</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((r, i) => (
                        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="p-4">{new Date(r.date).toLocaleString()}</td>
                            <td className="p-4 font-medium">{getUserName(r.userId)}</td>
                            <td className="p-4">{r.subjectName}</td>
                            <td className="p-4 font-bold text-[#6c5ce7]">{r.score}</td>
                        </tr>
                    ))}
                    {results.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500">
                                Belum ada hasil ujian yang tersedia.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
