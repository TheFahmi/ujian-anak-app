import React, { useEffect, useRef, useState } from 'react';

interface QuestionEditorProps {
    questions: any[];
    onUpdate: (questions: any[]) => void;
    subjectName?: string;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuestionEditor({ questions, onUpdate, subjectName }: QuestionEditorProps) {
    // Draft lives here so typing never hits the network. Parent only hears about
    // it when the user presses Simpan, which is what stopped the per-keystroke
    // PUT + refetch race that was eating characters mid-sentence.
    const [draft, setDraft] = useState<any[]>(questions);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generateConfig, setGenerateConfig] = useState({
        topic: '',
        type: 'pilihan_ganda' as 'pilihan_ganda' | 'isian',
        count: 5
    });
    const lastQuestionRef = useRef<HTMLInputElement | null>(null);
    const focusNext = useRef(false);

    // Only accept incoming questions while there is nothing unsaved to lose.
    useEffect(() => {
        if (!dirty) setDraft(questions);
    }, [questions, dirty]);

    // Warn before a tab close / navigation would drop unsaved questions.
    useEffect(() => {
        if (!dirty) return;
        const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    useEffect(() => {
        if (focusNext.current && lastQuestionRef.current) {
            lastQuestionRef.current.focus();
            focusNext.current = false;
        }
    }, [draft.length]);

    const edit = (fn: (d: any[]) => any[]) => {
        setDraft(prev => fn([...prev]));
        setDirty(true);
    };

    const handleAddQuestion = (type: 'pilihan_ganda' | 'isian') => {
        const newQuestion: any = {
            id: Date.now(),
            pertanyaan: '',
            tipe: type
        };

        if (type === 'pilihan_ganda') {
            newQuestion.pilihan = LETTERS.map(id => ({ id, text: '' }));
            newQuestion.jawaban_benar = 'A';
        } else {
            newQuestion.rubrik_penilaian = 'Penilaian berdasarkan: 1) Kelengkapan jawaban, 2) Kebenaran konsep, 3) Tata bahasa';
        }

        focusNext.current = true;
        edit(d => [...d, newQuestion]);
    };

    const handleUpdateQuestion = (index: number, field: string, value: any) => {
        edit(d => {
            const q = { ...d[index], [field]: value };
            // Switching type mid-edit must bring the fields that type needs.
            if (field === 'tipe') {
                if (value === 'pilihan_ganda' && !q.pilihan?.length) {
                    q.pilihan = LETTERS.map(id => ({ id, text: '' }));
                    q.jawaban_benar = q.jawaban_benar || 'A';
                }
                if (value === 'isian' && !q.rubrik_penilaian) {
                    q.rubrik_penilaian = 'Penilaian berdasarkan: 1) Kelengkapan jawaban, 2) Kebenaran konsep, 3) Tata bahasa';
                }
            }
            d[index] = q;
            return d;
        });
    };

    const handleUpdateOption = (qIndex: number, optIndex: number, value: string) => {
        edit(d => {
            const pilihan = [...d[qIndex].pilihan];
            pilihan[optIndex] = { ...pilihan[optIndex], text: value };
            d[qIndex] = { ...d[qIndex], pilihan };
            return d;
        });
    };

    const handleDeleteQuestion = (index: number) => {
        const q = draft[index];
        const filled = (q?.pertanyaan || '').trim();
        if (filled && !confirm(`Hapus soal "${filled.slice(0, 60)}"?`)) return;
        edit(d => d.filter((_, i) => i !== index));
    };

    // Blank questions reach students as empty rows, so block the save instead.
    const problems = draft.reduce<string[]>((acc, q, i) => {
        if (!(q.pertanyaan || '').trim()) acc.push(`Soal ${i + 1}: pertanyaan masih kosong`);
        else if (q.tipe !== 'isian' && q.pilihan?.some((o: any) => !(o.text || '').trim()))
            acc.push(`Soal ${i + 1}: ada pilihan jawaban yang kosong`);
        return acc;
    }, []);

    const handleSave = async () => {
        if (problems.length) return;
        setSaving(true);
        try {
            await onUpdate(draft);
            setDirty(false);
        } finally {
            setSaving(false);
        }
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
                body: JSON.stringify({ ...generateConfig, subjectName })
            });

            if (!res.ok) throw new Error('Generate failed');

            const data = await res.json();
            const generatedQuestions = data.questions.map((q: any, idx: number) => ({
                ...q,
                id: Date.now() + idx
            }));

            edit(d => [...d, ...generatedQuestions]);
            setShowGenerateModal(false);
            setGenerateConfig({ topic: '', type: 'pilihan_ganda', count: 5 });
        } catch (err) {
            console.error(err);
            alert('Gagal generate soal. Coba lagi.');
        } finally {
            setGenerating(false);
        }
    };

    const btnGrey = 'bg-[#dfe6e9] text-[#2d3436] px-4 py-2.5 sm:px-6 sm:py-3 rounded-[10px] border-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#b2bec3] text-sm sm:text-base';

    return (
        <div className="bg-white p-4 sm:p-8 rounded-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h4 className="m-0 text-lg font-bold text-[#2d3436]">
                    Daftar Soal ({draft.length})
                    {dirty && <span className="ml-2 text-sm font-medium text-[#e17055]">• belum disimpan</span>}
                </h4>
            </div>

            {draft.length === 0 && (
                <p className="text-gray-500 mb-4">Belum ada soal. Tambah manual atau generate dengan AI.</p>
            )}

            {draft.map((q, qIndex) => (
                <div key={q.id ?? qIndex} className="bg-[#f8f9fa] p-3 sm:p-6 rounded-[10px] mb-4 border border-[#e9ecef]">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                        <div className="flex gap-2 sm:gap-4 items-center">
                            <span className="font-bold text-gray-400 w-6 flex-none">{qIndex + 1}.</span>
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
                            ref={qIndex === draft.length - 1 ? lastQuestionRef : undefined}
                            className="flex-1 p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#6c5ce7]"
                            value={q.pertanyaan || ''}
                            onChange={e => handleUpdateQuestion(qIndex, 'pertanyaan', e.target.value)}
                            placeholder="Tulis pertanyaan di sini"
                        />
                        <button
                            className="hidden sm:block bg-[#dfe6e9] text-[#2d3436] px-4 py-2 rounded-lg border-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#b2bec3]"
                            onClick={() => handleDeleteQuestion(qIndex)}
                        >
                            Hapus
                        </button>
                    </div>

                    {(q.tipe === 'isian') ? (
                        <div className="mt-2 space-y-3">
                            <textarea
                                className="w-full p-2 rounded-lg border-2 border-gray-200 text-base focus:outline-none focus:border-[#6c5ce7]"
                                value={q.rubrik_penilaian || ''}
                                onChange={e => handleUpdateQuestion(qIndex, 'rubrik_penilaian', e.target.value)}
                                placeholder="Rubrik Penilaian AI (wajib untuk soal essay)"
                                rows={3}
                            />
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Kunci Jawaban (referensi jawaban benar) — opsional
                                </label>
                                <textarea
                                    className="w-full p-2.5 rounded-lg border-2 border-gray-200 text-base focus:outline-none focus:border-[#6c5ce7]"
                                    value={q.kunci_jawaban || ''}
                                    onChange={e => handleUpdateQuestion(qIndex, 'kunci_jawaban', e.target.value)}
                                    placeholder="Contoh: Sumpah Pemuda diikrarkan pada 28 Oktober 1928, isinya... (dipakai AI sebagai referensi penilaian)"
                                    rows={2}
                                />
                            </div>
                        </div>
                    ) : (
                        q.pilihan?.length > 0 && (
                            <>
                                {/* Radio doubles as the answer key, so picking the correct
                                    option no longer means a separate dropdown trip. */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                    {q.pilihan.map((opt: any, optIndex: number) => (
                                        <label
                                            key={opt.id}
                                            className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-colors cursor-pointer ${
                                                q.jawaban_benar === opt.id
                                                    ? 'border-[#00b894] bg-[#00b894]/5'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`benar-${q.id ?? qIndex}`}
                                                checked={q.jawaban_benar === opt.id}
                                                onChange={() => handleUpdateQuestion(qIndex, 'jawaban_benar', opt.id)}
                                                className="w-4 h-4 flex-none accent-[#00b894]"
                                                aria-label={`Tandai pilihan ${opt.id} sebagai jawaban benar`}
                                            />
                                            <span className="font-bold text-gray-500 w-4 flex-none">{opt.id}</span>
                                            <input
                                                className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-base bg-white focus:outline-none focus:border-[#6c5ce7]"
                                                value={opt.text || ''}
                                                onChange={e => handleUpdateOption(qIndex, optIndex, e.target.value)}
                                                placeholder={`Jawaban ${opt.id}`}
                                            />
                                        </label>
                                    ))}
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Jawaban benar: <strong className="text-[#00b894]">{q.jawaban_benar || '-'}</strong> — klik bulatan hijau untuk mengubah.
                                </p>
                                <div className="mt-3">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                        Pembahasan (kenapa jawaban benar) — opsional, muncul saat siswa salah
                                    </label>
                                    <textarea
                                        className="w-full p-2.5 rounded-lg border-2 border-gray-200 text-base focus:outline-none focus:border-[#6c5ce7]"
                                        value={q.penjelasan || ''}
                                        onChange={e => handleUpdateQuestion(qIndex, 'penjelasan', e.target.value)}
                                        placeholder="Contoh: Karena Soekarno adalah presiden pertama Indonesia yang membacakan proklamasi..."
                                        rows={2}
                                    />
                                </div>
                                <div className="mt-3">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                        Diagram SVG (opsional) — untuk soal geometri, tampil di penjelasan
                                    </label>
                                    <textarea
                                        className="w-full p-2.5 rounded-lg border-2 border-gray-200 font-mono text-xs focus:outline-none focus:border-[#6c5ce7]"
                                        value={q.diagram_svg || ''}
                                        onChange={e => handleUpdateQuestion(qIndex, 'diagram_svg', e.target.value)}
                                        placeholder={'<svg viewBox="0 0 200 150"><rect x="50" y="25" width="100" height="100" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/><text x="100" y="150" text-anchor="middle" fill="#333">s = 5 cm</text></svg>'}
                                        rows={3}
                                    />
                                </div>
                            </>
                        )
                    )}
                </div>
            ))}

            <div className="flex flex-wrap gap-3 sm:gap-4 mt-6">
                <button className={btnGrey} onClick={() => handleAddQuestion('pilihan_ganda')}>
                    + Soal Pilihan Ganda
                </button>
                <button className={btnGrey} onClick={() => handleAddQuestion('isian')}>
                    + Soal Essay
                </button>
                <button
                    className="bg-[#f4c025] text-[#0f172a] px-4 py-2.5 sm:px-6 sm:py-3 rounded-[10px] border-2 border-[#0f172a] cursor-pointer font-bold transition-all duration-200 hover:bg-[#e0ac00] text-sm sm:text-base"
                    onClick={() => setShowGenerateModal(true)}
                >
                    Generate dengan AI
                </button>
            </div>

            {problems.length > 0 && (
                <ul className="mt-4 text-sm text-[#d63031] list-disc pl-5">
                    {problems.map(p => <li key={p}>{p}</li>)}
                </ul>
            )}

            <div className="sticky bottom-0 mt-6 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 bg-white/95 backdrop-blur border-t border-gray-100 flex flex-wrap gap-3 items-center">
                <button
                    className="bg-[#6c5ce7] text-white px-8 py-3 rounded-[10px] font-bold hover:bg-[#5b4cc4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled={!dirty || saving || problems.length > 0}
                >
                    {saving ? 'Menyimpan...' : 'Simpan Soal'}
                </button>
                {dirty && !saving && (
                    <button
                        className="px-4 py-3 rounded-[10px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                        onClick={() => { setDraft(questions); setDirty(false); }}
                    >
                        Batalkan perubahan
                    </button>
                )}
                {!dirty && draft.length > 0 && (
                    <span className="text-sm text-gray-400">Semua perubahan tersimpan.</span>
                )}
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
                                    onChange={e => setGenerateConfig({ ...generateConfig, topic: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleGenerateQuestions()}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#0f172a]">Tipe Soal</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border-2 border-[#0f172a]"
                                    value={generateConfig.type}
                                    onChange={e => setGenerateConfig({ ...generateConfig, type: e.target.value as any })}
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
                                    onChange={e => setGenerateConfig({ ...generateConfig, count: parseInt(e.target.value) || 1 })}
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
                        <p className="mt-3 text-xs text-[#0f172a]/60">
                            Hasil generate masuk ke daftar sebagai draft — cek dulu, lalu tekan Simpan Soal.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
