import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Auth as AuthOrm } from './infrastructure/persistence/db/entites/auth.orm-entity';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { LocalStrategy } from './infrastructure/services/strategies/local.strategy';
import { GoogleStrategy } from './infrastructure/services/strategies/google.strategy';
import { LoginUseCase } from './application/use-cases/auth/Login.usecase';
import { RegisterUserUseCase } from './application/use-cases/auth/Register-user.usecase';
import { AuthRepository } from './infrastructure/persistence/db/repositories/auth.repository';
import { BcryptPasswordHasher } from './infrastructure/services/security/bcrypt-hasher.service';
import { CreateUserUseCase } from '../users/application/use-cases/create-user.usecase';
import { UuidAdapter } from './infrastructure/services/security/uuid.service';
import { UsersModule } from '../users/users.module';
import { GenerateTokensUseCase } from './application/use-cases/auth/generate-tokens.usecase';
import { Env } from '../../../shared/config/env.model';
import { RegisterUserWithGoogleUseCase } from './application/use-cases/auth/register-user-with-google.usecase';
import { RegisterUserWithFacebookUseCase } from './application/use-cases/auth/register-user-with-facebook.usecase';
import { FacebookStrategy } from './infrastructure/services/strategies/facebook.strategy';
import { CreateRefreshTokenUseCase } from './application/use-cases/refresh-token/create-refresh-token.usecase';
import { NetIpService } from './infrastructure/services/security/ipAddress.service';
import { LibUserAgentService } from './infrastructure/services/security/userAgent.service';
import { RefreshTokenRepository } from './infrastructure/persistence/db/repositories/refresh-token.repository';
import { RefreshToken as RefreshTokenOrm } from './infrastructure/persistence/db/entites/refresh-tokens.orm-entity';
import { VerifyRefreshTokenUseCase } from './application/use-cases/refresh-token/verify-refresh-token.usecase';
import { UpdateRefreshTokenUseCase } from './application/use-cases/refresh-token/update-refresh-token.usecase';
import { RevokeRefreshTokenUseCase } from './application/use-cases/refresh-token/revoke-refresh-token.usecase';
import { FindAllRefreshTokensUseCase } from './application/use-cases/refresh-token/find-all-refresh-tokens.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthOrm, RefreshTokenOrm]),
    PassportModule,
    UsersModule,
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
    { provide: 'IAuthRepository', useClass: AuthRepository },
    { provide: 'IRefreshTokenRepository', useClass: RefreshTokenRepository },
    { provide: 'IHasherService', useClass: BcryptPasswordHasher },
    { provide: 'CreateUserPort', useClass: CreateUserUseCase },
    { provide: 'IUuidService', useClass: UuidAdapter },
    { provide: 'JwtService', useClass: JwtService },
    { provide: 'UserAgentService', useClass: LibUserAgentService },
    { provide: 'IpAddressService', useClass: NetIpService },
    LoginUseCase,
    RegisterUserUseCase,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
    GenerateTokensUseCase,
    RegisterUserWithGoogleUseCase,
    RegisterUserWithFacebookUseCase,
    CreateRefreshTokenUseCase,
    VerifyRefreshTokenUseCase,
    UpdateRefreshTokenUseCase,
    RevokeRefreshTokenUseCase,
    FindAllRefreshTokensUseCase,
  ],
})
export class AuthModule {}
