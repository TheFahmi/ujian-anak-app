import React, { useState, useEffect } from 'react';

interface SubjectFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isEditing: boolean;
}

export default function SubjectForm({ initialData, onSubmit, onCancel, isEditing }: SubjectFormProps) {
    const [formData, setFormData] = useState({
        id: '',
        nama: '',
        kelas: '',
        soal: []
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="bg-white p-4 sm:p-8 rounded-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] mb-8">
            <h3 className="m-0 mb-4 text-lg sm:text-xl font-bold text-[#2d3436]">
                {isEditing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
            </h3>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                        className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7]"
                        placeholder="ID (Angka)"
                        value={formData.id}
                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                        disabled={isEditing}
                        required
                    />
                    <input
                        className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7]"
                        placeholder="Nama Pelajaran"
                        value={formData.nama}
                        onChange={e => setFormData({ ...formData, nama: e.target.value })}
                        required
                    />
                    <select
                        className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7]"
                        value={formData.kelas}
                        onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                        required
                    >
                        <option value="">Pilih Kelas</option>
                        <option value="Kelas 1">Kelas 1</option>
                        <option value="Kelas 2">Kelas 2</option>
                        <option value="Kelas 3">Kelas 3</option>
                        <option value="Kelas 4">Kelas 4</option>
                        <option value="Kelas 5">Kelas 5</option>
                        <option value="Kelas 6">Kelas 6</option>
                    </select>
                </div>

                <div className="flex flex-wrap gap-3 sm:gap-4 mt-6">
                    <button
                        type="submit"
                        className="bg-[#6c5ce7] text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-[10px] border-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#5b4cc4] text-sm sm:text-base"
                    >
                        {isEditing ? 'Simpan Perubahan' : 'Simpan Mata Pelajaran'}
                    </button>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-[#dfe6e9] text-[#2d3436] px-4 py-2.5 sm:px-6 sm:py-3 rounded-[10px] border-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#b2bec3] text-sm sm:text-base"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
