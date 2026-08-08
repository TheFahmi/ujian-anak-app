import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import { UpdateTokenSettingsDto, TokenUsageQueryDto } from './dto/token.dto';

@Controller()
export class TokenController {
    constructor(private readonly tokenService: TokenService) {}

    // GET /api/admin/token/stats
    @Get('api/admin/token/stats')
    async getStatsApi() {
        return this.tokenService.getStats();
    }

    // GET /api/admin/token/usage
    @Get('api/admin/token/usage')
    async getUsageHistoryApi(@Query() query: TokenUsageQueryDto) {
        return this.tokenService.getUsageHistory({
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
            sortBy: query.sortBy || 'timestamp',
            sortOrder: query.sortOrder || 'desc',
        });
    }

    // GET /api/admin/token/settings
    @Get('api/admin/token/settings')
    async getSettingsApi() {
        return this.tokenService.getSettings();
    }

    // POST /api/admin/token/settings
    @Post('api/admin/token/settings')
    async updateSettingsApi(@Body() dto: UpdateTokenSettingsDto) {
        // TODO: Get admin ID from auth context
        return this.tokenService.updateSettings(dto, 'admin');
    }

    // V2 endpoints (without /api prefix)
    @Get('admin/token/stats')
    async getStats() {
        return this.tokenService.getStats();
    }

    @Get('admin/token/usage')
    async getUsageHistory(@Query() query: TokenUsageQueryDto) {
        return this.tokenService.getUsageHistory({
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
            sortBy: query.sortBy || 'timestamp',
            sortOrder: query.sortOrder || 'desc',
        });
    }

    @Get('admin/token/settings')
    async getSettings() {
        return this.tokenService.getSettings();
    }

    @Post('admin/token/settings')
    async updateSettings(@Body() dto: UpdateTokenSettingsDto) {
        return this.tokenService.updateSettings(dto, 'admin');
    }
}
