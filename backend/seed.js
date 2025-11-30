const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ujian_db';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const seedData = async () => {
    const dataPath = path.join(__dirname, 'data.json');
    if (!fs.existsSync(dataPath)) {
        console.log('No data.json found to seed.');
        return;
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0 && data.pengguna) {
        await User.insertMany(data.pengguna);
        console.log('Users seeded');
    }

    // Seed Subjects
    const subjectCount = await Subject.countDocuments();
    if (subjectCount === 0 && data.mata_pelajaran) {
        await Subject.insertMany(data.mata_pelajaran);
        console.log('Subjects seeded');
    }
};

seedData();
