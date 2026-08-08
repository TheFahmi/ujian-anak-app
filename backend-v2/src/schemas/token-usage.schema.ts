import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenUsageDocument = TokenUsage & Document;

@Schema()
export class TokenUsage {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    inputTokens: number;

    @Prop({ required: true })
    outputTokens: number;

    @Prop({ required: true })
    totalTokens: number;

    @Prop({ default: 'Qwen/Qwen3-235B-A22B' })
    model: string;

    @Prop({ default: Date.now, index: true })
    timestamp: Date;
}

export const TokenUsageSchema = SchemaFactory.createForClass(TokenUsage);

// Add index for efficient time-based queries
TokenUsageSchema.index({ timestamp: -1 });
