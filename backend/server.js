const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Result = require('./models/Result');
const ExamSession = require('./models/ExamSession');
require('./seed'); // Run seeder on startup

const app = express();
const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ujian_db';

// Connect to MongoDB if not already connected by seed
if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.error('MongoDB Connection Error:', err));
}

app.use(cors());
app.use(bodyParser.json());

// AUTHENTICATION
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    kelas: user.kelas,
                    mata_pelajaran: user.mata_pelajaran
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET USER DATA (Refresh Session)
app.get('/api/user/:id', async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            kelas: user.kelas,
            mata_pelajaran: user.mata_pelajaran
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE USER CLASS
app.put('/api/user/:id/kelas', async (req, res) => {
    try {
        const { kelas } = req.body;
        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            { kelas: kelas },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SUBJECTS
app.get('/api/subjects', async (req, res) => {
    try {
        const { kelas, userId } = req.query;
        let query = {};

        // Filter by class if provided
        if (kelas) {
            query.kelas = kelas;
        }

        const subjects = await Subject.find(query, 'id nama kelas durasi');

        // If userId is provided, attach last score
        if (userId) {
            const subjectsWithScore = await Promise.all(subjects.map(async (subject) => {
                const highestResult = await Result.findOne({
                    userId: userId,
                    subjectId: subject.id
                }).sort({ score: -1 }); // Get highest score

                return {
                    ...subject.toObject(),
                    highestScore: highestResult ? highestResult.score : null
                };
            }));
            res.json(subjectsWithScore);
        } else {
            res.json(subjects);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET QUESTIONS FOR A SUBJECT (Start/Resume Exam)
app.get('/api/soal/:subjectId', async (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        const userId = req.query.userId; // Get userId from query

        const subject = await Subject.findOne({ id: subjectId });

        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        // Handle Exam Session
        let remainingSeconds = subject.durasi ? subject.durasi * 60 : 3600;

        if (userId) {
            let session = await ExamSession.findOne({ userId, subjectId });

            if (!session) {
                // Start new session
                session = new ExamSession({ userId, subjectId, startTime: new Date() });
                await session.save();
            } else {
                // Calculate remaining time
                const now = new Date();
                const elapsedSeconds = Math.floor((now - session.startTime) / 1000);
                remainingSeconds = Math.max(0, remainingSeconds - elapsedSeconds);
            }
        }

        const questions = subject.soal.map(q => ({
            id: q.id,
            pertanyaan: q.pertanyaan,
            tipe: q.tipe || 'pilihan_ganda', // Default to multiple choice
            pilihan: q.pilihan,
            rubrik_penilaian: q.rubrik_penilaian
        }));

        res.json({
            subjectName: subject.nama,
            duration: remainingSeconds / 60, // Send remaining minutes (float) or handle as seconds in frontend
            remainingSeconds: remainingSeconds, // Explicit seconds
            questions
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SUBMIT EXAM
app.post('/api/submit', async (req, res) => {
    const { userId, subjectId, jawaban, cheatCount } = req.body;
    try {
        const subject = await Subject.findOne({ id: parseInt(subjectId) });
        if (!subject) return res.status(404).json({ error: "Subject not found" });

        let score = 0;
        let correctCount = 0;
        const totalQuestions = subject.soal.length;
        const results = [];

        // Process all questions in parallel to speed up AI grading
        const processedResults = await Promise.all(subject.soal.map(async (q) => {
            const userAnswer = jawaban[q.id];
            const questionType = q.tipe || 'pilihan_ganda';

            if (questionType === 'isian') {
                // AI Grading for essay questions
                try {
                    const aiScore = await gradeEssayWithAI(q.pertanyaan, userAnswer, q.rubrik_penilaian);
                    const questionScore = (aiScore / 100) * (100 / totalQuestions);

                    return {
                        id: q.id,
                        tipe: 'isian',
                        correct: aiScore >= 70,
                        userAnswer,
                        aiScore: Math.round(aiScore),
                        aiFeedback: `Nilai: ${Math.round(aiScore)}/100`,
                        scoreContribution: questionScore
                    };
                } catch (err) {
                    console.error('AI grading error:', err);
                    return {
                        id: q.id,
                        tipe: 'isian',
                        correct: false,
                        userAnswer,
                        aiScore: 0,
                        aiFeedback: 'Error dalam penilaian AI',
                        scoreContribution: 0
                    };
                }
            } else {
                // Multiple choice grading
                const isCorrect = userAnswer === q.jawaban_benar;
                const questionScore = isCorrect ? (100 / totalQuestions) : 0;

                return {
                    id: q.id,
                    tipe: 'pilihan_ganda',
                    correct: isCorrect,
                    userAnswer,
                    correctAnswer: q.jawaban_benar,
                    scoreContribution: questionScore
                };
            }
        }));

        // Calculate totals
        processedResults.forEach(r => {
            score += r.scoreContribution || 0;
            if (r.correct) correctCount++;
            // Remove internal scoreContribution before sending to client
            delete r.scoreContribution;
            results.push(r);
        });

        const finalScore = Math.round(score);

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

            const feedback = await generateAICoachFeedback(summaryPrompt);
            if (feedback) coachFeedback = feedback;
        } catch (e) {
            console.error("Coach feedback error", e);
        }

        // Save result
        const newResult = new Result({
            userId,
            subjectId,
            subjectName: subject.nama,
            score: finalScore,
            correctCount,
            totalQuestions,
            cheatCount: cheatCount || 0,
            aiCoachFeedback: coachFeedback,
            results
        });
        await newResult.save();

        // Clear Exam Session
        await ExamSession.deleteOne({ userId: userId, subjectId: parseInt(subjectId) });

        res.json({
            score: finalScore,
            totalQuestions,
            correctCount,
            results,
            aiCoachFeedback: coachFeedback
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Grading helper function
async function gradeEssayWithAI(question, answer, rubric) {
    const CHUTES_API_TOKEN = process.env.CHUTES_API_TOKEN;

    if (!CHUTES_API_TOKEN) {
        console.warn('CHUTES_API_TOKEN not set, using default score');
        return 75; // Default score if no API token
    }

    const prompt = `Kamu adalah guru yang sedang menilai jawaban siswa SD.
    
Pertanyaan: ${question}

Jawaban siswa: ${answer || '(tidak ada jawaban)'}

Rubrik penilaian: ${rubric}

Tugasmu:
1. Analisis jawaban siswa berdasarkan rubrik.
2. Berikan nilai (0-100).
3. Berikan feedback singkat.

PENTING: Jawablah dengan SINGKAT dan PADAT. Jangan bertele-tele.
Format responmu HARUS seperti ini di akhir jawaban:
NILAI: [angka]
FEEDBACK: [kalimat]`;

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CHUTES_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-ai/DeepSeek-R1',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                stream: false,
                max_tokens: 1500, // Increased to prevent truncation
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`Chutes AI API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Extract score from response
        const scoreMatch = aiResponse.match(/NILAI:\s*(\d+)/i);
        if (scoreMatch) {
            return parseInt(scoreMatch[1]);
        }

        return 75; // Default if can't parse
    } catch (err) {
        console.error('AI grading error details:', err);
        return 75; // Default score on error
    }
}

// AI Coach Helper
async function generateAICoachFeedback(prompt) {
    const CHUTES_API_TOKEN = process.env.CHUTES_API_TOKEN;
    if (!CHUTES_API_TOKEN) return null;

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CHUTES_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-ai/DeepSeek-R1',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                stream: false,
                max_tokens: 500,
                temperature: 0.7 // Higher temperature for more creative/friendly feedback
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (err) {
        console.error('AI Coach error:', err);
        return null;
    }
}

// GET RESULTS FOR A USER
app.get('/api/results/:userId', async (req, res) => {
    try {
        const results = await Result.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN & SUPERVISOR ROUTES

// Get all data (Admin only - simplified for MongoDB)
app.get('/api/admin/data', async (req, res) => {
    try {
        const subjects = await Subject.find();
        const users = await User.find();
        const results = await Result.find().sort({ date: -1 });

        res.json({
            mata_pelajaran: subjects,
            pengguna: users,
            hasil_ujian: results
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update all data (Admin only)
app.post('/api/admin/data', async (req, res) => {
    const newData = req.body;
    try {
        if (newData.mata_pelajaran) {
            await Subject.deleteMany({});
            await Subject.insertMany(newData.mata_pelajaran);
        }
        if (newData.pengguna) {
            await User.deleteMany({});
            await User.insertMany(newData.pengguna);
        }

        res.json({ success: true, message: "Data updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save data: " + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
