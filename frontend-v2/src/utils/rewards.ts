// Reward System Logic - Frontend Definitions
// Logic is now handled by the backend. This file serves as a reference for badge display info.

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export const BADGES: Badge[] = [
    { id: 'first-win', name: 'Pencapaian Pertama', description: 'Menyelesaikan ujian pertamamu', icon: '/images/rewards/first-win.svg' },
    { id: 'perfect-score', name: 'Nilai Sempurna', description: 'Mendapatkan nilai 100', icon: '/images/rewards/perfect-score.svg' },
    { id: 'high-score', name: 'Nilai Tinggi', description: 'Mendapatkan nilai di atas 80', icon: '/images/rewards/high-score.svg' },
    { id: 'math-lover', name: 'Jago Matematika', description: 'Menyelesaikan 3 ujian Matematika', icon: '/images/rewards/math-lover.svg' },
    { id: 'science-geek', name: 'Penjelajah Sains', description: 'Menyelesaikan 3 ujian Sains', icon: '/images/rewards/science-geek.svg' },
    { id: 'history-buff', name: 'Ahli Sejarah', description: 'Menyelesaikan 3 ujian Sejarah', icon: '/images/rewards/history-buff.svg' },
    { id: 'language-pro', name: 'Pujangga Bahasa', description: 'Menyelesaikan 3 ujian Bahasa', icon: '/images/rewards/language-pro.svg' },
    { id: 'speed-demon', name: 'Berpikir Cepat', description: 'Menyelesaikan ujian dalam waktu singkat', icon: '/images/rewards/speed-demon.svg' },
    { id: 'persistence', name: 'Pantang Menyerah', description: 'Mengulang ujian untuk nilai lebih baik', icon: '/images/rewards/persistence.svg' },
    { id: 'streak-7', name: 'Rajin Belajar', description: 'Belajar 7 hari berturut-turut', icon: '/images/rewards/streak-7.svg' },
    { id: 'night-owl', name: 'Belajar Malam', description: 'Menyelesaikan ujian di malam hari', icon: '/images/rewards/night-owl.svg' },
    { id: 'early-bird', name: 'Belajar Pagi', description: 'Menyelesaikan ujian di pagi hari', icon: '/images/rewards/early-bird.svg' },
    { id: 'bookworm', name: 'Kutu Buku', description: 'Menyelesaikan 10 ujian', icon: '/images/rewards/bookworm.svg' },
    { id: 'quiz-master', name: 'Master Kuis', description: 'Menyelesaikan 20 ujian', icon: '/images/rewards/quiz-master.svg' },
    { id: 'coin-collector', name: 'Kolektor Koin', description: 'Mengumpulkan 100 koin', icon: '/images/rewards/coin-collector.svg' },
    { id: 'rich-kid', name: 'Sultan Koin', description: 'Mengumpulkan 500 koin', icon: '/images/rewards/rich-kid.svg' },
    { id: 'helper', name: 'Butuh Bantuan', description: 'Menggunakan bantuan saat ujian', icon: '/images/rewards/helper.svg' },
    { id: 'independent', name: 'Mandiri', description: 'Menyelesaikan ujian tanpa bantuan', icon: '/images/rewards/independent.svg' },
    { id: 'social-butterfly', name: 'Teman Setia', description: 'Memilih teman belajar AI', icon: '/images/rewards/social-butterfly.svg' },
    { id: 'legend', name: 'Legenda', description: 'Membuka semua lencana lain', icon: '/images/rewards/legend.svg' }
];
