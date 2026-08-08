import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Subject, SubjectSchema } from '../schemas/subject.schema';
import { Result, ResultSchema } from '../schemas/result.schema';
import { ShopItem, ShopItemSchema } from '../schemas/shop-item.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Subject.name, schema: SubjectSchema },
            { name: Result.name, schema: ResultSchema },
            { name: ShopItem.name, schema: ShopItemSchema },
        ]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
