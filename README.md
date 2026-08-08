# Ujian Anak App

Platform ujian online untuk siswa SD dengan AI companion dan fitur anti-cheat.

## Features

### Student (Siswa)
- **Ujian Online**: Multiple choice & essay questions
- **AI Teman Belajar**: Pilih companion AI dengan karakter berbeda
  - Detective (Investigasi & analisis)
  - Scientist (Eksperimen & logika)
  - Artist (Kreativitas & visual)
  - Athlete (Motivasi & semangat)
- **Anti-Cheat**: Browser lock, tab switch detection, face detection
- **Real-time Results**: Instant feedback setelah submit

### Admin
- **Kelola Mata Pelajaran**: CRUD subjects dengan inline UX
- **Generate Soal AI**: Auto-generate PG & Essay via AI (pecut-ai)
- **Kelola Pengguna**: Manage users (admin/pengawas/guru/orangtua/siswa)
- **Detail Siswa**: History nilai lengkap per siswa
- **Lazy Load**: Efficient data fetching untuk ribuan records
- **Token Usage**: Monitor AI token consumption

### Guardian (Orangtua)
- **Monitor Anak**: Track progress & nilai
- **History Ujian**: View complete exam history

## Tech Stack

**Frontend:**
- Next.js 16 (React)
- TypeScript
- Tailwind CSS v4
- i18next (Indonesian/English)

**Backend:**
- NestJS
- MongoDB (Mongoose)
- JWT Authentication

**AI Integration:**
- pecut-ai (llm.mfah.me) — deepseek-v4-flash-free
- RAG unlimited reply dengan tools

**Infrastructure:**
- Docker Compose
- Oracle ARM Ubuntu
- Cloudflare

## Installation

### Prerequisites
- Docker & Docker Compose
- Node.js 22+
- MongoDB

### Environment Variables

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/ujian
JWT_SECRET=your_jwt_secret
PECUT_AI_URL=https://llm.mfah.me
PECUT_AI_TOKEN=your_token
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
ENCRYPTION_KEY=your_32_char_key
```

### Development

```bash
# Clone repository
git clone https://github.com/TheFahmi/ujian-anak-app.git
cd ujian-anak-app

# Backend
cd backend-v2
npm install
npm run start:dev

# Frontend
cd ../frontend-v2
npm install
npm run dev
```

### Production (Docker)

```bash
# Build & run
docker compose build
docker compose up -d

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## Project Structure

```
ujian-anak-app/
├── backend-v2/          # NestJS backend
│   ├── src/
│   │   ├── admin/       # Admin endpoints
│   │   ├── auth/        # Authentication
│   │   ├── results/     # Exam results
│   │   ├── subjects/    # Subject management
│   │   └── schemas/     # MongoDB schemas
│   └── Dockerfile
├── frontend-v2/         # Next.js frontend
│   ├── src/
│   │   ├── app/         # App router pages
│   │   ├── components/  # React components
│   │   ├── context/     # React context
│   │   └── lib/         # Utilities
│   └── Dockerfile
└── docker-compose.yml
```

## API Endpoints

### Authentication
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register

### Admin
- `GET /api/admin/subjects` — List subjects
- `POST /api/admin/subjects` — Create subject
- `PUT /api/admin/subjects/:id` — Update subject
- `DELETE /api/admin/subjects/:id` — Delete subject
- `GET /api/admin/users` — List users
- `GET /api/admin/results` — List results
- `POST /api/admin/generate-questions` — AI generate questions

### Results
- `GET /api/results/:userId` — User exam history
- `POST /api/results` — Submit exam

## Features in Detail

### AI Question Generation
- Generate multiple choice (4 options)
- Generate essay questions
- Auto-assign UUID v4 to questions
- Timeout 120 seconds
- Kelas 1-6 SD compatible

### Anti-Cheat System
- Browser full-screen lock
- Tab switch counter
- Face detection via webcam
- Cheat count tracked in results

### Lazy Load Admin
- Initial load: no data fetch (fast)
- Per-tab fetch on-demand
- Cache per resource
- Efficient for thousands of records

## Default Credentials

**Admin:**
- Username: `admin`
- Password: `gatauu123`

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push branch (`git push origin feature/amazing`)
5. Open Pull Request

## License

Private — internal use only.

## Live Demo

**Production:** https://temanujian.mfah.me

## Support

Issues: https://github.com/TheFahmi/ujian-anak-app/issues
