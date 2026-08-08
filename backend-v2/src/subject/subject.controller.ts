import { Controller, Get, Query } from '@nestjs/common';
import { SubjectService } from './subject.service';

@Controller()
export class SubjectController {
    constructor(private subjectService: SubjectService) { }

    // Original backend endpoint: GET /api/subjects
    @Get('api/subjects')
    async getSubjectsApi(@Query('kelas') kelas: string, @Query('userId') userId: string) {
        return this.subjectService.getSubjects(kelas, userId);
    }

    // V2 endpoint
    @Get('subjects')
    async getSubjects(@Query('kelas') kelas: string, @Query('userId') userId: string) {
        return this.subjectService.getSubjects(kelas, userId);
    }
}
