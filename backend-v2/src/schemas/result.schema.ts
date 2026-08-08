import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Pilihan, PilihanSchema } from './subject.schema';

@Schema()
export class ResultQuestion {
    @Prop()
    id: number;

    @Prop()
    pertanyaan: string;

    @Prop()
    tipe: string;

    @Prop({ type: [PilihanSchema] })
    pilihan: Pilihan[];

    @Prop()
    rubrik_penilaian: string;
}
export const ResultQuestionSchema = SchemaFactory.createForClass(ResultQuestion);

@Schema()
export class ResultAnswer {
    @Prop()
    id: number;

    @Prop()
    tipe: string;

    @Prop()
    correct: boolean;

    @Prop()
    userAnswer: string;

    @Prop()
    correctAnswer: string;

    @Prop()
    aiScore: number;

    @Prop()
    aiFeedback: string;
}
export const ResultAnswerSchema = SchemaFactory.createForClass(ResultAnswer);

export type ResultDocument = Result & Document;

@Schema()
export class Result {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    subjectId: number;

    @Prop()
    subjectName: string;

    @Prop()
    score: number;

    @Prop()
    correctCount: number;

    @Prop()
    totalQuestions: number;

    @Prop({ default: 0 })
    cheatCount: number;

    @Prop()
    aiCoachFeedback: string;

    @Prop({ type: [ResultQuestionSchema] })
    questions: ResultQuestion[];

    @Prop({ type: [ResultAnswerSchema] })
    results: ResultAnswer[];

    @Prop({ default: Date.now })
    date: Date;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
