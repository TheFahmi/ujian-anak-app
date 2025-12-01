import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

const Admin = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'subjects', 'users', 'results', 'import', 'add-questions'
    const [subjects, setSubjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [results, setResults] = useState([]);
    const { addToast } = useToast();
    const [jsonInput, setJsonInput] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [questionsJson, setQuestionsJson] = useState('');

    // New Subject Form State
    const [newSubject, setNewSubject] = useState({ id: '', nama: '', kelas: '', soal: [] });
    const [isEditingSubject, setIsEditingSubject] = useState(false);

    // New User Form State
    const [newUser, setNewUser] = useState({ id: '', username: '', password: '', role: 'siswa', kelas: '', mata_pelajaran: [] });

    const fetchData = useCallback(() => {
        fetch('/api/admin/data')
            .then(res => res.json())
            .then(data => {
                setSubjects(data.mata_pelajaran || []);
                setUsers(data.pengguna || []);
                setResults(data.hasil_ujian || []);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveData = (updatedData) => {
        fetch('/api/admin/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        })
            .then(res => res.json())
            .then(data => {
                addToast(data.message || 'Data berhasil disimpan!', 'success');
                fetchData();
                // Reset forms
                setNewSubject({ id: '', nama: '', kelas: '', soal: [] });
                setNewUser({ id: '', username: '', password: '', role: 'siswa', kelas: '', mata_pelajaran: [] });
                setIsEditingSubject(false);
            })
            .catch(() => addToast('Gagal menyimpan data', 'error'));
    };

    // --- SUBJECT MANAGEMENT ---
    const handleAddSubject = () => {
        const id = parseInt(newSubject.id) || Date.now();
        const subjectToAdd = { ...newSubject, id };

        let updatedSubjects;

        if (isEditingSubject) {
            updatedSubjects = subjects.map(s => s.id === id ? subjectToAdd : s);
        } else {
            updatedSubjects = [...subjects, subjectToAdd];
        }

        handleSaveData({ mata_pelajaran: updatedSubjects });
    };

    const handleDeleteSubject = (id) => {
        const updatedSubjects = subjects.filter(s => s.id !== id);
        handleSaveData({ mata_pelajaran: updatedSubjects });
    };

    const handleEditSubject = (subject) => {
        setNewSubject(subject);
        setIsEditingSubject(true);
    };

    // --- QUESTION MANAGEMENT (Nested in Subject) ---
    const handleAddQuestion = (tipesoal = 'pilihan_ganda') => {
        const newQuestion = {
            id: Date.now(),
            pertanyaan: "Pertanyaan Baru",
            tipe: tipesoal
        };

        if (tipesoal === 'pilihan_ganda') {
            newQuestion.pilihan = [
                { id: "A", text: "Pilihan A" },
                { id: "B", text: "Pilihan B" },
                { id: "C", text: "Pilihan C" },
                { id: "D", text: "Pilihan D" }
            ];
            newQuestion.jawaban_benar = "A";
        } else {
            // Essay question
            newQuestion.rubrik_penilaian = "Penilaian berdasarkan: 1) Kelengkapan jawaban, 2) Kebenaran konsep, 3) Tata bahasa";
        }

        setNewSubject({ ...newSubject, soal: [...newSubject.soal, newQuestion] });
    };

    const handleUpdateQuestion = (qIndex, field, value) => {
        const updatedSoal = [...newSubject.soal];
        updatedSoal[qIndex][field] = value;
        setNewSubject({ ...newSubject, soal: updatedSoal });
    };

    const handleUpdateOption = (qIndex, optIndex, value) => {
        const updatedSoal = [...newSubject.soal];
        updatedSoal[qIndex].pilihan[optIndex].text = value;
        setNewSubject({ ...newSubject, soal: updatedSoal });
    };

    const handleDeleteQuestion = (qIndex) => {
        const updatedSoal = newSubject.soal.filter((_, i) => i !== qIndex);
        setNewSubject({ ...newSubject, soal: updatedSoal });
    };


    // --- USER MANAGEMENT ---
    const [isEditingUser, setIsEditingUser] = useState(false);

    const handleAddUser = () => {
        // Generate UUID for new user if not editing
        const id = isEditingUser ? newUser.id : (crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`);
        const userToAdd = {
            ...newUser,
            id,
            mata_pelajaran: typeof newUser.mata_pelajaran === 'string'
                ? newUser.mata_pelajaran.split(',').map(Number)
                : newUser.mata_pelajaran
        };

        let updatedUsers;
        if (isEditingUser) {
            updatedUsers = users.map(u => u.id === id ? userToAdd : u);
        } else {
            updatedUsers = [...users, userToAdd];
        }

        handleSaveData({ pengguna: updatedUsers });
    };

    const handleEditUser = (user) => {
        setNewUser({
            ...user,
            kelas: user.kelas || '',
            mata_pelajaran: Array.isArray(user.mata_pelajaran) ? user.mata_pelajaran.join(',') : user.mata_pelajaran
        });
        setIsEditingUser(true);
    };

    const handleDeleteUser = (id) => {
        const updatedUsers = users.filter(u => u.id !== id);
        handleSaveData({ pengguna: updatedUsers });
    };

    // Calculate Stats
    const stats = {
        totalSubjects: subjects.length,
        totalUsers: users.length,
        totalResults: results.length,
        recentActivity: results.slice(0, 5)
    };

    // Helper to get username
    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.username : userId;
    };

    return (
        <div className="admin-container">
            {/* Mobile Bottom Navigation */}
            <div className="mobile-nav">
                <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>🏠<br />Home</button>
                <button className={activeTab === 'subjects' ? 'active' : ''} onClick={() => setActiveTab('subjects')}>📚<br />Mapel</button>
                <button className={activeTab === 'add-questions' ? 'active' : ''} onClick={() => setActiveTab('add-questions')}>➕<br />Soal</button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>👥<br />User</button>
                <button className={activeTab === 'results' ? 'active' : ''} onClick={() => setActiveTab('results')}>📊<br />Hasil</button>
            </div>

            <div className="admin-header">
                <div>
                    <h2>Panel Admin 🛠️</h2>
                    <p>Kelola ujian dengan mudah dan menyenangkan!</p>
                </div>
                <button className="btn-secondary" onClick={onLogout}>Keluar 🚪</button>
            </div>

            {/* Desktop Tabs (Hidden on Mobile) */}
            <div className="admin-tabs desktop-only">
                <button className={activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                <button className={activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('subjects')}>Kelola Mapel</button>
                <button className={activeTab === 'add-questions' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('add-questions')}>Tambah Soal JSON</button>
                <button className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('users')}>Kelola User</button>
                <button className={activeTab === 'import' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('import')}>Import Mapel Baru</button>
                <button className={activeTab === 'results' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('results')}>Lihat Hasil</button>
            </div>

            {activeTab === 'dashboard' && (
                <div className="dashboard-overview">
                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <h3>📚 Mapel</h3>
                            <div className="stat-number">{stats.totalSubjects}</div>
                        </div>
                        <div className="stat-card pink">
                            <h3>👥 Siswa</h3>
                            <div className="stat-number">{stats.totalUsers}</div>
                        </div>
                        <div className="stat-card yellow">
                            <h3>📝 Ujian</h3>
                            <div className="stat-number">{stats.totalResults}</div>
                        </div>
                    </div>

                    <div className="recent-activity">
                        <h3>Aktivitas Terbaru</h3>
                        {stats.recentActivity.length === 0 ? (
                            <p>Belum ada aktivitas ujian.</p>
                        ) : (
                            <div className="activity-list">
                                {stats.recentActivity.map((r, i) => (
                                    <div key={i} className="activity-item">
                                        <span className="activity-icon">✅</span>
                                        <div>
                                            <strong>{getUserName(r.userId)}</strong> mengerjakan <strong>{r.subjectName}</strong>
                                            <br />
                                            <small>Nilai: {r.score} • {new Date(r.date).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'add-questions' && (
                <div>
                    <div className="form-section">
                        <h3>➕ Tambah Soal ke Mata Pelajaran yang Sudah Ada</h3>
                        <p>Pilih mata pelajaran, lalu paste array soal dalam format JSON untuk menambahkan soal baru.</p>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Pilih Mata Pelajaran:
                            </label>
                            <select
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #eee' }}
                            >
                                <option value="">-- Pilih Mata Pelajaran --</option>
                                {subjects.map(sub => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.nama} - {sub.kelas} (ID: {sub.id}) - {sub.soal.length} soal
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Array Soal (JSON):
                        </label>
                        <textarea
                            className="json-input"
                            placeholder='[{"pertanyaan": "...", "pilihan": [...], "jawaban_benar": "A"}, {"tipe": "isian", "pertanyaan": "...", "rubrik_penilaian": "..."}]'
                            value={questionsJson}
                            onChange={(e) => setQuestionsJson(e.target.value)}
                            rows={12}
                        />

                        <div style={{ marginTop: '1rem' }}>
                            <button
                                className="btn-primary"
                                disabled={!selectedSubjectId}
                                onClick={() => {
                                    if (!selectedSubjectId) {
                                        addToast('Pilih mata pelajaran terlebih dahulu!', 'error');
                                        return;
                                    }

                                    try {
                                        const newQuestions = JSON.parse(questionsJson);

                                        if (!Array.isArray(newQuestions)) {
                                            addToast('JSON harus berupa array soal!', 'error');
                                            return;
                                        }

                                        // Find the subject
                                        const subject = subjects.find(s => s.id === parseInt(selectedSubjectId));
                                        if (!subject) {
                                            addToast('Mata pelajaran tidak ditemukan!', 'error');
                                            return;
                                        }

                                        // Get the current max question ID
                                        const maxId = subject.soal.length > 0
                                            ? Math.max(...subject.soal.map(q => q.id))
                                            : 0;

                                        // Process new questions
                                        const processedQuestions = newQuestions.map((q, idx) => {
                                            const baseQ = {
                                                ...q,
                                                id: q.id || (maxId + idx + 1),
                                                tipe: q.tipe || 'pilihan_ganda'
                                            };

                                            // Only process pilihan for multiple choice
                                            if (q.pilihan && Array.isArray(q.pilihan)) {
                                                baseQ.pilihan = q.pilihan.map((p, pIdx) => ({
                                                    ...p,
                                                    id: p.id || String.fromCharCode(65 + pIdx)
                                                }));
                                            }

                                            return baseQ;
                                        });

                                        // Update the subject with new questions
                                        const updatedSubject = {
                                            ...subject,
                                            soal: [...subject.soal, ...processedQuestions]
                                        };

                                        // Update all subjects
                                        const updatedSubjects = subjects.map(s =>
                                            s.id === parseInt(selectedSubjectId) ? updatedSubject : s
                                        );

                                        handleSaveData({ mata_pelajaran: updatedSubjects });
                                        setQuestionsJson('');
                                        setSelectedSubjectId('');
                                        addToast(`Berhasil menambahkan ${processedQuestions.length} soal ke ${subject.nama}!`, 'success');
                                    } catch (e) {
                                        addToast('Error parsing JSON: ' + e.message, 'error');
                                    }
                                }}
                            >
                                Tambahkan Soal
                            </button>
                        </div>

                        <div className="json-example" style={{ marginTop: '2rem' }}>
                            <h4>📝 Contoh Format JSON:</h4>
                            <pre>
                                {`[
  {
    "pertanyaan": "Apa ibu kota Indonesia?",
    "pilihan": [
      {"text": "Bandung"},
      {"text": "Jakarta"},
      {"text": "Surabaya"},
      {"text": "Medan"}
    ],
    "jawaban_benar": "B"
  },
  {
    "tipe": "isian",
    "pertanyaan": "Jelaskan mengapa Jakarta menjadi ibu kota Indonesia!",
    "rubrik_penilaian": "Penilaian berdasarkan: 1) Menyebutkan alasan historis, 2) Menjelaskan faktor geografis, 3) Tata bahasa yang baik"
  }
]`}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'import' && (
                <div>
                    <div className="form-section">
                        <h3>Import Soal dari JSON</h3>
                        <p>Paste JSON yang didapat dari AI lain di sini. Format harus sesuai contoh di bawah.</p>
                        <textarea
                            className="json-input"
                            placeholder='{"nama": "Sejarah", "kelas": "Kelas 4", "soal": [...]}'
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                        />
                        <div style={{ marginTop: '1rem' }}>
                            <button className="btn-primary" onClick={() => {
                                try {
                                    const parsed = JSON.parse(jsonInput);
                                    // Handle single subject or array of subjects
                                    const newSubjects = Array.isArray(parsed) ? parsed : [parsed];

                                    // Validate basic structure
                                    if (!newSubjects[0].nama || !newSubjects[0].soal) {
                                        addToast("Format JSON tidak valid! Pastikan ada 'nama' dan 'soal'.", 'error');
                                        return;
                                    }

                                    // Assign IDs if missing
                                    const subjectsToSave = newSubjects.map(s => ({
                                        ...s,
                                        id: s.id || Date.now() + Math.floor(Math.random() * 1000),
                                        kelas: s.kelas || "Umum",
                                        soal: s.soal.map((q, idx) => {
                                            const baseQ = {
                                                ...q,
                                                id: q.id || idx + 1,
                                                tipe: q.tipe || 'pilihan_ganda'
                                            };

                                            // Only process pilihan for multiple choice questions
                                            if (q.pilihan && Array.isArray(q.pilihan)) {
                                                baseQ.pilihan = q.pilihan.map((p, pIdx) => ({
                                                    ...p,
                                                    id: p.id || String.fromCharCode(65 + pIdx) // A, B, C...
                                                }));
                                            }

                                            return baseQ;
                                        })
                                    }));

                                    const updatedSubjects = [...subjects, ...subjectsToSave];
                                    handleSaveData({ mata_pelajaran: updatedSubjects });
                                    setJsonInput('');
                                    addToast("Berhasil import " + subjectsToSave.length + " mata pelajaran!", 'success');
                                } catch (e) {
                                    addToast("Error parsing JSON: " + e.message, 'error');
                                }
                            }}>Import JSON</button>
                        </div>

                        <div className="json-example">
                            <h4>Contoh Format JSON (Copy ini ke AI):</h4>
                            <pre>
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
                </div>
            )}

            {activeTab === 'subjects' && (
                <div>
                    <div className="form-section">
                        <h3>{isEditingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</h3>
                        <div className="admin-grid-3">
                            <input
                                placeholder="ID (Angka)"
                                value={newSubject.id}
                                onChange={e => setNewSubject({ ...newSubject, id: e.target.value })}
                                disabled={isEditingSubject}
                            />
                            <input
                                placeholder="Nama Pelajaran"
                                value={newSubject.nama}
                                onChange={e => setNewSubject({ ...newSubject, nama: e.target.value })}
                            />
                            <input
                                placeholder="Kelas (misal: Kelas 1)"
                                value={newSubject.kelas}
                                onChange={e => setNewSubject({ ...newSubject, kelas: e.target.value })}
                            />
                        </div>

                        <h4 style={{ marginTop: '1rem' }}>Soal ({newSubject.soal.length})</h4>
                        {newSubject.soal.map((q, qIndex) => (
                            <div key={qIndex} className="question-edit-card">
                                <div className="question-row">
                                    <select
                                        value={q.tipe || 'pilihan_ganda'}
                                        onChange={e => handleUpdateQuestion(qIndex, 'tipe', e.target.value)}
                                        style={{ padding: '0.5rem', width: '150px' }}
                                    >
                                        <option value="pilihan_ganda">Pilihan Ganda</option>
                                        <option value="isian">Essay/Isian</option>
                                    </select>
                                    <input
                                        style={{ flex: 1 }}
                                        value={q.pertanyaan}
                                        onChange={e => handleUpdateQuestion(qIndex, 'pertanyaan', e.target.value)}
                                        placeholder="Pertanyaan"
                                    />
                                    <button className="btn-secondary delete-btn" onClick={() => handleDeleteQuestion(qIndex)}>Hapus</button>
                                </div>

                                {(q.tipe === 'isian') ? (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <textarea
                                            value={q.rubrik_penilaian || ''}
                                            onChange={e => handleUpdateQuestion(qIndex, 'rubrik_penilaian', e.target.value)}
                                            placeholder="Rubrik Penilaian AI (wajib untuk soal essay): Misal: Penilaian berdasarkan: 1) Kelengkapan, 2) Kebenaran, 3) Tata bahasa"
                                            rows={3}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '2px solid #eee' }}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        {q.pilihan && q.pilihan.length > 0 && (
                                            <>
                                                <div className="options-edit-grid">
                                                    {q.pilihan.map((opt, optIndex) => (
                                                        <input
                                                            key={opt.id}
                                                            value={opt.text}
                                                            onChange={e => handleUpdateOption(qIndex, optIndex, e.target.value)}
                                                            placeholder={`Pilihan ${opt.id}`}
                                                        />
                                                    ))}
                                                </div>
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <label style={{ marginRight: '0.5rem' }}>Jawaban Benar:</label>
                                                    <select
                                                        value={q.jawaban_benar}
                                                        onChange={e => handleUpdateQuestion(qIndex, 'jawaban_benar', e.target.value)}
                                                        style={{ padding: '0.5rem' }}
                                                    >
                                                        {q.pilihan.map(opt => <option key={opt.id} value={opt.id}>{opt.id}</option>)}
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                        <div className="button-group">
                            <button className="btn-secondary" onClick={() => handleAddQuestion('pilihan_ganda')}>+ Soal Pilihan Ganda</button>
                            <button className="btn-secondary" onClick={() => handleAddQuestion('isian')}>+ Soal Essay</button>
                            <button className="btn-primary" onClick={handleAddSubject}>{isEditingSubject ? 'Simpan Perubahan' : 'Simpan Mata Pelajaran'}</button>
                            {isEditingSubject && <button className="btn-secondary" onClick={() => { setIsEditingSubject(false); setNewSubject({ id: '', nama: '', kelas: '', soal: [] }); }}>Batal</button>}
                        </div>
                    </div>

                    <h3>Daftar Mata Pelajaran</h3>
                    {subjects.map(sub => (
                        <div key={sub.id} className="list-item">
                            <div>
                                <strong>{sub.nama}</strong> - {sub.kelas} (ID: {sub.id})
                                <br />
                                <small>{sub.soal.length} Soal</small>
                            </div>
                            <div className="action-buttons">
                                <button className="btn-secondary" onClick={() => handleEditSubject(sub)}>Edit & Soal</button>
                                <button className="btn-secondary delete-btn" onClick={() => handleDeleteSubject(sub.id)}>Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'users' && (
                <div>
                    <div className="form-section">
                        <h3>{isEditingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
                        <div className="admin-grid-4">
                            {/* ID Input Removed - Auto Generated */}
                            <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                            <input placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px' }}>
                                <option value="siswa">Siswa</option>
                                <option value="admin">Admin</option>
                                <option value="pengawas">Pengawas</option>
                            </select>
                            {newUser.role === 'siswa' && (
                                <input
                                    placeholder="Kelas (misal: Kelas 1)"
                                    value={newUser.kelas}
                                    onChange={e => setNewUser({ ...newUser, kelas: e.target.value })}
                                />
                            )}
                        </div>
                        <input
                            placeholder="ID Mata Pelajaran (pisahkan dengan koma, misal: 1,2)"
                            value={newUser.mata_pelajaran}
                            onChange={e => setNewUser({ ...newUser, mata_pelajaran: e.target.value })}
                            style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }}
                        />
                        <div className="button-group" style={{ marginTop: '1rem' }}>
                            <button className="btn-primary" onClick={handleAddUser}>{isEditingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}</button>
                            {isEditingUser && <button className="btn-secondary" onClick={() => { setIsEditingUser(false); setNewUser({ id: '', username: '', password: '', role: 'siswa', kelas: '', mata_pelajaran: [] }); }}>Batal</button>}
                        </div>
                    </div>

                    <h3>Daftar Pengguna</h3>
                    <div className="table-responsive">
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Kelas</th>
                                    <th>Mata Pelajaran (ID)</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.username}</td>
                                        <td>{u.role}</td>
                                        <td>{u.kelas || '-'}</td>
                                        <td>{Array.isArray(u.mata_pelajaran) ? u.mata_pelajaran.join(', ') : u.mata_pelajaran}</td>
                                        <td>
                                            <button onClick={() => handleEditUser(u)} style={{ marginRight: '0.5rem', cursor: 'pointer' }}>Edit</button>
                                            <button onClick={() => handleDeleteUser(u.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'results' && (
                <div className="table-responsive">
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Siswa</th>
                                <th>Mata Pelajaran</th>
                                <th>Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={i}>
                                    <td>{new Date(r.date).toLocaleString()}</td>
                                    <td>{getUserName(r.userId)}</td>
                                    <td>{r.subjectName}</td>
                                    <td>{r.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Admin;
