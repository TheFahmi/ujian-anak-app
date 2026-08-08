import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SubjectStats {
    @Prop({ default: 0 }) math: number;
    @Prop({ default: 0 }) science: number;
    @Prop({ default: 0 }) history: number;
    @Prop({ default: 0 }) language: number;
}
export const SubjectStatsSchema = SchemaFactory.createForClass(SubjectStats);

@Schema()
export class RewardStats {
    @Prop({ default: 0 }) examsTaken: number;
    @Prop({ default: 0 }) perfectScores: number;
    @Prop({ default: 0 }) highScores: number;
    @Prop({ type: SubjectStatsSchema, default: {} }) subjects: SubjectStats;
    @Prop({ default: 0 }) fastFinishes: number;
    @Prop({ default: 0 }) retries: number;
    @Prop({ default: 0 }) streak: number;
    @Prop() lastExamDate: Date;
    @Prop({ default: 0 }) nightOwl: number;
    @Prop({ default: 0 }) earlyBird: number;
    @Prop({ default: 0 }) hintsUsed: number;
    @Prop({ default: 0 }) noHints: number;
    @Prop({ default: false }) friendSelected: boolean;
    @Prop({ default: 'robo' }) selectedFriendId: string;
}
export const RewardStatsSchema = SchemaFactory.createForClass(RewardStats);

export type RewardDocument = Reward & Document;

@Schema()
export class Reward {
    @Prop({ required: true, unique: true })
    userId: string;

    @Prop({ default: 0 })
    coins: number;

    @Prop([String])
    badges: string[];

    @Prop({ type: RewardStatsSchema, default: {} })
    stats: RewardStats;

    @Prop([String])
    inventory: string[];
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
