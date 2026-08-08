import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    // Original backend endpoint: POST /api/login
    @Post('api/login')
    async loginApi(@Body() req) {
        const user = await this.authService.validateUser(req.username, req.password);
        if (!user) {
            return { success: false, message: 'Invalid credentials' };
        }
        const result = await this.authService.login(user);
        return {
            success: true,
            access_token: result.access_token,
            user: result.user
        };
    }

    // Frontend-v2 endpoint: POST /api/auth/login
    @Post('api/auth/login')
    async loginApiAuth(@Body() req) {
        const user = await this.authService.validateUser(req.username, req.password);
        if (!user) {
            return { success: false, message: 'Invalid credentials' };
        }
        const result = await this.authService.login(user);
        return {
            success: true,
            access_token: result.access_token,
            user: result.user
        };
    }

    // V2 endpoint
    @Post('auth/login')
    async login(@Body() req) {
        const user = await this.authService.validateUser(req.username, req.password);
        if (!user) {
            return { success: false, message: 'Invalid credentials' };
        }
        const result = await this.authService.login(user);
        return {
            success: true,
            access_token: result.access_token,
            user: result.user
        };
    }

    @Post('auth/register')
    async register(@Body() createUserDto) {
        return this.authService.register(createUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('auth/profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
