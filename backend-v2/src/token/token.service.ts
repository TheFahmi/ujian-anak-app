import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenUsage, TokenUsageDocument } from '../schemas/token-usage.schema';
import { TokenSettings, TokenSettingsDocument } from '../schemas/token-settings.schema';
import {
    TokenStatsResponse,
    TokenStatsPeriod,
    TokenUsageListResponse,
    TokenSettingsResponse,
    UpdateTokenSettingsDto,
} from './dto/token.dto';

@Injectable()
export class TokenService {
    constructor(
        @InjectModel(TokenUsage.name) private tokenUsageModel: Model<TokenUsageDocument>,
        @InjectModel(TokenSettings.name) private tokenSettingsModel: Model<TokenSettingsDocument>,
    ) { }

    /**
     * Record token usage after AI request
     */
    async recordUsage(data: {
        userId: string;
        username: string;
        inputTokens: number;
        outputTokens: number;
        model?: string;
    }): Promise<TokenUsage> {
        const usage = new this.tokenUsageModel({
            userId: data.userId,
            username: data.username,
            inputTokens: data.inputTokens,
            outputTokens: data.outputTokens,
            totalTokens: data.inputTokens + data.outputTokens,
            model: data.model || 'Qwen/Qwen3-235B-A22B',
            timestamp: new Date(),
        });
        return usage.save();
    }

    /**
     * Estimate tokens from text length
     * Formula: 1 token ≈ 4 characters for Indonesian text
     */
    estimateTokens(text: string): number {
        if (!text) return 0;
        return Math.ceil(text.length / 4);
    }

    /**
     * Calculate cost based on token usage and prices (USD per 1M tokens)
     * Formula: (tokens / 1,000,000) * pricePerMillion
     */
    calculateCost(
        inputTokens: number,
        outputTokens: number,
        inputPricePerMillion: number,
        outputPricePerMillion: number,
    ): number {
        const inputCost = (inputTokens / 1_000_000) * inputPricePerMillion;
        const outputCost = (outputTokens / 1_000_000) * outputPricePerMillion;
        return inputCost + outputCost;
    }


    /**
     * Get aggregated token statistics
     */
    async getStats(): Promise<TokenStatsResponse> {
        const settings = await this.getSettings();
        const now = new Date();

        // Calculate date boundaries
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(todayStart);
        monthStart.setMonth(monthStart.getMonth() - 1);

        const [today, week, month, all] = await Promise.all([
            this.aggregateTokens(todayStart),
            this.aggregateTokens(weekStart),
            this.aggregateTokens(monthStart),
            this.aggregateTokens(null),
        ]);

        const calcCost = (stats: any) => this.calculateCost(
            stats.inputTokens,
            stats.outputTokens,
            settings.inputTokenPrice,
            settings.outputTokenPrice,
        );

        return {
            today: { ...today, cost: calcCost(today) },
            week: { ...week, cost: calcCost(week) },
            month: { ...month, cost: calcCost(month) },
            all: { ...all, cost: calcCost(all) },
        };
    }

    private async aggregateTokens(since: Date | null): Promise<Omit<TokenStatsPeriod, 'cost'>> {
        const match = since ? { timestamp: { $gte: since } } : {};

        const result = await this.tokenUsageModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    inputTokens: { $sum: '$inputTokens' },
                    outputTokens: { $sum: '$outputTokens' },
                    totalTokens: { $sum: '$totalTokens' },
                    requestCount: { $sum: 1 },
                },
            },
        ]);

        if (result.length === 0) {
            return { inputTokens: 0, outputTokens: 0, totalTokens: 0, requestCount: 0 };
        }

        return {
            inputTokens: result[0].inputTokens,
            outputTokens: result[0].outputTokens,
            totalTokens: result[0].totalTokens,
            requestCount: result[0].requestCount,
        };
    }

    /**
     * Get paginated usage history with sorting
     */
    async getUsageHistory(options: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    }): Promise<TokenUsageListResponse> {
        const { page, limit, sortBy, sortOrder } = options;
        const skip = (page - 1) * limit;
        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            this.tokenUsageModel
                .find()
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.tokenUsageModel.countDocuments().exec(),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get current token settings
     */
    async getSettings(): Promise<TokenSettingsResponse> {
        let settings = await this.tokenSettingsModel.findOne().exec();

        if (!settings) {
            // Create default settings if none exist (USD per 1M tokens - DeepSeek V3 pricing)
            settings = await this.tokenSettingsModel.create({
                inputTokenPrice: 0.14, // $0.14 per 1M input tokens
                outputTokenPrice: 0.28, // $0.28 per 1M output tokens
                updatedAt: new Date(),
            });
        }

        return {
            inputTokenPrice: settings.inputTokenPrice,
            outputTokenPrice: settings.outputTokenPrice,
            updatedAt: settings.updatedAt,
            updatedBy: settings.updatedBy,
        };
    }

    /**
     * Update token settings with validation
     */
    async updateSettings(dto: UpdateTokenSettingsDto, adminId: string): Promise<TokenSettingsResponse> {
        if (dto.inputTokenPrice < 0 || dto.outputTokenPrice < 0) {
            throw new BadRequestException('Price must be non-negative');
        }

        if (typeof dto.inputTokenPrice !== 'number' || typeof dto.outputTokenPrice !== 'number') {
            throw new BadRequestException('Price must be a number');
        }

        let settings = await this.tokenSettingsModel.findOne().exec();

        if (settings) {
            settings.inputTokenPrice = dto.inputTokenPrice;
            settings.outputTokenPrice = dto.outputTokenPrice;
            settings.updatedAt = new Date();
            settings.updatedBy = adminId;
            await settings.save();
        } else {
            settings = await this.tokenSettingsModel.create({
                inputTokenPrice: dto.inputTokenPrice,
                outputTokenPrice: dto.outputTokenPrice,
                updatedAt: new Date(),
                updatedBy: adminId,
            });
        }

        return {
            inputTokenPrice: settings.inputTokenPrice,
            outputTokenPrice: settings.outputTokenPrice,
            updatedAt: settings.updatedAt,
            updatedBy: settings.updatedBy,
        };
    }
}
