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
import { AdminUiModule } from './admin-ui.module';
import { BootstrapService } from '../services/bootstrap.service';
import { AgeRange } from '../entities/age-range.entity';
import { ToyCategory } from '../entities/toy-category.entity';
import { Pack } from '../entities/pack.entity';

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
      useFactory: (configService: ConfigService) => {
        const syncSetting = configService.get<string>('DATABASE_SYNCHRONIZE');
        const shouldSynchronize =
          typeof syncSetting === 'string'
            ? syncSetting.toLowerCase() === 'true'
            : configService.get('NODE_ENV') !== 'production';

        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          username: configService.get('DATABASE_USER', 'postgres'),
          password: configService.get('DATABASE_PASSWORD', 'postgres'),
          database: configService.get('DATABASE_NAME', 'louaab'),
          entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
          synchronize: shouldSynchronize,
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
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
    AdminUiModule,
    TypeOrmModule.forFeature([AgeRange, ToyCategory, Pack]),
  ],
  providers: [BootstrapService],
})
export class AppModule {}
