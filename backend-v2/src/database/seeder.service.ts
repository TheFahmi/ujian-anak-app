import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Subject, SubjectDocument } from '../schemas/subject.schema';
import { ShopItem, ShopItemDocument } from '../schemas/shop-item.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeederService implements OnModuleInit {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
        @InjectModel(ShopItem.name) private shopItemModel: Model<ShopItemDocument>,
    ) { }

    async onModuleInit() {
        await this.seed();
    }

    async seed() {
        const dataPath = path.join(process.cwd(), 'data.json');
        const shopDataPath = path.join(process.cwd(), 'shop_seed.json');

        if (fs.existsSync(dataPath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

            // Seed Users
            const userCount = await this.userModel.countDocuments();
            if (userCount === 0 && data.pengguna) {
                await this.userModel.insertMany(data.pengguna);
                console.log('Users seeded');
            }

            // Seed Subjects
            const subjectCount = await this.subjectModel.countDocuments();
            if (subjectCount === 0 && data.mata_pelajaran) {
                await this.subjectModel.insertMany(data.mata_pelajaran);
                console.log('Subjects seeded');
            }
        }

        if (fs.existsSync(shopDataPath)) {
            const shopData = JSON.parse(fs.readFileSync(shopDataPath, 'utf8'));
            const shopCount = await this.shopItemModel.countDocuments();
            if (shopCount === 0) {
                await this.shopItemModel.insertMany(shopData);
                console.log('Shop Items seeded');
            }
        }
    }
}
