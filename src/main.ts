import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Social-media API')
    .setDescription(
      'API RESTful y GraphQL para una red social. Implementa autenticación segura con OAuth2.0 y JWT, soporte para múltiples dispositivos, gestión de usuarios, perfiles, publicaciones, seguidores/seguidos, comentarios, likes, blocks, chat en tiempo real con WebSockets y notificaciones. Construida con NestJS, TypeScript y arquitectura hexagonal siguiendo principios de DDD.',
    )
    .setVersion('1.0')
    .setExternalDoc('GitHub - Repository', 'https://github.com/OscarS05/social-media-API')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  app.enableCors({
    origin: '*',
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
