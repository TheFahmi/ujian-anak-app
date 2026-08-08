import { Controller, Get, Post, Body } from '@nestjs/common';
import { ShopService } from './shop.service';

@Controller()
export class ShopController {
    constructor(private readonly shopService: ShopService) { }

    // Original backend endpoint: GET /api/shop
    @Get('api/shop')
    async getShopItemsApi() {
        return this.shopService.getShopItems();
    }

    // Original backend endpoint: POST /api/shop/buy
    @Post('api/shop/buy')
    async buyItemApi(@Body() body: { userId: string, itemId: string }) {
        return this.shopService.buyItem(body.userId, body.itemId);
    }

    // V2 endpoints
    @Get('shop')
    async getShopItems() {
        return this.shopService.getShopItems();
    }

    @Post('shop/buy')
    async buyItem(@Body() body: { userId: string, itemId: string }) {
        return this.shopService.buyItem(body.userId, body.itemId);
    }
}
