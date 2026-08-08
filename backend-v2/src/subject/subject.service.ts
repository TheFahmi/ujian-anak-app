import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from '../schemas/subject.schema';
import { Result, ResultDocument } from '../schemas/result.schema';

@Injectable()
export class SubjectService {
    constructor(
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
        @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    ) { }

    async getSubjects(kelas: string, userId: string) {
        let query = {};
        if (kelas) {
            query = { kelas: { $regex: kelas, $options: 'i' } };
        }

        const subjects = await this.subjectModel.find(query).lean().exec();

        if (userId) {
            // Enrich with highest score
            const enrichedSubjects = await Promise.all(subjects.map(async (subject) => {
                const results = await this.resultModel.find({ userId, subjectId: subject.id }).sort({ score: -1 }).limit(1).exec();
                const highestScore = results.length > 0 ? results[0].score : null;
                return { ...subject, highestScore };
            }));
            return enrichedSubjects;
        }

        return subjects;
    }
}
