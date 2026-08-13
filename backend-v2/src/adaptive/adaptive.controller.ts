import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AdaptiveService } from './adaptive.service';

@Controller('api/adaptive')
export class AdaptiveController {
    constructor(private readonly adaptiveService: AdaptiveService) { }

    // Skill tree mapel
    @Get('skill-tree/:subjectId')
    async getSkillTree(@Param('subjectId') subjectId: string) {
        return this.adaptiveService.getSkillTree(subjectId);
    }

    // Info tutor + badge mapel
    @Get('mapel-info/:subjectId')
    async getMapelInfo(@Param('subjectId') subjectId: string) {
        return this.adaptiveService.getMapelInfo(subjectId);
    }

    // Progress siswa per mapel
    @Get('progress/:subjectId')
    async getProgress(@Param('subjectId') subjectId: string, @Query('userId') userId?: string) {
        return this.adaptiveService.getProgress(userId || '', subjectId);
    }

    // Mulai assessment (generate 3 soal level saat ini)
    @Post('assessment/start')
    async startAssessment(@Body() body: { userId: string; subjectId: string }) {
        return this.adaptiveService.startAssessment(body.userId, body.subjectId);
    }

    // Submit jawaban assessment → naik/turun level
    @Post('assessment/submit')
    async submitAssessment(@Body() body: { userId: string; subjectId: string; answers: any[] }) {
        return this.adaptiveService.submitAssessment(body.userId, body.subjectId, body.answers || []);
    }

    // Mode belajar: mulai latihan intensif per skill (5 soal)
    @Post('latihan/start')
    async startLatihan(@Body() body: { userId: string; subjectId: string; skillId?: string }) {
        return this.adaptiveService.startLatihan(body.userId, body.subjectId, body.skillId);
    }

    // Submit latihan → tandai skill dikuasai kalau ≥4 benar
    @Post('latihan/submit')
    async submitLatihan(@Body() body: { userId: string; subjectId: string; skillId: string; answers: any[] }) {
        return this.adaptiveService.submitLatihan(body.userId, body.subjectId, body.skillId, body.answers || []);
    }
}
