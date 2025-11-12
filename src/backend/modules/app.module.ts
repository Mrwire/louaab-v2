import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth.module';
import { ToyModule } from './toy.module';
import { OrderModule } from './order.module';
import { SubscriptionModule } from './subscription.module';
import { AgeRangeModule } from './age-range.module';
import { CategoryModule } from './category.module';
import { PackModule } from './pack.module';
import { FAQModule } from './faq.module';
import { ContactModule } from './contact.module';
import { SyncModule } from './sync.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'postgres'),
        database: configService.get('DATABASE_NAME', 'louaab'),
        entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    // Feature modules
    HealthModule,
    AuthModule,
    ToyModule,
    OrderModule,
    SubscriptionModule,
    AgeRangeModule,
    CategoryModule,
    PackModule,
    FAQModule,
    ContactModule,
    SyncModule,
  ],
})
export class AppModule {}
