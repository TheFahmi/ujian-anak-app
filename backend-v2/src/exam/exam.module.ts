import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { UsersModule } from '../users/users.module';
import { TokenModule } from '../token/token.module';

@Module({
    imports: [UsersModule, TokenModule],
    providers: [ExamService],
    controllers: [ExamController],
})
export class ExamModule { }
