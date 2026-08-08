import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Soal, SoalSchema } from './subject.schema';

export type ExamSessionDocument = ExamSession & Document;

@Schema()
export class ExamSession {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    subjectId: number;

    @Prop({ default: Date.now })
    startTime: Date;

    @Prop({ default: Date.now })
    lastUpdated: Date;

    @Prop({ type: [SoalSchema], default: [] })
    questions: Soal[];

    @Prop({ default: false })
    isLocked: boolean;
}

export const ExamSessionSchema = SchemaFactory.createForClass(ExamSession);
ExamSessionSchema.index({ userId: 1, subjectId: 1 }, { unique: true });
