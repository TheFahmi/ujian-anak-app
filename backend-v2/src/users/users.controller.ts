import { Controller, Put, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
    constructor(private usersService: UsersService) { }

    // Kode unik siswa utk orang tua
    @Get('api/user/:id/kode-ortua')
    async getKodeOrtuaApi(@Param('id') id: string) {
        try {
            const kode = await this.usersService.getKodeOrtua(id);
            return { success: true, kode };
        } catch (e: any) {
            throw new BadRequestException(e?.message || 'Gagal ambil kode');
        }
    }

    // Orang tua link anak via kode
    @Put('api/user/:id/link-anak')
    async linkAnakApi(@Param('id') id: string, @Body('kode') kode: string) {
        try {
            return await this.usersService.linkAnakViaKode(id, kode);
        } catch (e: any) {
            throw new BadRequestException(e?.message || 'Gagal hubungkan anak');
        }
    }

    // Original backend endpoint: GET /api/user/:id
    @Get('api/user/:id')
    async getUserApi(@Param('id') id: string) {
        const user = await this.usersService.findById(id);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        return {
            id: user.id,
            username: user.username,
            role: user.role,
            kelas: user.kelas,
            mata_pelajaran: user.mata_pelajaran,
            avatar: user.avatar || '/images/profil-avatar-dino.png'
        };
    }

    // Original backend endpoint: PUT /api/user/:id/kelas
    @Put('api/user/:id/kelas')
    async updateKelasApi(@Param('id') id: string, @Body('kelas') kelas: string) {
        return this.usersService.update(id, { kelas });
    }

    // Original backend endpoint: PUT /api/user/:id/avatar
    @Put('api/user/:id/avatar')
    async updateAvatarApi(@Param('id') id: string, @Body('avatar') avatar: string) {
        const user = await this.usersService.updateAvatar(id, avatar);
        return { success: true, avatar: user.avatar };
    }

    // Original backend endpoint: PUT /api/user/:id/password
    @Put('api/user/:id/password')
    async updatePasswordApi(
        @Param('id') id: string,
        @Body() body: { currentPassword: string; newPassword: string }
    ) {
        const user = await this.usersService.findById(id);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Check current password (plain text comparison for backward compatibility)
        if (user.password !== body.currentPassword) {
            throw new BadRequestException('Kata sandi lama salah');
        }

        // Update with new password (will be hashed in service)
        await this.usersService.updatePasswordPlain(id, body.newPassword);
        return { success: true };
    }

    // Frontend-v2 endpoints: /api/users/:id/...
    @Put('api/users/:id/avatar')
    async updateAvatarV2(@Param('id') id: string, @Body() body: { avatar: string }) {
        const avatar = body?.avatar;
        if (!avatar) {
            throw new BadRequestException('Avatar URL is required');
        }
        const user = await this.usersService.updateAvatar(id, avatar);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        return { success: true, avatar: user.avatar };
    }

    @Put('api/users/:id/password')
    async updatePasswordV2(
        @Param('id') id: string,
        @Body() body: { currentPassword: string; newPassword: string }
    ) {
        const user = await this.usersService.findById(id);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Check current password
        if (user.password !== body.currentPassword) {
            throw new BadRequestException('Kata sandi lama salah');
        }

        await this.usersService.updatePasswordPlain(id, body.newPassword);
        return { success: true };
    }

    // V2 endpoints (without /api prefix)
    @Put('users/:id/avatar')
    async updateAvatar(@Param('id') id: string, @Body('avatar') avatar: string) {
        return this.usersService.updateAvatar(id, avatar);
    }

    @Put('users/:id/password')
    async updatePassword(@Param('id') id: string, @Body('password') password: string) {
        return this.usersService.updatePassword(id, password);
    }
}
