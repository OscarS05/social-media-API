import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { User as UserORM } from './infrastructure/persistence/db/entites/user.orm-entity';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { GoogleStrategy } from './infrastructure/services/strategies/google.strategy';
import { LoginUseCase } from './application/use-cases/users/login-local.usecase';
import { RegisterUserUseCase } from './application/use-cases/users/register-with-local.usecase';
import { BcryptPasswordHasher } from './infrastructure/services/security/bcrypt-hasher.service';
import { Env } from '../../shared/config/env.model';
import { LoginWithOAuthUseCase } from './application/use-cases/users/login-with-oauth';
import { IpService } from './infrastructure/services/security/ipAddress.service';
import { LibUserAgentService } from './infrastructure/services/security/userAgent.service';
import { SessionRepositoryORM } from './infrastructure/persistence/db/repositories/session.repository';
import { Session as SessionOrm } from './infrastructure/persistence/db/entites/sessions.orm-entity';
import { RevokeOneSessionUseCase } from './application/use-cases/session/revoke-one-session.usecase';
import { FindAllSessionsUseCase } from './application/use-cases/session/find-all-session.usecase';
import { RevokeAllSessionsUseCase } from './application/use-cases/session/revoke-all-sessions.usecase';
import { UserRepositoryORM } from './infrastructure/persistence/db/repositories/user.repository';
import { RefreshSessionUseCase } from './application/use-cases/session/refresh-session.usecase';
import { HasherService } from './domain/services/hasher.service';
import { SessionManagerService } from './application/services/session-manager.service';
import { SessionRepository } from './domain/repositories/session.repository';
import { UserRepository } from './domain/repositories/user.repository';
import { UserAgentService } from './domain/services/userAgent.service';
import { IpAddressService } from './domain/services/ipAddress.service';
import { JwtTokenService } from './infrastructure/services/security/jwt.service';
import { TokenService } from './domain/services/token.service';
import { AccessTokenGuard } from './infrastructure/services/guards/accessToken.guard';
import { APP_GUARD } from '@nestjs/core';
import { UuidService } from './domain/services/uuid.service';
import { UuidAdapter } from './infrastructure/services/security/uuid.service';
import { TransactionManager } from './domain/services/transaction-manager.service';
import { TypeOrmTransactionManager } from './infrastructure/services/transaction/typeorm-transaction-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserORM, SessionOrm]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<Env>) => {
        return {
          secret: configService.get('ACCESS_SECRET', { infer: true }),
          signOptions: {
            expiresIn: configService.get('ACCESS_EXPIRES_IN', { infer: true }),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: TokenService, useClass: JwtTokenService },
    { provide: SessionRepository, useClass: SessionRepositoryORM },
    { provide: UserRepository, useClass: UserRepositoryORM },
    { provide: HasherService, useClass: BcryptPasswordHasher },
    { provide: UserAgentService, useClass: LibUserAgentService },
    { provide: IpAddressService, useClass: IpService },
    { provide: UuidService, useClass: UuidAdapter },
    { provide: TransactionManager, useClass: TypeOrmTransactionManager },
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    LoginUseCase,
    RegisterUserUseCase,
    GoogleStrategy,
    LoginWithOAuthUseCase,
    RevokeOneSessionUseCase,
    FindAllSessionsUseCase,
    RevokeAllSessionsUseCase,
    RefreshSessionUseCase,
    SessionManagerService,
  ],
  exports: [TokenService],
})
export class AuthModule {}
