import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Icons = {
    RobotGear: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
        </svg>
    ),
    RobotBulb: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19h6"></path>
            <path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
            <path d="M12 15v4"></path>
        </svg>
    ),
    GraduationCap: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
    ),
    Rocket: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.48-.56.93-1.23 1.35-1.95A6 6 0 0 0 23 3z"></path>
            <path d="M8.3 10.7a6 6 0 0 1-.3-4.7"></path>
            <path d="M15 6h2a2 2 0 0 1 2 2v2"></path>
        </svg>
    ),
    Eye: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
             <circle cx="12" cy="12" r="3"></circle>
        </svg>
    ),
    Sparkle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD93D" stroke="none" width="40" height="40">
             <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"></path>
        </svg>
    ),
    Gift: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '5px' }}>
            <polyline points="20 12 20 22 4 22 4 12"></polyline>
            <rect x="2" y="7" width="20" height="5"></rect>
            <line x1="12" y1="22" x2="12" y2="7"></line>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
        </svg>
    )
};

const Home = () => {
    return (
        <div className="home-container">
            <nav className="home-nav">
                <div className="logo">
                    <Icons.GraduationCap /> Ujian Seru!
                </div>
                <div className="nav-links">
                    <Link to="/auth/login" className="nav-btn btn-login">
                        Yuk Masuk! <Icons.Rocket />
                    </Link>
                </div>
            </nav>

            <main className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Belajar Jadi <br />
                        <span className="highlight-text">
                            Lebih Seru!
                            <span className="title-sparkle"><Icons.Sparkle /></span>
                        </span>
                    </h1>
                    <p className="hero-subtitle">
                        Ikuti ujian online yang menyenangkan dengan teman AI yang siap bantu kamu belajar lebih baik!
                        Plus ada hadiah kalau jawabanmu bagus lho! <Icons.Gift />
                    </p>

                    <div className="cta-group">
                        <Link to="/auth/login" className="btn-cta btn-primary-cta">
                            Ayo Mulai! <Icons.Rocket />
                        </Link>
                        <a href="#features" className="btn-cta btn-secondary-cta">
                            Lihat Fitur Keren <Icons.Eye />
                        </a>
                    </div>
                </div>
            </main>

            <section id="features" className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">
                        <Icons.RobotGear />
                    </div>
                    <h3 className="feature-title">Guru AI Keren!</h3>
                    <p className="feature-desc">
                        Setelah ujian, AI Guru akan kasih tau bagian mana yang perlu dipelajari lagi. Kayak punya guru pribadi!
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">
                        <Icons.RobotBulb />
                    </div>
                    <h3 className="feature-title">Bantuan Pintar</h3>
                    <p className="feature-desc">
                        Ada tips dan trik belajar yang disesuaikan dengan caramu. Belajar jadi lebih mudah dan menyenangkan!
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Home;
