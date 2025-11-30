const mongoose = require('mongoose');

const ExamSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    subjectId: { type: Number, required: true },
    startTime: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});

// Compound index to ensure unique active session per user per subject
ExamSessionSchema.index({ userId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('ExamSession', ExamSessionSchema);
