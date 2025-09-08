import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { MockGoogleStrategy } from '../../test/modules/identity/auth/infrastructure/strategies/googe.strategy-mock';
import { GoogleStrategy } from '../../src/modules/identity/auth/infrastructure/services/strategies/google.strategy';
import { FacebookStrategy } from '../../src/modules/identity/auth/infrastructure/services/strategies/facebook.strategy';
import { MockFacebookStrategy } from '../../test/modules/identity/auth/infrastructure/strategies/facebook.strategy-mock';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(GoogleStrategy)
    .useClass(MockGoogleStrategy)
    .overrideProvider(FacebookStrategy)
    .useClass(MockFacebookStrategy)
    .compile();

  const app = moduleFixture.createNestApplication();
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

  await app.init();

  return app;
}
