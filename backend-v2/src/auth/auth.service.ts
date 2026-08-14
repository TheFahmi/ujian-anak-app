import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PESAN_LUPA_NETRAL = 'Kalau email terdaftar, tautan reset sudah dikirim.';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
        private prisma: PrismaService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user) {
            // Check if password is hashed (bcrypt hashes start with $2b$ or $2a$)
            const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');

            if (isHashed) {
                const isMatch = await bcrypt.compare(pass, user.password);
                if (isMatch) {
                    // Cek status approval (guru pending/rejected)
                    if (user.status_approval === 'pending') {
                        throw new UnauthorizedException('Akun guru masih menunggu persetujuan admin.');
                    }
                    if (user.status_approval === 'rejected') {
                        throw new UnauthorizedException('Pendaftaran guru ditolak. Hubungi admin.');
                    }
                    const { password, ...result } = user;
                    return result;
                }
            } else {
                // Fallback to plain text check (for existing users)
                if (user.password === pass) {
                    // Cek status approval
                    if (user.status_approval === 'pending') {
                        throw new UnauthorizedException('Akun guru masih menunggu persetujuan admin.');
                    }
                    if (user.status_approval === 'rejected') {
                        throw new UnauthorizedException('Pendaftaran guru ditolak. Hubungi admin.');
                    }
                    const { password, ...result } = user;
                    return result;
                }
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async register(userDto: any) {
        const email = String(userDto.email ?? '').trim().toLowerCase();
        if (!email) {
            throw new BadRequestException('Email wajib diisi ya.');
        }
        if (!POLA_EMAIL.test(email)) {
            throw new BadRequestException('Format emailnya belum benar. Contoh: nama@sekolah.com');
        }
        if (!userDto.password || String(userDto.password).length < 8) {
            throw new BadRequestException('Password minimal 8 karakter ya.');
        }
        // Check if user exists
        const existingUser = await this.usersService.findOne(userDto.username);
        if (existingUser) {
            throw new UnauthorizedException('Username already exists');
        }
        const emailDipakai = await this.usersService.findByEmail(email);
        if (emailDipakai) {
            throw new BadRequestException('Email ini sudah dipakai. Coba pakai email lain ya.');
        }
        // Create user (password will be hashed in UsersService)
        const role = userDto.role || 'siswa';
        const statusApproval = role === 'guru' ? 'pending' : 'active';
        // Orang tua: kode anak opsional — validasi sebelum buat user
        const kodeAnak = role === 'orangtua' && userDto.kode_anak
            ? String(userDto.kode_anak).trim().toUpperCase()
            : '';
        if (role === 'orangtua' && kodeAnak) {
            if (kodeAnak.length !== 6) {
                throw new BadRequestException('Kode anak harus 6 karakter.');
            }
            const siswa = await this.prisma.user.findUnique({ where: { kode_ortua: kodeAnak } });
            if (!siswa || siswa.role !== 'siswa') {
                throw new BadRequestException('Kode anak tidak ditemukan. Periksa kembali kode dari anak.');
            }
        }
        const newUser: any = await this.usersService.create({
            ...userDto,
            id: userDto.id || randomUUID(),
            email,
            emailTerverifikasi: false,
            role,
            status_approval: statusApproval,
        });

        // Orang tua: link anak langsung setelah akun dibuat
        if (role === 'orangtua' && kodeAnak) {
            try {
                await this.usersService.linkAnakViaKode(newUser.id, kodeAnak);
            } catch (e) {
                console.error('[auth] gagal link anak saat register:', e?.message || e);
            }
        }

        // Kirim email verifikasi. Kalau SMTP bermasalah, pendaftaran tetap dianggap sukses.
        try {
            const token = await this.buatToken(newUser.id, 'verifikasi', 24 * 60);
            await this.mailService.kirimVerifikasi(email, newUser.username, token);
        } catch (e) {
            console.error('[auth] gagal kirim email verifikasi:', e?.message || e);
        }

        // Guru pending: jangan auto-login, kasih status khusus.
        if (role === 'guru') {
            return {
                success: true,
                pending: true,
                message: 'Pendaftaran guru diterima! Tunggu persetujuan admin sebelum login.',
                user: { username: newUser.username, role },
            };
        }

        const hasil: any = await this.login(newUser);
        if (hasil.user?.password) delete hasil.user.password;
        return hasil;
    }

    private async buatToken(userId: string, jenis: string, menit: number): Promise<string> {
        const token = randomBytes(32).toString('hex');
        await this.prisma.tokenEmail.create({
            data: {
                token,
                userId,
                jenis,
                kedaluwarsa: new Date(Date.now() + menit * 60 * 1000),
                dipakai: false,
                createdAt: new Date(),
            },
        });
        return token;
    }

    private async ambilTokenSah(token: string, jenis: string) {
        if (!token) {
            throw new BadRequestException('Tautannya tidak lengkap. Coba buka lagi tautan dari emailmu ya.');
        }
        const data = await this.prisma.tokenEmail.findFirst({ where: { token, jenis } });
        if (!data) {
            throw new BadRequestException('Tautannya tidak dikenali. Coba minta tautan baru ya.');
        }
        if (data.dipakai) {
            throw new BadRequestException('Tautan ini sudah pernah dipakai. Silakan minta tautan baru ya.');
        }
        if (data.kedaluwarsa.getTime() < Date.now()) {
            throw new BadRequestException('Tautannya sudah kedaluwarsa. Silakan minta tautan baru ya.');
        }
        return data;
    }

    private async tandaiDipakai(id: string) {
        await this.prisma.tokenEmail.update({ where: { id }, data: { dipakai: true } });
    }

    async verifikasiEmail(token: string) {
        const data = await this.ambilTokenSah(token, 'verifikasi');
        const user = await this.usersService.findById(data.userId);
        if (!user) {
            throw new BadRequestException('Akunnya tidak ditemukan. Coba daftar ulang ya.');
        }
        await this.prisma.user.update({
            where: { id: data.userId },
            data: { emailTerverifikasi: true },
        });
        await this.tandaiDipakai(data.id);
        return { pesan: 'Yeay, emailmu berhasil diverifikasi! Sekarang kamu bisa masuk.' };
    }

    async lupaPassword(email: string) {
        const bersih = String(email ?? '').trim().toLowerCase();
        try {
            if (bersih && POLA_EMAIL.test(bersih)) {
                const user = await this.usersService.findByEmail(bersih);
                if (user) {
                    // Batas 3 permintaan per email per jam
                    const sejam = new Date(Date.now() - 60 * 60 * 1000);
                    const jumlah = await this.prisma.tokenEmail.count({
                        where: { userId: user.id, jenis: 'reset', createdAt: { gte: sejam } },
                    });
                    if (jumlah < 3) {
                        const token = await this.buatToken(user.id, 'reset', 60);
                        await this.mailService.kirimReset(bersih, user.username, token);
                    }
                }
            }
        } catch (e: any) {
            console.error('[auth] gagal proses lupa-password:', e?.message || e);
        }
        // Respons selalu sama supaya tidak membocorkan email mana yang terdaftar
        return { pesan: PESAN_LUPA_NETRAL };
    }

    async resetPassword(token: string, passwordBaru: string) {
        if (!passwordBaru || String(passwordBaru).length < 8) {
            throw new BadRequestException('Password baru minimal 8 karakter ya.');
        }
        const data = await this.ambilTokenSah(token, 'reset');
        const user = await this.usersService.findById(data.userId);
        if (!user) {
            throw new BadRequestException('Akunnya tidak ditemukan.');
        }
        await this.usersService.updatePassword(data.userId, passwordBaru);
        await this.tandaiDipakai(data.id);
        return { pesan: 'Password kamu sudah diganti. Silakan masuk pakai password baru.' };
    }

    async kirimUlangVerifikasi(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.email) {
            throw new BadRequestException('Akunmu belum punya email terdaftar.');
        }
        if (user.emailTerverifikasi) {
            return { pesan: 'Emailmu sudah terverifikasi.' };
        }
        const terakhir = await this.prisma.tokenEmail.findFirst({
            where: { userId, jenis: 'verifikasi' },
            orderBy: { createdAt: 'desc' },
        });
        if (terakhir && Date.now() - new Date(terakhir.createdAt).getTime() < 60 * 1000) {
            throw new BadRequestException('Tunggu sebentar sebelum kirim ulang.');
        }
        const token = await this.buatToken(userId, 'verifikasi', 24 * 60);
        await this.mailService.kirimVerifikasi(user.email, user.username, token);
        return { pesan: 'Email verifikasi sudah dikirim ulang. Cek kotak masukmu ya.' };
    }

    async profil(userId: string) {
        const user = await this.usersService.findById(userId);
        return {
            email: user?.email ?? null,
            emailTerverifikasi: user?.emailTerverifikasi ?? false,
        };
    }
}
