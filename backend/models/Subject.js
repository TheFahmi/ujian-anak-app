const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nama: String,
    kelas: String,
    durasi: { type: Number, default: 60 }, // Duration in minutes
    soal: [{
        id: Number,
        pertanyaan: String,
        tipe: { type: String, default: 'pilihan_ganda' }, // 'pilihan_ganda' or 'isian'
        pilihan: [{
            id: String,
            text: String
        }],
        jawaban_benar: String,
        rubrik_penilaian: String // For essay questions
    }]
});

module.exports = mongoose.model('Subject', SubjectSchema);
