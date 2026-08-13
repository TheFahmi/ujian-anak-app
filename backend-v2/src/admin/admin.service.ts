import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { pilihFieldUser, pilihFieldSubject } from '../users/user-fields';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    private asArray(v: any): any[] {
        return Array.isArray(v) ? v : [];
    }

    async getDashboardData() {
        const [users, subjects, results] = await Promise.all([
            this.prisma.user.findMany(),
            this.prisma.subject.findMany(),
            this.prisma.result.findMany({ orderBy: { date: 'desc' }, take: 50 }),
        ]);

        return {
            pengguna: users,
            mata_pelajaran: subjects,
            hasil_ujian: results.map((r) => ({ ...r, _id: r.id })),
        };
    }

    async getSubjects() {
        return this.prisma.subject.findMany();
    }

    async getUsers() {
        return this.prisma.user.findMany();
    }

    async getResults() {
        const results = await this.prisma.result.findMany({ orderBy: { date: 'desc' }, take: 50 });
        return results.map((r) => ({ ...r, _id: r.id }));
    }

    async updateData(data: any) {
        if (data.mata_pelajaran) {
            for (const sub of data.mata_pelajaran) {
                const isi = pilihFieldSubject(sub);
                await this.prisma.subject.upsert({
                    where: { id: sub.id },
                    create: { ...isi, id: sub.id || randomUUID() },
                    update: isi,
                });
            }

            const incomingIds = data.mata_pelajaran.map((s: any) => s.id);
            await this.prisma.subject.deleteMany({ where: { id: { notIn: incomingIds } } });
        }

        if (data.pengguna) {
            for (const user of data.pengguna) {
                const existing = await this.prisma.user.findUnique({ where: { id: user.id } });
                let passwordToSave = user.password;

                if (!existing || (user.password && existing && user.password !== existing.password)) {
                    // It's a new user or password changed
                    // Check if it's already hashed (starts with $2b$)
                    if (!user.password.startsWith('$2b$')) {
                        passwordToSave = await bcrypt.hash(user.password, 10);
                    }
                }

                const isi = { ...pilihFieldUser(user), password: passwordToSave };
                await this.prisma.user.upsert({
                    where: { id: user.id },
                    create: { ...isi, id: user.id || randomUUID(), role: user.role || 'siswa' },
                    update: isi,
                });
            }
            const incomingIds = data.pengguna.map((u: any) => u.id);
            await this.prisma.user.deleteMany({ where: { id: { notIn: incomingIds } } });
        }

        return { success: true, message: 'Data updated successfully' };
    }

    // Add questions to a subject (original backend logic)
    async addQuestions(subjectId: string, questions: any[]) {
        if (!Array.isArray(questions)) {
            throw new BadRequestException('Questions must be an array');
        }

        const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) {
            throw new NotFoundException('Subject not found');
        }
        const soal = this.asArray(subject.soal);

        // Get the current max question ID
        const maxId = soal.length > 0
            ? Math.max(...soal.map(q => q.id))
            : 0;

        // Process new questions
        const processedQuestions = questions.map((q, idx) => {
            const baseQ = {
                ...q,
                id: q.id || (maxId + idx + 1),
                tipe: q.tipe || 'pilihan_ganda'
            };

            // Only process pilihan for multiple choice
            if (q.pilihan && Array.isArray(q.pilihan)) {
                baseQ.pilihan = q.pilihan.map((p: any, pIdx: number) => ({
                    ...p,
                    id: p.id || String.fromCharCode(65 + pIdx)
                }));
            }

            return baseQ;
        });

        // Add new questions to existing questions
        const updated = await this.prisma.subject.update({
            where: { id: subjectId },
            data: { soal: [...soal, ...processedQuestions] },
        });

        return {
            success: true,
            message: `Berhasil menambahkan ${processedQuestions.length} soal ke ${subject.nama}!`,
            subject: updated
        };
    }

    // Add or update shop item (original backend logic)
    async addOrUpdateShopItem(itemData: any) {
        const { id, name, description, cost, type, icon, rarity } = itemData;

        const item = await this.prisma.shopItem.upsert({
            where: { id },
            create: { id, name, description, cost, type, icon, rarity },
            update: { name, description, cost, type, icon, rarity },
        });

        return { success: true, item };
    }

    // Delete shop item (original backend logic)
    async deleteShopItem(id: string) {
        await this.prisma.shopItem.deleteMany({ where: { id } });
        return { success: true };
    }

    // Assign id otomatis (UUID v4) lalu simpan; user tidak perlu isi ID manual
    private async saveSubjectWithAutoId(payload: any) {
        return this.prisma.subject.create({
            data: { ...pilihFieldSubject(payload), id: payload.id || randomUUID() },
        });
    }

    // NEW: Import multiple subjects (only new data, not replace all)
    async importSubjects(subjects: any[]) {
        if (!Array.isArray(subjects)) {
            throw new BadRequestException('Subjects must be an array');
        }

        const importedSubjects: any[] = [];
        for (const sub of subjects) {
            if (!sub.nama || !sub.soal) {
                throw new BadRequestException("Each subject must have 'nama' and 'soal'");
            }

            const subjectToSave = {
                ...sub,
                kelas: sub.kelas || 'Umum',
                soal: sub.soal.map((q: any, idx: number) => {
                    const baseQ: any = {
                        ...q,
                        id: q.id || idx + 1,
                        tipe: q.tipe || 'pilihan_ganda'
                    };
                    if (q.pilihan && Array.isArray(q.pilihan)) {
                        baseQ.pilihan = q.pilihan.map((p: any, pIdx: number) => ({
                            ...p,
                            id: p.id || String.fromCharCode(65 + pIdx)
                        }));
                    }
                    return baseQ;
                })
            };

            const saved = await this.saveSubjectWithAutoId(subjectToSave);
            importedSubjects.push(saved);
        }

        return {
            success: true,
            message: `Berhasil import ${importedSubjects.length} mata pelajaran!`,
            subjects: importedSubjects
        };
    }

    // NEW: Create single subject
    async createSubject(subject: any) {
        if (!subject.nama || !subject.soal) {
            throw new BadRequestException("Subject must have 'nama' and 'soal'");
        }

        const subjectToSave = {
            ...subject,
            kelas: subject.kelas || 'Umum',
            soal: subject.soal.map((q: any, idx: number) => {
                const baseQ: any = {
                    ...q,
                    id: q.id || idx + 1,
                    tipe: q.tipe || 'pilihan_ganda'
                };
                if (q.pilihan && Array.isArray(q.pilihan)) {
                    baseQ.pilihan = q.pilihan.map((p: any, pIdx: number) => ({
                        ...p,
                        id: p.id || String.fromCharCode(65 + pIdx)
                    }));
                }
                return baseQ;
            })
        };

        const saved = await this.saveSubjectWithAutoId(subjectToSave);
        return { success: true, subject: saved };
    }

    // NEW: Delete single subject by ID
    async deleteSubject(id: string) {
        const result = await this.prisma.subject.deleteMany({ where: { id } });
        if (result.count === 0) {
            throw new NotFoundException('Subject not found');
        }
        return { success: true, message: 'Subject deleted' };
    }

    // NEW: Update single subject
    async updateSubject(id: string, subject: any) {
        const existing = await this.prisma.subject.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Subject not found');
        }

        // Process questions if provided
        if (subject.soal) {
            subject.soal = subject.soal.map((q: any, idx: number) => {
                const baseQ: any = {
                    ...q,
                    id: q.id || idx + 1,
                    tipe: q.tipe || 'pilihan_ganda',
                };
                if (q.pilihan && Array.isArray(q.pilihan)) {
                    baseQ.pilihan = q.pilihan.map((p: any, pIdx: number) => ({
                        ...p,
                        id: p.id || String.fromCharCode(65 + pIdx),
                    }));
                }
                return baseQ;
            });
        }

        const isi = pilihFieldSubject(subject);
        delete isi.id;
        const updated = await this.prisma.subject.update({ where: { id }, data: isi });
        return { success: true, subject: updated };
    }

    // ============ USER CRUD (Dedicated) ============

    // Create single user
    async createUser(user: any) {
        if (!user.username || !user.password) {
            throw new BadRequestException('Username and password are required');
        }

        // Generate ID if not provided
        const id = user.id || randomUUID();

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        const saved = await this.prisma.user.create({
            data: {
                ...pilihFieldUser(user),
                id,
                password: hashedPassword,
                role: user.role || 'siswa',
            },
        });
        return { success: true, user: saved };
    }

    // Update single user
    async updateUser(id: string, user: any) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('User not found');
        }

        let passwordToSave = existing.password;

        // Only hash if password changed and not already hashed
        if (user.password && user.password !== existing.password) {
            if (!user.password.startsWith('$2b$')) {
                passwordToSave = await bcrypt.hash(user.password, 10);
            } else {
                passwordToSave = user.password;
            }
        }

        const isi = { ...pilihFieldUser(user), password: passwordToSave };
        delete isi.id;
        const updated = await this.prisma.user.update({ where: { id }, data: isi });
        return { success: true, user: updated };
    }

    // Delete single user
    async deleteUser(id: string) {
        const result = await this.prisma.user.deleteMany({ where: { id } });
        if (result.count === 0) {
            throw new NotFoundException('User not found');
        }
        return { success: true, message: 'User deleted' };
    }

    // Generate questions with AI
    async generateQuestions(topic: string, type: string, count: number) {
        const apiUrl = this.configService.get<string>('PECUT_AI_URL') || 'https://llm.mfah.me/v1/chat/completions';
        const apiToken = this.configService.get<string>('PECUT_AI_TOKEN');

        if (!apiToken) {
            throw new BadRequestException('AI service not configured');
        }

        const promptMap = {
            pilihan_ganda: `Generate ${count} soal pilihan ganda (multiple choice) untuk tingkat SD tentang: ${topic}

PENTING: Jika soal melibatkan rumus matematika (pecahan, akar, pangkat, persamaan), tulis menggunakan format LaTeX yang dibungkus tanda dollar, contoh:
- Pecahan: \\\\( \\\\frac{1}{2} \\\\) atau tulis \\$\\\\frac{1}{2}\\$
- Pangkat: \\$x^2\\$
- Akar: \\$\\\\sqrt{16}\\$
- Soal campuran: "Hitunglah \\$\\\\frac{2}{3} + \\\\frac{1}{6}\\$"
- Perkalian/geometri: "Luas = \\$5 \\\\times 5 = 25\\\\$ cm²" — WAJIB pakai \\$...\\$ dan \\\\times untuk kali, JANGAN tulis "5 x 5" atau "5×5" sebagai teks biasa

PENTING - DIAGRAM: Jika soal tentang BANGUN DATAR / GEOMETRI (persegi, persegi panjang, segitiga, lingkaran, kubus, dll), buat diagram SVG sederhana dan sertakan di field "diagram_svg". Diagram harus:
1. Hanya tag SVG murni (mulai <svg> dan akhiri </svg>), TANPA style, script, atau class
2. Gunakan viewBox="0 0 200 150"
3. Gambar bentuk dengan <rect>, <circle>, <polygon>, <path> atau <line>
4. Label sisi dengan <text> (misal "s = 5 cm"), warna teks gelap (#333)
5. Garis bentuk warna biru (#2563eb) tebal 2-3, area diisi warna terang (misal #dbeafe untuk persegi, #fef3c7 untuk segitiga)
6. Sertakan simbol sudut siku-siku (kotak kecil) jika relevan
7. Maksimal ~15 elemen, sederhana dan jelas untuk anak SD

CONTOH diagram_svg untuk soal persegi (TIRU pola ini, sesuaikan ukuran/teks):
<svg viewBox="0 0 200 150"><rect x="45" y="10" width="110" height="110" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/><text x="100" y="145" text-anchor="middle" font-size="14" fill="#333">s = 5 cm</text><line x1="45" y1="10" x2="155" y2="10" stroke="#333" stroke-width="1" stroke-dasharray="4 3"/><text x="100" y="0" text-anchor="middle" font-size="12" fill="#333">s</text></svg>

Untuk SETIAP soal, tulis penjelasan singkat (1-2 kalimat) yang menjelaskan KENAPA jawaban yang benar itu benar — penjelasan ini akan ditampilkan ke siswa saat mereka menjawab salah. Gunakan LaTeX juga di penjelasan jika perlu. Untuk soal geometri, jelaskan juga rumusnya dalam LaTeX (misal luas = \\$s \\\\times s\\$, keliling = \\$4 \\\\times s\\$).

Format output JSON array (JANGAN tambahkan markdown/backticks):
[
  {
    "pertanyaan": "teks soal (boleh berisi LaTeX dengan tanda dollar)",
    "pilihan": [
      {"id": "A", "text": "pilihan A (boleh LaTeX)"},
      {"id": "B", "text": "pilihan B"},
      {"id": "C", "text": "pilihan C"},
      {"id": "D", "text": "pilihan D"}
    ],
    "jawaban_benar": "A",
    "penjelasan": "penjelasan singkat kenapa jawaban A benar (1-2 kalimat, bahasa anak SD, boleh LaTeX)",
    "diagram_svg": "SVG diagram bangun datar (hanya untuk soal geometri, selain itu null atau hilangkan)",
    "tipe": "pilihan_ganda"
  }
]`,
            isian: `Generate ${count} soal essay untuk tingkat SD tentang: ${topic}

PENTING: Jika soal melibatkan rumus matematika (pecahan, akar, pangkat, persamaan), tulis menggunakan format LaTeX yang dibungkus tanda dollar, contoh:
- Pecahan: \\\\( \\\\frac{1}{2} \\\\) atau tulis \\$\\\\frac{1}{2}\\$
- Pangkat: \\$x^2\\$
- Akar: \\$\\\\sqrt{16}\\$
- Perkalian/geometri: "Luas = \\$5 \\\\times 5 = 25\\$ cm²" — WAJIB pakai \\$...\\$ dan \\\\times untuk kali

PENTING - DIAGRAM: Jika soal tentang BANGUN DATAR / GEOMETRI (persegi, persegi panjang, segitiga, lingkaran, kubus, dll), buat diagram SVG sederhana dan sertakan di field "diagram_svg". Diagram harus:
1. Hanya tag SVG murni (mulai <svg> dan akhiri </svg>), TANPA style, script, atau class
2. Gunakan viewBox="0 0 200 150"
3. Gambar bentuk dengan <rect>, <circle>, <polygon>, <path> atau <line>
4. Label sisi dengan <text> (misal "s = 5 cm"), warna teks gelap (#333)
5. Garis bentuk warna biru (#2563eb) tebal 2-3, area diisi warna terang (misal #dbeafe untuk persegi, #fef3c7 untuk segitiga)
6. Sertakan simbol sudut siku-siku (kotak kecil) jika relevan
7. Maksimal ~15 elemen, sederhana dan jelas untuk anak SD

CONTOH diagram_svg untuk soal persegi (TIRU pola ini, sesuaikan ukuran/teks):
<svg viewBox="0 0 200 150"><rect x="45" y="10" width="110" height="110" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/><text x="100" y="145" text-anchor="middle" font-size="14" fill="#333">s = 5 cm</text></svg>

Untuk SETIAP soal, tulis kunci jawaban (jawaban referensi yang benar) — dipakai AI sebagai acuan menilai jawaban siswa. Gunakan LaTeX di kunci jawaban jika perlu.

Format output JSON array (JANGAN tambahkan markdown/backticks):
[
  {
    "pertanyaan": "teks soal (boleh berisi LaTeX dengan tanda dollar)",
    "rubrik_penilaian": "kriteria penilaian detail",
    "kunci_jawaban": "jawaban referensi yang benar dan lengkap (boleh LaTeX)",
    "diagram_svg": "SVG diagram bangun datar (hanya untuk soal geometri, selain itu null atau hilangkan)",
    "tipe": "isian"
  }
]`
        };

        const prompt = promptMap[type] || promptMap.pilihan_ganda;

        // Upstream (llm.mfah.me) intermittently answers HTTP 200 with an
        // {"error": ...} body ("Worker local total request limit reached")
        // and its latency varies (~3s..90s). Retry, but stay inside a total
        // budget: Cloudflare drops the origin response at ~100s (error 524).
        // ponytail: fire-and-wait with a 90s budget; move to a job queue +
        // polling endpoint if generation regularly needs longer than that.
        const BUDGET_MS = 90_000;
        const deadline = Date.now() + BUDGET_MS;
        const MAX_ATTEMPTS = 3;
        let lastError: unknown;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            const remaining = deadline - Date.now();
            if (remaining < 5000) break;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), remaining);
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiToken}`
                    },
                    body: JSON.stringify({
                        model: 'pecut-ai',
                        messages: [
                            { role: 'system', content: 'Kamu adalah guru SD yang membuat soal. Output HANYA JSON array, tanpa markdown atau penjelasan tambahan.' },
                            { role: 'user', content: prompt }
                        ],
                        temperature: 0.7,
                        max_tokens: 3000
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    console.error('Pecut AI error:', response.status, await response.text());
                    throw new Error(`Pecut AI API error: ${response.status}`);
                }

                const rawText = await response.text();
                console.log('Raw AI response length:', rawText.length);

                if (!rawText || rawText.trim().length === 0) {
                    throw new Error('Empty AI response');
                }

                // Strip data: [DONE] suffix
                const responseText = rawText.replace(/data:\s*\[DONE\]\s*$/, '').trim();

                const data = JSON.parse(responseText);

                // Upstream error delivered with a 200 status code.
                if (data.error) {
                    throw new Error(`Pecut AI upstream error: ${data.error.message || JSON.stringify(data.error)}`);
                }

                const content = data.choices?.[0]?.message?.content;

                if (!content) {
                    throw new Error('Empty AI response');
                }

                // Strip markdown code blocks if present
                const jsonText = content.trim()
                    .replace(/^```json?\s*/i, '')
                    .replace(/```\s*$/, '')
                    .trim();

                const questions = JSON.parse(jsonText);

                if (!Array.isArray(questions)) {
                    throw new Error('Invalid response format');
                }

                // Assign unique IDs
                const questionsWithIds = questions.map((q) => ({
                    ...q,
                    id: randomUUID()
                }));

                return { success: true, questions: questionsWithIds };
            } catch (error) {
                lastError = error;
                console.error(`Generate questions error (attempt ${attempt}/${MAX_ATTEMPTS}):`, error);
                if (attempt < MAX_ATTEMPTS) {
                    await new Promise((r) => setTimeout(r, 2000 * attempt));
                }
            } finally {
                clearTimeout(timeoutId);
            }
        }

        console.error('Generate questions failed after retries:', lastError);
        throw new BadRequestException('Gagal generate soal. Coba lagi.');
    }
}
