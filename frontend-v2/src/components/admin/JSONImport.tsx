import React, { useState } from 'react';

interface JSONImportProps {
    onImport: (json: string) => void;
}

export default function JSONImport({ onImport }: JSONImportProps) {
    const [jsonInput, setJsonInput] = useState('');

    const handleImport = () => {
        if (!jsonInput.trim()) return;
        onImport(jsonInput);
        setJsonInput('');
    };

    return (
        <div className="bg-white p-4 sm:p-8 rounded-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] mb-8">
            <h3 className="m-0 mb-2 text-lg sm:text-xl font-bold text-[#2d3436]">Import Soal dari JSON</h3>
            <p className="m-0 mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">Paste JSON yang didapat dari AI lain di sini. Format harus sesuai contoh di bawah.</p>

            <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-base font-mono focus:outline-none focus:border-[#6c5ce7] min-h-[200px]"
                placeholder='{"nama": "Sejarah", "kelas": "Kelas 4", "soal": [...]}'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
            />

            <div className="mt-4">
                <button
                    className="bg-[#6c5ce7] text-white px-6 py-3 rounded-[10px] border-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#5b4cc4] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleImport}
                    disabled={!jsonInput.trim()}
                >
                    Import JSON
                </button>
            </div>

            <div className="mt-6 sm:mt-8 bg-gray-50 p-3 sm:p-6 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Contoh Format JSON (Copy ini ke AI):</h4>
                <pre className="text-xs overflow-x-auto bg-white p-3 sm:p-4 rounded border border-gray-200 text-gray-600">
                    {`{
  "nama": "IPA",
  "kelas": "Kelas 3",
  "soal": [
    {
      "pertanyaan": "Hewan pemakan daging disebut?",
      "pilihan": [
        {"text": "Herbivora"},
        {"text": "Karnivora"},
        {"text": "Omnivora"},
        {"text": "Insectivora"}
      ],
      "jawaban_benar": "B"
    },
    {
      "tipe": "isian",
      "pertanyaan": "Jelaskan proses fotosintesis!",
      "rubrik_penilaian": "Penilaian berdasarkan: 1) Menyebutkan bahan yang dibutuhkan, 2) Penjelasan proses, 3) Menyebutkan hasil fotosintesis"
    }
  ]
}`}
                </pre>
            </div>
        </div>
    );
}
