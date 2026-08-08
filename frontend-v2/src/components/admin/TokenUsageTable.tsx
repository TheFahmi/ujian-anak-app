"use client";

import React from 'react';
import { formatCompact } from '@/utils/formatIDR';

interface TokenUsage {
    _id: string;
    userId: string;
    username: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    model: string;
    timestamp: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface TokenUsageTableProps {
    data: TokenUsage[];
    pagination: Pagination;
    onPageChange: (page: number) => void;
    onSort: (field: string) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export default function TokenUsageTable({
    data,
    pagination,
    onPageChange,
    onSort,
    sortBy,
    sortOrder,
}: TokenUsageTableProps) {
    const SortIcon = ({ field }: { field: string }) => {
        if (sortBy !== field) return <span className="text-gray-300">↕</span>;
        return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
    };

    const columns = [
        { key: 'timestamp', label: 'Waktu' },
        { key: 'username', label: 'User' },
        { key: 'inputTokens', label: 'Input' },
        { key: 'outputTokens', label: 'Output' },
        { key: 'totalTokens', label: 'Total' },
        { key: 'model', label: 'Model' },
    ];

    return (
        <div className="bg-white rounded-[15px] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="m-0 text-lg font-bold text-gray-800">Riwayat Penggunaan Token</h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="p-3 font-semibold text-gray-600 text-sm cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort(col.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        <SortIcon field={col.key} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    Belum ada data penggunaan token
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 text-sm">
                                        {new Date(item.timestamp).toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-3 text-sm font-medium">{item.username}</td>
                                    <td className="p-3 text-sm text-blue-600">{formatCompact(item.inputTokens)}</td>
                                    <td className="p-3 text-sm text-green-600">{formatCompact(item.outputTokens)}</td>
                                    <td className="p-3 text-sm font-bold text-purple-600">{formatCompact(item.totalTokens)}</td>
                                    <td className="p-3 text-xs text-gray-500 truncate max-w-[150px]">{item.model}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="text-sm text-gray-500">
                        Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total)
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
