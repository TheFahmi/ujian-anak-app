import { Controller, Get, Param, Query } from '@nestjs/common';
import { ResultsService } from './results.service';

@Controller()
export class ResultsController {
    constructor(private readonly resultsService: ResultsService) { }

    // Frontend-v2 memakai /api/results/:id untuk dua hal sekaligus:
    // 1. satu hasil ujian (review page), 2. semua hasil milik user (history page).
    // Dulu dibedakan lewat bentuk ObjectId 24-hex vs UUID. Setelah migrasi ke
    // Postgres keduanya UUID, jadi pembedanya sekarang: coba ambil sebagai
    // resultId, kalau tidak ada baru dianggap userId.
    private async ambil(id: string) {
        try {
            return await this.resultsService.getResult(id);
        } catch {
            return this.resultsService.getResultsByUser(id);
        }
    }

    @Get('api/results/:id')
    async getResultsApi(
        @Param('id') id: string,
        @Query('userId') userId?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('paginated') paginated?: string,
    ) {
        // If userId query param exists, use it (admin panel / history page)
        if (userId) {
            // Pagination: GET /api/results/:anything?userId=X&paginated=1&page=2&limit=10
            if (paginated === '1' || paginated === 'true') {
                return this.resultsService.getResultsPaginated(userId, Number(page) || 1, Number(limit) || 10);
            }
            return this.resultsService.getResultsByUser(userId);
        }
        return this.ambil(id);
    }

    // V2 endpoint: Get single result by ID (without /api prefix)
    @Get('results/:id')
    async getResult(@Param('id') id: string) {
        return this.ambil(id);
    }
}
