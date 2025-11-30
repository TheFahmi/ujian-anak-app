import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Login.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    // Load saved credentials on mount
    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        const savedPassword = localStorage.getItem('rememberedPassword');
        if (savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                // Handle Remember Me
                if (rememberMe) {
                    localStorage.setItem('rememberedUsername', username);
                    localStorage.setItem('rememberedPassword', password);
                } else {
                    localStorage.removeItem('rememberedUsername');
                    localStorage.removeItem('rememberedPassword');
                }

                onLogin(data.user);
                addToast(`Hore! Selamat datang ${data.user.username}! 🎉`, 'success');

                // Redirect based on role
                if (data.user.role === 'admin' || data.user.role === 'pengawas') {
                    navigate('/dashboard/admin');
                } else {
                    navigate('/dashboard/siswa');
                }
            } else {
                setError(data.message || 'Yah, login gagal! Coba lagi ya 😊');
                addToast('Username atau password salah nih!', 'error');
            }
        } catch (err) {
            setError('Waduh, servernya lagi sibuk! Coba lagi nanti ya 🙏');
            addToast('Gagal terhubung ke server', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-brand">
                    <h1>Ujian Seru! 🎓✨</h1>
                    <p>Platform ujian yang bikin belajar jadi lebih menyenangkan! Yuk gabung sekarang!</p>
                </div>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Hai Kawan! 👋</h2>
                        <p>Yuk masuk dulu biar bisa mulai!</p>
                    </div>

                    {error && <div className="error-message">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Username Kamu</label>
                            <input
                                type="text"
                                className="form-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Tulis username di sini"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password Kamu</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Tulis password di sini"
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? '🙈' : '🐵'}
                                </button>
                            </div>
                        </div>

                        <div className="remember-me-wrapper">
                            <label className="remember-me-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="remember-me-checkbox"
                                />
                                <span>Inget aku ya! 💭</span>
                            </label>
                        </div>

                        <button type="submit" className="btn-login-submit" disabled={loading}>
                            {loading ? '⏳ Tunggu sebentar...' : '🚀 Yuk Masuk!'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
