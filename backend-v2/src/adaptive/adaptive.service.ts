import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdaptiveService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    /** Ambil skill tree mapel (urut by level) */
    async getSkillTree(subjectId: string) {
        const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) throw new NotFoundException('Mapel tidak ditemukan');
        const skills = await this.prisma.skillNode.findMany({
            where: { subjectId },
            orderBy: [{ level: 'asc' }, { urutan: 'asc' }],
        });
        return {
            subject: { id: subject.id, nama: subject.nama, kelas: subject.kelas },
            skills,
        };
    }

    /** Ambil progress siswa per mapel (buat kalau belum ada) */
    async getProgress(userId: string, subjectId: string) {
        const progress = await this.prisma.studentProgress.findUnique({
            where: { userId_subjectId: { userId, subjectId } },
        });
        if (progress) return progress;
        // Buat progress baru: mulai dari level kelas siswa (atau 3 default)
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const kelasMap: Record<string, number> = {
            'TK': 0, 'Kelas 1': 1, 'Kelas 2': 2, 'Kelas 3': 3, 'Kelas 4': 4, 'Kelas 5': 5, 'Kelas 6': 6,
        };
        const startLevel = kelasMap[user?.kelas || ''] ?? 3;
        return this.prisma.studentProgress.create({
            data: { userId, subjectId, level: startLevel },
        });
    }

    /** AI generate soal assessment untuk level tertentu */
    private async aiGenerateQuestions(subjectName: string, skill: any, count: number = 3) {
        const apiUrl = this.configService.get<string>('PECUT_AI_URL') || 'https://llm.mfah.me/v1/chat/completions';
        const apiToken = this.configService.get<string>('PECUT_AI_TOKEN');
        if (!apiToken) throw new BadRequestException('AI service not configured');

        const prompt = `Kamu adalah pembuat soal untuk anak SD Indonesia.
Buat ${count} soal pilihan ganda untuk mata pelajaran ${subjectName}, level ${skill.level === 0 ? 'TK' : `Kelas ${skill.level}`}, topik: "${skill.nama}" (${skill.deskripsi}).
Soal harus ramah anak, bahasa sederhana, sesuai kemampuan level itu.
Untuk soal matematika, gunakan format LaTeX untuk rumus (contoh: $5 \\times 3 = ?$).
JAWAB HANYA JSON array, format tiap soal:
{"pertanyaan": "...", "pilihan": {"A": "...", "B": "...", "C": "...", "D": "..."}, "jawaban_benar": "A", "penjelasan": "singkat"}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`,
                },
                body: JSON.stringify({
                    model: 'pecut-ai',
                    messages: [
                        { role: 'system', content: 'Kamu adalah guru SD Indonesia. Selalu jawab JSON valid tanpa markdown.' },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.7,
                    max_tokens: 8000,
                    stream: false,
                }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                throw new Error(`AI API ${response.status}: ${errText.substring(0, 200)}`);
            }

            const data = await response.json();
            const message = data.choices?.[0]?.message;
            let content = message?.content;
            if (!content && message?.reasoning_content) content = message.reasoning_content;
            if (!content) throw new Error('Empty AI response');

            const jsonText = content.trim()
                .replace(/^```json?\s*/i, '')
                .replace(/```\s*$/, '')
                .trim();
            const questions = JSON.parse(jsonText);
            if (!Array.isArray(questions)) throw new Error('Invalid response format');
            return questions.slice(0, count);
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /** Mulai assessment: generate 3 soal level saat ini */
    async startAssessment(userId: string, subjectId: string) {
        const progress = await this.getProgress(userId, subjectId);
        const skill = await this.getCurrentSkill(subjectId, progress.level);
        const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });

        const questions = await this.aiGenerateQuestions(subject?.nama || 'Matematika', skill, 3);
        return {
            level: progress.level,
            levelLabel: progress.level === 0 ? 'TK' : `Kelas ${progress.level}`,
            skill: { id: skill.id, nama: skill.nama },
            questions: questions.map((q: any, i: number) => ({ ...q, nomor: i + 1 })),
        };
    }

    /** Skill pertama yang belum dikuasai di level tertentu */
    private async getCurrentSkill(subjectId: string, level: number) {
        const skills = await this.prisma.skillNode.findMany({
            where: { subjectId, level },
            orderBy: { urutan: 'asc' },
        });
        if (skills.length === 0) {
            // Fallback: skill level terdekat di bawah
            const any = await this.prisma.skillNode.findFirst({
                where: { subjectId },
                orderBy: { urutan: 'asc' },
            });
            if (!any) throw new NotFoundException('Skill tree belum tersedia untuk mapel ini');
            return any;
        }
        return skills[0];
    }

    /** Submit jawaban assessment → naik/turun level */
    async submitAssessment(userId: string, subjectId: string, answers: any[]) {
        const progress = await this.getProgress(userId, subjectId);
        const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });

        const total = answers.length;
        const correct = answers.filter(a => a.jawaban === a.jawaban_benar).length;
        const skor = total > 0 ? Math.round((correct / total) * 100) : 0;

        let naik = false, turun = false;
        // ≥2 benar dari 3 → kuasai skill & naik
        if (correct >= 2 && total >= 3) {
            // Tandai skill level saat ini dikuasai
            const skillsLevel = await this.prisma.skillNode.findMany({
                where: { subjectId, level: progress.level },
            });
            const baruMastered = [...(progress.mastered || [])];
            for (const s of skillsLevel) {
                if (!baruMastered.includes(s.id)) baruMastered.push(s.id);
            }
            const stars = progress.stars + skillsLevel.length;

            // Naik 1 level (max 6) — tapi tidak lebih tinggi dari kelas asli siswa? Naik terus sampai 6.
            const newLevel = Math.min(6, progress.level + 1);
            naik = newLevel !== progress.level;

            await this.prisma.studentProgress.update({
                where: { id: progress.id },
                data: {
                    level: newLevel,
                    mastered: baruMastered,
                    stars,
                    currentSkillId: '',
                    history: [...(Array.isArray(progress.history) ? progress.history : []), { date: new Date().toISOString(), level: progress.level, skor }],
                },
            });
        } else if (correct < 2) {
            // Turun 1 level (min 0 = TK)
            const newLevel = Math.max(0, progress.level - 1);
            turun = newLevel !== progress.level;

            await this.prisma.studentProgress.update({
                where: { id: progress.id },
                data: {
                    level: newLevel,
                    currentSkillId: '',
                    history: [...(Array.isArray(progress.history) ? progress.history : []), { date: new Date().toISOString(), level: progress.level, skor }],
                },
            });
        }

        // Simpan juga sebagai Result biasa (riwayat ujian)
        try {
            await this.prisma.result.create({
                data: {
                    userId,
                    subjectId,
                    subjectName: subject?.nama || 'Matematika',
                    score: skor,
                    correctCount: correct,
                    totalQuestions: total,
                    questions: answers.map(a => ({ pertanyaan: a.pertanyaan, jawaban: a.jawaban, jawaban_benar: a.jawaban_benar, penjelasan: a.penjelasan })),
                    results: answers,
                    date: new Date(),
                },
            });
        } catch (e) {
            console.error('Gagal simpan result assessment:', e);
        }

        return {
            skor,
            correct,
            total,
            level: progress.level,
            levelLabel: progress.level === 0 ? 'TK' : `Kelas ${progress.level}`,
            naik,
            turun,
            message: naik
                ? 'Hebat! Kamu menguasai level ini. Naik ke level berikutnya! 🎉'
                : turun
                    ? 'Tidak apa-apa! Kita turun satu level dulu, belajar dari dasar. 💪'
                    : 'Level kamu tetap. Terus berlatih!',
        };
    }
}
