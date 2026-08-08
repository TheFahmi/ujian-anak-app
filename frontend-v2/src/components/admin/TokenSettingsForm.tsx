"use client";
import { Settings } from 'lucide-react';

import { useState, useEffect } from 'react';

interface TokenSettings {
    inputTokenPrice: number;
    outputTokenPrice: number;
    updatedAt: string;
    updatedBy?: string;
}

interface TokenSettingsFormProps {
    settings: TokenSettings;
    onSave: (settings: { inputTokenPrice: number; outputTokenPrice: number }) => Promise<void>;
}

export default function TokenSettingsForm({ settings, onSave }: TokenSettingsFormProps) {
    const [inputPrice, setInputPrice] = useState(settings.inputTokenPrice.toString());
    const [outputPrice, setOutputPrice] = useState(settings.outputTokenPrice.toString());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setInputPrice(settings.inputTokenPrice.toString());
        setOutputPrice(settings.outputTokenPrice.toString());
    }, [settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const inputNum = parseFloat(inputPrice);
        const outputNum = parseFloat(outputPrice);

        if (isNaN(inputNum) || isNaN(outputNum)) {
            setError('Harga harus berupa angka');
            return;
        }

        if (inputNum < 0 || outputNum < 0) {
            setError('Harga tidak boleh negatif');
            return;
        }

        setSaving(true);
        try {
            await onSave({ inputTokenPrice: inputNum, outputTokenPrice: outputNum });
        } catch (err) {
            setError('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-[15px] shadow-sm p-6 mb-6">
            <h3 className="m-0 mb-4 text-lg font-bold text-gray-800"><span className="inline-flex items-center gap-2"><Settings className="inline w-5 h-5" /> Pengaturan Harga Token</span></h3>
            <p className="text-gray-500 text-sm mb-4">
                Atur harga token dalam USD per 1 juta (1M) token. Default: DeepSeek V3 pricing.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Input Token ($ / 1M tokens)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={inputPrice}
                                onChange={(e) => setInputPrice(e.target.value)}
                                className="w-full p-3 pl-7 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-[#6c5ce7]"
                                placeholder="0.14"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">DeepSeek V3: $0.14/1M</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Output Token ($ / 1M tokens)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={outputPrice}
                                onChange={(e) => setOutputPrice(e.target.value)}
                                className="w-full p-3 pl-7 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-[#6c5ce7]"
                                placeholder="0.28"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">DeepSeek V3: $0.28/1M</p>
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                        {settings.updatedAt && (
                            <>Terakhir diupdate: {new Date(settings.updatedAt).toLocaleString('id-ID')}</>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#6c5ce7] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#5b4cc4] transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
