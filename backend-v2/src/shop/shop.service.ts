import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopItem, ShopItemDocument } from '../schemas/shop-item.schema';
import { Reward, RewardDocument } from '../schemas/reward.schema';

@Injectable()
export class ShopService {
    constructor(
        @InjectModel(ShopItem.name) private shopItemModel: Model<ShopItemDocument>,
        @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    ) { }

    async getShopItems() {
        return this.shopItemModel.find().exec();
    }

    async buyItem(userId: string, itemId: string) {
        const item = await this.shopItemModel.findOne({ id: itemId }).exec();
        if (!item) throw new NotFoundException('Item not found');

        let reward = await this.rewardModel.findOne({ userId }).exec();
        if (!reward) {
            // Create default reward profile if not exists
            reward = new this.rewardModel({ userId, coins: 0, badges: [], inventory: [], stats: {} });
        }

        if (reward.inventory.includes(itemId)) {
            throw new BadRequestException('Item already owned');
        }

        if (reward.coins < item.cost) {
            throw new BadRequestException('Insufficient coins');
        }

        reward.coins -= item.cost;
        reward.inventory.push(itemId);
        await reward.save();

        return { success: true, coins: reward.coins, inventory: reward.inventory };
    }

    async getUserRewards(userId: string) {
        let reward = await this.rewardModel.findOne({ userId }).exec();
        if (!reward) {
            reward = new this.rewardModel({ userId, coins: 0, badges: [], inventory: [], stats: {} });
            await reward.save();
        }
        return reward;
    }

    async selectFriend(userId: string, friendId: string) {
        const reward = await this.rewardModel.findOne({ userId }).exec();
        if (!reward) throw new NotFoundException('User rewards not found');

        reward.stats = { ...reward.stats, selectedFriendId: friendId };
        await reward.save();
        return { success: true };
    }

    // Original backend logic: also gives social-butterfly badge
    async selectFriendWithBadge(userId: string, friendId: string) {
        const reward = await this.rewardModel.findOne({ userId }).exec();
        if (!reward) throw new NotFoundException('Reward data not found');

        reward.stats.selectedFriendId = friendId;
        reward.stats.friendSelected = true; // Mark as selected for badge

        // Check social-butterfly badge
        const badgeId = 'social-butterfly';
        if (!reward.badges.includes(badgeId)) {
            reward.badges.push(badgeId);
        }

        await reward.save();
        return { success: true, selectedFriendId: friendId };
    }
}
