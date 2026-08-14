import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pilihFieldUser } from './user-fields';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(username: string): Promise<any | undefined> {
        const result = await this.prisma.user.findUnique({ where: { username } });
        return result ?? undefined;
    }

    async findById(id: string): Promise<any | undefined> {
        const result = await this.prisma.user.findUnique({ where: { id } });
        return result ?? undefined;
    }

    async findByEmail(email: string): Promise<any | undefined> {
        const result = await this.prisma.user.findUnique({ where: { email } });
        return result ?? undefined;
    }

    async create(createUserDto: any): Promise<any> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const role = createUserDto.role || 'siswa';
        // Siswa: generate kode unik otomatis (6 karakter, tanpa O/0/I/1/L)
        let kode: string | null = null;
        if (role === 'siswa') {
            kode = await this.generateKodeOrtua();
        }
        return this.prisma.user.create({
            data: {
                ...pilihFieldUser(createUserDto),
                password: hashedPassword,
                role,
                kode_ortua: kode,
            },
        });
    }

    // Generate kode unik 6 karakter (tanpa karakter ambigu)
    private async generateKodeOrtua(): Promise<string> {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // tanpa O/0/I/1/L
        for (let attempt = 0; attempt < 20; attempt++) {
            let kode = '';
            for (let i = 0; i < 6; i++) {
                kode += chars[Math.floor(Math.random() * chars.length)];
            }
            const exists = await this.prisma.user.findUnique({ where: { kode_ortua: kode } });
            if (!exists) return kode;
        }
        return `K${Date.now().toString(36).toUpperCase().slice(-5)}`;
    }

    // Ambil kode ortua siswa (generate kalau belum ada)
    async getKodeOrtua(userId: string): Promise<string> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User tidak ditemukan');
        if (user.kode_ortua) return user.kode_ortua;
        const kode = await this.generateKodeOrtua();
        await this.prisma.user.update({ where: { id: userId }, data: { kode_ortua: kode } });
        return kode;
    }

    // Orang tua link anak via kode
    async linkAnakViaKode(parentId: string, kode: string): Promise<any> {
        const kodeClean = String(kode || '').trim().toUpperCase();
        if (kodeClean.length !== 6) {
            throw new Error('Kode harus 6 karakter');
        }
        const siswa = await this.prisma.user.findUnique({ where: { kode_ortua: kodeClean } });
        if (!siswa || siswa.role !== 'siswa') {
            throw new Error('Kode tidak ditemukan. Periksa kembali kode dari anak.');
        }
        const parent = await this.prisma.user.findUnique({ where: { id: parentId } });
        if (!parent) throw new Error('Orang tua tidak ditemukan');
        const children = [...(parent.children || [])];
        if (children.includes(siswa.id)) {
            return { success: true, message: 'Anak sudah terhubung', anak: { id: siswa.id, username: siswa.username, kelas: siswa.kelas } };
        }
        children.push(siswa.id);
        await this.prisma.user.update({ where: { id: parentId }, data: { children } });
        return { success: true, message: 'Anak berhasil dihubungkan!', anak: { id: siswa.id, username: siswa.username, kelas: siswa.kelas } };
    }

    async update(id: string, updateUserDto: any): Promise<any> {
        await this.pastikanAda(id);
        return this.prisma.user.update({ where: { id }, data: pilihFieldUser(updateUserDto) });
    }

    async updateAvatar(id: string, avatarUrl: string): Promise<any> {
        await this.pastikanAda(id);
        return this.prisma.user.update({ where: { id }, data: { avatar: avatarUrl } });
    }

    async updatePassword(id: string, newPassword: string): Promise<any> {
        await this.pastikanAda(id);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return this.prisma.user.update({ where: { id }, data: { password: hashedPassword } });
    }

    // For backward compatibility with original backend (stores plain text password)
    async updatePasswordPlain(id: string, newPassword: string): Promise<any> {
        await this.pastikanAda(id);
        return this.prisma.user.update({ where: { id }, data: { password: newPassword } });
    }

    private async pastikanAda(id: string) {
        const ada = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
        if (!ada) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
    }
}
