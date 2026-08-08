import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { ShopItem, ShopItemSchema } from '../schemas/shop-item.schema';
import { Reward, RewardSchema } from '../schemas/reward.schema';
import { RewardsController } from './rewards.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ShopItem.name, schema: ShopItemSchema },
            { name: Reward.name, schema: RewardSchema },
        ]),
    ],
    providers: [ShopService],
    controllers: [ShopController, RewardsController],
})
export class ShopModule { }
