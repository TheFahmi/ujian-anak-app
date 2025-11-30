import React, { useState, useEffect } from 'react';

const StudentHistory = ({ user }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const resultsRes = await fetch(`/api/results/${user.id}`);
                const resultsData = await resultsRes.json();
                setResults(resultsData);
            } catch (err) {
                console.error('Error fetching results:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [user.id]);

    if (loading) {
        return (
            <div className="student-history-container">
                <div className="section-title">
                    <div className="skeleton skeleton-title" style={{ width: '40%', margin: '0 auto 1rem' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '60%', margin: '0 auto' }}></div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="skeleton skeleton-row" style={{ height: '40px' }}></div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton skeleton-row"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(results.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="student-history-container">
            <div className="section-title">
                <h3>🏆 Hasil Ujian Kamu</h3>
                <p>Lihat pencapaian belajarmu di sini!</p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                {results.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📝</span>
                        <p>Belum ada hasil ujian. Ayo kerjakan soal! 💪</p>
                    </div>
                ) : (
                    <>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Tanggal</th>
                                    <th style={{ padding: '1rem' }}>Mata Pelajaran</th>
                                    <th style={{ padding: '1rem' }}>Nilai</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '1rem' }}>{new Date(r.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{r.subjectName}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                background: r.score >= 70 ? 'var(--success-color)' : '#FF6B6B',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontWeight: 'bold'
                                            }}>
                                                {r.score}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {r.score >= 70 ? 'Lulus 🎉' : 'Belajar Lagi 💪'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        background: currentPage === 1 ? '#f5f5f5' : 'white',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    ⬅️ Prev
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                    <button
                                        key={number}
                                        onClick={() => handlePageChange(number)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            background: currentPage === number ? 'var(--primary-color)' : 'white',
                                            color: currentPage === number ? 'white' : 'black',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {number}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        background: currentPage === totalPages ? '#f5f5f5' : 'white',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Next ➡️
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentHistory;
