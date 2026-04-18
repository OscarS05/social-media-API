import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AccessTokenGuard } from './services/guards/accesToken.guard';
import { TokenService } from '../modules/auth/domain/services/token.service';
import { JwtTokenService } from '../modules/auth/infrastructure/services/security/jwt.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    { provide: TokenService, useClass: JwtTokenService },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
  exports: [TokenService],
})
export class SharedModule {}
