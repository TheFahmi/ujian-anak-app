import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Result, ResultDocument } from '../schemas/result.schema';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    ) { }

    async getTeacherDashboard() {
        const totalStudents = await this.userModel.countDocuments({ role: 'siswa' });
        const totalExams = await this.resultModel.countDocuments();

        // Get recent activity with user details
        const recentResults = await this.resultModel.find()
            .sort({ date: -1 })
            .limit(5)
            .exec();

        // Enrich results with student names
        const enrichedResults = await Promise.all(recentResults.map(async (result) => {
            const student = await this.userModel.findOne({ id: result.userId });
            return {
                ...result.toObject(),
                studentName: student ? student.username : 'Unknown Student',
                studentAvatar: student ? student.avatar : '/images/avatar-student.png'
            };
        }));

        return {
            stats: {
                totalStudents,
                totalExams
            },
            recentActivity: enrichedResults
        };
    }

    async getParentDashboard(parentId: string) {
        const parent = await this.userModel.findOne({ id: parentId });
        if (!parent || !parent.children || parent.children.length === 0) {
            return {
                hasChildren: false,
                stats: { averageScore: 0, totalExams: 0 },
                recentResults: []
            };
        }

        // For MVP, assume single child or aggregate all children
        const childIds = parent.children;

        // Get all results for these children
        const results = await this.resultModel.find({ userId: { $in: childIds } })
            .sort({ date: -1 })
            .limit(10)
            .exec();

        const totalExams = await this.resultModel.countDocuments({ userId: { $in: childIds } });

        // Calculate average score
        const allResults = await this.resultModel.find({ userId: { $in: childIds } });
        const totalScore = allResults.reduce((acc, curr) => acc + curr.score, 0);
        const averageScore = allResults.length > 0 ? Math.round(totalScore / allResults.length) : 0;

        // Get child details
        const childrenDetails = await this.userModel.find({ id: { $in: childIds } });

        return {
            hasChildren: true,
            children: childrenDetails,
            stats: {
                averageScore,
                totalExams
            },
            recentResults: results
        };
    }
}
