import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap — application entry point.
 *
 * ValidationPipe (global):
 *   transform: true            → coerce JSON strings to TS types via @Transform
 *   whitelist: true            → strip undeclared DTO properties silently
 *   forbidNonWhitelisted: true → reject requests with extra fields (security)
 *
 * CORS:
 *   Origins from ALLOWED_ORIGINS env var (comma-separated).
 *   Falls back to localhost for development without .env.
 *
 * PORT:
 *   From environment — same binary works in dev (3001) and production.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['log', 'error', 'warn', 'debug'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform:            true,
      whitelist:            true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.enableCors({
    origin:         allowedOrigins,
    methods:        ['POST'],
    allowedHeaders: ['Content-Type'],
  });

  app.setGlobalPrefix('api');

  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);
  console.log(`API listening on port ${port}`);
}

bootstrap();
