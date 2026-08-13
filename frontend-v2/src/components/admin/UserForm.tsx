import React, { useState, useEffect } from 'react';

interface UserFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isEditing: boolean;
    subjects?: Array<{ id: string; nama: string; kelas: string }>;
    users?: Array<{ id: string; username: string; nama?: string; kelas?: string; role?: string }>;
}

export default function UserForm({ initialData, onSubmit, onCancel, isEditing, subjects = [], users = [] }: UserFormProps) {
    const [formData, setFormData] = useState({
        id: '',
        username: '',
        password: '',
        role: 'siswa',
        kelas: '',
        kelas_assign: '',
        mata_pelajaran: '',
        children: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                kelas_assign: Array.isArray(initialData.kelas_assign)
                    ? initialData.kelas_assign.join(',')
                    : initialData.kelas_assign || '',
                mata_pelajaran: Array.isArray(initialData.mata_pelajaran)
                    ? initialData.mata_pelajaran.join(',')
                    : initialData.mata_pelajaran || '',
                children: Array.isArray(initialData.children)
                    ? initialData.children.join(',')
                    : initialData.children || ''
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            kelas_assign: formData.kelas_assign.split(',').map(s => s.trim()).filter(Boolean),
            mata_pelajaran: formData.mata_pelajaran.split(',').map(s => s.trim()).filter(Boolean),
            children: formData.children.split(',').map(s => s.trim()).filter(Boolean)
        });
    };

    return (
        <div className="bg-white p-4 sm:p-8 rounded-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] mb-8">
            <h3 className="m-0 mb-4 text-lg sm:text-xl font-bold text-[#2d3436]">
                {isEditing ? 'Edit Pengguna' : 'Tambah Pengguna'}
            </h3>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <input
                        className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7]"
                        placeholder="Username"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                    <input
                        className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7]"
                        placeholder="Password"
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required={!isEditing}
                    />
                    <select
                        className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7]"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="siswa">Siswa</option>
                        <option value="admin">Admin</option>
                        <option value="pengawas">Pengawas</option>
                        <option value="guru">Guru</option>
                        <option value="orangtua">Orang Tua</option>
                    </select>
                    {formData.role === 'siswa' && (
                        <input
                            className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7]"
                            placeholder="Kelas (misal: Kelas 1)"
                            value={formData.kelas}
                            onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                        />
                    )}
                </div>

                {formData.role === 'orangtua' && (
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-2">
                            Anak (centang siswa yang menjadi anak)
                        </label>
                        {(() => {
                            const siswaList = users.filter(u => u.role === 'siswa');
                            if (siswaList.length === 0) {
                                return <p className="text-sm text-gray-400">Belum ada siswa. Buat dulu user role Siswa.</p>;
                            }
                            const selected = (formData.children || '').split(',').map(s => s.trim()).filter(Boolean);
                            return (
                                <div className="flex flex-wrap gap-2">
                                    {siswaList.map(s => {
                                        const isSelected = selected.includes(s.id);
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    const next = isSelected
                                                        ? selected.filter(id => id !== s.id)
                                                        : [...selected, s.id];
                                                    setFormData({ ...formData, children: next.join(',') });
                                                }}
                                                className={`px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                                                    isSelected
                                                        ? 'bg-[#6c5ce7] border-[#6c5ce7] text-white'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#6c5ce7]'
                                                }`}
                                            >
                                                {s.username} {s.kelas ? `(${s.kelas})` : ''}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Multi-select Mapel (untuk guru) */}
                {formData.role === 'guru' && (
                    <div className="mt-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-2">
                            Mata Pelajaran (centang yang dipegang guru)
                        </label>
                        {subjects.length === 0 ? (
                            <p className="text-sm text-gray-400">Belum ada mapel. Buat dulu di tab Mapel.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {subjects.map(s => {
                                    const isSelected = (formData.mata_pelajaran || '').split(',').map(x => x.trim()).filter(Boolean).includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => {
                                                const ids = (formData.mata_pelajaran || '').split(',').map(x => x.trim()).filter(Boolean);
                                                const next = isSelected
                                                    ? ids.filter(id => id !== s.id)
                                                    : [...ids, s.id];
                                                setFormData({ ...formData, mata_pelajaran: next.join(',') });
                                            }}
                                            className={`px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-[#6c5ce7] border-[#6c5ce7] text-white'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#6c5ce7]'
                                            }`}
                                        >
                                            {s.nama} {s.kelas ? `(${s.kelas})` : ''}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {formData.role === 'guru' && (
                    <div className="mt-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-2">
                            Kelas yang dipegang (centang; kosongkan = semua kelas)
                        </label>
                        <input
                            className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7]"
                            placeholder="Kelas 4, Kelas 5 (pisahkan dengan koma)"
                            value={formData.kelas_assign}
                            onChange={e => setFormData({ ...formData, kelas_assign: e.target.value })}
                        />
                        <p className="text-xs text-gray-400 mt-1">Tulis nama kelas, contoh: Kelas 4,Kelas 5</p>
                    </div>
                )}

                <div className="flex flex-wrap gap-3 sm:gap-4 mt-6">
                    <button
                        type="submit"
                        className="bg-[#6c5ce7] text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-[10px] border-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#5b4cc4] text-sm sm:text-base"
                    >
                        {isEditing ? 'Simpan Perubahan' : 'Tambah Pengguna'}
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
