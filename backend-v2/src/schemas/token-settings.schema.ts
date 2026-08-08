import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenSettingsDocument = TokenSettings & Document;

@Schema()
export class TokenSettings {
    // Price in USD per 1M tokens (e.g., 0.14 = $0.14 per 1M input tokens)
    @Prop({ default: 0.14 })
    inputTokenPrice: number;

    // Price in USD per 1M tokens (e.g., 0.28 = $0.28 per 1M output tokens)
    @Prop({ default: 0.28 })
    outputTokenPrice: number;

    @Prop({ default: Date.now })
    updatedAt: Date;

    @Prop()
    updatedBy: string;
}

export const TokenSettingsSchema = SchemaFactory.createForClass(TokenSettings);
