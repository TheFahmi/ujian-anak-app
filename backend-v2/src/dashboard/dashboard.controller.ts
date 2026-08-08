import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('guru')
    async getTeacherDashboard() {
        return this.dashboardService.getTeacherDashboard();
    }

    @Get('orangtua/:parentId')
    async getParentDashboard(@Param('parentId') parentId: string) {
        return this.dashboardService.getParentDashboard(parentId);
    }
}
