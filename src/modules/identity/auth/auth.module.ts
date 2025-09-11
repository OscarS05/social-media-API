import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Auth } from './infrastructure/persistence/db/entites/auth.orm-entity';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { LocalStrategy } from './infrastructure/services/strategies/local.strategy';
import { GoogleStrategy } from './infrastructure/services/strategies/google.strategy';
import { LoginUseCase } from './application/use-cases/auth/Login.usecase';
import { RegisterUserUseCase } from './application/use-cases/auth/Register-user.usecase';
import { AuthRepository } from './infrastructure/persistence/db/auth.repository';
import { BcryptPasswordHasher } from './infrastructure/services/security/bcrypt-hasher.service';
import { CreateUserUseCase } from '../users/application/use-cases/create-user.usecase';
import { UuidAdapter } from './infrastructure/services/security/uuid.service';
import { UsersModule } from '../users/users.module';
import { GenerateTokensUseCase } from './application/use-cases/auth/generate-tokens.usecase';
import { Env } from 'src/shared/config/env.model';
import { RegisterUserWithGoogleUseCase } from './application/use-cases/auth/register-user-with-google.usecase';
import { RegisterUserWithFacebookUseCase } from './application/use-cases/auth/register-user-with-facebook.usecase';
import { FacebookStrategy } from './infrastructure/services/strategies/facebook.strategy';
import { CreateRefreshTokenUseCase } from './application/use-cases/refresh-token/create-refresh-token.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
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
    // { provide: 'IRefreshTokenRepository', useClass:  },
    { provide: 'IHasherService', useClass: BcryptPasswordHasher },
    { provide: 'CreateUserPort', useClass: CreateUserUseCase },
    { provide: 'IUuidService', useClass: UuidAdapter },
    { provide: 'JwtService', useClass: JwtService },
    // { provide: 'UserAgentService', useClass:  },
    // { provide: 'IpAddressService', useClass:  },
    LoginUseCase,
    RegisterUserUseCase,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
    GenerateTokensUseCase,
    RegisterUserWithGoogleUseCase,
    RegisterUserWithFacebookUseCase,
    CreateRefreshTokenUseCase,
  ],
})
export class AuthModule {}
