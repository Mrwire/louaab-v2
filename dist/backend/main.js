"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./modules/app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    // API prefix
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend API is running on: http://localhost:${port}/api`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
}
bootstrap();
