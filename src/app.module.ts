import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module';
import { validationSchema } from './shared/config/validate-envs';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/identity/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
