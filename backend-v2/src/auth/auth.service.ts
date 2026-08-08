import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user) {
            // Check if password is hashed (bcrypt hashes start with $2b$ or $2a$)
            const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');

            if (isHashed) {
                const isMatch = await bcrypt.compare(pass, user.password);
                if (isMatch) {
                    const { password, ...result } = user.toObject();
                    return result;
                }
            } else {
                // Fallback to plain text check (for existing users)
                if (user.password === pass) {
                    // TODO: Migrate to hash?
                    // For now, just return user
                    const { password, ...result } = user.toObject();
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
        // Check if user exists
        const existingUser = await this.usersService.findOne(userDto.username);
        if (existingUser) {
            throw new UnauthorizedException('Username already exists');
        }
        // Create user (password will be hashed in UsersService)
        const newUser = await this.usersService.create(userDto);
        return this.login(newUser);
    }
}
