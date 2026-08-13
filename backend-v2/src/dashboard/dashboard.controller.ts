import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('guru')
    @UseGuards(AuthGuard('jwt'))
    async getTeacherDashboard(@Request() req, @Query('userId') userId?: string) {
        const id = userId || req.user?.userId;
        return this.dashboardService.getTeacherDashboard(id);
    }

    // Daftar siswa yang terlihat guru (filter kelas_assign)
    @Get('guru/siswa')
    @UseGuards(AuthGuard('jwt'))
    async getTeacherStudents(@Request() req, @Query('userId') userId?: string) {
        const id = userId || req.user?.userId;
        return this.dashboardService.getTeacherStudents(id);
    }

    // Detail mapel yang di-assign ke guru (soal penuh untuk dikelola)
    @Get('guru/mapel/:subjectId')
    @UseGuards(AuthGuard('jwt'))
    async getTeacherSubject(@Param('subjectId') subjectId: string, @Request() req, @Query('userId') userId?: string) {
        const id = userId || req.user?.userId;
        return this.dashboardService.getTeacherSubject(id, subjectId);
    }

    @Get('orangtua/:parentId')
    async getParentDashboard(@Param('parentId') parentId: string) {
        return this.dashboardService.getParentDashboard(parentId);
    }
}
