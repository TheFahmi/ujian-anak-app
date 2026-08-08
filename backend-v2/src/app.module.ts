import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema } from './schemas/user.schema';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { ExamSession, ExamSessionSchema } from './schemas/exam-session.schema';
import { Result, ResultSchema } from './schemas/result.schema';
import { Reward, RewardSchema } from './schemas/reward.schema';
import { ShopItem, ShopItemSchema } from './schemas/shop-item.schema';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExamModule } from './exam/exam.module';
import { ShopModule } from './shop/shop.module';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './admin/admin.module';
import { SubjectModule } from './subject/subject.module';
import { ResultsModule } from './results/results.module';
import { AiModule } from './ai/ai.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: ExamSession.name, schema: ExamSessionSchema },
      { name: Result.name, schema: ResultSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: ShopItem.name, schema: ShopItemSchema },
    ]),
    AuthModule,
    UsersModule,
    ExamModule,
    ShopModule,
    DatabaseModule,
    AdminModule,
    SubjectModule,
    ResultsModule,
    AiModule,
    DashboardModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
