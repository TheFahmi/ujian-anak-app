import { Controller, Get, Param, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('guru')
    async getTeacherDashboard(@Query('userId') userId?: string) {
        return this.dashboardService.getTeacherDashboard(userId || '');
    }

    // Daftar siswa yang terlihat guru (filter kelas_assign)
    @Get('guru/siswa')
    async getTeacherStudents(@Query('userId') userId?: string) {
        return this.dashboardService.getTeacherStudents(userId || '');
    }

    // Progress adaptif siswa utk guru (level + skill per mapel)
    @Get('guru/adaptif')
    async getTeacherAdaptiveProgress(@Query('userId') userId?: string) {
        return this.dashboardService.getTeacherAdaptiveProgress(userId || '');
    }

    // Detail mapel yang di-assign ke guru (soal penuh untuk dikelola)
    @Get('guru/mapel/:subjectId')
    async getTeacherSubject(@Param('subjectId') subjectId: string, @Query('userId') userId?: string) {
        return this.dashboardService.getTeacherSubject(userId || '', subjectId);
    }

    @Get('orangtua/:parentId')
    async getParentDashboard(@Param('parentId') parentId: string) {
        return this.dashboardService.getParentDashboard(parentId);
    }

    @Get('orangtua/:parentId/report/:childId')
    async getParentReport(@Param('parentId') parentId: string, @Param('childId') childId: string) {
        return this.dashboardService.getParentReport(parentId, childId);
    }

    @Get('orangtua/:parentId/report/:childId/riwayat')
    async getParentReportRiwayat(
        @Param('parentId') parentId: string,
        @Param('childId') childId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.dashboardService.getParentReportRiwayat(parentId, childId, Number(page) || 1, Number(limit) || 10);
    }
}
