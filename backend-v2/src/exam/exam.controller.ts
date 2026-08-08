import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ExamService } from './exam.service';

@Controller()
export class ExamController {
    constructor(private readonly examService: ExamService) { }

    // Original backend endpoint: /api/soal/:subjectId
    @Get('api/soal/:subjectId')
    async getSoal(
        @Param('subjectId') subjectId: string,
        @Query('userId') userId: string,
        @Query('review') review: string
    ) {
        const isReview = review === 'true';
        return this.examService.getQuestions(subjectId, userId, isReview);
    }

    // Frontend-v2 endpoint: /api/exam/questions/:subjectId
    @Get('api/exam/questions/:subjectId')
    async getQuestionsApiExam(
        @Param('subjectId') subjectId: string,
        @Query('userId') userId: string,
        @Query('review') review: string
    ) {
        const isReview = review === 'true';
        return this.examService.getQuestions(subjectId, userId, isReview);
    }

    // Alternative endpoint for v2 frontend (without /api prefix)
    @Get('exam/questions/:subjectId')
    async getQuestions(
        @Param('subjectId') subjectId: string,
        @Query('userId') userId: string,
        @Query('review') review: string
    ) {
        const isReview = review === 'true';
        return this.examService.getQuestions(subjectId, userId, isReview);
    }

    // Original backend endpoint: /api/submit
    @Post('api/submit')
    async submitSoal(@Body() body: { userId: string, subjectId: string, jawaban: any, cheatCount?: number }) {
        // Map 'jawaban' to 'answers' for compatibility with original backend
        return this.examService.submitExam(body.userId, body.subjectId, body.jawaban, body.cheatCount || 0);
    }

    // Frontend-v2 endpoint: /api/exam/submit
    @Post('api/exam/submit')
    async submitExamApiExam(@Body() body: { userId: string, subjectId: string, answers: any, cheatCount?: number }) {
        return this.examService.submitExam(body.userId, body.subjectId, body.answers, body.cheatCount || 0);
    }

    // Alternative endpoint for v2 frontend (without /api prefix)
    @Post('exam/submit')
    async submitExam(@Body() body: { userId: string, subjectId: string, answers: any, cheatCount?: number }) {
        return this.examService.submitExam(body.userId, body.subjectId, body.answers, body.cheatCount || 0);
    }

    // Original backend endpoint: /api/exam/lock
    @Post('api/exam/lock')
    async lockExamApi(@Body() body: { userId: string, subjectId: string }) {
        return this.examService.lockExam(body.userId, body.subjectId);
    }

    @Post('exam/lock')
    async lockExam(@Body() body: { userId: string, subjectId: string }) {
        return this.examService.lockExam(body.userId, body.subjectId);
    }

    // Original backend endpoint: /api/exam/unlock
    @Post('api/exam/unlock')
    async unlockExamApi(@Body() body: { userId: string, subjectId: string, password: string }) {
        return this.examService.unlockExam(body.userId, body.subjectId, body.password);
    }

    @Post('exam/unlock')
    async unlockExam(@Body() body: { userId: string, subjectId: string, password: string }) {
        return this.examService.unlockExam(body.userId, body.subjectId, body.password);
    }

    // Original backend endpoint: /api/retry-grading
    @Post('api/retry-grading')
    async retryGradingApi(@Body() body: { resultId: string, questionId: number }) {
        return this.examService.retryGrading(body.resultId, body.questionId);
    }

    @Post('exam/retry-grading')
    async retryGrading(@Body() body: { resultId: string, questionId: number }) {
        return this.examService.retryGrading(body.resultId, body.questionId);
    }
}
