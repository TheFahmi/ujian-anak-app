"use client";

import { formatCompact } from '@/utils/formatIDR';

interface TokenStatsPeriod {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
    requestCount: number;
}

interface TokenStatsCardsProps {
    today: TokenStatsPeriod;
    week: TokenStatsPeriod;
    month: TokenStatsPeriod;
    all: TokenStatsPeriod;
}

// Format USD currency
function formatUSD(amount: number): string {
    if (amount < 0.01) {
        return `$${amount.toFixed(4)}`;
    }
    return `$${amount.toFixed(2)}`;
}

export default function TokenStatsCards({ today, week, month, all }: TokenStatsCardsProps) {
    const periods = [
        { label: 'Hari Ini', data: today, gradient: 'from-[#6c5ce7] to-[#a29bfe]' },
        { label: 'Minggu Ini', data: week, gradient: 'from-[#0984e3] to-[#74b9ff]' },
        { label: 'Bulan Ini', data: month, gradient: 'from-[#00b894] to-[#55efc4]' },
        { label: 'Total', data: all, gradient: 'from-[#e84393] to-[#fd79a8]' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {periods.map((period) => (
                <div
                    key={period.label}
                    className={`p-5 rounded-[15px] text-white shadow-lg bg-gradient-to-br ${period.gradient}`}
                >
                    <h3 className="m-0 text-sm opacity-90 font-medium">{period.label}</h3>
                    <div className="text-2xl font-bold mt-2">
                        {formatCompact(period.data.totalTokens)} tokens
                    </div>
                    <div className="mt-3 text-xs opacity-80 space-y-1">
                        <div className="flex justify-between">
                            <span>Input:</span>
                            <span>{formatCompact(period.data.inputTokens)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Output:</span>
                            <span>{formatCompact(period.data.outputTokens)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Request:</span>
                            <span>{period.data.requestCount}</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="text-lg font-bold">{formatUSD(period.data.cost)}</div>
                        <div className="text-xs opacity-70">Estimasi Biaya (USD)</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
