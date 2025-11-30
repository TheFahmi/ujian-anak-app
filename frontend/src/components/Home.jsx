import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <nav className="home-nav">
                <div className="logo">
                    <span>🎓</span> Ujian Seru!
                </div>
                <div className="nav-links">
                    <Link to="/auth/login" className="nav-btn btn-login">Yuk Masuk! 🚀</Link>
                </div>
            </nav>

            <main className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Belajar Jadi <br />
                        <span>Lebih Seru!</span> ✨
                    </h1>
                    <p className="hero-subtitle">
                        Ikuti ujian online yang menyenangkan dengan teman AI yang siap bantu kamu belajar lebih baik!
                        Plus ada hadiah kalau jawabanmu bagus lho! 🎁
                    </p>

                    <div className="cta-group">
                        <Link to="/auth/login" className="btn-cta btn-primary-cta">
                            Ayo Mulai! 🎉
                        </Link>
                        <a href="#features" className="btn-cta btn-secondary-cta">
                            Lihat Fitur Keren 👀
                        </a>
                    </div>
                </div>
            </main>

            <section id="features" className="features-grid">
                <div className="feature-card">
                    <span className="feature-icon">🤖✨</span>
                    <h3 className="feature-title">Guru AI Keren!</h3>
                    <p className="feature-desc">
                        Setelah ujian, AI Guru akan kasih tau bagian mana yang perlu dipelajari lagi. Kayak punya guru pribadi!
                    </p>
                </div>
                <div className="feature-card">
                    <span className="feature-icon">🎮👀</span>
                    <h3 className="feature-title">Main Fair ya!</h3>
                    <p className="feature-desc">
                        Ada sistem yang lucu banget! Kalau kamu buka tab lain waktu ujian, bakal ada peringatan lucu, hehe!
                    </p>
                </div>
                <div className="feature-card">
                    <span className="feature-icon">📱💫</span>
                    <h3 className="feature-title">Bisa Di mana Aja!</h3>
                    <p className="feature-desc">
                        Mau pakai HP, tablet, atau laptop? Semua bisa! Tampilannya bagus di semua perangkat kok!
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Home;
