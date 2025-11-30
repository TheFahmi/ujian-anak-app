import React, { useState, useEffect } from 'react';
import StudentHistory from './StudentHistory';

const SubjectSelection = ({ user, onSelectSubject, onLogout }) => {
    const [subjects, setSubjects] = useState([]);
    const [currentClass, setCurrentClass] = useState(user.kelas || '');
    const [activeTab, setActiveTab] = useState('home'); // 'home' or 'history'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get latest user data
                const userRes = await fetch(`/api/user/${user.id}`);
                const userData = await userRes.json();

                if (userData.kelas && !currentClass) {
                    setCurrentClass(userData.kelas);
                }

                // 2. Get subjects filtered by class and with last score
                const queryParams = new URLSearchParams({
                    userId: user.id
                });
                if (userData.kelas) {
                    queryParams.append('kelas', userData.kelas);
                }

                const subjectsRes = await fetch(`/api/subjects?${queryParams}`);
                const subjectsData = await subjectsRes.json();
                setSubjects(subjectsData);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.id, currentClass]);

    const getSubjectIcon = (subjectName) => {
        const lower = subjectName.toLowerCase();
        if (lower.includes('matematika') || lower.includes('math')) return '🧮';
        if (lower.includes('bahasa') || lower.includes('indonesia')) return '📖';
        if (lower.includes('ipa') || lower.includes('sains')) return '🔬';
        if (lower.includes('ips') || lower.includes('sejarah')) return '🌍';
        if (lower.includes('inggris') || lower.includes('english')) return '🅰️';
        return '🎒';
    };

    return (
        <div className="student-dashboard-container" style={{ paddingBottom: '150px' }}>
            {activeTab === 'home' ? (
                <>
                    <div className="dashboard-hero">
                        <div className="hero-content">
                            <h1>Hai, {user.username}! 👋</h1>
                            <p>Siap latihan ujian hari ini?</p>

                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '50px' }}>
                                    {currentClass ? `Kelas: ${currentClass}` : 'Belum ada kelas assigned'}
                                </span>
                                <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Keluar 🚪
                                </button>
                            </div>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-bubble">
                                <span className="stat-icon">⭐</span>
                                <span className="stat-value">Semangat!</span>
                            </div>
                        </div>
                    </div>

                    <div className="section-title">
                        <h3>Daftar Latihan</h3>
                        <p>Pilih mata pelajaran untuk mulai mengerjakan!</p>
                    </div>

                    <div className="subject-grid">
                        {loading ? (
                            // Skeleton Loading for Subjects
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="subject-card skeleton-card skeleton" style={{ border: 'none', cursor: 'default' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '100%' }}>
                                        <div className="skeleton skeleton-circle"></div>
                                        <div style={{ flex: 1 }}>
                                            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                                            <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : subjects.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📭</span>
                                <p>Belum ada ujian tersedia.</p>
                            </div>
                        ) : (
                            subjects.map(sub => (
                                <button
                                    key={sub.id}
                                    className="subject-card"
                                    onClick={() => onSelectSubject(sub.id)}
                                >
                                    <div className="card-icon">{getSubjectIcon(sub.nama)}</div>
                                    <div className="card-info">
                                        <span className="subject-name">{sub.nama}</span>
                                        <span className="subject-class">{sub.kelas || 'Umum'}</span>
                                        {sub.highestScore !== null && sub.highestScore !== undefined && (
                                            <div style={{
                                                marginTop: '0.5rem',
                                                color: sub.highestScore >= 70 ? 'var(--success-color)' : '#FF6B6B',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}>
                                                Nilai Tertinggi: {sub.highestScore}
                                            </div>
                                        )}
                                    </div>
                                    <div className="play-button">
                                        {sub.highestScore !== null && sub.highestScore !== undefined ? 'KERJAKAN ULANG 🔄' : 'MULAI ▶'}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <StudentHistory user={user} />
            )}

            {/* Bottom Navigation */}
            <div className="bottom-nav">
                <button
                    className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveTab('home')}
                >
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Home</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <span className="nav-icon">🏆</span>
                    <span className="nav-label">Hasil</span>
                </button>
            </div>
        </div>
    );
};

export default SubjectSelection;
