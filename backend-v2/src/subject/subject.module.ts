import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectController } from './subject.controller';
import { Subject, SubjectSchema } from '../schemas/subject.schema';
import { Result, ResultSchema } from '../schemas/result.schema';
import { SubjectService } from './subject.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Subject.name, schema: SubjectSchema },
            { name: Result.name, schema: ResultSchema }
        ]),
    ],
    controllers: [SubjectController],
    providers: [SubjectService],
})
export class SubjectModule { }
