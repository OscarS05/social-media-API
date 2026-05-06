import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './shared/database/config/database.module';
import { validationSchema } from './shared/config/validate-envs';
import { AuthModule } from './modules/auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ProfileModule } from './modules/social/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    DatabaseModule,
    ProfileModule,
  ],
})
export class AppModule {}
