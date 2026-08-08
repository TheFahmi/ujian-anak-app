import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShopItemDocument = ShopItem & Document;

@Schema()
export class ShopItem {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    cost: number;

    @Prop({ required: true, enum: ['sticker', 'theme', 'avatar_frame', 'pet', 'effect', 'badge', 'item'] })
    type: string;

    @Prop({ required: true })
    icon: string;

    @Prop({ enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' })
    rarity: string;
}

export const ShopItemSchema = SchemaFactory.createForClass(ShopItem);
