import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { ShopService } from './shop.service';

@Controller()
export class RewardsController {
    constructor(private readonly shopService: ShopService) { }

    // Original backend endpoint: GET /api/rewards/:userId
    @Get('api/rewards/:userId')
    async getUserRewardsApi(@Param('userId') userId: string) {
        return this.shopService.getUserRewards(userId);
    }

    // Original backend endpoint: PUT /api/rewards/:userId/friend
    @Put('api/rewards/:userId/friend')
    async selectFriendApi(@Param('userId') userId: string, @Body() body: { friendId: string }) {
        return this.shopService.selectFriendWithBadge(userId, body.friendId);
    }

    // V2 endpoints
    @Get('rewards/:userId')
    async getUserRewards(@Param('userId') userId: string) {
        return this.shopService.getUserRewards(userId);
    }

    @Put('rewards/:userId/friend')
    async selectFriend(@Param('userId') userId: string, @Body() body: { friendId: string }) {
        return this.shopService.selectFriend(userId, body.friendId);
    }
}
