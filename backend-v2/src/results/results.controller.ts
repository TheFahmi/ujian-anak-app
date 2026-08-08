import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ResultsService } from './results.service';

@Controller()
export class ResultsController {
    constructor(private readonly resultsService: ResultsService) { }

    // Frontend-v2 uses /api/results/:id for both:
    // 1. Get single result by MongoDB ObjectId (24 hex chars) - for review page
    // 2. Get all results by userId (shorter string like "siswa1") - for history page
    // 3. Query param ?userId=xxx - admin panel detail siswa
    @Get('api/results/:id')
    async getResultsApi(@Param('id') id: string, @Query('userId') userId?: string) {
        // If userId query param exists, use it (admin panel)
        if (userId) {
            return this.resultsService.getResultsByUser(userId);
        }
        
        // Check if id looks like a MongoDB ObjectId (24 hex characters)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

        if (isObjectId) {
            // It's a result ID - get single result
            try {
                return await this.resultsService.getResult(id);
            } catch (error) {
                // If ObjectId format is valid but result not found, try as userId
                // This handles edge cases where ObjectId might be valid format but not exist
                if (error instanceof NotFoundException) {
                    throw error; // Re-throw NotFoundException
                }
                // For other errors, try as userId
                return this.resultsService.getResultsByUser(id);
            }
        } else {
            // It's a user ID - get all results for user
            return this.resultsService.getResultsByUser(id);
        }
    }

    // V2 endpoint: Get single result by ID (without /api prefix)
    @Get('results/:id')
    async getResult(@Param('id') id: string) {
        // Check if id looks like a MongoDB ObjectId (24 hex characters)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

        if (isObjectId) {
            // It's a result ID - get single result
            try {
                return await this.resultsService.getResult(id);
            } catch (error) {
                // If ObjectId format is valid but result not found, try as userId
                if (error instanceof NotFoundException) {
                    throw error;
                }
                return this.resultsService.getResultsByUser(id);
            }
        } else {
            // It's a user ID - get all results for user
            return this.resultsService.getResultsByUser(id);
        }
    }
}
