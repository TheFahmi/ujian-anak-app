import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdaptiveController } from './adaptive.controller';
import { AdaptiveService } from './adaptive.service';

@Module({
    imports: [ConfigModule],
    controllers: [AdaptiveController],
    providers: [AdaptiveService],
    exports: [AdaptiveService],
})
export class AdaptiveModule { }
