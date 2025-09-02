import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/config/database.module';
import { validationSchema } from './shared/config/validate-envs';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/identity/auth/auth.module';
import { UsersModule } from './modules/identity/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
