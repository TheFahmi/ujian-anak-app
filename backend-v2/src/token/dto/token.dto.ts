import { IsNumber, Min, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateTokenSettingsDto {
    @IsNumber()
    @Min(0)
    inputTokenPrice: number;

    @IsNumber()
    @Min(0)
    outputTokenPrice: number;
}

export class TokenUsageQueryDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number = 20;

    @IsOptional()
    @IsString()
    @IsIn(['timestamp', 'inputTokens', 'outputTokens', 'totalTokens'])
    sortBy?: string = 'timestamp';

    @IsOptional()
    @IsString()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}

export interface TokenStatsResponse {
    today: TokenStatsPeriod;
    week: TokenStatsPeriod;
    month: TokenStatsPeriod;
    all: TokenStatsPeriod;
}

export interface TokenStatsPeriod {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
    requestCount: number;
}

export interface TokenUsageListResponse {
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface TokenSettingsResponse {
    inputTokenPrice: number;
    outputTokenPrice: number;
    updatedAt: Date;
    updatedBy?: string;
}
