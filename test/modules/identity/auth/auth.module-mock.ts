import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

import { RegisterUserUseCase } from '../../../../src/modules/identity/auth/application/use-cases/auth/Register-user.usecase';
import { IAuthRepositoryMock } from './infrastructure/adapters/repositories/auth.repository';
import { IUuidServiceMock } from './infrastructure/adapters/services/uuid.service';
import { IHasherServiceMock } from './infrastructure/adapters/services/hasher.service';
import { CreateUserPortMock } from './infrastructure/adapters/services/createUser.port';
import { LoginUseCase } from '../../../../src/modules/identity/auth/application/use-cases/auth/Login.usecase';
import { RegisterUserWithGoogleUseCase } from '../../../../src/modules/identity/auth/application/use-cases/auth/register-user-with-google.usecase';
import { RegisterUserWithFacebookUseCase } from '../../../../src/modules/identity/auth/application/use-cases/auth/register-user-with-facebook.usecase';
import { CreateRefreshTokenUseCase } from '../../../../src/modules/identity/auth/application/use-cases/refresh-token/create-refresh-token.usecase';
import { MockJwtService } from './infrastructure/adapters/services/jwt.service';
import { MockUserAgentService } from './infrastructure/adapters/services/userAgent.service';
import { MockIpAddressService } from './infrastructure/adapters/services/ipAddressParser.service';
import { MockRefreshTokenRepository } from './infrastructure/adapters/repositories/refreshToken.repository';
import { VerifyRefreshTokenUseCase } from '../../../../src/modules/identity/auth/application/use-cases/refresh-token/verify-refresh-token.usecase';
import { UpdateRefreshTokenUseCase } from '../../../../src/modules/identity/auth/application/use-cases/refresh-token/update-refresh-token.usecase';
import { RevokeRefreshTokenUseCase } from '../../../../src/modules/identity/auth/application/use-cases/refresh-token/revoke-refresh-token.usecase';

export const authModule: Promise<TestingModule> = Test.createTestingModule({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' })],
  providers: [
    { provide: 'IRefreshTokenRepository', useClass: MockRefreshTokenRepository },
    { provide: 'IAuthRepository', useClass: IAuthRepositoryMock },
    { provide: 'CreateUserPort', useClass: CreateUserPortMock },
    { provide: 'IUuidService', useClass: IUuidServiceMock },
    { provide: 'IHasherService', useClass: IHasherServiceMock },
    { provide: 'JwtService', useClass: MockJwtService },
    { provide: 'UserAgentService', useClass: MockUserAgentService },
    { provide: 'IpAddressService', useClass: MockIpAddressService },
    RegisterUserUseCase,
    LoginUseCase,
    RegisterUserWithGoogleUseCase,
    RegisterUserWithFacebookUseCase,
    CreateRefreshTokenUseCase,
    VerifyRefreshTokenUseCase,
    UpdateRefreshTokenUseCase,
    RevokeRefreshTokenUseCase,
  ],
}).compile();
