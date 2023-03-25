import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  });

  if (process.env.STAGE === 'DEV') {
    const swagger = new DocumentBuilder()
      .setTitle('Flashcards server')
      .setDescription('API for Flashcards application')
      .setVersion('1.0')
      .addTag('flashcards')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('swagger', app, document);
  }

  app.use(helmet());
  await app.listen(3000);
}
bootstrap();
