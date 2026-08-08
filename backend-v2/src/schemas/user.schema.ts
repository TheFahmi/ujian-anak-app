import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: ['admin', 'siswa', 'pengawas', 'guru', 'orangtua'] })
    role: string;

    @Prop()
    kelas: string;

    @Prop([Number])
    mata_pelajaran: number[];

    @Prop({ default: '/images/profil-avatar-dino.png' })
    avatar: string;

    @Prop([String])
    children: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
