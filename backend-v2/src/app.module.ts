import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
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
import { MailModule } from './mail/mail.module';
import { AdaptiveModule } from './adaptive/adaptive.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
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
    MailModule,
    AdaptiveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
