import { Controller, Get, Post, Put, Delete, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
        return this.adminService.addQuestions(subjectId, body.questions);
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
    // GET routes the admin dashboard fetches on tab switch. The services
    // existed but were never routed, so /api/admin/{subjects,users,results}
    // returned a 404 JSON object; the page did setSubjects(data) on it and
    // crashed on subjects.map (not a function).
    @Get('api/admin/subjects')
    async getSubjectsApi() {
        return this.adminService.getSubjects();
    }

    @Get('api/admin/users')
    async getUsersApi() {
        return this.adminService.getUsers();
    }

    @Get('api/admin/results')
    async getResultsApi() {
        return this.adminService.getResults();
    }

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
        return this.adminService.updateSubject(id, subject);
    }

    @Delete('api/admin/subjects/:id')
    async deleteSubjectApi(@Param('id') id: string) {
        return this.adminService.deleteSubject(id);
    }

    @Post('api/admin/generate-questions')
    async generateQuestionsApi(@Body() body: { topic: string; type: string; count: number }) {
        return this.adminService.generateQuestions(body.topic, body.type, body.count);
    }

    // Generate questions from uploaded PDF material
    @Post('api/admin/generate-questions/pdf')
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
    async generateQuestionsFromPdfApi(
        @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
        @Body() body: { type: string; count: number }
    ) {
        if (!file) {
            return { success: false, message: 'File PDF wajib diunggah' };
        }
        if (!file.originalname.toLowerCase().endsWith('.pdf')) {
            return { success: false, message: 'File harus berformat PDF' };
        }
        return this.adminService.generateQuestionsFromPdf(file.buffer, body.type || 'pilihan_ganda', Number(body.count) || 5);
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

    // Daftar guru pending approval
    @Get('api/admin/guru-pending')
    async getGuruPending() {
        return this.adminService.getGuruPending();
    }

    // Approve/reject guru (status: active | rejected)
    @Put('api/admin/guru/:id/approval')
    async setGuruApproval(@Param('id') id: string, @Body() body: { status: string }) {
        return this.adminService.setGuruApproval(id, body.status);
    }

    @Delete('api/admin/users/:id')
    async deleteUserApi(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }
}
