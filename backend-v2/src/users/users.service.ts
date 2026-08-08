import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async findOne(username: string): Promise<UserDocument | undefined> {
        const result = await this.userModel.findOne({ username }).exec();
        return result ?? undefined;
    }

    async findById(id: string): Promise<UserDocument | undefined> {
        const result = await this.userModel.findOne({ id }).exec();
        return result ?? undefined;
    }

    async create(createUserDto: any): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });
        return createdUser.save();
    }

    async update(id: string, updateUserDto: any): Promise<User> {
        const result = await this.userModel.findOneAndUpdate({ id }, updateUserDto, { new: true }).exec();
        if (!result) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return result;
    }

    async updateAvatar(id: string, avatarUrl: string): Promise<User> {
        const result = await this.userModel.findOneAndUpdate({ id }, { avatar: avatarUrl }, { new: true }).exec();
        if (!result) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return result;
    }

    async updatePassword(id: string, newPassword: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await this.userModel.findOneAndUpdate({ id }, { password: hashedPassword }, { new: true }).exec();
        if (!result) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return result;
    }

    // For backward compatibility with original backend (stores plain text password)
    async updatePasswordPlain(id: string, newPassword: string): Promise<User> {
        const result = await this.userModel.findOneAndUpdate({ id }, { password: newPassword }, { new: true }).exec();
        if (!result) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return result;
    }
}
