import React, { useState, useEffect } from 'react';

interface UserFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isEditing: boolean;
}

export default function UserForm({ initialData, onSubmit, onCancel, isEditing }: UserFormProps) {
    const [formData, setFormData] = useState({
        id: '',
        username: '',
        password: '',
        role: 'siswa',
        kelas: '',
        mata_pelajaran: '',
        children: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
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
                    <input
                        className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7] mb-4"
                        placeholder="ID Anak (pisahkan dengan koma, misal: siswa1,siswa2)"
                        value={formData.children}
                        onChange={e => setFormData({ ...formData, children: e.target.value })}
                    />
                )}

                <input
                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#6c5ce7] mt-4"
                    placeholder="ID Mata Pelajaran (pisahkan dengan koma, misal: 1,2)"
                    value={formData.mata_pelajaran}
                    onChange={e => setFormData({ ...formData, mata_pelajaran: e.target.value })}
                />

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
