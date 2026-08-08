import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { Subject, SubjectSchema } from '../schemas/subject.schema';
import { ExamSession, ExamSessionSchema } from '../schemas/exam-session.schema';
import { Result, ResultSchema } from '../schemas/result.schema';
import { Reward, RewardSchema } from '../schemas/reward.schema';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Subject.name, schema: SubjectSchema },
            { name: ExamSession.name, schema: ExamSessionSchema },
            { name: Result.name, schema: ResultSchema },
            { name: Reward.name, schema: RewardSchema },
        ]),
        UsersModule,
    ],
    providers: [ExamService],
    controllers: [ExamController],
})
export class ExamModule { }
