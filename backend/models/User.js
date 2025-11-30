const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'siswa', 'pengawas'], required: true },
    kelas: { type: String }, // User's class (e.g., "10A", "12 IPA")
    mata_pelajaran: [{ type: Number }] // Array of Subject IDs
});

module.exports = mongoose.model('User', UserSchema);
