import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { TokenUsage, TokenUsageSchema } from '../schemas/token-usage.schema';
import { TokenSettings, TokenSettingsSchema } from '../schemas/token-settings.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: TokenUsage.name, schema: TokenUsageSchema },
            { name: TokenSettings.name, schema: TokenSettingsSchema },
        ]),
    ],
    controllers: [TokenController],
    providers: [TokenService],
    exports: [TokenService],
})
export class TokenModule {}
