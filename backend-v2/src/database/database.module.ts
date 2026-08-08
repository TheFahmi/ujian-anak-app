import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeder.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Subject, SubjectSchema } from '../schemas/subject.schema';
import { ShopItem, ShopItemSchema } from '../schemas/shop-item.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Subject.name, schema: SubjectSchema },
            { name: ShopItem.name, schema: ShopItemSchema },
        ]),
    ],
    providers: [SeederService],
})
export class DatabaseModule { }
