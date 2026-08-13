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
}
