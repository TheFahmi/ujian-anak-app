import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

// Badge definitions - same as backend original
const BADGES = [
    { id: 'first-win', condition: (stats: any) => stats.examsTaken >= 1 },
    { id: 'perfect-score', condition: (stats: any) => stats.perfectScores >= 1 },
    { id: 'high-score', condition: (stats: any) => stats.highScores >= 1 },
    { id: 'math-lover', condition: (stats: any) => stats.subjects?.math >= 3 },
    { id: 'science-geek', condition: (stats: any) => stats.subjects?.science >= 3 },
    { id: 'history-buff', condition: (stats: any) => stats.subjects?.history >= 3 },
    { id: 'language-pro', condition: (stats: any) => stats.subjects?.language >= 3 },
    { id: 'speed-demon', condition: (stats: any) => stats.fastFinishes >= 1 },
    { id: 'persistence', condition: (stats: any) => stats.retries >= 1 },
    { id: 'streak-7', condition: (stats: any) => stats.streak >= 7 },
    { id: 'night-owl', condition: (stats: any) => stats.nightOwl >= 1 },
    { id: 'early-bird', condition: (stats: any) => stats.earlyBird >= 1 },
    { id: 'bookworm', condition: (stats: any) => stats.examsTaken >= 10 },
    { id: 'quiz-master', condition: (stats: any) => stats.examsTaken >= 20 },
    { id: 'coin-collector', condition: (stats: any, coins: number) => coins >= 100 },
    { id: 'rich-kid', condition: (stats: any, coins: number) => coins >= 500 },
    { id: 'helper', condition: (stats: any) => stats.hintsUsed >= 1 },
    { id: 'independent', condition: (stats: any) => stats.noHints >= 5 },
    { id: 'social-butterfly', condition: (stats: any) => stats.friendSelected },
    { id: 'legend', condition: (stats: any, coins: number, badges: string[]) => badges.length >= 19 }
];

@Injectable()
export class ExamService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    private encryptData(data: any): string {
        const key = this.configService.get<string>('ENCRYPTION_KEY');
        if (!key) throw new Error('ENCRYPTION_KEY is not defined');
        return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    }

    // `soal` / `questions` / `results` disimpan sebagai jsonb, jadi Prisma
    // mengembalikannya bertipe JsonValue. Helper ini menormalkan ke array biasa.
    private asArray(v: any): any[] {
        return Array.isArray(v) ? v : [];
    }

    async getQuestions(subjectId: string, userId: string, isReview: boolean = false) {
        // subjectId adalah UUID v4 (string), jangan di-parseInt
        const subjectIdNum = subjectId;
        if (!subjectIdNum) {
            throw new BadRequestException('Invalid subjectId');
        }

        // 1. Check if subject exists
        const subject = await this.prisma.subject.findUnique({ where: { id: subjectIdNum } });
        if (!subject) throw new NotFoundException('Subject not found');

        const soal = this.asArray(subject.soal);
        if (soal.length === 0) {
            throw new NotFoundException('No questions found for this subject');
        }

        // Handle Exam Session (only for exam, not review)
        let remainingSeconds = subject.durasi ? subject.durasi * 60 : 3600;

        // Separate PG and Essay questions - prepare all questions without jawaban_benar
        const allQuestions = soal.map(q => ({
            id: q.id,
            pertanyaan: q.pertanyaan,
            tipe: q.tipe || 'pilihan_ganda',
            pilihan: q.pilihan,
            rubrik_penilaian: q.rubrik_penilaian,
            penjelasan: q.penjelasan,
            kunci_jawaban: q.kunci_jawaban
        }));

        let questions: any[];
        let session: any = null;

        if (isReview) {
            // For review, return all questions without limiting or shuffling
            questions = allQuestions;
        } else if (userId) {
            // For exam, check if session exists and has saved questions
            session = await this.prisma.examSession.findUnique({
                where: { userId_subjectId: { userId, subjectId: subjectIdNum } },
            });

            if (!session) {
                // Start new session - shuffle and save questions
                const pgQuestions = allQuestions.filter(q => q.tipe !== 'isian');
                const essayQuestions = allQuestions.filter(q => q.tipe === 'isian');

                // Shuffle and limit: 20 PG + 5 Essay
                const shuffledPg = this.shuffleArray([...pgQuestions]).slice(0, 20);
                const shuffledEssay = this.shuffleArray([...essayQuestions]).slice(0, 5);

                // Shuffle pilihan for PG questions
                const finalPg = shuffledPg.map(q => ({
                    ...q,
                    pilihan: q.pilihan ? this.shuffleArray([...q.pilihan]) : []
                }));

                // Combine all questions (PG first, then Essay)
                questions = [...finalPg, ...shuffledEssay];

                // Save session with questions
                session = await this.prisma.examSession.create({
                    data: {
                        userId,
                        subjectId: subjectIdNum,
                        startTime: new Date(),
                        questions,
                        isLocked: false,
                    },
                });
            } else {
                // Session exists - use saved questions to maintain consistency
                const tersimpan = this.asArray(session.questions);
                questions = tersimpan.length > 0
                    ? tersimpan.map(q => ({
                        id: q.id,
                        pertanyaan: q.pertanyaan,
                        tipe: q.tipe || 'pilihan_ganda',
                        pilihan: q.pilihan,
                        rubrik_penilaian: q.rubrik_penilaian
                    }))
                    : allQuestions; // Fallback if questions not saved

                // Calculate remaining time
                const now = new Date();
                const elapsedSeconds = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
                remainingSeconds = Math.max(0, remainingSeconds - elapsedSeconds);
            }
        } else {
            // No userId - shuffle but don't save (for testing/preview)
            const pgQuestions = allQuestions.filter(q => q.tipe !== 'isian');
            const essayQuestions = allQuestions.filter(q => q.tipe === 'isian');

            const shuffledPg = this.shuffleArray([...pgQuestions]).slice(0, 20);
            const shuffledEssay = this.shuffleArray([...essayQuestions]).slice(0, 5);

            const finalPg = shuffledPg.map(q => ({
                ...q,
                pilihan: q.pilihan ? this.shuffleArray([...q.pilihan]) : []
            }));

            questions = [...finalPg, ...shuffledEssay];
        }

        // Encrypt questions
        const encryptedQuestions = this.encryptData(questions);

        return {
            subjectName: subject.nama,
            duration: remainingSeconds / 60,
            remainingSeconds: remainingSeconds,
            questions: encryptedQuestions,
            isEncrypted: true,
            isLocked: (userId && session) ? session.isLocked : false
        };
    }

    async lockExam(userId: string, subjectId: string) {
        const subjectIdNum = subjectId;
        if (!subjectIdNum) {
            throw new BadRequestException('Invalid subjectId');
        }
        // findOneAndUpdate Mongo tidak error kalau dokumen tidak ada; updateMany
        // memberi perilaku sama (0 baris terpengaruh) tanpa melempar.
        await this.prisma.examSession.updateMany({
            where: { userId, subjectId: subjectIdNum },
            data: { isLocked: true },
        });
        return this.prisma.examSession.findUnique({
            where: { userId_subjectId: { userId, subjectId: subjectIdNum } },
        });
    }

    async unlockExam(userId: string, subjectId: string, password: string) {
        const subjectIdNum = subjectId;
        if (!subjectIdNum) {
            throw new BadRequestException('Invalid subjectId');
        }

        // Hardcoded password for now, should be in env or DB
        // Match with frontend password: '1234'
        const EXIT_PASSWORD = this.configService.get<string>('EXIT_PASSWORD') || '1234';

        if (password !== EXIT_PASSWORD) {
            return { success: false, message: 'Password salah!' };
        }

        await this.prisma.examSession.updateMany({
            where: { userId, subjectId: subjectIdNum },
            data: { isLocked: false },
        });

        return { success: true };
    }

    async submitExam(userId: string, subjectId: string, answers: any, cheatCount: number = 0) {
        const subjectIdNum = subjectId;
        if (!subjectIdNum) {
            throw new BadRequestException('Invalid subjectId');
        }

        const subject = await this.prisma.subject.findUnique({ where: { id: subjectIdNum } });
        if (!subject) throw new NotFoundException('Subject not found');
        const soal = this.asArray(subject.soal);

        // Get questions from ExamSession before deleting it
        const session = await this.prisma.examSession.findUnique({
            where: { userId_subjectId: { userId, subjectId: subjectIdNum } },
        });
        const sessionQuestions = session ? this.asArray(session.questions) : [];
        let examQuestions: any[] = [];

        if (sessionQuestions.length > 0) {
            // Use questions from session (the actual questions user saw during exam)
            // Re-attach the correct answers from the database
            examQuestions = sessionQuestions.map(sessionQ => {
                const originalQ = soal.find(sq => sq.id === sessionQ.id);
                return {
                    id: sessionQ.id,
                    pertanyaan: sessionQ.pertanyaan,
                    tipe: sessionQ.tipe || 'pilihan_ganda',
                    pilihan: sessionQ.pilihan || [],
                    jawaban_benar: originalQ ? originalQ.jawaban_benar : null,
                    rubrik_penilaian: originalQ ? originalQ.rubrik_penilaian : sessionQ.rubrik_penilaian,
                    penjelasan: originalQ ? originalQ.penjelasan : sessionQ.penjelasan,
                    kunci_jawaban: originalQ ? originalQ.kunci_jawaban : sessionQ.kunci_jawaban
                };
            });
        } else {
            // Fallback: get questions from subject based on answered IDs
            const answeredQuestionIds = Object.keys(answers).map(id => parseInt(id));
            examQuestions = soal
                .filter(q => answeredQuestionIds.includes(q.id))
                .map(q => ({
                    id: q.id,
                    pertanyaan: q.pertanyaan,
                    tipe: q.tipe || 'pilihan_ganda',
                    pilihan: q.pilihan || [],
                    jawaban_benar: q.jawaban_benar,
                    rubrik_penilaian: q.rubrik_penilaian || '',
                    penjelasan: q.penjelasan,
                    kunci_jawaban: q.kunci_jawaban
                }));
        }

        // Only process questions that user answered
        const answeredQuestionIds = Object.keys(answers).map(id => parseInt(id));
        const answeredQuestions = examQuestions.filter(q => answeredQuestionIds.includes(q.id));

        let score = 0;
        let correctCount = 0;
        const totalQuestions = answeredQuestions.length;
        const results: any[] = [];

        // Process questions - MC in parallel, essay sequentially to avoid rate limits
        const mcQuestions = answeredQuestions.filter(q => (q.tipe || 'pilihan_ganda') !== 'isian');
        const essayQuestions = answeredQuestions.filter(q => (q.tipe || 'pilihan_ganda') === 'isian');

        // Grade MC questions (no API calls needed for scoring; AI only when
        // a wrong answer has no manual penjelasan)
        const mcResults: any[] = [];
        for (const q of mcQuestions) {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.jawaban_benar;
            const questionScore = isCorrect ? (100 / totalQuestions) : 0;
            let penjelasan = q.penjelasan || null;
            if (!isCorrect && !penjelasan) {
                try {
                    penjelasan = await this.generatePGExplanation(q.pertanyaan, userAnswer, q.jawaban_benar, q.pilihan);
                } catch (err) {
                    console.error('PG explanation fallback error:', err);
                    penjelasan = null;
                }
            }
            mcResults.push({
                id: q.id,
                tipe: 'pilihan_ganda',
                correct: isCorrect,
                userAnswer,
                correctAnswer: q.jawaban_benar,
                penjelasan,
                scoreContribution: questionScore
            });
        }

        // Grade essay questions SEQUENTIALLY to avoid rate limits
        const essayResults: any[] = [];
        for (const q of essayQuestions) {
            const userAnswer = answers[q.id];
            try {
                const aiResult = await this.gradeEssayWithAI(q.pertanyaan, userAnswer, q.rubrik_penilaian, q.kunci_jawaban);
                const aiScore = aiResult.score;
                const aiFeedback = aiResult.feedback
                    ? `${aiResult.feedback}\n\nNilai: ${Math.round(aiScore)}/100`
                    : `Nilai: ${Math.round(aiScore)}/100`;
                const questionScore = (aiScore / 100) * (100 / totalQuestions);

                essayResults.push({
                    id: q.id,
                    tipe: 'isian',
                    correct: aiScore >= 70,
                    userAnswer,
                    aiScore: Math.round(aiScore),
                    aiFeedback: aiFeedback,
                    kunciJawaban: q.kunci_jawaban || null,
                    scoreContribution: questionScore
                });
            } catch (err) {
                console.error('AI grading error:', err);
                essayResults.push({
                    id: q.id,
                    tipe: 'isian',
                    correct: false,
                    userAnswer,
                    aiScore: 0,
                    aiFeedback: 'Error dalam penilaian AI. Silakan coba retry.',
                    scoreContribution: 0
                });
            }
        }

        const processedResults = [...mcResults, ...essayResults];

        // Calculate totals
        processedResults.forEach(r => {
            score += r.scoreContribution || 0;
            if (r.correct) correctCount++;
            // Remove internal scoreContribution before sending to client
            const { scoreContribution, ...resultWithoutScore } = r;
            results.push(resultWithoutScore);
        });

        const finalScore = Math.round(score);

        // Check previous high score for coin calculation
        const previousBestResult = await this.prisma.result.findFirst({
            where: { userId, subjectId: subjectIdNum },
            orderBy: { score: 'desc' },
        });
        const previousHighScore = previousBestResult ? previousBestResult.score : 0;

        // Generate AI Coach Feedback
        let coachFeedback = "Terus semangat belajar! Kamu pasti bisa lebih baik lagi.";
        try {
            const wrongAnswers = results.filter(r => !r.correct);
            const summaryPrompt = `Siswa SD baru saja menyelesaikan ujian ${subject.nama}.
            Skor: ${finalScore}/100.
            Salah: ${wrongAnswers.length} dari ${totalQuestions} soal.
            
            Berikan saran belajar singkat (maksimal 3 kalimat) untuk siswa ini agar lebih semangat dan memperbaiki kesalahannya. 
            Gunakan bahasa yang ramah, ceria, dan memotivasi seperti guru favorit.
            Jangan sebutkan ID soal, tapi berikan tips umum belajar.`;

            const feedback = await this.generateAICoachFeedback(summaryPrompt);
            if (feedback) coachFeedback = feedback;
        } catch (e) {
            console.error("Coach feedback error", e);
        }

        // Prepare questions for saving (only answered questions in exam order)
        const questionsForSave = examQuestions
            .filter(q => answeredQuestionIds.includes(q.id))
            .map(q => ({
                id: q.id,
                pertanyaan: q.pertanyaan,
                tipe: q.tipe || 'pilihan_ganda',
                pilihan: q.pilihan || [],
                rubrik_penilaian: q.rubrik_penilaian || '',
                penjelasan: q.penjelasan,
                kunci_jawaban: q.kunci_jawaban
            }));

        // Save result
        const newResult = await this.prisma.result.create({
            data: {
                userId,
                subjectId: subjectIdNum,
                subjectName: subject.nama,
                score: finalScore,
                correctCount,
                totalQuestions,
                cheatCount: cheatCount || 0,
                aiCoachFeedback: coachFeedback,
                questions: questionsForSave,
                results,
                date: new Date(),
            },
        });

        // Clear Exam Session
        await this.prisma.examSession.deleteMany({ where: { userId, subjectId: subjectIdNum } });

        // --- REWARD SYSTEM LOGIC ---
        const rewardRow = await this.prisma.reward.findUnique({ where: { userId } });
        const badges: string[] = rewardRow ? [...rewardRow.badges] : [];
        let coins = rewardRow ? rewardRow.coins : 0;
        const stats: any = rewardRow ? { ...(rewardRow.stats as any) } : {
            examsTaken: 0,
            perfectScores: 0,
            highScores: 0,
            subjects: { math: 0, science: 0, history: 0, language: 0 },
            fastFinishes: 0,
            retries: 0,
            streak: 0,
            nightOwl: 0,
            earlyBird: 0,
            hintsUsed: 0,
            noHints: 0,
            friendSelected: false,
            selectedFriendId: 'robo'
        };
        if (!stats.subjects) stats.subjects = { math: 0, science: 0, history: 0, language: 0 };

        // Update Stats
        stats.examsTaken = (stats.examsTaken || 0) + 1;

        // Coin Logic: Only award difference if new score is higher than previous best
        let coinsEarned = 0;
        const currentCoins = finalScore >= 60 ? Math.floor(finalScore / 10) : 0;
        const previousCoins = previousHighScore >= 60 ? Math.floor(previousHighScore / 10) : 0;

        if (currentCoins > previousCoins) {
            coinsEarned = currentCoins - previousCoins;
        }

        coins += coinsEarned;

        if (finalScore === 100) stats.perfectScores = (stats.perfectScores || 0) + 1;
        if (finalScore >= 80) stats.highScores = (stats.highScores || 0) + 1;

        const lowerName = subject.nama.toLowerCase();
        if (lowerName.includes('matematika')) stats.subjects.math = (stats.subjects.math || 0) + 1;
        if (lowerName.includes('sains') || lowerName.includes('ipa')) stats.subjects.science = (stats.subjects.science || 0) + 1;
        if (lowerName.includes('sejarah') || lowerName.includes('ips')) stats.subjects.history = (stats.subjects.history || 0) + 1;
        if (lowerName.includes('bahasa')) stats.subjects.language = (stats.subjects.language || 0) + 1;

        const hour = new Date().getHours();
        if (hour >= 20 || hour <= 4) stats.nightOwl = (stats.nightOwl || 0) + 1;
        if (hour >= 5 && hour <= 8) stats.earlyBird = (stats.earlyBird || 0) + 1;

        // Check Badges
        const newBadges: { id: string; name: string }[] = [];
        BADGES.forEach(badge => {
            if (!badges.includes(badge.id)) {
                if (badge.condition(stats, coins, badges)) {
                    newBadges.push({ id: badge.id, name: badge.id });
                    badges.push(badge.id);
                }
            }
        });

        await this.prisma.reward.upsert({
            where: { userId },
            create: { userId, coins, badges, inventory: [], stats },
            update: { coins, badges, stats },
        });
        // ---------------------------

        const resultId = newResult.id;
        if (!resultId) {
            throw new Error('Failed to get result ID after saving');
        }

        return {
            success: true,
            score: finalScore,
            totalQuestions,
            correctCount,
            resultId,
            results,
            aiCoachFeedback: coachFeedback,
            newBadges,
            coinsEarned,
            totalCoins: coins
        };
    }

    // AI Coach Helper
    private async generateAICoachFeedback(prompt: string): Promise<string | null> {
        const tokens: string[] = [];
        const token1 = this.configService.get<string>('CHUTES_API_TOKEN');
        const token2 = this.configService.get<string>('CHUTES_API_TOKEN_2');
        if (token1) tokens.push(token1);
        if (token2) tokens.push(token2);
        if (tokens.length === 0) return null;

        for (const token of tokens) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000);

                const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'Qwen/Qwen3-235B-A22B',
                        messages: [{ role: 'user', content: '/no_think\n' + prompt }],
                        stream: false,
                        max_tokens: 300,
                        temperature: 0.7
                    }),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    if (response.status === 402 || response.status === 429) continue;
                    return null;
                }

                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    // Strip thinking tags if any
                    return this.stripThinkingTags(content);
                }
            } catch (err) {
                console.error('AI Coach error:', err instanceof Error ? err.message : err);
                continue;
            }
        }
        return null;
    }

    /**
     * Generate a short explanation for a wrong PG answer using AI.
     * Returns null when no tokens configured or AI fails.
     */
    private async generatePGExplanation(question: string, userAnswer: string, correctAnswer: string, pilihan: any[]): Promise<string | null> {
        const apiUrl = this.configService.get<string>('PECUT_AI_URL') || 'https://llm.mfah.me/v1/chat/completions';
        const apiToken = this.configService.get<string>('PECUT_AI_TOKEN');
        if (!apiToken) return null;

        const findText = (id: string) => {
            const opt = (pilihan || []).find((p: any) => (p.id || p.text) === id);
            return opt ? (opt.text || opt.jawaban || opt.label || id) : id;
        };
        const jawabanBenarText = findText(correctAnswer);
        const jawabanUserText = findText(userAnswer);

        const prompt = `Siswa SD menjawab salah soal pilihan ganda.

Soal: ${question}

Jawaban siswa: ${jawabanUserText}
Jawaban benar: ${jawabanBenarText}

Jelaskan dalam 1-2 kalimat singkat, ramah, dan mudah dipahami anak SD: KENAPA jawaban yang benar itu benar dan KENAPA jawaban siswa salah. Jangan mengulang soal. Langsung ke penjelasan.`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    model: 'pecut-ai',
                    messages: [
                        {
                            role: 'system',
                            content: '/no_think\nKamu adalah guru SD. Jawab SINGKAT dengan 1-2 kalimat, bahasa ramah anak SD.'
                        },
                        { role: 'user', content: prompt }
                    ],
                    stream: false,
                    max_tokens: 200,
                    temperature: 0.5
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.warn(`PG explanation failed with HTTP ${response.status}`);
                return null;
            }

            let responseText = await response.text();
            responseText = responseText.replace(/data:\s*\[DONE\]\s*$/, '').trim();
            const data = JSON.parse(responseText);
            const content = data.choices?.[0]?.message?.content;
            if (content) {
                return this.stripThinkingTags(content).trim();
            }
        } catch (err) {
            console.error('PG explanation error:', err instanceof Error ? err.message : err);
        }
        return null;
    }

    /**
     * Strip DeepSeek-R1 <think>...</think> tags from response
     */
    private stripThinkingTags(content: string): string {
        // Remove <think>...</think> blocks (DeepSeek-R1 reasoning output)
        return content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    }

    /**
     * Parse AI grading response with robust pattern matching
     */
    private parseGradingResponse(rawContent: string): { score: number | null, feedback: string | null } {
        // First strip any thinking tags
        const content = this.stripThinkingTags(rawContent);

        // Try multiple regex patterns for score (from most specific to most flexible)
        const scorePatterns = [
            /NILAI\s*[:：]\s*(\d+)/i,                    // NILAI: 85 or NILAI：85
            /\*\*NILAI\*\*\s*[:：]\s*(\d+)/i,            // **NILAI**: 85
            /nilai\s*[:=]\s*(\d+)\s*(?:\/\s*100)?/i,    // nilai = 85 or nilai: 85/100
            /skor\s*[:：]\s*(\d+)/i,                     // skor: 85
            /score\s*[:：]\s*(\d+)/i,                    // score: 85
            /(\d+)\s*\/\s*100/,                          // 85/100 (last resort)
        ];

        let score: number | null = null;
        for (const pattern of scorePatterns) {
            const match = content.match(pattern);
            if (match) {
                score = parseInt(match[1]);
                break;
            }
        }

        // Try multiple regex patterns for feedback
        const feedbackPatterns = [
            /FEEDBACK\s*[:：]\s*(.+?)(?:\n|$)/i,         // FEEDBACK: text
            /\*\*FEEDBACK\*\*\s*[:：]\s*(.+?)(?:\n|$)/i, // **FEEDBACK**: text
            /umpan\s*balik\s*[:：]\s*(.+?)(?:\n|$)/i,    // Umpan Balik: text
            /komentar\s*[:：]\s*(.+?)(?:\n|$)/i,         // Komentar: text
        ];

        let feedback: string | null = null;
        for (const pattern of feedbackPatterns) {
            const match = content.match(pattern);
            if (match) {
                feedback = match[1].trim();
                break;
            }
        }

        // If no feedback pattern matched, try to get the last meaningful sentence
        if (!feedback && score !== null) {
            const lines = content.split('\n').filter(l => l.trim().length > 10);
            const lastLine = lines[lines.length - 1]?.trim();
            if (lastLine && !lastLine.match(/NILAI|skor|score|\d+\/100/i)) {
                feedback = lastLine;
            }
        }

        return { score, feedback };
    }

    private async gradeEssayWithAI(question: string, userAnswer: string, rubric: string, kunciJawaban?: string): Promise<{ score: number, feedback: string }> {
        const apiUrl = this.configService.get<string>('PECUT_AI_URL') || 'https://llm.mfah.me/v1/chat/completions';
        const apiToken = this.configService.get<string>('PECUT_AI_TOKEN');

        if (!apiToken || !userAnswer) return { score: 0, feedback: '' };

        // Truncate very long answers to prevent excessive token usage
        const truncatedAnswer = userAnswer.length > 500 ? userAnswer.substring(0, 500) + '...' : userAnswer;
        const truncatedRubric = rubric && rubric.length > 300 ? rubric.substring(0, 300) + '...' : (rubric || 'Jawaban benar dan lengkap');
        const kunci = kunciJawaban && kunciJawaban.length > 300 ? kunciJawaban.substring(0, 300) + '...' : (kunciJawaban || '');

        const prompt = `Kamu adalah guru yang menilai jawaban siswa SD.

Pertanyaan: ${question}

Jawaban siswa: ${truncatedAnswer}

Rubrik: ${truncatedRubric}
${kunci ? `\nKunci jawaban (referensi): ${kunci}` : ''}

Tugasmu: Analisis jawaban lalu berikan nilai dan feedback singkat.

WAJIB tulis format ini di akhir jawaban (JANGAN gunakan format lain):
NILAI: [angka 0-100]
FEEDBACK: [1 kalimat singkat]`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    model: 'pecut-ai',
                    messages: [
                        {
                            role: 'system',
                            content: '/no_think\nKamu adalah guru SD. Jawab SINGKAT. Selalu akhiri dengan format:\nNILAI: [angka]\nFEEDBACK: [kalimat]'
                        },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 500,
                    stream: false
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.warn(`Essay grading failed with HTTP ${response.status}`);
                throw new Error(`API Error: ${response.status}`);
            }

            let responseText = await response.text();
            console.log(`AI raw response (first 500 chars): ${responseText.substring(0, 500)}`);
            responseText = responseText.replace(/data:\s*\[DONE\]\s*$/, '').trim();

            const data = JSON.parse(responseText);
            console.log(`Parsed data.choices: ${JSON.stringify(data.choices?.slice(0, 1))}`);
            const content = data.choices?.[0]?.message?.content;
            if (!content) {
                console.warn('Empty response from AI');
                console.warn(`Full response data: ${JSON.stringify(data).substring(0, 500)}`);
                return { score: 0, feedback: 'Tidak dapat menilai jawaban' };
            }

            const parsed = this.parseGradingResponse(content);

            if (parsed.score === null) {
                console.warn(`Could not parse score from AI response. Raw content: ${content.substring(0, 200)}`);
                return { score: 0, feedback: 'Format nilai tidak valid' };
            }

            const score = parsed.score !== null ? parsed.score : 0;
            const feedback = parsed.feedback || '';

            return { score: Math.min(100, Math.max(0, score)), feedback };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`AI Grading Error:`, errorMsg);

            if (errorMsg.includes('abort') || errorMsg.includes('AbortError')) {
                return { score: 0, feedback: 'Penilaian AI timeout. Silakan coba lagi dengan tombol retry.' };
            }
            if (errorMsg.includes('402')) {
                return { score: 0, feedback: 'Kuota AI habis. Silakan coba lagi nanti atau hubungi guru.' };
            }
            return { score: 0, feedback: 'Terjadi kesalahan dalam penilaian AI. Silakan coba lagi.' };
        }
    }

    async retryGrading(resultId: string, questionId: number) {
        const result = await this.prisma.result.findUnique({ where: { id: resultId } });
        if (!result) throw new NotFoundException('Result not found');

        const resultItems = this.asArray(result.results);
        const savedQuestions = this.asArray(result.questions);

        // Find the specific result item for this question
        const questionResultIndex = resultItems.findIndex(r => r.id === questionId);
        if (questionResultIndex === -1) throw new NotFoundException('Question result not found');

        const questionResult = resultItems[questionResultIndex];

        // Only allow retrying essay questions
        if (questionResult.tipe !== 'isian') {
            throw new BadRequestException('Only essay questions can be re-graded');
        }

        // Find the original question to get the rubric
        const savedQuestion = savedQuestions.find(q => q.id === questionId);
        if (!savedQuestion) throw new NotFoundException('Question definition not found');

        // Re-run AI grading
        const aiResult = await this.gradeEssayWithAI(savedQuestion.pertanyaan, questionResult.userAnswer, savedQuestion.rubrik_penilaian, savedQuestion.kunci_jawaban);
        const aiScore = aiResult.score;
        const aiFeedback = aiResult.feedback
            ? `${aiResult.feedback}\n\nNilai: ${Math.round(aiScore)}/100`
            : `Nilai: ${Math.round(aiScore)}/100`;

        // Update the specific result
        const totalQuestions = result.totalQuestions;

        // Update properties
        resultItems[questionResultIndex].aiScore = Math.round(aiScore);
        resultItems[questionResultIndex].aiFeedback = aiFeedback;
        resultItems[questionResultIndex].correct = aiScore >= 70;

        // Recalculate total score
        let newTotalScore = 0;
        let newCorrectCount = 0;

        resultItems.forEach(r => {
            if (r.tipe === 'isian') {
                const qScore = (r.aiScore / 100) * (100 / totalQuestions);
                newTotalScore += qScore;
                if (r.aiScore >= 70) newCorrectCount++;
            } else {
                // Multiple choice
                if (r.correct) {
                    newTotalScore += (100 / totalQuestions);
                    newCorrectCount++;
                }
            }
        });

        const score = Math.round(newTotalScore);

        // Save updated result
        await this.prisma.result.update({
            where: { id: resultId },
            data: { results: resultItems, score, correctCount: newCorrectCount },
        });

        return {
            success: true,
            newScore: score,
            newCorrectCount: newCorrectCount,
            updatedQuestionResult: resultItems[questionResultIndex]
        };
    }

    private shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
