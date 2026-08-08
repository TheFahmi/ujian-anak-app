import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Pilihan {
    @Prop()
    id: string;

    @Prop()
    text: string;
}
export const PilihanSchema = SchemaFactory.createForClass(Pilihan);

@Schema()
export class Soal {
    @Prop()
    id: number;

    @Prop()
    pertanyaan: string;

    @Prop({ default: 'pilihan_ganda' })
    tipe: string;

    @Prop({ type: [PilihanSchema] })
    pilihan: Pilihan[];

    @Prop()
    jawaban_benar: string;

    @Prop()
    rubrik_penilaian: string;
}
export const SoalSchema = SchemaFactory.createForClass(Soal);

export type SubjectDocument = Subject & Document;

@Schema()
export class Subject {
    @Prop({ required: true, unique: true })
    id: number;

    @Prop()
    nama: string;

    @Prop()
    kelas: string;

    @Prop({ default: 60 })
    durasi: number;

    @Prop({ type: [SoalSchema] })
    soal: Soal[];
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
