import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';
import { Subject, SubjectDocument } from '../schemas/subject.schema';
import { Result, ResultDocument } from '../schemas/result.schema';
import { ShopItem, ShopItemDocument } from '../schemas/shop-item.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
        @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
        @InjectModel(ShopItem.name) private shopItemModel: Model<ShopItemDocument>,
        private configService: ConfigService,
    ) { }

    async getDashboardData() {
        const [users, subjects, results] = await Promise.all([
            this.userModel.find().exec(),
            this.subjectModel.find().exec(),
            this.resultModel.find().sort({ date: -1 }).limit(50).exec(),
        ]);

        return {
            pengguna: users,
            mata_pelajaran: subjects,
            hasil_ujian: results,
        };
    }

    async getSubjects() {
        return this.subjectModel.find().exec();
    }

    async getUsers() {
        return this.userModel.find().exec();
    }

    async getResults() {
        return this.resultModel.find().sort({ date: -1 }).limit(50).exec();
    }

    async updateData(data: any) {
        if (data.mata_pelajaran) {
            // Bulk update or replace subjects?
            // The frontend sends the whole array. This is risky for concurrency but okay for MVP.
            // Better to iterate and update/create.
            for (const sub of data.mata_pelajaran) {
                await this.subjectModel.findOneAndUpdate({ id: sub.id }, sub, { upsert: true, new: true }).exec();
            }

            // Check for deletions? The frontend sends the "updatedSubjects" array which implies the desired state.
            // If we want to support deletion via this method, we'd need to delete IDs not in the list.
            // For now, let's assume the frontend handles deletions via a separate call or we just update what's sent.
            // Actually, the frontend `handleDeleteSubject` sends the filtered array.
            // So we should probably sync the DB to match the array.
            const incomingIds = data.mata_pelajaran.map((s: any) => s.id);
            await this.subjectModel.deleteMany({ id: { $nin: incomingIds } }).exec();
        }

        if (data.pengguna) {
            for (const user of data.pengguna) {
                // If password is plain text (not hashed), hash it. 
                // But wait, we don't want to re-hash existing hashes.
                // Simple check: if it looks like a bcrypt hash, skip.
                // Or better: only update password if it's changed. 
                // The frontend sends the whole object.

                const existing = await this.userModel.findOne({ id: user.id }).exec();
                let passwordToSave = user.password;

                if (!existing || (user.password && existing && user.password !== existing.password)) {
                    // It's a new user or password changed
                    // Check if it's already hashed (starts with $2b$)
                    if (!user.password.startsWith('$2b$')) {
                        passwordToSave = await bcrypt.hash(user.password, 10);
                    }
                }

                await this.userModel.findOneAndUpdate(
                    { id: user.id },
                    { ...user, password: passwordToSave },
                    { upsert: true, new: true }
                ).exec();
            }
            const incomingIds = data.pengguna.map((u: any) => u.id);
            await this.userModel.deleteMany({ id: { $nin: incomingIds } }).exec();
        }

        return { success: true, message: 'Data updated successfully' };
    }

    // Add questions to a subject (original backend logic)
    async addQuestions(subjectId: number, questions: any[]) {
        if (!Array.isArray(questions)) {
            throw new BadRequestException('Questions must be an array');
        }

        const subject = await this.subjectModel.findOne({ id: subjectId }).exec();
        if (!subject) {
            throw new NotFoundException('Subject not found');
        }

        // Get the current max question ID
        const maxId = subject.soal.length > 0
            ? Math.max(...subject.soal.map(q => q.id))
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
        subject.soal = [...subject.soal, ...processedQuestions];
        await subject.save();

        return {
            success: true,
            message: `Berhasil menambahkan ${processedQuestions.length} soal ke ${subject.nama}!`,
            subject: subject
        };
    }

    // Add or update shop item (original backend logic)
    async addOrUpdateShopItem(itemData: any) {
        const { id, name, description, cost, type, icon, rarity } = itemData;

        let item = await this.shopItemModel.findOne({ id }).exec();
        if (item) {
            // Update
            item.name = name;
            item.description = description;
            item.cost = cost;
            item.type = type;
            item.icon = icon;
            item.rarity = rarity;
            await item.save();
        } else {
            // Create
            item = new this.shopItemModel({ id, name, description, cost, type, icon, rarity });
            await item.save();
        }

        return { success: true, item };
    }

    // Delete shop item (original backend logic)
    async deleteShopItem(id: string) {
        await this.shopItemModel.deleteOne({ id }).exec();
        return { success: true };
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
                id: sub.id || Date.now() + Math.floor(Math.random() * 1000),
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

            const saved = await this.subjectModel.create(subjectToSave);
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
            id: subject.id || Date.now() + Math.floor(Math.random() * 1000),
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

        const saved = await this.subjectModel.create(subjectToSave);
        return { success: true, subject: saved };
    }

    // NEW: Delete single subject by ID
    async deleteSubject(id: number) {
        const result = await this.subjectModel.deleteOne({ id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Subject not found');
        }
        return { success: true, message: 'Subject deleted' };
    }

    // NEW: Update single subject
    async updateSubject(id: number, subject: any) {
        const existing = await this.subjectModel.findOne({ id }).exec();
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

        const updated = await this.subjectModel
            .findOneAndUpdate({ id }, { ...subject, id }, { new: true })
            .exec();
        return { success: true, subject: updated };
    }

    // ============ USER CRUD (Dedicated) ============

    // Create single user
    async createUser(user: any) {
        if (!user.username || !user.password) {
            throw new BadRequestException('Username and password are required');
        }

        // Generate ID if not provided
        const id =
            user.id ||
            (crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`);

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        const userToSave = {
            ...user,
            id,
            password: hashedPassword,
            role: user.role || 'siswa',
        };

        const saved = await this.userModel.create(userToSave);
        return { success: true, user: saved };
    }

    // Update single user
    async updateUser(id: string, user: any) {
        const existing = await this.userModel.findOne({ id }).exec();
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

        const updated = await this.userModel
            .findOneAndUpdate(
                { id },
                { ...user, id, password: passwordToSave },
                { new: true },
            )
            .exec();
        return { success: true, user: updated };
    }

    // Delete single user
    async deleteUser(id: string) {
        const result = await this.userModel.deleteOne({ id }).exec();
        if (result.deletedCount === 0) {
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

Format output JSON array (JANGAN tambahkan markdown/backticks):
[
  {
    "pertanyaan": "teks soal",
    "pilihan": [
      {"id": "A", "text": "pilihan A"},
      {"id": "B", "text": "pilihan B"},
      {"id": "C", "text": "pilihan C"},
      {"id": "D", "text": "pilihan D"}
    ],
    "jawaban_benar": "A",
    "tipe": "pilihan_ganda"
  }
]`,
            isian: `Generate ${count} soal essay untuk tingkat SD tentang: ${topic}

Format output JSON array (JANGAN tambahkan markdown/backticks):
[
  {
    "pertanyaan": "teks soal",
    "rubrik_penilaian": "kriteria penilaian detail",
    "tipe": "isian"
  }
]`
        };

        const prompt = promptMap[type] || promptMap.pilihan_ganda;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000);

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

            clearTimeout(timeoutId);

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
            let responseText = rawText.replace(/data:\s*\[DONE\]\s*$/, '').trim();
            
            const data = JSON.parse(responseText);
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('Empty AI response');
            }

            // Strip markdown code blocks if present
            let jsonText = content.trim();
            jsonText = jsonText.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();

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
            console.error('Generate questions error:', error);
            throw new BadRequestException('Gagal generate soal. Coba lagi.');
        }
    }
}
