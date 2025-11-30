const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    subjectId: { type: Number, required: true },
    subjectName: String,
    score: Number,
    correctCount: Number,
    totalQuestions: Number,
    cheatCount: { type: Number, default: 0 },
    aiCoachFeedback: String,
    results: [{
        id: Number,
        tipe: String,
        correct: Boolean,
        userAnswer: String,
        correctAnswer: String, // For PG
        aiScore: Number, // For Essay
        aiFeedback: String // For Essay
    }],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
