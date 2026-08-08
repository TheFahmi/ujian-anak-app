import React, { useState } from 'react';

interface QuestionEditorProps {
    questions: any[];
    onUpdate: (questions: any[]) => void;
    subjectName?: string;
}

export default function QuestionEditor({ questions, onUpdate, subjectName }: QuestionEditorProps) {
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generateConfig, setGenerateConfig] = useState({
        topic: '',
        type: 'pilihan_ganda' as 'pilihan_ganda' | 'isian',
        count: 5
    });

    const handleAddQuestion = (type: 'pilihan_ganda' | 'isian') => {
        const newQuestion: any = {
            id: Date.now(),
            pertanyaan: "Pertanyaan Baru",
            tipe: type
        };

        if (type === 'pilihan_ganda') {
            newQuestion.pilihan = [
                { id: "A", text: "Pilihan A" },
                { id: "B", text: "Pilihan B" },
                { id: "C", text: "Pilihan C" },
                { id: "D", text: "Pilihan D" }
            ];
            newQuestion.jawaban_benar = "A";
        } else {
            newQuestion.rubrik_penilaian = "Penilaian berdasarkan: 1) Kelengkapan jawaban, 2) Kebenaran konsep, 3) Tata bahasa";
        }

        onUpdate([...questions, newQuestion]);
    };

    const handleUpdateQuestion = (index: number, field: string, value: any) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        onUpdate(updatedQuestions);
    };

    const handleUpdateOption = (qIndex: number, optIndex: number, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].pilihan[optIndex].text = value;
        onUpdate(updatedQuestions);
    };

    const handleDeleteQuestion = (index: number) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        onUpdate(updatedQuestions);
    };

    const handleGenerateQuestions = async () => {
        if (!generateConfig.topic.trim()) {
            alert('Masukkan topik soal');
            return;
        }

        setGenerating(true);
        try {
            const res = await fetch('/api/admin/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(generateConfig)
            });

            if (!res.ok) throw new Error('Generate failed');

            const data = await res.json();
            const generatedQuestions = data.questions.map((q: any, idx: number) => ({
                ...q,
                id: Date.now() + idx
            }));

            onUpdate([...questions, ...generatedQuestions]);
            setShowGenerateModal(false);
            setGenerateConfig({ topic: '', type: 'pilihan_ganda', count: 5 });
        } catch (err) {
            console.error(err);
            alert('Gagal generate soal. Coba lagi.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="bg-white p-4 sm:p-8 rounded-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] mb-8">
            <h4 className="m-0 mb-4 text-lg font-bold text-[#2d3436]">Daftar Soal ({questions.length})</h4>

            {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-[#f8f9fa] p-3 sm:p-6 rounded-[10px] mb-4 border border-[#e9ecef]">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                        <div className="flex gap-2 sm:gap-4">
                            <select
                                value={q.tipe || 'pilihan_ganda'}
                                onChange={e => handleUpdateQuestion(qIndex, 'tipe', e.target.value)}
                                className="p-2 w-auto sm:w-[150px] border-2 border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#6c5ce7]"
                            >
                                <option value="pilihan_ganda">Pilihan Ganda</option>
                                <option value="isian">Essay/Isian</option>
                            </select>
                            <button
                                className="bg-[#dfe6e9] text-[#2d3436] px-3 py-2 sm:px-4 rounded-lg border-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#b2bec3] sm:hidden text-sm"
                                onClick={() => handleDeleteQuestion(qIndex)}
                            >
                                Hapus
                            </button>
                        </div>
                        <input
                            className="flex-1 p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#6c5ce7]"
                            value={q.pertanyaan}
                            onChange={e => handleUpdateQuestion(qIndex, 'pertanyaan', e.target.value)}
                            placeholder="Pertanyaan"
                        />
                        <button
                            className="hidden sm:block bg-[#dfe6e9] text-[#2d3436] px-4 py-2 rounded-lg border-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#b2bec3]"
                            onClick={() => handleDeleteQuestion(qIndex)}
                        >
                            Hapus
                        </button>
                    </div>

                    {(q.tipe === 'isian') ? (
                        <div className="mt-2">
                            <textarea
                                className="w-full p-2 rounded-lg border-2 border-gray-200 text-base focus:outline-none focus:border-[#6c5ce7]"
                                value={q.rubrik_penilaian || ''}
                                onChange={e => handleUpdateQuestion(qIndex, 'rubrik_penilaian', e.target.value)}
                                placeholder="Rubrik Penilaian AI (wajib untuk soal essay)"
                                rows={3}
                            />
                        </div>
                    ) : (
                        <>
                            {q.pilihan && q.pilihan.length > 0 && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {q.pilihan.map((opt: any, optIndex: number) => (
                                            <input
                                                key={opt.id}
                                                className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7]"
                                                value={opt.text}
                                                onChange={e => handleUpdateOption(qIndex, optIndex, e.target.value)}
                                                placeholder={`Pilihan ${opt.id}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-2">
                                        <label className="mr-2 font-medium text-gray-600">Jawaban Benar:</label>
                                        <select
                                            className="p-2 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7]"
                                            value={q.jawaban_benar}
                                            onChange={e => handleUpdateQuestion(qIndex, 'jawaban_benar', e.target.value)}
                                        >
                                            {q.pilihan.map((opt: any) => <option key={opt.id} value={opt.id}>{opt.id}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            ))}

            <div className="flex flex-wrap gap-3 sm:gap-4 mt-6">
                <button
                    className="bg-[#dfe6e9] text-[#2d3436] px-4 py-2.5 sm:px-6 sm:py-3 rounded-[10px] border-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#b2bec3] text-sm sm:text-base"
                    onClick={() => handleAddQuestion('pilihan_ganda')}
                >
                    + Soal Pilihan Ganda
                </button>
                <button
                    className="bg-[#dfe6e9] text-[#2d3436] px-4 py-2.5 sm:px-6 sm:py-3 rounded-[10px] border-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#b2bec3] text-sm sm:text-base"
                    onClick={() => handleAddQuestion('isian')}
                >
                    + Soal Essay
                </button>
                <button
                    className="bg-[#f4c025] text-[#0f172a] px-4 py-2.5 sm:px-6 sm:py-3 rounded-[10px] border-2 border-[#0f172a] cursor-pointer font-bold transition-all duration-200 hover:bg-[#e0ac00] text-sm sm:text-base"
                    onClick={() => setShowGenerateModal(true)}
                >
                    ✨ Generate dengan AI
                </button>
            </div>

            {showGenerateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowGenerateModal(false)}>
                    <div className="bg-[#fdfbf7] rounded-[2rem] p-6 w-full max-w-md shadow-2xl border-4 border-[#0f172a]" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Generate Soal dengan AI</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#0f172a]">Topik / Materi</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Sistem Pencernaan Manusia"
                                    className="w-full px-4 py-2 rounded-lg border-2 border-[#0f172a]"
                                    value={generateConfig.topic}
                                    onChange={e => setGenerateConfig({...generateConfig, topic: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#0f172a]">Tipe Soal</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border-2 border-[#0f172a]"
                                    value={generateConfig.type}
                                    onChange={e => setGenerateConfig({...generateConfig, type: e.target.value as any})}
                                >
                                    <option value="pilihan_ganda">Pilihan Ganda</option>
                                    <option value="isian">Essay</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#0f172a]">Jumlah Soal</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    className="w-full px-4 py-2 rounded-lg border-2 border-[#0f172a]"
                                    value={generateConfig.count}
                                    onChange={e => setGenerateConfig({...generateConfig, count: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                className="flex-1 bg-[#dfe6e9] text-[#2d3436] px-4 py-2.5 rounded-lg font-semibold"
                                onClick={() => setShowGenerateModal(false)}
                                disabled={generating}
                            >
                                Batal
                            </button>
                            <button
                                className="flex-1 bg-[#f4c025] text-[#0f172a] px-4 py-2.5 rounded-lg border-2 border-[#0f172a] font-bold disabled:opacity-50"
                                onClick={handleGenerateQuestions}
                                disabled={generating}
                            >
                                {generating ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
