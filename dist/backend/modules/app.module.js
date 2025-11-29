"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth.module");
const toy_module_1 = require("./toy.module");
const order_module_1 = require("./order.module");
const subscription_module_1 = require("./subscription.module");
const age_range_module_1 = require("./age-range.module");
const category_module_1 = require("./category.module");
const pack_module_1 = require("./pack.module");
const faq_module_1 = require("./faq.module");
const contact_module_1 = require("./contact.module");
const sync_module_1 = require("./sync.module");
const admin_ui_module_1 = require("./admin-ui.module");
const bootstrap_service_1 = require("../services/bootstrap.service");
const age_range_entity_1 = require("../entities/age-range.entity");
const toy_category_entity_1 = require("../entities/toy-category.entity");
const pack_entity_1 = require("../entities/pack.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Configuration
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            // Database
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DATABASE_HOST', 'localhost'),
                    port: configService.get('DATABASE_PORT', 5432),
                    username: configService.get('DATABASE_USER', 'postgres'),
                    password: configService.get('DATABASE_PASSWORD', 'postgres'),
                    database: configService.get('DATABASE_NAME', 'louaab'),
                    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    logging: configService.get('NODE_ENV') === 'development',
                }),
            }),
            // Feature modules
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            toy_module_1.ToyModule,
            order_module_1.OrderModule,
            subscription_module_1.SubscriptionModule,
            age_range_module_1.AgeRangeModule,
            category_module_1.CategoryModule,
            pack_module_1.PackModule,
            faq_module_1.FAQModule,
            contact_module_1.ContactModule,
            sync_module_1.SyncModule,
            admin_ui_module_1.AdminUiModule,
            typeorm_1.TypeOrmModule.forFeature([age_range_entity_1.AgeRange, toy_category_entity_1.ToyCategory, pack_entity_1.Pack]),
        ],
        providers: [bootstrap_service_1.BootstrapService],
    })
], AppModule);
