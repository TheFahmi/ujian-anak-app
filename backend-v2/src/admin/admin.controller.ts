import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller()
export class AdminController {
    constructor(private adminService: AdminService) {}

    // Original backend endpoint: GET /api/admin/data
    @Get('api/admin/data')
    async getDashboardDataApi() {
        return this.adminService.getDashboardData();
    }

    // Original backend endpoint: POST /api/admin/data (keep for backward compatibility)
    @Post('api/admin/data')
    async updateDataApi(@Body() data: any) {
        return this.adminService.updateData(data);
    }

    // Original backend endpoint: POST /api/admin/subject/:subjectId/questions
    @Post('api/admin/subject/:subjectId/questions')
    async addQuestionsApi(
        @Param('subjectId') subjectId: string,
        @Body() body: { questions: any[] },
    ) {
        return this.adminService.addQuestions(parseInt(subjectId), body.questions);
    }

    // Original backend endpoint: POST /api/admin/shop
    @Post('api/admin/shop')
    async addOrUpdateShopItemApi(@Body() body: any) {
        return this.adminService.addOrUpdateShopItem(body);
    }

    // Original backend endpoint: DELETE /api/admin/shop/:id
    @Delete('api/admin/shop/:id')
    async deleteShopItemApi(@Param('id') id: string) {
        return this.adminService.deleteShopItem(id);
    }

    // V2 endpoints
    @Get('admin/data')
    async getDashboardData() {
        return this.adminService.getDashboardData();
    }

    @Post('admin/data')
    async updateData(@Body() data: any) {
        return this.adminService.updateData(data);
    }

    // ============ SUBJECTS API (Dedicated) ============
    @Post('api/admin/subjects/import')
    async importSubjectsApi(@Body() body: { subjects: any[] }) {
        return this.adminService.importSubjects(body.subjects);
    }

    @Post('api/admin/subjects')
    async createSubjectApi(@Body() subject: any) {
        return this.adminService.createSubject(subject);
    }

    @Put('api/admin/subjects/:id')
    async updateSubjectApi(@Param('id') id: string, @Body() subject: any) {
        return this.adminService.updateSubject(parseInt(id), subject);
    }

    @Delete('api/admin/subjects/:id')
    async deleteSubjectApi(@Param('id') id: string) {
        return this.adminService.deleteSubject(parseInt(id));
    }

    @Post('api/admin/generate-questions')
    async generateQuestionsApi(@Body() body: { topic: string; type: string; count: number }) {
        return this.adminService.generateQuestions(body.topic, body.type, body.count);
    }

    // ============ USERS API (Dedicated) ============
    @Post('api/admin/users')
    async createUserApi(@Body() user: any) {
        return this.adminService.createUser(user);
    }

    @Put('api/admin/users/:id')
    async updateUserApi(@Param('id') id: string, @Body() user: any) {
        return this.adminService.updateUser(id, user);
    }

    @Delete('api/admin/users/:id')
    async deleteUserApi(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }
}
