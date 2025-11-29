import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  // Disable default bodyParser to reconfigure limits
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Body size limits (JSON + urlencoded) up to 5MB
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ limit: '5mb', extended: true }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend API is running on: http://localhost:${port}/api`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
}

bootstrap();
