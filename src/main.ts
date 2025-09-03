import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // const config = new DocumentBuilder().setTitle('Blog API').setDescription('Blog API description').setVersion('1.0').build();

  // const documentFactory = () => SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('docs', app, documentFactory, {
  //   jsonDocumentUrl: 'swagger/json',
  // });

  app.enableCors({
    origin: '*',
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
