import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { attachRawWs } from './ws/raw-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const server = await app.listen(port);
  // Attach a raw WebSocket server compatible with native WebSocket clients
  attachRawWs(server);
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend listening on http://localhost:${port}`);
}

bootstrap();


